import { Link } from "react-router-dom";
import TopBanner from "./TopBanner";
import { useAuth } from "../state/AuthContext";

export default function AppLayout({ children }) {
  const { user, profile, signOut } = useAuth();
  const isAdmin = profile?.role === "admin";

  return (
    <div className="app-shell">
      <TopBanner />
      <nav className="nav-row">
        <Link to="/">Home</Link>
        {user && <Link to="/dashboard">Dashboard</Link>}
        {user && <Link to="/archive">Archive</Link>}
        {user && <Link to="/my-tool-recommendations">My Tool Recommendations</Link>}
        {user && <Link to="/settings">Settings</Link>}
        {isAdmin && <Link to="/admin">Admin</Link>}
        {!user ? (
          <Link to="/login">Login</Link>
        ) : (
          <button type="button" className="link-like" onClick={signOut}>
            Logout
          </button>
        )}
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
}
