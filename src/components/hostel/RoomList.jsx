export default function RoomList({ rooms = [] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Rooms</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-600">
        {rooms.map((r) => (
          <li key={r.id} className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{r.roomNumber}</div>
              <div className="text-xs text-slate-500">Capacity: {r.capacity || 1} · Occupied: {r.occupiedBeds || 0}</div>
            </div>
            <div className="text-xs text-slate-500">{r.status || 'Available'}</div>
          </li>
        ))}
        {!rooms.length && <li className="text-sm text-slate-500">No rooms configured</li>}
      </ul>
    </div>
  );
}
