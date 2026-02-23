import ArticleCard from "../components/ArticleCard";
import Reveal from "../components/Reveal";
import { articles } from "../data/articles";
import { useAppState } from "../state/AppStateContext";

export default function FavoritesPage() {
  const { heartedIds } = useAppState();
  const favoriteArticles = articles.filter((article) => heartedIds.has(article.id));

  return (
    <section className="page-stack">
      <Reveal>
        <div className="page-intro">
          <p className="eyebrow">Favorites</p>
          <h1>Articles You Hearted</h1>
        </div>
      </Reveal>
      {favoriteArticles.length ? (
        <div className="article-grid">
          {favoriteArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <Reveal delay={200}>
          <p className="empty-state">You have not hearted any articles yet.</p>
        </Reveal>
      )}
    </section>
  );
}
