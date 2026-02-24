import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import ArticlePage from "./pages/ArticlePage";
import CategoryPage from "./pages/CategoryPage";
import FavoritesPage from "./pages/FavoritesPage";
import HomePage from "./pages/HomePage";
import InfoPage from "./pages/InfoPage";
import ReadingListPage from "./pages/ReadingListPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SettingsPage from "./pages/SettingsPage";
import SignupPage from "./pages/SignupPage";
import EmailPreviewPage from "./pages/EmailPreviewPage";
import AdminPage from "./pages/AdminPage";
import { useAppState } from "./state/AppStateContext";

function Page({ children }) {
  return <Layout>{children}</Layout>;
}

function RequireAuth({ children }) {
  const { isLoggedIn, authLoading } = useAppState();
  const location = useLocation();

  if (authLoading) {
    return <div className="page-content">Loading account...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/signup" state={{ from: location }} replace />;
  }

  return children;
}

function RequireAdmin({ children }) {
  const { isAdmin, authLoading } = useAppState();

  if (authLoading) {
    return <div className="page-content">Loading account...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const { theme, showCopyToast } = useAppState();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll(
      ".article-card, .section-block, .page-intro, .info-card, .settings-card"
    );
    elements.forEach((el) => {
      el.classList.add("reveal-on-scroll");
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <Page>
                <HomePage />
              </Page>
            </RequireAuth>
          }
        />
        <Route
          path="/favorites"
          element={
            <RequireAuth>
              <Page>
                <FavoritesPage />
              </Page>
            </RequireAuth>
          }
        />
        <Route
          path="/automation"
          element={
            <RequireAuth>
              <Page>
                <CategoryPage
                  categoryKey="automation"
                  title="Automation"
                  description="Articles focused on automation strategy, rollouts, and maintenance."
                />
              </Page>
            </RequireAuth>
          }
        />
        <Route
          path="/marketing"
          element={
            <RequireAuth>
              <Page>
                <CategoryPage
                  categoryKey="marketing"
                  title="Marketing"
                  description="Articles focused on positioning, content systems, and campaign execution."
                />
              </Page>
            </RequireAuth>
          }
        />
        <Route
          path="/my-workflow"
          element={
            <RequireAuth>
              <Page>
                <CategoryPage
                  categoryKey="my-workflow"
                  title="My Workflow"
                  description="Articles describing personal operating systems and team rhythms."
                />
              </Page>
            </RequireAuth>
          }
        />
        <Route
          path="/my-tools"
          element={
            <RequireAuth>
              <Page>
                <CategoryPage
                  categoryKey="my-tools"
                  title="My Tools"
                  description="Articles on evaluating and selecting tools for scalable operations."
                />
              </Page>
            </RequireAuth>
          }
        />
        <Route
          path="/reading-list"
          element={
            <RequireAuth>
              <Page>
                <ReadingListPage />
              </Page>
            </RequireAuth>
          }
        />
        <Route
          path="/info"
          element={
            <RequireAuth>
              <Page>
                <InfoPage />
              </Page>
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <Page>
                <SettingsPage />
              </Page>
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <RequireAdmin>
                <Page>
                  <AdminPage />
                </Page>
              </RequireAdmin>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <div className={`copy-toast ${showCopyToast ? "is-visible" : ""}`}>Link copied</div>
    </>
  );
}
