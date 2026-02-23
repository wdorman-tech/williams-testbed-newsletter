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
        className="ghost-button"
        onClick={() => copyArticleLink(article.slug)}
        aria-label={`Copy link for ${article.title}`}
      >
        {copied ? "Link Copied" : "Copy Link"}
      </button>
      <button
        type="button"
        className={`ghost-button ${isHearted ? "is-active" : ""}`}
        onClick={() => toggleHeart(article.id)}
        aria-label={`Heart ${article.title}`}
      >
        {isHearted ? "Hearted" : "Heart"}
      </button>
      <button
        type="button"
        className={`ghost-button ${isSaved ? "is-active" : ""}`}
        onClick={() => toggleSave(article.id)}
        aria-label={`Save ${article.title}`}
      >
        {isSaved ? "Saved" : "Save for Later"}
      </button>
    </div>
  );
}
