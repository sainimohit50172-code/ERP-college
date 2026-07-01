import { useEffect, useMemo, useState } from 'react';
import { clearAuditLogs, getAuditLogs } from '../services/auditService.js';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLogs(getAuditLogs());
  }, []);

  const filteredLogs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return logs;
    return logs.filter((entry) => {
      return [entry.action, entry.moduleKey, entry.description, entry.user?.name, entry.user?.role, entry.resourceId]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [logs, search]);

  const handleClear = () => {
    clearAuditLogs();
    setLogs([]);
  };

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Audit Log</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Review login, logout, permission changes, and CRUD events for the ERP system.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search audit entries"
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 sm:w-[320px]"
          />
          <button
            type="button"
            onClick={handleClear}
            className="rounded-3xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500"
          >
            Clear log
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-slate-50">
        <table className="min-w-full border-collapse text-left text-sm text-slate-700">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="border-b border-slate-200 px-4 py-3 font-medium">Time</th>
              <th className="border-b border-slate-200 px-4 py-3 font-medium">Action</th>
              <th className="border-b border-slate-200 px-4 py-3 font-medium">Module</th>
              <th className="border-b border-slate-200 px-4 py-3 font-medium">User</th>
              <th className="border-b border-slate-200 px-4 py-3 font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                  No audit events found.
                </td>
              </tr>
            ) : (
              filteredLogs.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-200 last:border-b-0">
                  <td className="px-4 py-3 text-slate-600">{new Date(entry.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{entry.action}</td>
                  <td className="px-4 py-3 text-slate-700">{entry.moduleKey}</td>
                  <td className="px-4 py-3 text-slate-700">{entry.user?.name || 'System'} ({entry.user?.role || 'N/A'})</td>
                  <td className="px-4 py-3 text-slate-700">{entry.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
