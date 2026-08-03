import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext.jsx';
import { hasPermission } from '../../services/rbac.js';

const PermissionCheckFallback = () => (
  <div className="flex min-h-[40vh] items-center justify-center px-6 py-10 text-sm text-slate-500">
    Checking access...
  </div>
);

export default function ProtectedRoute({ moduleKey, action = 'view', children }) {
  const { auth } = useAuth();
  const demoModeEnabled = typeof window !== 'undefined' && window.localStorage.getItem('erp_demo_mode') === 'true';
  const isAuthenticated = Boolean(auth?.isAuthenticated) || demoModeEnabled;
  const permissions = auth?.permissions || {};
  const hasPermissions = Object.keys(permissions).length > 0;
  const isPermissionLoading = auth?.loadingPermissions === true;
  const hasLoadedPermissions = auth?.loadingPermissions === false || auth?.permissionsStatus === 'ready' || auth?.permissionsStatus === 'denied' || auth?.permissionsStatus === 'error';
  const explicitPermissionDenied = auth?.permissionsStatus === 'denied';
  const permissionLoadErrorWithoutCache = auth?.permissionsStatus === 'error' && !hasPermissions;
  const canAccess = Boolean(moduleKey) ? hasPermission(permissions, moduleKey, action) : true;

  if (import.meta.env.DEV) {
    console.debug('[ProtectedRoute]', {
      moduleKey,
      action,
      isAuthenticated,
      isPermissionLoading,
      hasPermissions,
      hasLoadedPermissions,
      explicitPermissionDenied,
      permissionLoadErrorWithoutCache,
      canAccess,
      permissionsStatus: auth?.permissionsStatus,
    });
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (moduleKey) {
    if (isPermissionLoading || permissionLoadErrorWithoutCache || (!hasLoadedPermissions && !hasPermissions)) {
      return <PermissionCheckFallback />;
    }

    if (explicitPermissionDenied) {
      return <Navigate to="/unauthorized" replace />;
    }

    if (hasLoadedPermissions && hasPermissions && !canAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
}
