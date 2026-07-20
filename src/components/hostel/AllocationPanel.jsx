import { useState } from 'react';
import { allocateRoom } from '../../services/allocationService.js';
import { useResourceList } from '../../hooks/useResourceHooks';

export default function AllocationPanel() {
  const rooms = useResourceList('hostelRooms', { page: 1, pageSize: 500 });
  const students = useResourceList('students', { page: 1, pageSize: 500 });
  const allocations = useResourceList('hostelAllocations', { page: 1, pageSize: 500 });

  const [studentId, setStudentId] = useState('');
  const [roomId, setRoomId] = useState('');

  const doAllocate = async () => {
    if (!studentId || !roomId) return;
    await allocateRoom({ studentId, roomId, hostelId: null, bedNumber: 1 });
    setStudentId(''); setRoomId('');
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Allocate room</h3>
      <div className="mt-3 grid gap-2">
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="rounded-2xl border px-3 py-2">
          <option value="">Select student</option>
          {(students.data?.items || []).map((s) => <option key={s.id} value={s.id}>{s.name || s.id}</option>)}
        </select>
        <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className="rounded-2xl border px-3 py-2">
          <option value="">Select room</option>
          {(rooms.data?.items || []).map((r) => <option key={r.id} value={r.id}>{r.roomNumber || r.id}</option>)}
        </select>
        <div className="flex gap-2">
          <button onClick={doAllocate} className="rounded-2xl bg-sky-400 px-3 py-2 text-sm font-semibold hover-gradient-border">Allocate</button>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-xs font-semibold text-slate-900">Recent allocations</h4>
        <ul className="mt-2 text-sm text-slate-600">
          {(allocations.data?.items || []).slice(0,6).map((a) => (
            <li key={a.id}>#{a.id} · {a.studentId} · {a.roomId} · {a.status}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
