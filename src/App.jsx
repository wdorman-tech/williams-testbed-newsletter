import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import { AdminRoute, ProtectedRoute } from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import NewsletterPage from "./pages/NewsletterPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/archive" element={<Navigate to="/dashboard?tab=editions" replace />} />
        <Route
          path="/archive/:slug"
          element={
            <ProtectedRoute>
              <NewsletterPage />
            </ProtectedRoute>
          }
        />
        <Route path="/my-tool-recommendations" element={<Navigate to="/dashboard?tab=tools" replace />} />
        <Route path="/settings" element={<Navigate to="/dashboard?tab=editions" replace />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
