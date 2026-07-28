import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import ToolsPage from "./pages/ToolsPage";
import ReportsPage from "./pages/ReportsPage";
import ReportGroupPage from "./pages/ReportGroupPage";
import ReportViewerPage from "./pages/ReportViewerPage";
import ArtworkLibraryPage from "./pages/ArtworkLibraryPage";
import { roleHasTools } from "./data/users";

function HomeRedirect() {
  const { user } = useAuth();
  if (!roleHasTools(user.role)) {
    return <Navigate to="/reports" replace />;
  }
  return <ToolsPage />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <HomeRedirect />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Layout>
              <ReportsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/:groupId"
        element={
          <ProtectedRoute>
            <Layout>
              <ReportGroupPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/:groupId/:reportId"
        element={
          <ProtectedRoute>
            <Layout>
              <ReportViewerPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tools/artwork-library"
        element={
          <ProtectedRoute>
            <Layout>
              <ArtworkLibraryPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
