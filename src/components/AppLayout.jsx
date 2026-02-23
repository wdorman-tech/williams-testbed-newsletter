import { Link, useNavigate } from "react-router-dom";
import TopBanner from "./TopBanner";
import { useAuth } from "../state/AuthContext";

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const isAdmin = profile?.role === "admin";

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      // Keep this visible for debugging if Supabase rejects sign-out.
      console.error(error);
    }
  };

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
          <button type="button" className="link-like" onClick={handleSignOut}>
            Logout
          </button>
        )}
      </nav>
      <main className="main-content page-surface">{children}</main>
    </div>
  );
}
