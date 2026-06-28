import React from 'react';
import { usePermissions } from '../../services/permissionHelpers.js';

export default function WithPermission({ moduleKey, action, children }) {
  const perms = usePermissions();
  if (!moduleKey || !action) return null;
  const fnName = `can${action.charAt(0).toUpperCase()}${action.slice(1)}`;
  if (typeof perms[fnName] === 'function') {
    return perms[fnName](moduleKey) ? <>{children}</> : null;
  }
  return null;
}
