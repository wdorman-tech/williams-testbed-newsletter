import { Link, Navigate, useParams } from "react-router-dom";
import ArticleActions from "../components/ArticleActions";
import Reveal from "../components/Reveal";
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
      <Reveal>
        <p className="article-meta">
          <span>{categoryMeta[article.category]}</span>
          <span className="meta-dot">•</span>
          <span>{formatDate(article.publishedAt)}</span>
          <span className="meta-dot">•</span>
          <span>{article.readMinutes} min read</span>
        </p>
      </Reveal>
      <Reveal delay={100}>
        <h1>{article.title}</h1>
      </Reveal>
      <Reveal delay={200}>
        <p className="article-author">By {article.author}</p>
      </Reveal>
      <Reveal delay={300}>
        <ArticleActions article={article} compact />
      </Reveal>
      <div className="article-body">
        {article.body.map((paragraph, index) => (
          <Reveal key={`${article.id}-paragraph-${index}`} delay={400 + index * 50}>
            <p>{paragraph}</p>
          </Reveal>
        ))}
      </div>
    </article>
  );
}
