import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext.jsx';
import { hasPermission } from '../../services/rbac.js';

export default function ProtectedRoute({ moduleKey, action = 'view', children }) {
  const { auth } = useAuth();
  if (!auth?.isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  if (moduleKey && !hasPermission(auth.permissions, moduleKey, action)) {
    return <Navigate to="/unauthorized" replace />;
  }
  if (children) {
    return <>{children}</>;
  }
  return <Outlet />;
}
