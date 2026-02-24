import { buildNewsletterHtml } from "./_lib/renderNewsletter.js";
import { readArticleBySlug } from "./_lib/articles.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const slug = String(req.query.slug || "");
  if (!slug) {
    return res.status(400).json({ error: "Missing slug." });
  }

  const article = await readArticleBySlug(slug, { includeDrafts: true, includePrivate: true });
  if (!article) {
    return res.status(404).json({ error: "Article not found." });
  }

  const { html } = await buildNewsletterHtml(article);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(200).send(html);
}
