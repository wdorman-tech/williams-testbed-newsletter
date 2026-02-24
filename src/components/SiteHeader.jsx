import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import brandMark from "../../photos/blacklily_transparent.png";
import { useAppState } from "../state/AppStateContext";

const baseNavItems = [
  { to: "/", label: "Home", end: true },
  { to: "/my-tools", label: "My Tools" },
  { to: "/reading-list", label: "Reading List" },
  { to: "/info", label: "Info" },
  { to: "/settings", label: "Settings" },
];

const categoryItems = [
  { to: "/favorites", label: "Favorites" },
  { to: "/automation", label: "Automation" },
  { to: "/marketing", label: "Marketing" },
  { to: "/my-workflow", label: "My Workflow" },
];

export default function SiteHeader() {
  const { isAdmin } = useAppState();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navItems = isAdmin
    ? [...baseNavItems.slice(0, 3), { to: "/admin", label: "Admin" }, ...baseNavItems.slice(3)]
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
        {navItems.slice(0, 1).map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}
          >
            {item.label}
          </NavLink>
        ))}

        <div 
          className="nav-dropdown"
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <button 
            className={`nav-link dropdown-trigger ${isDropdownOpen ? "is-active" : ""}`}
            aria-expanded={isDropdownOpen}
          >
            Article Categories
            <svg className="dropdown-arrow" viewBox="0 0 24 24" width="12" height="12">
              <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {isDropdownOpen && (
            <div className="dropdown-menu">
              {categoryItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) => `dropdown-item ${isActive ? "is-active" : ""}`}
                  onClick={() => setIsDropdownOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {navItems.slice(1).map((item) => (
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
        <a href="https://blacklilyaccelerator.com" className="work-with-me-button" target="_blank" rel="noopener noreferrer">
          Work with Me
        </a>
      </div>
    </header>
  );
}
