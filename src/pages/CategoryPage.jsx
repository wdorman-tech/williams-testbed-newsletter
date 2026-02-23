import ArticleCard from "../components/ArticleCard";
import Reveal from "../components/Reveal";
import { articles } from "../data/articles";

export default function CategoryPage({ categoryKey, title, description }) {
  const categoryArticles = articles.filter((article) => article.category === categoryKey);

  return (
    <section className="page-stack">
      <Reveal>
        <div className="page-intro">
          <p className="eyebrow">{title}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </Reveal>
      <div className="article-grid">
        {categoryArticles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
