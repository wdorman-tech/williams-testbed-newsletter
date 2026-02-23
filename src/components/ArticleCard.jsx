import { Link } from "react-router-dom";
import { categoryMeta } from "../data/articles";
import ArticleActions from "./ArticleActions";

function formatDate(dateValue) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateValue));
}

export default function ArticleCard({ article }) {
  return (
    <article className="article-card">
      <div className="article-card-top">
        <p className="article-meta">
          <span>{categoryMeta[article.category]}</span>
          <span className="meta-dot">•</span>
          <span>{formatDate(article.publishedAt)}</span>
          <span className="meta-dot">•</span>
          <span>{article.readMinutes} min</span>
        </p>
        {article.trending ? <span className="trending-label">Trending</span> : null}
      </div>
      <h2 className="article-title">
        <Link to={`/article/${article.slug}`} title={`Read more about ${article.title}`}>
          {article.title}
        </Link>
      </h2>
      <p className="article-excerpt">{article.excerpt}</p>
      <ArticleActions article={article} />
    </article>
  );
}
