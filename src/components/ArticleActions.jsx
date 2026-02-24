import { useAppState } from "../state/AppStateContext";

export default function ArticleActions({ article, compact = false }) {
  const { heartedIds, savedIds, lastCopiedSlug, toggleHeart, toggleSave, copyArticleLink } =
    useAppState();

  const isHearted = heartedIds.has(article.id);
  const isSaved = savedIds.has(article.id);
  const copied = lastCopiedSlug === article.slug;

  return (
    <div className={`article-actions ${compact ? "compact" : ""}`}>
      <button
        type="button"
        className={`action-icon-button ${copied ? "is-active" : ""}`}
        onClick={() => copyArticleLink(article.slug)}
        aria-label={`Copy link for ${article.title}`}
        title={copied ? "Link copied" : "Copy link"}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </button>
      <button
        type="button"
        className={`action-icon-button ${isHearted ? "is-active is-filled" : ""}`}
        onClick={() => toggleHeart(article.id)}
        aria-label={`Heart ${article.title}`}
        title={isHearted ? "Unheart" : "Heart"}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21s-6.6-4.2-9.2-8.2C.7 9.5 2.1 5 6.2 5c2.2 0 3.7 1.4 4.5 2.6C11.5 6.4 13 5 15.2 5c4.1 0 5.5 4.5 3.4 7.8C18.6 12.8 16.1 16.8 12 21z" />
        </svg>
      </button>
      <button
        type="button"
        className={`action-icon-button ${isSaved ? "is-active is-filled" : ""}`}
        onClick={() => toggleSave(article.id)}
        aria-label={`Save ${article.title}`}
        title={isSaved ? "Unsave" : "Save"}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3-6 3V5a1 1 0 0 1 1-1z" />
        </svg>
      </button>
    </div>
  );
}
