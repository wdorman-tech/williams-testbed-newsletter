import { useEffect, useRef } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import ArticleActions from "../components/ArticleActions";
import { categoryMeta } from "../data/articles";
import { useArticles } from "../hooks/useArticles";
import { supabase } from "../lib/supabase";
import { useAppState } from "../state/AppStateContext";

const VIEW_COOLDOWN_MS = 15 * 60 * 1000;
const VIEW_TIMESTAMPS_KEY = "article_view_timestamps";
const VIEW_SESSION_KEY = "article_view_session_key";

function createSessionKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatDate(dateValue) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateValue));
}

export default function ArticlePage({ allowDrafts = false }) {
  const { user } = useAppState();
  const { getArticleBySlug } = useArticles();
  const { slug } = useParams();
  const trackedSlugRef = useRef("");
  const article = getArticleBySlug(slug, { includeDrafts: allowDrafts });

  useEffect(() => {
    if (!slug || allowDrafts || !article || !user?.id) {
      return;
    }

    if (trackedSlugRef.current === slug) {
      return;
    }

    let timestampMap = {};
    try {
      timestampMap = JSON.parse(localStorage.getItem(VIEW_TIMESTAMPS_KEY) || "{}");
    } catch {
      timestampMap = {};
    }

    const now = Date.now();
    const previousViewedAt = Number(timestampMap[slug] || 0);
    if (now - previousViewedAt < VIEW_COOLDOWN_MS) {
      trackedSlugRef.current = slug;
      return;
    }

    let sessionKey = localStorage.getItem(VIEW_SESSION_KEY);
    if (!sessionKey) {
      sessionKey = createSessionKey();
      localStorage.setItem(VIEW_SESSION_KEY, sessionKey);
    }

    trackedSlugRef.current = slug;
    timestampMap[slug] = now;
    localStorage.setItem(VIEW_TIMESTAMPS_KEY, JSON.stringify(timestampMap));

    void supabase.from("article_views").insert({
      article_slug: slug,
      user_id: user.id,
      session_key: sessionKey,
    });
  }, [allowDrafts, article, slug, user?.id]);

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
      <div className="article-byline-row">
        <p className="article-author">{article.author}</p>
        <ArticleActions article={article} compact />
      </div>
      <div className="article-body">
        <ReactMarkdown>{article.body}</ReactMarkdown>
      </div>
    </article>
  );
}
