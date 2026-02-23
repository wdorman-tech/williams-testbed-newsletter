import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

const tickerItems = ["WILLIAM'S TESTBED", "NEW EDITION WEEKLY", "AI TOOLS THAT ACTUALLY SHIP"];

export default function TopBanner() {
  const { user } = useAuth();
  const location = useLocation();
  const isLanding = !user && location.pathname === "/";

  if (isLanding) {
    return (
      <header className="landing-topbar">
        <p className="landing-brand">BLACKLILY</p>
        <nav className="landing-topbar-nav" aria-label="Primary">
          <a href="#services">Services</a>
          <a href="#case-studies">Case Studies</a>
          <a href="#faq">FAQ</a>
          <Link className="button landing-topbar-button" to="/login">
            Book A Call
          </Link>
        </nav>
      </header>
    );
  }

  return (
    <header className="top-banner">
      <div className="ticker-marquee" aria-hidden="true">
        <div className="ticker-track">
          <div className="ticker-group">
            {tickerItems.map((item) => (
              <span key={`primary-${item}`}>{item}</span>
            ))}
          </div>
          <div className="ticker-group">
            {tickerItems.map((item) => (
              <span key={`duplicate-${item}`}>{item}</span>
            ))}
          </div>
        </div>
      </div>
      {!user && (
        <Link className="banner-login-button" to="/login">
          Login
        </Link>
      )}
    </header>
  );
}
