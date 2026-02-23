import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAppState } from "../state/AppStateContext";

const SIGNUP_TITLE = "sign up for free to\nstay ahead of the curve";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [typedTitle, setTypedTitle] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUpWithEmailPassword, signInWithEmailPassword, sendPasswordResetEmail, isLoggedIn } =
    useAppState();

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setTypedTitle(SIGNUP_TITLE.slice(0, index));
      if (index >= SIGNUP_TITLE.length) {
        clearInterval(timer);
      }
    }, 45);

    return () => clearInterval(timer);
  }, []);

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setStatusMessage("");
    setIsSubmitting(true);

    let result;
    if (mode === "signup") {
      result = await signUpWithEmailPassword(email, password);
    } else if (mode === "forgot") {
      result = await sendPasswordResetEmail(email);
    } else {
      result = await signInWithEmailPassword(email, password);
    }

    if (result?.error) {
      setErrorMessage(result.error);
      setIsSubmitting(false);
      return;
    }

    if (result?.message) {
      setStatusMessage(result.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="signup-container">
      <div className="signup-content">
        <h1 className="signup-title signup-title--typewriter">
          {typedTitle}
          <span className="signup-caret" aria-hidden="true">
            |
          </span>
        </h1>
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="input-wrapper">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="signup-input"
              required
            />
            {mode !== "forgot" && (
              <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="signup-input"
                minLength={8}
                required
              />
            )}
            <button type="submit" className="signup-button">
              {isSubmitting
                ? "Please wait..."
                : mode === "signup"
                  ? "Create Account"
                  : mode === "forgot"
                    ? "Send Reset Email"
                    : "Login"}
            </button>
            {errorMessage && <p className="auth-error">{errorMessage}</p>}
            {statusMessage && <p className="auth-success">{statusMessage}</p>}
          </div>
        </form>

        <div className="login-link-container auth-link-row">
          <button type="button" onClick={() => setMode("login")} className="login-link">
            login
          </button>
          <button type="button" onClick={() => setMode("signup")} className="login-link">
            create account
          </button>
          <button type="button" onClick={() => setMode("forgot")} className="login-link">
            forgot password
          </button>
        </div>
      </div>
    </div>
  );
}
