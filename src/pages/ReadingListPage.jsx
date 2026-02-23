import ArticleCard from "../components/ArticleCard";
import Reveal from "../components/Reveal";
import { articles } from "../data/articles";
import { useAppState } from "../state/AppStateContext";

export default function ReadingListPage() {
  const { savedIds } = useAppState();
  const readingList = articles.filter((article) => savedIds.has(article.id));

  return (
    <section className="page-stack">
      <Reveal>
        <div className="page-intro">
          <p className="eyebrow">Reading List</p>
          <h1>Saved for Later</h1>
        </div>
      </Reveal>
      {readingList.length ? (
        <div className="article-grid">
          {readingList.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <Reveal delay={200}>
          <p className="empty-state">Your reading list is empty.</p>
        </Reveal>
      )}
    </section>
  );
}
