import { useEffect, useState } from "react";
import { apiFetch } from "../lib/apiClient";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [weeklyDigestEnabled, setWeeklyDigestEnabled] = useState(true);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const response = await apiFetch("/api/settings");
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || "Could not load settings.");
        return;
      }
      setDisplayName(data.settings?.display_name || "");
      setWeeklyDigestEnabled(
        data.settings?.weekly_digest_enabled === undefined
          ? true
          : Boolean(data.settings.weekly_digest_enabled)
      );
    };
    load();
  }, []);

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
    <section className="card narrow">
      <h2>Settings</h2>
      <form className="form-grid" onSubmit={save}>
        <label>
          Display name
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
          Weekly digest emails enabled
        </label>
        <button type="submit" className="button primary" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save settings"}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </section>
  );
}
