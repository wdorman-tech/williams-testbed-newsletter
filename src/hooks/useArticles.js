import { useMemo } from "react";
import { toArticleFromIndexRow } from "../lib/articleFormat";
import { useAppState } from "../state/AppStateContext";

export function useArticles() {
  const { articleIndex, isAdmin } = useAppState();

  return useMemo(() => {
    const merged = (articleIndex || [])
      .map((row) => toArticleFromIndexRow(row))
      .filter(Boolean)
      .sort(
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
  }, [articleIndex, isAdmin]);
}
