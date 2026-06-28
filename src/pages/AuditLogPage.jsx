import { usePermissions } from '../services/permissionHelpers.js';

export default function AuditLogPage() {
  const perms = usePermissions();
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Audit Log</h1>
      <p className="mt-2 text-sm text-slate-500">Track system activity, login events, and permission changes.</p>
      <div className="mt-8 rounded-3xl border border-slate-200/80 bg-slate-50 p-6 text-sm text-slate-700">
        <p className="text-slate-600">This page is a placeholder for audit and event logging details.</p>
      </div>
    </div>
  );
}
