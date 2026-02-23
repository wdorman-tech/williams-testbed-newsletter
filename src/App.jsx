import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import ArticlePage from "./pages/ArticlePage";
import CategoryPage from "./pages/CategoryPage";
import FavoritesPage from "./pages/FavoritesPage";
import HomePage from "./pages/HomePage";
import InfoPage from "./pages/InfoPage";
import ReadingListPage from "./pages/ReadingListPage";
import SettingsPage from "./pages/SettingsPage";
import WorkWithMePage from "./pages/WorkWithMePage";
import SignupPage from "./pages/SignupPage";
import { useAppState } from "./state/AppStateContext";
import CursorFollower from "./components/CursorFollower";

function Page({ children }) {
  return <Layout>{children}</Layout>;
}

function RequireAuth({ children }) {
  const { isLoggedIn } = useAppState();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/signup" state={{ from: location }} replace />;
  }

  return children;
}

export default function App() {
  const { theme } = useAppState();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <>
      <CursorFollower />
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        
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
        path="/work-with-me"
        element={
          <RequireAuth>
            <Page>
              <WorkWithMePage />
            </Page>
          </RequireAuth>
        }
      />
      <Route
        path="/article/:slug"
        element={
          <RequireAuth>
            <Page>
              <ArticlePage />
            </Page>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
