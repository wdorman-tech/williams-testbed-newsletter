import ArticleCard from "../components/ArticleCard";
import { useArticles } from "../hooks/useArticles";

export default function CategoryPage({ categoryKey, title, description }) {
  const { getArticlesByCategory } = useArticles();
  const categoryArticles = getArticlesByCategory(categoryKey);

  return (
    <section className="page-stack">
      <div className="page-intro">
        <p className="eyebrow">{title}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {categoryArticles.length > 0 ? (
        <div className="article-grid">
          {categoryArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <p className="empty-state">No articles in this category yet.</p>
      )}
    </section>
  );
}
