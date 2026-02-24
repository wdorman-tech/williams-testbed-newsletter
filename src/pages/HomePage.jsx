import { Link } from "react-router-dom";
import ArticleCard from "../components/ArticleCard";
import { useArticles } from "../hooks/useArticles";
import { useAppState } from "../state/AppStateContext";

function sortByDateDesc(list) {
  return [...list].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

export default function HomePage() {
  const { savedIds, listsLoading } = useAppState();
  const { publishedArticles } = useArticles();

  const recentArticles = sortByDateDesc(publishedArticles).slice(0, 4);
  const trendingArticles = sortByDateDesc(
    publishedArticles.filter((article) => article.trending)
  ).slice(0, 3);
  const savedArticles = sortByDateDesc(publishedArticles.filter((article) => savedIds.has(article.id)));

  return (
    <div className="home-layout">
      <section className="main-column">
        <div className="page-intro">
          <p className="eyebrow">William&apos;s Testbed</p>
          <h1>What I&apos;m Building This Week</h1>
          <p>
            A weekly notebook on live AI systems, experiments, and practical implementation
            lessons.
          </p>
        </div>

        <section className="section-block">
          <h2 className="section-title">Recent</h2>
          {recentArticles.length > 0 ? (
            <div className="article-grid">
              {recentArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <p className="empty-state">No articles published yet.</p>
          )}
        </section>

        <section className="section-block">
          <h2 className="section-title">Trending</h2>
          {trendingArticles.length > 0 ? (
            <div className="article-grid">
              {trendingArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <p className="empty-state">No trending articles yet.</p>
          )}
        </section>
      </section>

      <aside className="right-rail">
        <h2>Credentials</h2>
        <p className="credentials-copy">
          William has built production AI systems across high-stakes industries: an ML model for
          intraoperative pedicle screw placement at a 10M+ biomedical startup, a RAG-based
          research curation agent for a 10B+ AUM investment firm, and a quantitative trading
          framework integrating AI-driven qualitative scoring that achieved 17% outperformance over
          the S&amp;P 500 at a beta of 0.56. He doesn&apos;t write about AI from the sidelines - he
          has shipped real systems for real clients with real money on the line. That&apos;s the
          credential most AI newsletter writers can&apos;t claim.
        </p>
        <h2>Saved for Later</h2>
        {listsLoading ? (
          <p className="empty-state">Loading saved articles...</p>
        ) : savedArticles.length ? (
          <ul className="saved-list">
            {savedArticles.map((article) => (
              <li key={article.id}>
                <Link to={`/article/${article.slug}`}>{article.title}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">No saved articles yet.</p>
        )}
      </aside>
    </div>
  );
}
