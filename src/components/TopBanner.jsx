import { Link } from "react-router-dom";

export default function TopBanner() {
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
      <Link className="banner-login-button" to="/login">
        Login
      </Link>
    </header>
  );
}
