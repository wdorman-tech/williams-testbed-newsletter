import { Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export default function TopBanner() {
  const { user } = useAuth();

  return (
    <header className="top-banner">
      <div className="ticker-track" aria-hidden="true">
        <span>WILLIAM'S TESTBED</span>
        <span>NEW EDITION WEEKLY</span>
        <span>AI TOOLS THAT ACTUALLY SHIP</span>
        <span>WILLIAM'S TESTBED</span>
        <span>NEW EDITION WEEKLY</span>
        <span>AI TOOLS THAT ACTUALLY SHIP</span>
      </div>
      {!user && (
        <Link className="banner-login-button" to="/login">
          Login
        </Link>
      )}
    </header>
  );
}
