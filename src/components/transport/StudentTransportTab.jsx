import { useMemo } from 'react';
import { useResourceList } from '../../hooks/useResourceHooks';

export default function StudentTransportTab({ studentId }) {
  const assignments = useResourceList('studentTransportAssignments', { page: 1, pageSize: 200 });
  const vehicles = useResourceList('transportVehicles', { page: 1, pageSize: 200 });
  const routes = useResourceList('transportRoutes', { page: 1, pageSize: 200 });
  const fees = useResourceList('transportFees', { page: 1, pageSize: 200 });

  const memberAssignments = useMemo(() => (assignments.data?.items || []).filter((a) => String(a.studentId) === String(studentId)), [assignments, studentId]);
  const current = memberAssignments.find((a) => a.status === 'Assigned');

  const vehicleMap = useMemo(() => new Map((vehicles.data?.items || []).map((v) => [v.id, v])), [vehicles]);
  const routeMap = useMemo(() => new Map((routes.data?.items || []).map((r) => [r.id, r])), [routes]);
  const fee = (fees.data?.items || []).find((f) => String(f.studentId) === String(studentId));

  return (
    <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Transport Assignment</h3>
        {current ? (
          <div className="mt-2 text-sm text-slate-600">
            <div>Route: {routeMap.get(current.routeId)?.name || current.routeId}</div>
            <div>Vehicle: {vehicleMap.get(current.vehicleId)?.registration || current.vehicleId}</div>
            <div>Boarding: {current.boardingStopId}</div>
            <div>Drop: {current.dropStopId}</div>
            <div>Effective: {current.effectiveDate || current.assignedAt}</div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-500">No transport assigned</p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Fee Status</h3>
        <div className="mt-2 text-sm text-slate-600">
          <div>Amount due: {fee ? `$${Number(fee.amountDue || 0).toLocaleString()}` : 'N/A'}</div>
          <div>Payment status: {fee ? fee.status || 'Unknown' : 'N/A'}</div>
        </div>

        <h4 className="mt-4 text-sm font-semibold text-slate-900">Travel History</h4>
        <ul className="mt-2 text-sm text-slate-600">
          {memberAssignments.map((a) => (
            <li key={a.id}>{a.status} · {routeMap.get(a.routeId)?.name || a.routeId} · {a.assignedAt}</li>
          ))}
          {!memberAssignments.length && <li className="text-sm text-slate-500">No history</li>}
        </ul>
      </div>
    </div>
  );
}
