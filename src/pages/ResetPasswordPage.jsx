import { Link } from "react-router-dom";
import { useState } from "react";
import { useAppState } from "../state/AppStateContext";

export default function ResetPasswordPage() {
  const { updatePassword, authLoading, user } = useAppState();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("");

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const result = await updatePassword(password);
    setIsSubmitting(false);

    if (result?.error) {
      setErrorMessage(result.error);
      return;
    }

    setStatusMessage("Password reset complete. You can sign in now.");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="signup-container">
      <div className="signup-content">
        <h1 className="signup-title">Reset your password</h1>
        {authLoading ? (
          <p className="auth-success">Verifying reset link...</p>
        ) : !user ? (
          <p className="auth-error">
            Invalid or expired reset session. Request a new reset email from the login page.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="signup-form">
            <div className="input-wrapper">
              <input
                type="password"
                placeholder="new password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="signup-input"
                minLength={8}
                required
              />
              <input
                type="password"
                placeholder="confirm new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="signup-input"
                minLength={8}
                required
              />
              <button type="submit" className="signup-button">
                {isSubmitting ? "Updating..." : "Update Password"}
              </button>
              {errorMessage && <p className="auth-error">{errorMessage}</p>}
              {statusMessage && <p className="auth-success">{statusMessage}</p>}
            </div>
          </form>
        )}
        <div className="login-link-container">
          <Link to="/signup" className="login-link">
            back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
