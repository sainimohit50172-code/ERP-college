import { useMemo } from 'react';
import { useResourceList } from '../../hooks/useResourceHooks';

export default function StudentHostelTab({ studentId }) {
  const allocations = useResourceList('hostelAllocations', { page: 1, pageSize: 500 });
  const _rooms = useResourceList('hostelRooms', { page: 1, pageSize: 500 });

  const memberAlloc = useMemo(() => (allocations.data?.items || []).filter((a) => String(a.studentId) === String(studentId)), [allocations, studentId]);

  const current = memberAlloc.find((a) => a.status === 'Allocated' || a.status === 'CheckedIn');

  return (
    <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Hostel Allocation</h3>
        {current ? (
          <div className="mt-2 text-sm text-slate-600">
            <div>Hostel: {current.hostelId}</div>
            <div>Room: {current.roomId}</div>
            <div>Bed: {current.bedNumber}</div>
            <div>Status: {current.status}</div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-500">No active allocation</p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Allocation History</h3>
        <ul className="mt-2 text-sm text-slate-600">
          {memberAlloc.map((a) => <li key={a.id}>{a.status} · {a.roomId} · {a.allocatedAt || a.createdAt}</li>)}
          {!memberAlloc.length && <li className="text-sm text-slate-500">No allocation history</li>}
        </ul>
      </div>
    </div>
  );
}
