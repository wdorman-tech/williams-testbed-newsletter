import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../state/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw error;
        }
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          throw error;
        }
        setMessage("Account created. You can now log in.");
        setMode("login");
      }
    } catch (error) {
      setMessage(error.message || "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="card narrow reveal">
      <h2>{mode === "login" ? "Login" : "Create account"}</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          minLength={8}
          required
        />
        <button className="button primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
        </button>
      </form>
      <button type="button" className="link-like" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
        {mode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
      </button>
      {message && <p className="message">{message}</p>}
    </section>
  );
}
