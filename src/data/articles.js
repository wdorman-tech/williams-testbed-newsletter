import { toArticleFromMarkdown } from "../lib/articleFormat";

const articleModules = import.meta.glob("../content/articles/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

const allArticles = Object.entries(articleModules)
  .map(([path, rawMarkdown]) => toArticleFromMarkdown(rawMarkdown, path))
  .filter(Boolean)
  .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

const seenSlugs = new Set();
export const articles = allArticles.filter((article) => {
  if (seenSlugs.has(article.slug)) {
    return false;
  }
  seenSlugs.add(article.slug);
  return true;
});

export const publishedArticles = articles.filter((article) => !article.draft);

export function getArticleBySlug(slug, { includeDrafts = false } = {}) {
  if (!slug) {
    return null;
  }

  const source = includeDrafts ? articles : publishedArticles;
  return source.find((article) => article.slug === slug) ?? null;
}

export const categoryMeta = {
  automation: "Automation",
  marketing: "Marketing",
  "my-workflow": "My Workflow",
  "my-tools": "My Tools",
};
