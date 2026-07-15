import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const token = localStorage.getItem("token");
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-purple-400 animate-spin" />
      </div>
    );
  }
  if (!token || !user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
