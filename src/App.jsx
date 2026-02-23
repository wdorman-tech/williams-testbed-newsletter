import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ArticlePage from "./pages/ArticlePage";
import CategoryPage from "./pages/CategoryPage";
import FavoritesPage from "./pages/FavoritesPage";
import HomePage from "./pages/HomePage";
import InfoPage from "./pages/InfoPage";
import ReadingListPage from "./pages/ReadingListPage";
import SettingsPage from "./pages/SettingsPage";
import WorkWithMePage from "./pages/WorkWithMePage";
import { useAppState } from "./state/AppStateContext";

function Page({ children }) {
  return <Layout>{children}</Layout>;
}

export default function App() {
  const { theme } = useAppState();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Page>
            <HomePage />
          </Page>
        }
      />
      <Route
        path="/favorites"
        element={
          <Page>
            <FavoritesPage />
          </Page>
        }
      />
      <Route
        path="/automation"
        element={
          <Page>
            <CategoryPage
              categoryKey="automation"
              title="Automation"
              description="Articles focused on automation strategy, rollouts, and maintenance."
            />
          </Page>
        }
      />
      <Route
        path="/marketing"
        element={
          <Page>
            <CategoryPage
              categoryKey="marketing"
              title="Marketing"
              description="Articles focused on positioning, content systems, and campaign execution."
            />
          </Page>
        }
      />
      <Route
        path="/my-workflow"
        element={
          <Page>
            <CategoryPage
              categoryKey="my-workflow"
              title="My Workflow"
              description="Articles describing personal operating systems and team rhythms."
            />
          </Page>
        }
      />
      <Route
        path="/my-tools"
        element={
          <Page>
            <CategoryPage
              categoryKey="my-tools"
              title="My Tools"
              description="Articles on evaluating and selecting tools for scalable operations."
            />
          </Page>
        }
      />
      <Route
        path="/reading-list"
        element={
          <Page>
            <ReadingListPage />
          </Page>
        }
      />
      <Route
        path="/info"
        element={
          <Page>
            <InfoPage />
          </Page>
        }
      />
      <Route
        path="/settings"
        element={
          <Page>
            <SettingsPage />
          </Page>
        }
      />
      <Route
        path="/work-with-me"
        element={
          <Page>
            <WorkWithMePage />
          </Page>
        }
      />
      <Route
        path="/article/:slug"
        element={
          <Page>
            <ArticlePage />
          </Page>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
