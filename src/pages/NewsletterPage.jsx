import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../lib/apiClient";

export default function NewsletterPage() {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await apiFetch(`/api/newsletter?slug=${encodeURIComponent(slug)}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Could not load newsletter.");
        }
        setItem(data.newsletter || null);
      } catch (err) {
        setError(err.message || "Could not load newsletter.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [slug]);

  const copyLink = async () => {
    if (!item?.slug) {
      return;
    }

    const url = `${window.location.origin}/archive/${item.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareMessage("Link copied.");
    } catch {
      setShareMessage("Unable to copy link.");
    }
  };

  if (error) {
    return <p className="message">{error}</p>;
  }

  if (isLoading) {
    return <p>Loading newsletter...</p>;
  }

  if (!item) {
    return <p>Newsletter not found.</p>;
  }

  return (
    <article className="card">
      <h2>{item.title}</h2>
      <p className="muted">{item.summary}</p>
      <button type="button" className="button" onClick={copyLink}>
        Share Link
      </button>
      {shareMessage && <p className="message">{shareMessage}</p>}
      <div className="newsletter-body">{item.content}</div>
    </article>
  );
}
