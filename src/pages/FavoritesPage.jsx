import ArticleCard from "../components/ArticleCard";
import { articles } from "../data/articles";
import { useAppState } from "../state/AppStateContext";

export default function FavoritesPage() {
  const { heartedIds, listsLoading } = useAppState();
  const favoriteArticles = articles.filter((article) => heartedIds.has(article.id));

  return (
    <section className="page-stack">
      <div className="page-intro">
        <p className="eyebrow">Favorites</p>
        <h1>Articles You Hearted</h1>
      </div>
      {listsLoading ? (
        <p className="empty-state">Loading favorites...</p>
      ) : favoriteArticles.length ? (
        <div className="article-grid">
          {favoriteArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <p className="empty-state">You have not hearted any articles yet.</p>
      )}
    </section>
  );
}
