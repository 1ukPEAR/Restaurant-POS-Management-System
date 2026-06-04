import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Components
import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./routes/ProtectedRoute";

// Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import TableManage from "./pages/TableManage";
import MenuManage from "./pages/MenuManage";
import OrderPage from "./pages/OrderPage";
export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>;


  return (
    <div className="flex bg-gray-50 min-h-screen">
      {user && <Navbar />}
      <main className={`${user ? "ml-15" : ""} flex-1 p-4`}>
        <Routes>
          {/* ─── Route เริ่มต้น ─── */}
          <Route
            path="/"
            element={
              user ? (
                user.role === "worker"
                  ? <Navigate to="/order" replace />
                  : <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* ─── หน้า Auth ─── */}
          <Route
            path="/login"
            element={
              user ? (
                user.role === "worker"
                  ? <Navigate to="/order" replace />
                  : <Navigate to="/dashboard" replace />
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/register"
            element={
              user ? (
                user.role === "worker"
                  ? <Navigate to="/order" replace />
                  : <Navigate to="/dashboard" replace />
              ) : (
                <Register />
              )
            }
          />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* ─── Protected Routes ─── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tables"
            element={
              <ProtectedRoute>
                <TableManage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/menus"
            element={
              <ProtectedRoute>
                <MenuManage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/order"
            element={
              <ProtectedRoute>
                <OrderPage />
              </ProtectedRoute>
            }
          />

          {/* ─── fallback ─── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
