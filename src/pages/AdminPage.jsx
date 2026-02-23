import { useEffect, useState } from "react";
import { apiFetch } from "../lib/apiClient";

const initialNewsletter = {
  title: "",
  slug: "",
  summary: "",
  content: "",
};

export default function AdminPage() {
  const [newsletters, setNewsletters] = useState([]);
  const [newsletterForm, setNewsletterForm] = useState(initialNewsletter);
  const [selectedNewsletterId, setSelectedNewsletterId] = useState("");
  const [toolTitle, setToolTitle] = useState("");
  const [toolWeekOf, setToolWeekOf] = useState("");
  const [toolContent, setToolContent] = useState("");
  const [sendTargetId, setSendTargetId] = useState("");
  const [sendSubject, setSendSubject] = useState("");
  const [message, setMessage] = useState("");
  const [analytics, setAnalytics] = useState({
    topArticles: "Placeholder",
    users: "Placeholder",
    revenue: "Placeholder",
  });

  const loadAdminData = async () => {
    setMessage("");
    try {
      const [newsResponse, toolsResponse, analyticsResponse] = await Promise.all([
        apiFetch("/api/newsletters?includeDrafts=1"),
        apiFetch("/api/tool-recommendations?admin=1"),
        apiFetch("/api/admin/dashboard-placeholders"),
      ]);

      const newsData = await newsResponse.json();
      const toolsData = await toolsResponse.json();
      const analyticsData = await analyticsResponse.json();

      if (!newsResponse.ok) {
        throw new Error(newsData.error || "Could not load newsletters.");
      }
      if (!toolsResponse.ok) {
        throw new Error(toolsData.error || "Could not load tool recommendations.");
      }
      if (!analyticsResponse.ok) {
        throw new Error(analyticsData.error || "Could not load analytics.");
      }

      setNewsletters(newsData.newsletters || []);
      if (toolsData.recommendation) {
        setToolTitle(toolsData.recommendation.title || "");
        setToolWeekOf(toolsData.recommendation.week_of || "");
        setToolContent(toolsData.recommendation.content || "");
      }
      setAnalytics(analyticsData.cards || analytics);
    } catch (error) {
      setMessage(error.message || "Could not load admin data.");
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const saveNewsletter = async (event) => {
    event.preventDefault();
    setMessage("");
    const path = selectedNewsletterId ? "/api/newsletter" : "/api/newsletters";
    const method = selectedNewsletterId ? "PATCH" : "POST";
    const body = selectedNewsletterId
      ? { id: selectedNewsletterId, ...newsletterForm }
      : { ...newsletterForm };

    try {
      const response = await apiFetch(path, { method, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not save newsletter.");
      }
      setMessage("Newsletter saved.");
      setNewsletterForm(initialNewsletter);
      setSelectedNewsletterId("");
      await loadAdminData();
    } catch (error) {
      setMessage(error.message || "Could not save newsletter.");
    }
  };

  const saveTools = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const response = await apiFetch("/api/tool-recommendations", {
        method: "PUT",
        body: JSON.stringify({
          title: toolTitle,
          weekOf: toolWeekOf,
          content: toolContent,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not save tools page.");
      }
      setMessage("Tools page updated.");
      await loadAdminData();
    } catch (error) {
      setMessage(error.message || "Could not save tools page.");
    }
  };

  const sendNewsletter = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const response = await apiFetch("/api/admin/send-newsletter", {
        method: "POST",
        body: JSON.stringify({
          newsletterId: sendTargetId,
          subject: sendSubject,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not send newsletter.");
      }
      setMessage("Newsletter sent and archived.");
      setSendTargetId("");
      setSendSubject("");
      await loadAdminData();
    } catch (error) {
      setMessage(error.message || "Could not send newsletter.");
    }
  };

  const editExisting = (entry) => {
    setSelectedNewsletterId(entry.id);
    setNewsletterForm({
      title: entry.title || "",
      slug: entry.slug || "",
      summary: entry.summary || "",
      content: entry.content || "",
    });
  };

  return (
    <section className="admin-grid">
      <article className="card">
        <h2>Add or Edit Newsletter</h2>
        <form className="form-grid" onSubmit={saveNewsletter}>
          <input
            placeholder="Title"
            value={newsletterForm.title}
            onChange={(event) => setNewsletterForm({ ...newsletterForm, title: event.target.value })}
            required
          />
          <input
            placeholder="Slug"
            value={newsletterForm.slug}
            onChange={(event) => setNewsletterForm({ ...newsletterForm, slug: event.target.value })}
            required
          />
          <input
            placeholder="Summary"
            value={newsletterForm.summary}
            onChange={(event) =>
              setNewsletterForm({
                ...newsletterForm,
                summary: event.target.value,
              })
            }
          />
          <textarea
            rows={10}
            placeholder="Content"
            value={newsletterForm.content}
            onChange={(event) =>
              setNewsletterForm({
                ...newsletterForm,
                content: event.target.value,
              })
            }
            required
          />
          <button className="button primary" type="submit">
            {selectedNewsletterId ? "Update Newsletter" : "Create Newsletter"}
          </button>
        </form>
        <ul className="list">
          {newsletters.map((entry) => (
            <li key={entry.id}>
              <span>{entry.title}</span>
              <button className="link-like" type="button" onClick={() => editExisting(entry)}>
                Edit
              </button>
            </li>
          ))}
        </ul>
      </article>

      <article className="card">
        <h2>Edit My Tool Recommendations</h2>
        <form className="form-grid" onSubmit={saveTools}>
          <input
            placeholder="Title"
            value={toolTitle}
            onChange={(event) => setToolTitle(event.target.value)}
            required
          />
          <input
            placeholder="Week of (YYYY-MM-DD)"
            value={toolWeekOf}
            onChange={(event) => setToolWeekOf(event.target.value)}
            required
          />
          <textarea
            rows={8}
            placeholder="Recommendation content"
            value={toolContent}
            onChange={(event) => setToolContent(event.target.value)}
            required
          />
          <button className="button primary" type="submit">
            Save Tool Recommendations
          </button>
        </form>
      </article>

      <article className="card">
        <h2>Send Newsletter (Resend)</h2>
        <form className="form-grid" onSubmit={sendNewsletter}>
          <select value={sendTargetId} onChange={(event) => setSendTargetId(event.target.value)} required>
            <option value="">Select newsletter</option>
            {newsletters.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.title}
              </option>
            ))}
          </select>
          <input
            placeholder="Email subject"
            value={sendSubject}
            onChange={(event) => setSendSubject(event.target.value)}
            required
          />
          <button className="button" type="submit">
            Send + Auto Archive
          </button>
        </form>
      </article>

      <article className="card">
        <h2>Admin Analytics (Placeholders)</h2>
        <ul className="list">
          <li>Most-clicked articles: {analytics.topArticles}</li>
          <li>User tracking: {analytics.users}</li>
          <li>Income: {analytics.revenue}</li>
        </ul>
      </article>
      {message && <p className="message">{message}</p>}
    </section>
  );
}
