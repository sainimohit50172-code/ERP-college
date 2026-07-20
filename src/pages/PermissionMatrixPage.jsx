import { useEffect, useMemo, useState } from 'react';
import {
  getActions,
  getModules,
  getPermissionsForRole,
  getRoles,
  resetRolePermissions,
  updateRolePermissions,
} from '../services/rbac.js';

export default function PermissionMatrixPage() {
  const roles = useMemo(() => getRoles(), []);
  const actions = useMemo(() => getActions(), []);
  const modules = useMemo(() => getModules(), []);
  const [selectedRole, setSelectedRole] = useState('Super Admin');
  const [permissions, setPermissions] = useState(getPermissionsForRole(selectedRole));
  const [message, setMessage] = useState('');

  useEffect(() => {
    setPermissions(getPermissionsForRole(selectedRole));
    setMessage('');
  }, [selectedRole]);

  const togglePermission = (moduleKey, action) => {
    setPermissions((current) => {
      const moduleActions = current[moduleKey] || [];
      const contains = moduleActions.includes(action);
      const nextActions = contains
        ? moduleActions.filter((item) => item !== action)
        : [...moduleActions, action];

      return {
        ...current,
        [moduleKey]: nextActions,
      };
    });
  };

  const handleSave = () => {
    updateRolePermissions(selectedRole, permissions);
    setMessage('Permissions saved successfully.');
  };

  const handleReset = () => {
    const resetPermissions = resetRolePermissions(selectedRole);
    setPermissions(resetPermissions);
    setMessage('Permissions reset to the default policy for this role.');
  };

  const renderCheckbox = (moduleKey, action) => {
    const checked = permissions[moduleKey]?.includes(action);
    return (
      <label className="flex items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => togglePermission(moduleKey, action)}
          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
      </label>
    );
  };

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Permission Matrix</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Manage role permissions per enterprise module. Changes persist in the browser and can be wired to an API later.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <span className="font-medium">Role</span>
            <select
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            >
              {roles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </label>
          <div className="inline-flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover-gradient-border"
            >
              Reset defaults
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-3xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 hover-gradient-border"
            >
              Save permissions
            </button>
          </div>
        </div>
      </div>

      {message ? (
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-slate-50">
        <table className="min-w-full border-collapse text-left text-sm text-slate-700">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="border-b border-slate-200 px-4 py-3 font-medium">Module</th>
              {actions.map((action) => (
                <th key={action} className="border-b border-slate-200 px-4 py-3 font-medium uppercase tracking-[0.24em] text-slate-600">
                  {action}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((module) => (
              <tr key={module.key} className="border-b border-slate-200 last:border-b-0">
                <td className="px-4 py-3 font-medium text-slate-900">{module.label}</td>
                {actions.map((action) => (
                  <td key={`${module.key}-${action}`} className="px-4 py-3">
                    {renderCheckbox(module.key, action)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
