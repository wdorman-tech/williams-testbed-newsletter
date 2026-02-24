import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useArticles } from "../hooks/useArticles";
import { useAppState } from "../state/AppStateContext";

export default function SettingsPage() {
  const { user, session, signOut, sendPasswordResetEmail } = useAppState();
  const { articles } = useArticles();
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState(articles[0]?.slug ?? "");
  const [testEmail, setTestEmail] = useState(user?.email ?? "");
  const [confirmSlug, setConfirmSlug] = useState("");

  const isNewsletterAdmin = useMemo(() => {
    const configured = (import.meta.env.VITE_NEWSLETTER_ADMIN_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
    const userEmail = user?.email?.toLowerCase() || "";
    return Boolean(userEmail) && configured.includes(userEmail);
  }, [user?.email]);

  const selectedArticle = useMemo(
    () => articles.find((article) => article.slug === selectedSlug) || null,
    [articles, selectedSlug]
  );

  useEffect(() => {
    if (!selectedSlug && articles[0]?.slug) {
      setSelectedSlug(articles[0].slug);
    }
  }, [articles, selectedSlug]);

  const handleSendPasswordReset = async () => {
    if (!user?.email) {
      return;
    }

    setErrorMessage("");
    setStatusMessage("");
    setIsSubmitting(true);
    const result = await sendPasswordResetEmail(user.email);
    setIsSubmitting(false);

    if (result?.error) {
      setErrorMessage(result.error);
      return;
    }
    setStatusMessage("Password reset email sent.");
  };

  const handleSignOut = async () => {
    setErrorMessage("");
    setStatusMessage("");
    setIsSubmitting(true);
    const result = await signOut();
    setIsSubmitting(false);
    if (result?.error) {
      setErrorMessage(result.error);
    }
  };

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.access_token || ""}`,
  });

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
      headers: getAuthHeaders(),
      body: JSON.stringify({
        slug: selectedSlug,
        toEmail: testEmail.trim(),
      }),
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
      headers: getAuthHeaders(),
      body: JSON.stringify({
        slug: selectedSlug,
        confirmationSlug: confirmSlug.trim(),
      }),
    });

    const payload = await response.json().catch(() => ({}));
    setIsSubmitting(false);
    if (!response.ok) {
      setErrorMessage(payload.error || "Could not send newsletter.");
      return;
    }
    setStatusMessage(payload.message || "Newsletter sent.");
    setConfirmSlug("");
  };

  return (
    <section className="page-stack">
      <div className="page-intro">
        <p className="eyebrow">Settings</p>
        <h1>Account Settings</h1>
      </div>

      <div className="settings-card">
        <div className="setting-row">
          <p className="setting-label">Email</p>
          <p className="setting-value">{user?.email ?? "Not available"}</p>
        </div>

        <div className="setting-row">
          <p className="setting-label">Password</p>
          <button type="button" className="ghost-button" onClick={handleSendPasswordReset}>
            {isSubmitting ? "Please wait..." : "Send Reset Email"}
          </button>
        </div>

        <div className="setting-row">
          <p className="setting-label">Session</p>
          <button type="button" className="ghost-button" onClick={handleSignOut}>
            {isSubmitting ? "Please wait..." : "Sign Out"}
          </button>
        </div>
      </div>

      {isNewsletterAdmin ? (
        <div className="newsletter-panel">
          <p className="eyebrow">Newsletter Admin</p>
          <div className="newsletter-control-row">
            <label htmlFor="newsletter-article" className="setting-label">
              Article
            </label>
            <select
              id="newsletter-article"
              className="newsletter-select"
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
            {selectedArticle ? (
              <>
                <Link to={`/preview/article/${selectedArticle.slug}`} className="ghost-button">
                  Preview Article
                </Link>
                <Link to={`/preview/email/${selectedArticle.slug}`} className="ghost-button">
                  Preview Email
                </Link>
              </>
            ) : null}
          </div>

          <div className="newsletter-control-row">
            <input
              type="email"
              className="newsletter-input"
              value={testEmail}
              onChange={(event) => setTestEmail(event.target.value)}
              placeholder="your@email.com"
            />
            <button type="button" className="ghost-button" onClick={handleSendTest}>
              {isSubmitting ? "Please wait..." : "Send Test Email"}
            </button>
          </div>

          <div className="newsletter-control-row">
            <input
              type="text"
              className="newsletter-input"
              value={confirmSlug}
              onChange={(event) => setConfirmSlug(event.target.value)}
              placeholder={`Type slug to confirm send-all: ${selectedSlug}`}
            />
            <button type="button" className="ghost-button" onClick={handleSendAll}>
              {isSubmitting ? "Please wait..." : "Send To All Subscribers"}
            </button>
          </div>
        </div>
      ) : null}
      {errorMessage && <p className="auth-error">{errorMessage}</p>}
      {statusMessage && <p className="auth-success">{statusMessage}</p>}
    </section>
  );
}
