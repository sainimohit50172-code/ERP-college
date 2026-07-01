import { useMemo } from 'react';
import { useAuth } from './AuthContext.jsx';
import { hasPermission } from './rbac.js';

function buildPermissionHelpers(permissions) {
  return {
    can: (moduleKey, action = 'view') => hasPermission(permissions, moduleKey, action),
    canView: (moduleKey) => hasPermission(permissions, moduleKey, 'view'),
    canCreate: (moduleKey) => hasPermission(permissions, moduleKey, 'create'),
    canEdit: (moduleKey) => hasPermission(permissions, moduleKey, 'edit'),
    canDelete: (moduleKey) => hasPermission(permissions, moduleKey, 'delete'),
    canImport: (moduleKey) => hasPermission(permissions, moduleKey, 'import'),
    canExport: (moduleKey) => hasPermission(permissions, moduleKey, 'export'),
    canApprove: (moduleKey) => hasPermission(permissions, moduleKey, 'approve'),
    canPrint: (moduleKey) => hasPermission(permissions, moduleKey, 'print'),
  };
}

export function usePermissions() {
  const { auth } = useAuth();
  return useMemo(() => buildPermissionHelpers(auth.permissions), [auth.permissions]);
}

export function usePermission() {
  return usePermissions();
}
