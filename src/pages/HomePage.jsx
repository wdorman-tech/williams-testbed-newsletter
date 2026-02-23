import { Link } from "react-router-dom";
import ArticleCard from "../components/ArticleCard";
import Reveal from "../components/Reveal";
import { articles } from "../data/articles";
import { useAppState } from "../state/AppStateContext";

function sortByDateDesc(list) {
  return [...list].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

export default function HomePage() {
  const { savedIds } = useAppState();

  const recentArticles = sortByDateDesc(articles).slice(0, 4);
  const trendingArticles = sortByDateDesc(articles.filter((article) => article.trending)).slice(0, 3);
  const savedArticles = sortByDateDesc(articles.filter((article) => savedIds.has(article.id)));

  return (
    <div className="home-layout">
      <section className="main-column">
        <Reveal>
          <div className="page-intro">
            <p className="eyebrow">Black Lily Journal</p>
            <h1>Recent & Trending Articles</h1>
            <p>
              Practical notes on workflows, automation, marketing, and tool systems.
            </p>
          </div>
        </Reveal>

        <section className="section-block">
          <Reveal delay={200}>
            <h2 className="section-title">Recent</h2>
          </Reveal>
          <div className="article-grid">
            {recentArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>

        <section className="section-block">
          <Reveal delay={300}>
            <h2 className="section-title">Trending</h2>
          </Reveal>
          <div className="article-grid">
            {trendingArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      </section>

      <aside className="right-rail">
        <Reveal delay={400}>
          <h2>Saved for Later</h2>
          {savedArticles.length ? (
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
        </Reveal>
      </aside>
    </div>
  );
}
