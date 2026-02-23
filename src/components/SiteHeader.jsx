import { NavLink } from "react-router-dom";
import { useAppState } from "../state/AppStateContext";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/favorites", label: "Favorites" },
  { to: "/automation", label: "Automation" },
  { to: "/marketing", label: "Marketing" },
  { to: "/my-workflow", label: "My Workflow" },
  { to: "/my-tools", label: "My Tools" },
  { to: "/reading-list", label: "Reading List" },
  { to: "/info", label: "Info" },
  { to: "/settings", label: "Settings" },
];

export default function SiteHeader() {
  const { theme, toggleTheme } = useAppState();

  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Primary">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="header-actions">
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </button>
        <a
          href="https://blacklilyaccelerator.com"
          target="_blank"
          rel="noreferrer"
          className="logo-link"
          aria-label="Visit Black Lily Accelerator"
        >
          <img
            src="/photos/blacklily_transparent.png"
            alt="Black Lily Accelerator"
            className="logo-image"
          />
        </a>
      </div>
    </header>
  );
}
