import { Link, NavLink } from "react-router-dom";
import brandMark from "../../photos/blacklily_transparent.png";
import { useAppState } from "../state/AppStateContext";

const baseNavItems = [
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
  const { isAdmin } = useAppState();
  const navItems = isAdmin
    ? [...baseNavItems.slice(0, 8), { to: "/admin", label: "Admin" }, ...baseNavItems.slice(8)]
    : baseNavItems;

  return (
    <header className="site-header">
      <Link to="/" className="brand-name" title="William's Testbed Home">
        <img
          src={brandMark}
          alt="William's Testbed Logo"
          className="brand-mark"
          width="64"
          height="64"
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
        <Link to="/work-with-me" className="work-with-me-button">
          Work with Me
        </Link>
      </div>
    </header>
  );
}
