import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../lib/apiClient";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [newsletters, setNewsletters] = useState([]);
  const [toolPick, setToolPick] = useState(null);
  const [search, setSearch] = useState("");
  const [isLoadingNewsletters, setIsLoadingNewsletters] = useState(true);
  const [isLoadingToolPick, setIsLoadingToolPick] = useState(true);
  const [newslettersError, setNewslettersError] = useState("");
  const [toolPickError, setToolPickError] = useState("");
  const activeTab = searchParams.get("tab") === "tools" ? "tools" : "editions";

  useEffect(() => {
    const loadNewsletters = async () => {
      try {
        const response = await apiFetch("/api/newsletters");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Could not load editions.");
        }
        setNewsletters(Array.isArray(data.newsletters) ? data.newsletters : []);
      } catch (error) {
        setNewslettersError(error.message || "Could not load editions.");
      } finally {
        setIsLoadingNewsletters(false);
      }
    };

    const loadToolPick = async () => {
      try {
        const response = await apiFetch("/api/tool-recommendations");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Could not load tool picks.");
        }
        setToolPick(data.recommendation || null);
      } catch (error) {
        setToolPickError(error.message || "Could not load tool picks.");
      } finally {
        setIsLoadingToolPick(false);
      }
    };

    loadNewsletters();
    loadToolPick();
  }, []);

  const filteredNewsletters = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return newsletters;
    }
    return newsletters.filter((item) => {
      const title = String(item.title || "").toLowerCase();
      const summary = String(item.summary || "").toLowerCase();
      return title.includes(query) || summary.includes(query);
    });
  }, [newsletters, search]);

  const latestEdition = newsletters[0] || null;
  const setTab = (tab) => {
    navigate(`/dashboard?tab=${tab}`, { replace: true });
  };

  return (
    <section className="dashboard-content">
      <header className="dashboard-tabbar">
        <button
          type="button"
          className={`tab-button${activeTab === "editions" ? " is-active" : ""}`}
          onClick={() => setTab("editions")}
        >
          Editions
        </button>
        <button
          type="button"
          className={`tab-button${activeTab === "tools" ? " is-active" : ""}`}
          onClick={() => setTab("tools")}
        >
          Tool Picks
        </button>
      </header>

      {activeTab === "editions" ? (
        <div className="dashboard-stack">
          <article className="card hero-card">
            <p className="meta-label">Latest edition</p>
            {isLoadingNewsletters && <p>Loading latest edition...</p>}
            {!isLoadingNewsletters && newslettersError && <p className="error">{newslettersError}</p>}
            {!isLoadingNewsletters && !newslettersError && !latestEdition && (
              <p>No editions have been published yet.</p>
            )}
            {!isLoadingNewsletters && !newslettersError && latestEdition && (
              <>
                <h1>{latestEdition.title}</h1>
                <p>{latestEdition.summary || "Read the newest newsletter edition."}</p>
                <div className="button-row">
                  <Link className="button button-primary" to={`/archive/${latestEdition.slug}`}>
                    Read latest edition
                  </Link>
                </div>
              </>
            )}
          </article>

          <article className="card">
            <div className="section-header">
              <h2>Archive</h2>
              <label className="search-field">
                <span className="meta-label">Search editions</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by title or excerpt"
                />
              </label>
            </div>
            {isLoadingNewsletters && <p>Loading archive...</p>}
            {!isLoadingNewsletters && newslettersError && <p className="error">{newslettersError}</p>}
            {!isLoadingNewsletters && !newslettersError && !filteredNewsletters.length && <p>No matching editions.</p>}
            <ul className="edition-list">
              {filteredNewsletters.map((item) => (
                <li key={item.id} className="edition-row">
                  <div>
                    <Link className="edition-title-link" to={`/archive/${item.slug}`}>
                      {item.title}
                    </Link>
                    {item.summary && <p className="meta-caption">{item.summary}</p>}
                  </div>
                  <p className="meta-label">
                    {new Date(item.sent_at || item.created_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          </article>
        </div>
      ) : (
        <div className="dashboard-stack">
          <article className="card hero-card">
            <p className="meta-label">Current week</p>
            {isLoadingToolPick && <p>Loading tool picks...</p>}
            {!isLoadingToolPick && toolPickError && <p className="error">{toolPickError}</p>}
            {!isLoadingToolPick && !toolPickError && !toolPick && <p>No tool picks published this week yet.</p>}
            {!isLoadingToolPick && !toolPickError && toolPick && (
              <>
                <h1>{toolPick.title}</h1>
                <p className="meta-label">Week of {toolPick.week_of}</p>
                <div className="newsletter-body">{toolPick.content}</div>
              </>
            )}
          </article>
        </div>
      )}
    </section>
  );
}
