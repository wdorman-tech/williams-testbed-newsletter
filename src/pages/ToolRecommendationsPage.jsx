import { useEffect, useState } from "react";
import { apiFetch } from "../lib/apiClient";

export default function ToolRecommendationsPage() {
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await apiFetch("/api/tool-recommendations");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Could not load recommendations.");
        }
        setItem(data.recommendation || null);
      } catch (err) {
        setError(err.message || "Could not load recommendations.");
      }
    };
    load();
  }, []);

  return (
    <section className="card">
      <h2>My Tool Recommendations</h2>
      {error && <p className="message">{error}</p>}
      {!item && !error && <p>No recommendations published this week yet.</p>}
      {item && (
        <>
          <h3>{item.title}</h3>
          <p className="muted">Week of {item.week_of}</p>
          <div className="newsletter-body">{item.content}</div>
        </>
      )}
    </section>
  );
}
