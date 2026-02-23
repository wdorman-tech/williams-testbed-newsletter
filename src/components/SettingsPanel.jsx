import { useEffect, useState } from "react";
import { apiFetch } from "../lib/apiClient";

export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [weeklyDigestEnabled, setWeeklyDigestEnabled] = useState(true);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen || isLoaded) {
      return;
    }

    const load = async () => {
      try {
        const response = await apiFetch("/api/settings");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Could not load settings.");
        }
        setDisplayName(data.settings?.display_name || "");
        setWeeklyDigestEnabled(
          data.settings?.weekly_digest_enabled === undefined
            ? true
            : Boolean(data.settings.weekly_digest_enabled)
        );
        setIsLoaded(true);
      } catch (error) {
        setMessage(error.message || "Could not load settings.");
      }
    };

    load();
  }, [isOpen, isLoaded]);

  const save = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);

    try {
      const response = await apiFetch("/api/settings", {
        method: "PATCH",
        body: JSON.stringify({ displayName, weeklyDigestEnabled }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not save settings.");
      }
      setMessage("Settings updated.");
    } catch (error) {
      setMessage(error.message || "Could not save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="sidebar-settings">
      <button
        type="button"
        className="sidebar-toggle"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        Settings
      </button>
      {isOpen && (
        <form className="sidebar-settings-form" onSubmit={save}>
          <label>
            <span className="meta-label">Display name</span>
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              maxLength={80}
            />
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={weeklyDigestEnabled}
              onChange={(event) => setWeeklyDigestEnabled(event.target.checked)}
            />
            <span className="meta-label">Weekly digest enabled</span>
          </label>
          <button type="submit" className="button button-primary" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </button>
          {message && <p className="message">{message}</p>}
        </form>
      )}
    </section>
  );
}
