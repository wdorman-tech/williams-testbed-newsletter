import { requireAdminUser } from "./_lib/auth.js";
import { readArticleBySlug } from "./_lib/articles.js";
import { buildNewsletterHtml } from "./_lib/renderNewsletter.js";
import { sendTestNewsletter } from "./_lib/sendNewsletter.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const authResult = await requireAdminUser(req);
  if (authResult.error) {
    return res.status(authResult.status).json({ error: authResult.error });
  }

  const { slug, toEmail } = req.body || {};
  if (!slug || !toEmail) {
    return res.status(400).json({ error: "slug and toEmail are required." });
  }

  const article = await readArticleBySlug(String(slug), { includeDrafts: true, includePrivate: true });
  if (!article) {
    return res.status(404).json({ error: "Article not found." });
  }

  const { html, subject } = await buildNewsletterHtml(article);
  await sendTestNewsletter({
    to: String(toEmail),
    subject,
    html,
  });

  return res.status(200).json({ ok: true, message: "Test email sent." });
}
