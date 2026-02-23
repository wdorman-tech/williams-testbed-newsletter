import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/apiClient";

export default function ArchivePage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await apiFetch("/api/newsletters");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Could not load archive.");
        }
        setItems(Array.isArray(data.newsletters) ? data.newsletters : []);
      } catch (err) {
        setError(err.message || "Could not load archive.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <p>Loading archive...</p>;
  }

  return (
    <section className="card">
      <h2>Past Editions</h2>
      {error && <p className="message">{error}</p>}
      {!items.length && !error && <p>No newsletters have been published yet.</p>}
      <ul className="list">
        {items.map((item) => (
          <li key={item.id}>
            <Link to={`/archive/${item.slug}`}>{item.title}</Link>
            <small>{new Date(item.sent_at || item.created_at).toLocaleDateString()}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}
