import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../lib/apiClient";

function parseCategories(summary) {
  const text = String(summary || "");
  const match = text.match(/\b(?:categories|tags)\s*:\s*([^\n\r]+)/i);
  if (!match?.[1]) {
    return [];
  }
  return match[1]
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function stripCategoryText(summary) {
  const text = String(summary || "");
  return text.replace(/\s*(?:categories|tags)\s*:\s*[^\n\r]+/i, "").trim();
}

function loadReadLaterIds() {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem("readLaterIds");
    const parsed = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(Boolean);
  } catch {
    return [];
  }
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [newsletters, setNewsletters] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoadingNewsletters, setIsLoadingNewsletters] = useState(true);
  const [newslettersError, setNewslettersError] = useState("");
  const [readLaterIds, setReadLaterIds] = useState(loadReadLaterIds);

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

    loadNewsletters();
  }, []);

  const newslettersWithMeta = useMemo(
    () =>
      newsletters.map((item) => ({
        ...item,
        parsedCategories: parseCategories(item.summary),
        displaySummary: stripCategoryText(item.summary),
      })),
    [newsletters]
  );

  const categoryTabs = useMemo(() => {
    const values = new Set();
    newslettersWithMeta.forEach((item) => {
      item.parsedCategories.forEach((category) => values.add(category));
    });
    return ["all", ...Array.from(values).sort((a, b) => a.localeCompare(b)), "read-later"];
  }, [newslettersWithMeta]);

  const requestedTab = searchParams.get("tab") || "all";
  const activeTab = categoryTabs.includes(requestedTab) ? requestedTab : "all";

  const filteredNewsletters = useMemo(() => {
    const query = search.trim().toLowerCase();
    return newslettersWithMeta.filter((item) => {
      const title = String(item.title || "").toLowerCase();
      const summary = String(item.displaySummary || "").toLowerCase();
      const matchesSearch = !query || title.includes(query) || summary.includes(query);
      if (!matchesSearch) {
        return false;
      }
      if (activeTab === "all") {
        return true;
      }
      if (activeTab === "read-later") {
        return readLaterIds.includes(item.id);
      }
      return item.parsedCategories.includes(activeTab);
    });
  }, [newslettersWithMeta, search, activeTab, readLaterIds]);

  const latestEdition = filteredNewsletters[0] || null;
  const setTab = (tab) => {
    navigate(`/dashboard?tab=${encodeURIComponent(tab)}`, { replace: true });
  };
  const toggleReadLater = (newsletterId) => {
    setReadLaterIds((current) => {
      const next = current.includes(newsletterId) ? current.filter((id) => id !== newsletterId) : [...current, newsletterId];
      window.localStorage.setItem("readLaterIds", JSON.stringify(next));
      return next;
    });
  };

  return (
    <section className="dashboard-content">
      <header className="dashboard-tabbar">
        {categoryTabs.map((tab) => (
          <button key={tab} type="button" className={`tab-button${activeTab === tab ? " is-active" : ""}`} onClick={() => setTab(tab)}>
            {tab === "all" && "Top Stories"}
            {tab === "read-later" && (
              <span className="tab-label-with-icon">
                <span className="bookmark-icon" aria-hidden="true" />
                Read Later
              </span>
            )}
            {tab !== "all" && tab !== "read-later" && tab}
          </button>
        ))}
      </header>

      <div className="dashboard-stack">
        <article className="card hero-card">
          <p className="meta-label">{activeTab === "read-later" ? "Saved for later" : "Lead story"}</p>
          {isLoadingNewsletters && <p>Loading latest edition...</p>}
          {!isLoadingNewsletters && newslettersError && <p className="error">{newslettersError}</p>}
          {!isLoadingNewsletters && !newslettersError && !latestEdition && <p>No editions in this category yet.</p>}
          {!isLoadingNewsletters && !newslettersError && latestEdition && (
            <>
              <h1>{latestEdition.title}</h1>
              <p>{latestEdition.displaySummary || "Read the newest newsletter edition."}</p>
              <div className="button-row">
                <Link className="button button-primary" to={`/archive/${latestEdition.slug}`}>
                  Read article
                </Link>
                <button
                  type="button"
                  className={`button button-ghost bookmark-toggle${readLaterIds.includes(latestEdition.id) ? " is-bookmarked" : ""}`}
                  onClick={() => toggleReadLater(latestEdition.id)}
                >
                  <span className="bookmark-icon" aria-hidden="true" />
                  {readLaterIds.includes(latestEdition.id) ? "Saved" : "Save for later"}
                </button>
              </div>
            </>
          )}
        </article>

        <article className="card">
          <div className="section-header">
            <h2>Latest Coverage</h2>
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
                  <div className="edition-header-row">
                    <Link className="edition-title-link" to={`/archive/${item.slug}`}>
                      {item.title}
                    </Link>
                    <button
                      type="button"
                      className={`bookmark-chip${readLaterIds.includes(item.id) ? " is-active" : ""}`}
                      onClick={() => toggleReadLater(item.id)}
                      aria-label={readLaterIds.includes(item.id) ? "Remove from read later" : "Save to read later"}
                    >
                      <span className="bookmark-icon" aria-hidden="true" />
                    </button>
                  </div>
                  {item.displaySummary && <p className="meta-caption">{item.displaySummary}</p>}
                  {!!item.parsedCategories.length && (
                    <div className="category-chip-row">
                      {item.parsedCategories.map((category) => (
                        <span key={`${item.id}-${category}`} className="category-chip">
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="meta-label">{new Date(item.sent_at || item.created_at).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
