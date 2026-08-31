import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { isLogin, role } = useAuth();

  if (!isLogin) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    if (role === "restaurant") return <Navigate to="/restaurant-dashboard" replace />;
    if (role === "rider") return <Navigate to="/rider-dashboard" replace />;
    if (role === "admin") return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to="/customer-dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
