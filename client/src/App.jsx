import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ApplicationDetails from "./pages/ApplicationDetails";
import AddApplication from "./pages/AddApplication";
import EditApplication from "./pages/EditApplication";

import StudentAnalytics from "./pages/StudentAnalytics";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminDashboard from "./pages/AdminDashboard";
import AdminApplications from "./pages/AdminApplications";
import AdminApplicationDetails from "./pages/AdminApplicationDetails";

import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import "./index.css";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-slate-400">
        Loading…
      </div>
    );
  }

  return (
    <>
      <Navbar />

      {/* Page Wrapper */}
      <div className="pt-2 sm:pt-4">
        <Routes>
          {/* ---------- AUTH ---------- */}
          <Route path="/login" element={<Login />} />

          {/* ---------- STUDENT ---------- */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <StudentAnalytics />
              </ProtectedRoute>
            }
          />

          <Route
            path="/applications/new"
            element={
              <ProtectedRoute>
                <AddApplication />
              </ProtectedRoute>
            }
          />

          <Route
            path="/applications/:id"
            element={
              <ProtectedRoute>
                <ApplicationDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/applications/:id/edit"
            element={
              <ProtectedRoute>
                <EditApplication />
              </ProtectedRoute>
            }
          />

          {/* ---------- ADMIN ---------- */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                {user?.role === "admin" ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to="/dashboard" replace />
                )}
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/applications"
            element={
              <ProtectedRoute>
                {user?.role === "admin" ? (
                  <AdminApplications />
                ) : (
                  <Navigate to="/dashboard" replace />
                )}
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/applications/:id"
            element={
              <ProtectedRoute>
                {user?.role === "admin" ? (
                  <AdminApplicationDetails />
                ) : (
                  <Navigate to="/dashboard" replace />
                )}
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute>
                {user?.role === "admin" ? (
                  <AdminAnalytics />
                ) : (
                  <Navigate to="/dashboard" replace />
                )}
              </ProtectedRoute>
            }
          />

          {/* ---------- FALLBACK ---------- */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
