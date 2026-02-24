import { useMemo } from "react";
import { articles as markdownArticles } from "../data/articles";
import { useAppState } from "../state/AppStateContext";

function toAdminArticle(row) {
  return {
    id: row.slug,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || "",
    category: row.category || "automation",
    author: row.author || "William",
    publishedAt: row.published_at || new Date().toISOString(),
    readMinutes: Number(row.read_minutes || 5),
    trending: Boolean(row.trending),
    draft: Boolean(row.draft),
    heroImage: row.hero_image || "",
    body: row.body || "",
    isPrivate: Boolean(row.is_private),
    source: "admin",
  };
}

export function useArticles() {
  const { adminArticles, articleSettings, isAdmin } = useAppState();

  return useMemo(() => {
    const mappedMarkdown = markdownArticles.map((article) => {
      const override = articleSettings[article.slug];
      return {
        ...article,
        category: override?.category || article.category,
        isPrivate: Boolean(override?.isPrivate),
        source: "markdown",
      };
    });

    const existingSlugs = new Set(mappedMarkdown.map((article) => article.slug));
    const mappedAdmin = (adminArticles || [])
      .filter((row) => row?.slug && !existingSlugs.has(row.slug))
      .map(toAdminArticle);

    const merged = [...mappedMarkdown, ...mappedAdmin].sort(
      (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
    );

    const visible = isAdmin ? merged : merged.filter((article) => !article.isPrivate);
    const published = visible.filter((article) => !article.draft);

    return {
      articles: visible,
      publishedArticles: published,
      getArticleBySlug(slug, { includeDrafts = false } = {}) {
        if (!slug) {
          return null;
        }
        const source = includeDrafts ? visible : published;
        return source.find((article) => article.slug === slug) ?? null;
      },
      getArticlesByCategory(categoryKey, { includeDrafts = false } = {}) {
        const source = includeDrafts ? visible : published;
        return source.filter((article) => article.category === categoryKey);
      },
    };
  }, [adminArticles, articleSettings, isAdmin]);
}
