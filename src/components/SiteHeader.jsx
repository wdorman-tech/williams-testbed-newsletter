import { Link, NavLink } from "react-router-dom";

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
  return (
    <header className="site-header">
      <Link to="/" className="brand-name">
        <img
          src="/photos/blacklily_transparent.png"
          alt="William's Testbed"
          className="brand-mark"
        />
        William&apos;s Testbed
      </Link>
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
        <a
          href="https://blacklilyaccelerator.com"
          target="_blank"
          rel="noreferrer"
          className="work-with-me-button"
        >
          Work with Me
        </a>
      </div>
    </header>
  );
}
