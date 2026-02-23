import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAppState } from "../state/AppStateContext";

const SIGNUP_TITLE = "sign up for free to\nstay ahead of the curve";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [typedTitle, setTypedTitle] = useState("");
  const { login, isLoggedIn } = useAppState();

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login
    login();
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
            <button type="submit" className="signup-button">
              Sign Up
            </button>
          </div>
        </form>
        <div className="login-link-container">
          <button onClick={login} className="login-link">
            login
          </button>
        </div>
      </div>
    </div>
  );
}
