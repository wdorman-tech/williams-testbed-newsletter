import { useMemo, useState } from "react";
import { apiFetch } from "../lib/apiClient";

const initialForm = {
  title: "",
  excerpt: "",
  body: "",
  categories: "",
  toolPicks: "",
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function PublishEditionModal({ isOpen, onClose, onPublished }) {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const categoriesAsText = useMemo(() => {
    if (!form.categories.trim()) {
      return "";
    }
    return form.categories
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .join(", ");
  }, [form.categories]);

  if (!isOpen) {
    return null;
  }

  const close = () => {
    if (isSubmitting) {
      return;
    }
    setError("");
    setMessage("");
    onClose();
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    const baseTitle = form.title.trim();
    const slug = slugify(baseTitle);
    if (!baseTitle || !slug || !form.body.trim()) {
      setError("Title and body are required.");
      setIsSubmitting(false);
      return;
    }

    const summaryParts = [form.excerpt.trim(), categoriesAsText ? `Categories: ${categoriesAsText}` : ""].filter(Boolean);
    const summary = summaryParts.join("  ");

    try {
      const newsletterResponse = await apiFetch("/api/newsletters", {
        method: "POST",
        body: JSON.stringify({
          title: baseTitle,
          slug,
          summary,
          content: form.body.trim(),
        }),
      });
      const newsletterData = await newsletterResponse.json();
      if (!newsletterResponse.ok) {
        throw new Error(newsletterData.error || "Could not publish edition.");
      }

      if (form.toolPicks.trim()) {
        const weekOf = new Date().toISOString().slice(0, 10);
        const toolsResponse = await apiFetch("/api/tool-recommendations", {
          method: "PUT",
          body: JSON.stringify({
            title: `Tool Picks: ${baseTitle}`,
            weekOf,
            content: form.toolPicks.trim(),
          }),
        });
        const toolsData = await toolsResponse.json();
        if (!toolsResponse.ok) {
          throw new Error(toolsData.error || "Edition was created, but tool picks failed.");
        }
      }

      setMessage("Edition created.");
      setForm(initialForm);
      if (onPublished) {
        onPublished();
      }
    } catch (submitError) {
      setError(submitError.message || "Could not publish edition.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={close}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Publish new edition"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <h2>Publish New Edition</h2>
          <button type="button" className="button button-ghost" onClick={close}>
            Close
          </button>
        </header>
        <form className="form-grid" onSubmit={submit}>
          <label>
            <span className="meta-label">Title</span>
            <input
              type="text"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
            />
          </label>
          <label>
            <span className="meta-label">Excerpt</span>
            <input
              type="text"
              value={form.excerpt}
              onChange={(event) => setForm({ ...form, excerpt: event.target.value })}
            />
          </label>
          <label>
            <span className="meta-label">Body</span>
            <textarea
              rows={8}
              value={form.body}
              onChange={(event) => setForm({ ...form, body: event.target.value })}
              required
            />
          </label>
          <label>
            <span className="meta-label">Categories (comma-separated)</span>
            <input
              type="text"
              value={form.categories}
              onChange={(event) => setForm({ ...form, categories: event.target.value })}
            />
          </label>
          <label>
            <span className="meta-label">Tool picks</span>
            <textarea
              rows={5}
              value={form.toolPicks}
              onChange={(event) => setForm({ ...form, toolPicks: event.target.value })}
            />
          </label>
          <button className="button button-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Publishing..." : "Publish"}
          </button>
          {message && <p className="message">{message}</p>}
          {error && <p className="error">{error}</p>}
        </form>
      </section>
    </div>
  );
}
