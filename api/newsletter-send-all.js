import { requireAdminUser } from "./_lib/auth.js";
import { readArticleBySlug } from "./_lib/articles.js";
import { buildNewsletterHtml } from "./_lib/renderNewsletter.js";
import { sendNewsletterToSubscribers } from "./_lib/sendNewsletter.js";
import { createSupabaseAdminClient } from "./_lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const authResult = await requireAdminUser(req);
  if (authResult.error) {
    return res.status(authResult.status).json({ error: authResult.error });
  }

  const { slug, confirmationSlug } = req.body || {};
  if (!slug || !confirmationSlug) {
    return res.status(400).json({ error: "slug and confirmationSlug are required." });
  }

  if (String(slug) !== String(confirmationSlug)) {
    return res.status(400).json({ error: "Confirmation slug does not match." });
  }

  const article = await readArticleBySlug(String(slug), { includeDrafts: true, includePrivate: true });
  if (!article) {
    return res.status(404).json({ error: "Article not found." });
  }

  if (article.draft) {
    return res.status(400).json({ error: "Draft articles cannot be sent to all subscribers." });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: existingSend, error: existingSendError } = await supabaseAdmin
    .from("newsletter_sends")
    .select("article_slug")
    .eq("article_slug", article.slug)
    .maybeSingle();

  if (existingSendError) {
    return res.status(500).json({ error: "Could not verify send history." });
  }

  if (existingSend) {
    return res.status(409).json({ error: "This article was already sent." });
  }

  const { data: subscribers, error: subscribersError } = await supabaseAdmin
    .from("newsletter_subscribers")
    .select("email")
    .eq("status", "active");

  if (subscribersError) {
    return res.status(500).json({ error: "Could not load subscriber list." });
  }

  const emails = (subscribers || [])
    .map((row) => String(row.email || "").trim())
    .filter(Boolean);

  if (!emails.length) {
    return res.status(400).json({ error: "No active subscribers found." });
  }

  const { html, subject } = await buildNewsletterHtml(article);
  const { sentCount } = await sendNewsletterToSubscribers({
    subscribers: emails,
    subject,
    html,
  });

  const { error: logError } = await supabaseAdmin.from("newsletter_sends").insert({
    article_slug: article.slug,
    sent_by_user_id: authResult.user.id,
    sent_count: sentCount,
  });

  if (logError) {
    return res.status(500).json({
      error: "Emails were sent, but send logging failed. Resolve before another blast.",
    });
  }

  return res.status(200).json({
    ok: true,
    message: `Newsletter sent to ${sentCount} subscribers.`,
  });
}
