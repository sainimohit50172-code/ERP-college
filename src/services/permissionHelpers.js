import { useMemo } from 'react';
import { useAuth } from './AuthContext.jsx';
import { hasPermission } from './rbac.js';

export function usePermissions() {
  const { auth } = useAuth();

  return useMemo(() => ({
    can: (moduleKey, action = 'view') => hasPermission(auth.permissions, moduleKey, action),
    canView: (moduleKey) => hasPermission(auth.permissions, moduleKey, 'view'),
    canCreate: (moduleKey) => hasPermission(auth.permissions, moduleKey, 'create'),
    canEdit: (moduleKey) => hasPermission(auth.permissions, moduleKey, 'edit'),
    canDelete: (moduleKey) => hasPermission(auth.permissions, moduleKey, 'delete'),
    canImport: (moduleKey) => hasPermission(auth.permissions, moduleKey, 'import'),
    canExport: (moduleKey) => hasPermission(auth.permissions, moduleKey, 'export'),
    canApprove: (moduleKey) => hasPermission(auth.permissions, moduleKey, 'approve'),
    canPrint: (moduleKey) => hasPermission(auth.permissions, moduleKey, 'print'),
  }), [auth.permissions]);
}
