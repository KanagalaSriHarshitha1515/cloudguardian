import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Loader from "../components/common/Loader";
import { isAdminRole } from "../utils/roles";

// Sits inside ProtectedRoute — this only adds a role check on top.
// Non-admins get bounced to /dashboard rather than seeing a blank/broken page.
export default function AdminRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdminRole(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
}
