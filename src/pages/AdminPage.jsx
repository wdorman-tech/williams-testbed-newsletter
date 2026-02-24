import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { categoryMeta } from "../data/articles";
import { useArticles } from "../hooks/useArticles";
import { supabase } from "../lib/supabase";
import { useAppState } from "../state/AppStateContext";

const TAB_KEYS = {
  ops: "ops",
  metrics: "metrics",
  manage: "manage",
  cms: "cms",
  images: "images",
};

const CATEGORY_OPTIONS = Object.keys(categoryMeta);

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toLocalDateTimeInput(isoDate) {
  const date = new Date(isoDate || Date.now());
  const pad = (value) => String(value).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const EMPTY_EDITOR = {
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  category: "my-tools",
  author: "William",
  publishedAt: toLocalDateTimeInput(new Date().toISOString()),
  readMinutes: 5,
  trending: false,
  draft: true,
  isPrivate: false,
  heroImage: "",
};

export default function AdminPage() {
  const { session, user, refreshArticleCatalog } = useAppState();
  const { articles } = useArticles();
  const [activeTab, setActiveTab] = useState(TAB_KEYS.ops);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [testEmail, setTestEmail] = useState(user?.email ?? "");
  const [confirmSlug, setConfirmSlug] = useState("");
  const [sendRows, setSendRows] = useState([]);
  const [metricRows, setMetricRows] = useState([]);
  const [manageRows, setManageRows] = useState([]);
  const [editorForm, setEditorForm] = useState(EMPTY_EDITOR);
  const [editingCmsSlug, setEditingCmsSlug] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [storageImages, setStorageImages] = useState([]);

  const adminCmsArticles = useMemo(
    () => articles.filter((article) => article.source === "admin"),
    [articles]
  );

  const selectedArticle = useMemo(
    () => articles.find((article) => article.slug === selectedSlug) || null,
    [articles, selectedSlug]
  );

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token || ""}`,
    }),
    [session?.access_token]
  );

  const loadAdminData = async () => {
    const [sendsResult, viewsResult, listsResult] = await Promise.all([
      supabase
        .from("newsletter_sends")
        .select("article_slug, sent_count, inserted_at")
        .order("inserted_at", { ascending: false })
        .limit(100),
      supabase
        .from("article_views")
        .select("article_slug, user_id")
        .order("viewed_at", { ascending: false })
        .limit(10000),
      supabase.from("user_article_lists").select("article_id, list_type"),
    ]);

    if (sendsResult.error || viewsResult.error || listsResult.error) {
      setErrorMessage("Could not load one or more admin datasets.");
      return;
    }

    const sends = sendsResult.data || [];
    const views = viewsResult.data || [];
    const lists = listsResult.data || [];
    setSendRows(sends);

    const viewCounts = new Map();
    const uniqueReaders = new Map();
    for (const row of views) {
      const slug = row.article_slug;
      if (!slug) {
        continue;
      }
      viewCounts.set(slug, (viewCounts.get(slug) || 0) + 1);
      if (!uniqueReaders.has(slug)) {
        uniqueReaders.set(slug, new Set());
      }
      if (row.user_id) {
        uniqueReaders.get(slug).add(row.user_id);
      }
    }

    const heartCounts = new Map();
    const saveCounts = new Map();
    for (const row of lists) {
      if (!row?.article_id) {
        continue;
      }
      if (row.list_type === "favorite") {
        heartCounts.set(row.article_id, (heartCounts.get(row.article_id) || 0) + 1);
      }
      if (row.list_type === "read_later") {
        saveCounts.set(row.article_id, (saveCounts.get(row.article_id) || 0) + 1);
      }
    }

    const sentCounts = new Map(sends.map((row) => [row.article_slug, row.sent_count]));
    const rows = articles.map((article) => ({
      slug: article.slug,
      title: article.title,
      views: viewCounts.get(article.slug) || 0,
      uniqueReaders: uniqueReaders.get(article.slug)?.size || 0,
      hearts: heartCounts.get(article.id) || 0,
      saves: saveCounts.get(article.id) || 0,
      sentCount: sentCounts.get(article.slug) || 0,
    }));
    setMetricRows(rows.sort((a, b) => b.views - a.views));

    const managementRows = articles.map((article) => ({
      slug: article.slug,
      title: article.title,
      source: article.source || "markdown",
      category: article.category,
      isPrivate: Boolean(article.isPrivate),
    }));
    setManageRows(managementRows);
  };

  const loadStorageImages = async () => {
    const { data, error } = await supabase.storage
      .from("article-images")
      .list("hero-images", {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      console.error("Error loading images:", error);
      return;
    }

    const imagesWithUrls = data.map((file) => {
      const { data: { publicUrl } } = supabase.storage
        .from("article-images")
        .getPublicUrl(`hero-images/${file.name}`);
      return { ...file, publicUrl };
    });

    setStorageImages(imagesWithUrls);
  };

  useEffect(() => {
    if (!selectedSlug && articles[0]?.slug) {
      setSelectedSlug(articles[0].slug);
    }
  }, [articles, selectedSlug]);

  useEffect(() => {
    void loadAdminData();
    if (activeTab === TAB_KEYS.images) {
      void loadStorageImages();
    }
  }, [articles, activeTab]);

  const handleSendTest = async () => {
    if (!selectedSlug || !testEmail.trim()) {
      setErrorMessage("Select an article and a test email first.");
      return;
    }
    setErrorMessage("");
    setStatusMessage("");
    setIsSubmitting(true);

    const response = await fetch("/api/newsletter-send-test", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ slug: selectedSlug, toEmail: testEmail.trim() }),
    });

    const payload = await response.json().catch(() => ({}));
    setIsSubmitting(false);
    if (!response.ok) {
      setErrorMessage(payload.error || "Could not send test email.");
      return;
    }
    setStatusMessage(payload.message || "Test email sent.");
  };

  const handleSendAll = async () => {
    if (!selectedSlug) {
      setErrorMessage("Select an article first.");
      return;
    }
    setErrorMessage("");
    setStatusMessage("");
    setIsSubmitting(true);

    const response = await fetch("/api/newsletter-send-all", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ slug: selectedSlug, confirmationSlug: confirmSlug.trim() }),
    });
    const payload = await response.json().catch(() => ({}));
    setIsSubmitting(false);
    if (!response.ok) {
      setErrorMessage(payload.error || "Could not send newsletter.");
      return;
    }
    setStatusMessage(payload.message || "Newsletter sent.");
    setConfirmSlug("");
    await loadAdminData();
  };

  const persistManageRow = async (row) => {
    setErrorMessage("");
    setStatusMessage("");
    setIsSubmitting(true);
    if (row.source === "admin") {
      const { error } = await supabase
        .from("admin_articles")
        .update({
          category: row.category,
          is_private: row.isPrivate,
        })
        .eq("slug", row.slug);
      setIsSubmitting(false);
      if (error) {
        setErrorMessage("Could not update admin article.");
        return;
      }
    } else {
      const { error } = await supabase.from("article_settings").upsert(
        {
          article_slug: row.slug,
          category: row.category,
          is_private: row.isPrivate,
        },
        { onConflict: "article_slug" }
      );
      setIsSubmitting(false);
      if (error) {
        setErrorMessage("Could not update article settings.");
        return;
      }
    }

    await refreshArticleCatalog();
    await loadAdminData();
    setStatusMessage(`Updated ${row.slug}.`);
  };

  const startNewCmsDraft = () => {
    setEditingCmsSlug("");
    setEditorForm({
      ...EMPTY_EDITOR,
      author: user?.email || "William",
      publishedAt: toLocalDateTimeInput(new Date().toISOString()),
    });
  };

  const beginEditCmsArticle = (slug) => {
    const article = adminCmsArticles.find((item) => item.slug === slug);
    if (!article) {
      return;
    }
    setEditingCmsSlug(slug);
    setEditorForm({
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt || "",
      body: article.body || "",
      category: article.category || "my-tools",
      author: article.author || "William",
      publishedAt: toLocalDateTimeInput(article.publishedAt),
      readMinutes: article.readMinutes || 5,
      trending: Boolean(article.trending),
      draft: Boolean(article.draft),
      isPrivate: Boolean(article.isPrivate),
      heroImage: article.heroImage || "",
    });
  };

  const handleSaveCms = async () => {
    const slug = editorForm.slug.trim() || slugify(editorForm.title);
    if (!slug || !editorForm.title.trim()) {
      setErrorMessage("Title is required.");
      return;
    }

    setErrorMessage("");
    setStatusMessage("");
    setIsSubmitting(true);
    const payload = {
      slug,
      title: editorForm.title.trim(),
      excerpt: editorForm.excerpt.trim(),
      category: editorForm.category,
      author: editorForm.author.trim() || "William",
      published_at: new Date(editorForm.publishedAt).toISOString(),
      read_minutes: Number(editorForm.readMinutes || 5),
      trending: Boolean(editorForm.trending),
      draft: Boolean(editorForm.draft),
      is_private: Boolean(editorForm.isPrivate),
      hero_image: editorForm.heroImage.trim(),
      body: editorForm.body,
    };

    const { error } = await supabase.from("admin_articles").upsert(payload, { onConflict: "slug" });
    setIsSubmitting(false);
    if (error) {
      setErrorMessage("Could not save CMS article.");
      return;
    }

    await refreshArticleCatalog();
    await loadAdminData();
    setEditingCmsSlug(slug);
    setEditorForm((prev) => ({ ...prev, slug }));
    setStatusMessage(`Saved ${slug}.`);
  };

  const handleDeleteCms = async () => {
    if (!editingCmsSlug) {
      return;
    }
    setErrorMessage("");
    setStatusMessage("");
    setIsSubmitting(true);
    const { error } = await supabase.from("admin_articles").delete().eq("slug", editingCmsSlug);
    setIsSubmitting(false);
    if (error) {
      setErrorMessage("Could not delete CMS article.");
      return;
    }
    await refreshArticleCatalog();
    await loadAdminData();
    setStatusMessage(`Deleted ${editingCmsSlug}.`);
    startNewCmsDraft();
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrorMessage("");
    setStatusMessage("");
    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `hero-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("article-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("article-images")
        .getPublicUrl(filePath);

      setEditorForm((prev) => ({ ...prev, heroImage: publicUrl }));
      setStatusMessage("Image uploaded successfully.");
    } catch (error) {
      console.error("Upload error:", error);
      setErrorMessage(error.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="page-stack admin-page">
      <div className="page-intro">
        <p className="eyebrow">Admin</p>
        <h1>Admin Panel</h1>
        <p>Operate newsletter sends, monitor article analytics, and manage content controls.</p>
      </div>

      <div className="admin-tabs">
        <button
          type="button"
          className={`ghost-button ${activeTab === TAB_KEYS.ops ? "is-active" : ""}`}
          onClick={() => setActiveTab(TAB_KEYS.ops)}
        >
          Newsletter Ops
        </button>
        <button
          type="button"
          className={`ghost-button ${activeTab === TAB_KEYS.metrics ? "is-active" : ""}`}
          onClick={() => setActiveTab(TAB_KEYS.metrics)}
        >
          Metrics
        </button>
        <button
          type="button"
          className={`ghost-button ${activeTab === TAB_KEYS.manage ? "is-active" : ""}`}
          onClick={() => setActiveTab(TAB_KEYS.manage)}
        >
          Article Manage
        </button>
        <button
          type="button"
          className={`ghost-button ${activeTab === TAB_KEYS.cms ? "is-active" : ""}`}
          onClick={() => setActiveTab(TAB_KEYS.cms)}
        >
          My Tools CMS
        </button>
        <button
          type="button"
          className={`ghost-button ${activeTab === TAB_KEYS.images ? "is-active" : ""}`}
          onClick={() => setActiveTab(TAB_KEYS.images)}
        >
          Images
        </button>
      </div>

      {activeTab === TAB_KEYS.ops ? (
        <div className="admin-panel">
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>Newsletter Controls</h2>
            </div>
            <div className="admin-control-group">
              <div className="admin-row">
                <div className="admin-field">
                  <label htmlFor="admin-article-select">Select Article</label>
                  <select
                    id="admin-article-select"
                    className="admin-select"
                    value={selectedSlug}
                    onChange={(event) => setSelectedSlug(event.target.value)}
                  >
                    {articles.map((article) => (
                      <option key={article.slug} value={article.slug}>
                        {article.title}
                        {article.draft ? " (draft)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedArticle ? (
                  <div className="admin-row" style={{ marginTop: "1.5rem" }}>
                    <Link to={`/preview/article/${selectedArticle.slug}`} className="admin-button secondary">
                      Preview Article
                    </Link>
                    <Link to={`/preview/email/${selectedArticle.slug}`} className="admin-button secondary">
                      Preview Email
                    </Link>
                  </div>
                ) : null}
              </div>

              <div className="admin-row">
                <div className="admin-field">
                  <label>Test Send</label>
                  <input
                    type="email"
                    className="admin-input"
                    value={testEmail}
                    onChange={(event) => setTestEmail(event.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
                <button 
                  type="button" 
                  className="admin-button" 
                  onClick={handleSendTest}
                  disabled={isSubmitting}
                  style={{ marginTop: "1.5rem" }}
                >
                  {isSubmitting ? "Sending..." : "Send Test Email"}
                </button>
              </div>

              <div className="admin-row">
                <div className="admin-field">
                  <label>Broadcast Send (All Subscribers)</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={confirmSlug}
                    onChange={(event) => setConfirmSlug(event.target.value)}
                    placeholder={`Type slug to confirm: ${selectedSlug}`}
                  />
                </div>
                <button 
                  type="button" 
                  className="admin-button" 
                  onClick={handleSendAll}
                  disabled={isSubmitting}
                  style={{ marginTop: "1.5rem" }}
                >
                  {isSubmitting ? "Sending..." : "Send To All Subscribers"}
                </button>
              </div>
            </div>
          </div>

          <div className="admin-section">
            <div className="admin-section-header">
              <h2>Recent Sends</h2>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Article Slug</th>
                    <th>Sent Count</th>
                    <th>Sent At</th>
                  </tr>
                </thead>
                <tbody>
                  {sendRows.length ? (
                    sendRows.map((row) => (
                      <tr key={`${row.article_slug}-${row.inserted_at}`}>
                        <td>{row.article_slug}</td>
                        <td>{row.sent_count}</td>
                        <td>{formatDateTime(row.inserted_at)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="empty-state">No send history yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === TAB_KEYS.metrics ? (
        <div className="admin-panel">
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>Article Analytics</h2>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Views</th>
                    <th>Unique Readers</th>
                    <th>Hearts</th>
                    <th>Saves</th>
                    <th>Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {metricRows.length ? (
                    metricRows.map((row) => (
                      <tr key={row.slug}>
                        <td style={{ fontWeight: 600 }}>{row.title}</td>
                        <td>{row.views}</td>
                        <td>{row.uniqueReaders}</td>
                        <td>{row.hearts}</td>
                        <td>{row.saves}</td>
                        <td>{row.sentCount}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="empty-state">No metrics available yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === TAB_KEYS.manage ? (
        <div className="admin-panel">
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>Content Visibility & Metadata</h2>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Slug</th>
                    <th>Category</th>
                    <th style={{ textAlign: "center" }}>Private</th>
                    <th>Source</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {manageRows.map((row) => (
                    <tr key={row.slug}>
                      <td>{row.slug}</td>
                      <td>
                        <select
                          className="admin-select"
                          value={row.category}
                          onChange={(event) =>
                            setManageRows((prev) =>
                              prev.map((item) =>
                                item.slug === row.slug ? { ...item, category: event.target.value } : item
                              )
                            )
                          }
                        >
                          {CATEGORY_OPTIONS.map((key) => (
                            <option key={key} value={key}>
                              {categoryMeta[key]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <label className="admin-checkbox" style={{ justifyContent: "center" }}>
                          <input
                            type="checkbox"
                            checked={row.isPrivate}
                            onChange={(event) =>
                              setManageRows((prev) =>
                                prev.map((item) =>
                                  item.slug === row.slug
                                    ? { ...item, isPrivate: event.target.checked }
                                    : item
                                )
                              )
                            }
                          />
                        </label>
                      </td>
                      <td>
                        <span className="eyebrow" style={{ margin: 0, fontSize: "0.65rem" }}>
                          {row.source}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button 
                          type="button" 
                          className="admin-button" 
                          onClick={() => persistManageRow(row)}
                          disabled={isSubmitting}
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === TAB_KEYS.cms ? (
        <div className="admin-panel">
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>Editor: {editingCmsSlug ? editingCmsSlug : "New Draft"}</h2>
              <div className="admin-row">
                <button type="button" className="admin-button secondary" onClick={startNewCmsDraft}>
                  New Article
                </button>
                <select
                  className="admin-select"
                  value={editingCmsSlug}
                  onChange={(event) => beginEditCmsArticle(event.target.value)}
                  style={{ minWidth: "200px" }}
                >
                  <option value="">Select existing article</option>
                  {adminCmsArticles.map((article) => (
                    <option key={article.slug} value={article.slug}>
                      {article.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="admin-control-group">
              <div className="admin-row">
                <div className="admin-field">
                  <label>Title</label>
                  <input
                    className="admin-input"
                    type="text"
                    placeholder="Article Title"
                    value={editorForm.title}
                    onChange={(event) =>
                      setEditorForm((prev) => ({
                        ...prev,
                        title: event.target.value,
                        slug: editingCmsSlug ? prev.slug : slugify(event.target.value),
                      }))
                    }
                  />
                </div>
                <div className="admin-field">
                  <label>Slug</label>
                  <input
                    className="admin-input"
                    type="text"
                    placeholder="article-slug"
                    value={editorForm.slug}
                    onChange={(event) => setEditorForm((prev) => ({ ...prev, slug: slugify(event.target.value) }))}
                  />
                </div>
              </div>

              <div className="admin-field">
                <label>Excerpt</label>
                <input
                  className="admin-input"
                  type="text"
                  placeholder="Short summary of the article..."
                  value={editorForm.excerpt}
                  onChange={(event) => setEditorForm((prev) => ({ ...prev, excerpt: event.target.value }))}
                />
              </div>

              <div className="admin-row">
                <div className="admin-field">
                  <label>Author</label>
                  <input
                    className="admin-input"
                    type="text"
                    placeholder="Author Name"
                    value={editorForm.author}
                    onChange={(event) => setEditorForm((prev) => ({ ...prev, author: event.target.value }))}
                  />
                </div>
                <div className="admin-field">
                  <label>Category</label>
                  <select
                    className="admin-select"
                    value={editorForm.category}
                    onChange={(event) => setEditorForm((prev) => ({ ...prev, category: event.target.value }))}
                  >
                    {CATEGORY_OPTIONS.map((key) => (
                      <option key={key} value={key}>
                        {categoryMeta[key]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-field">
                  <label>Published At</label>
                  <input
                    className="admin-input"
                    type="datetime-local"
                    value={editorForm.publishedAt}
                    onChange={(event) => setEditorForm((prev) => ({ ...prev, publishedAt: event.target.value }))}
                  />
                </div>
              </div>

              <div className="admin-row">
                <div className="admin-field">
                  <label>Read Minutes</label>
                  <input
                    className="admin-input"
                    type="number"
                    min="1"
                    value={editorForm.readMinutes}
                    onChange={(event) => setEditorForm((prev) => ({ ...prev, readMinutes: event.target.value }))}
                  />
                </div>
                <div className="admin-field">
                  <label>Hero Image</label>
                  <div className="admin-row" style={{ gap: "0.5rem", alignItems: "center" }}>
                    <input
                      className="admin-input"
                      type="text"
                      placeholder="https://..."
                      value={editorForm.heroImage}
                      onChange={(event) => setEditorForm((prev) => ({ ...prev, heroImage: event.target.value }))}
                      style={{ flex: 1 }}
                    />
                    <label className="admin-button secondary" style={{ cursor: "pointer", margin: 0, whiteSpace: "nowrap" }}>
                      {isUploading ? "Uploading..." : "Upload File"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                  {editorForm.heroImage && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <img 
                        src={editorForm.heroImage} 
                        alt="Preview" 
                        style={{ height: "60px", borderRadius: "4px", objectFit: "cover" }} 
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-field">
                <label>Content (Markdown)</label>
                <textarea
                  className="admin-body-textarea"
                  value={editorForm.body}
                  placeholder="Write article body in markdown..."
                  onChange={(event) => setEditorForm((prev) => ({ ...prev, body: event.target.value }))}
                />
              </div>

              <div className="admin-checkbox-group">
                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={editorForm.trending}
                    onChange={(event) =>
                      setEditorForm((prev) => ({ ...prev, trending: event.target.checked }))
                    }
                  />
                  Trending
                </label>
                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={editorForm.draft}
                    onChange={(event) => setEditorForm((prev) => ({ ...prev, draft: event.target.checked }))}
                  />
                  Draft
                </label>
                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={editorForm.isPrivate}
                    onChange={(event) =>
                      setEditorForm((prev) => ({ ...prev, isPrivate: event.target.checked }))
                    }
                  />
                  Private
                </label>
              </div>

              <div className="admin-row" style={{ marginTop: "1rem", justifyContent: "flex-end" }}>
                {editingCmsSlug && (
                  <button 
                    type="button" 
                    className="admin-button danger" 
                    onClick={handleDeleteCms}
                    disabled={isSubmitting}
                  >
                    Delete Article
                  </button>
                )}
                <button 
                  type="button" 
                  className="admin-button" 
                  onClick={handleSaveCms}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Article"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === TAB_KEYS.images ? (
        <div className="admin-panel">
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>Uploaded Images</h2>
              <button 
                type="button" 
                className="admin-button secondary" 
                onClick={loadStorageImages}
              >
                Refresh
              </button>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Preview</th>
                    <th>Name</th>
                    <th>Public URL</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {storageImages.length ? (
                    storageImages.map((img) => (
                      <tr key={img.id || img.name}>
                        <td>
                          <img 
                            src={img.publicUrl} 
                            alt={img.name} 
                            style={{ width: "60px", height: "40px", objectFit: "cover", borderRadius: "4px" }} 
                          />
                        </td>
                        <td style={{ fontSize: "0.8rem", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {img.name}
                        </td>
                        <td>
                          <div className="admin-row" style={{ gap: "0.5rem" }}>
                            <input 
                              className="admin-input" 
                              readOnly 
                              value={img.publicUrl} 
                              style={{ fontSize: "0.7rem", padding: "0.25rem" }}
                              onClick={(e) => e.target.select()}
                            />
                            <button 
                              type="button" 
                              className="admin-button secondary" 
                              style={{ padding: "0.25rem 0.5rem", fontSize: "0.7rem" }}
                              onClick={() => {
                                navigator.clipboard.writeText(img.publicUrl);
                                setStatusMessage("URL copied to clipboard.");
                              }}
                            >
                              Copy
                            </button>
                          </div>
                        </td>
                        <td style={{ fontSize: "0.8rem" }}>
                          {img.created_at ? formatDateTime(img.created_at) : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="empty-state">No images found in storage.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {errorMessage ? <p className="auth-error" style={{ marginTop: "1rem" }}>{errorMessage}</p> : null}
      {statusMessage ? <p className="auth-success" style={{ marginTop: "1rem" }}>{statusMessage}</p> : null}
    </section>
  );
}
