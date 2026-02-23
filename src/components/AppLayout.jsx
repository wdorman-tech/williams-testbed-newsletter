import { Link, useLocation, useNavigate } from "react-router-dom";
import TopBanner from "./TopBanner";
import { useAuth } from "../state/AuthContext";
import SettingsPanel from "./SettingsPanel";
import PublishEditionModal from "./PublishEditionModal";
import { useState } from "react";

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const isAdmin = profile?.role === "admin";
  const isDashboardRoute = user && location.pathname === "/dashboard";
  const activeTab = new URLSearchParams(location.search).get("tab") === "tools" ? "tools" : "editions";

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
      {isDashboardRoute ? (
        <div className="dashboard-shell">
          <aside className="sidebar">
            <div className="sidebar-top">
              <p className="sidebar-brand">William's Testbed</p>
              <nav className="sidebar-nav">
                <Link className={`sidebar-link${activeTab === "editions" ? " active" : ""}`} to="/dashboard?tab=editions">
                  Editions
                </Link>
                <Link className={`sidebar-link${activeTab === "tools" ? " active" : ""}`} to="/dashboard?tab=tools">
                  Tool Picks
                </Link>
              </nav>
              <SettingsPanel />
            </div>
            <div className="sidebar-bottom">
              {isAdmin && (
                <button type="button" className="button button-primary sidebar-publish" onClick={() => setIsPublishOpen(true)}>
                  Publish New Edition
                </button>
              )}
              <div className="sidebar-user-row">
                <div>
                  <p className="meta-label">{profile?.display_name || user?.email || "Member"}</p>
                  <p className="meta-caption">{user?.email}</p>
                </div>
                <button type="button" className="button button-ghost" onClick={handleSignOut}>
                  Logout
                </button>
              </div>
            </div>
          </aside>
          <main className="dashboard-main">{children}</main>
          <PublishEditionModal
            isOpen={isPublishOpen}
            onClose={() => setIsPublishOpen(false)}
            onPublished={() => {
              setIsPublishOpen(false);
              navigate("/dashboard?tab=editions", { replace: true });
            }}
          />
        </div>
      ) : (
        <main className="main-content page-surface">
          <nav className="nav-row">
            <Link to="/">Home</Link>
            {user && <Link to="/dashboard">Dashboard</Link>}
            {!user && <Link to="/login">Login</Link>}
            {user && isAdmin && <Link to="/admin">Admin</Link>}
            {user && (
              <button type="button" className="link-like" onClick={handleSignOut}>
                Logout
              </button>
            )}
          </nav>
          {children}
        </main>
      )}
    </div>
  );
}
