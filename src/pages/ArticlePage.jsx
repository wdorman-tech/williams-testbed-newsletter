import { Link, Navigate, useParams } from "react-router-dom";
import ArticleActions from "../components/ArticleActions";
import { articles, categoryMeta } from "../data/articles";

function formatDate(dateValue) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateValue));
}

export default function ArticlePage() {
  const { slug } = useParams();
  const article = articles.find((entry) => entry.slug === slug);

  if (!slug) {
    return <Navigate to="/" replace />;
  }

  if (!article) {
    return (
      <section className="page-stack">
        <h1>Article Not Found</h1>
        <p className="empty-state">
          That article does not exist. <Link to="/">Return home</Link>.
        </p>
      </section>
    );
  }

  return (
    <article className="page-stack article-page">
      <p className="article-meta">
        <span>{categoryMeta[article.category]}</span>
        <span className="meta-dot">•</span>
        <span>{formatDate(article.publishedAt)}</span>
        <span className="meta-dot">•</span>
        <span>{article.readMinutes} min read</span>
      </p>
      <h1>{article.title}</h1>
      <p className="article-author">By {article.author}</p>
      <ArticleActions article={article} compact />
      <div className="article-body">
        {article.body.map((paragraph, index) => (
          <p key={`${article.id}-paragraph-${index}`}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
