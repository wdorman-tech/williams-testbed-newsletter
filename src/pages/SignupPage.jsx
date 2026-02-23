import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAppState } from "../state/AppStateContext";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const { login, isLoggedIn } = useAppState();

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
        <h1 className="signup-title">
          sign up for free to stay ahead of the curve
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
