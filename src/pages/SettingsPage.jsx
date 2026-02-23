import { useState } from "react";
import { useAppState } from "../state/AppStateContext";

export default function SettingsPage() {
  const { user, signOut, sendPasswordResetEmail } = useAppState();
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      {errorMessage && <p className="auth-error">{errorMessage}</p>}
      {statusMessage && <p className="auth-success">{statusMessage}</p>}
    </section>
  );
}
