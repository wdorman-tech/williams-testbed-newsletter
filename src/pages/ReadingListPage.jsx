import ArticleCard from "../components/ArticleCard";
import { useArticles } from "../hooks/useArticles";
import { useAppState } from "../state/AppStateContext";

export default function ReadingListPage() {
  const { savedIds, listsLoading } = useAppState();
  const { publishedArticles } = useArticles();
  const readingList = publishedArticles.filter((article) => savedIds.has(article.id));

  return (
    <section className="page-stack">
      <div className="page-intro">
        <p className="eyebrow">Reading List</p>
        <h1>Saved for Later</h1>
      </div>
      {listsLoading ? (
        <p className="empty-state">Loading reading list...</p>
      ) : readingList.length ? (
        <div className="article-grid">
          {readingList.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <p className="empty-state">Your reading list is empty.</p>
      )}
    </section>
  );
}
