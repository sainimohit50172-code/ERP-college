export default function VehicleList({ vehicles = [], onView = () => {}, onEdit = () => {}, onDelete = () => {}, onArchive = () => {} }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Vehicles</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-600">
        {vehicles.map((v) => (
          <li key={v.id} className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{v.registration || v.id}</div>
              <div className="text-xs text-slate-500">{v.make || ''} · {v.capacity || 'N/A'}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onView(v)} className="text-xs text-slate-500 hover:underline">View</button>
              <button onClick={() => onEdit(v)} className="text-xs text-sky-500 hover:underline">Edit</button>
              <button onClick={() => onArchive(v)} className="text-xs text-amber-600 hover:underline">Archive</button>
              <button onClick={() => onDelete(v)} className="text-xs text-rose-600 hover:underline">Delete</button>
            </div>
          </li>
        ))}
        {!vehicles.length && <li className="text-sm text-slate-500">No vehicles configured</li>}
      </ul>
    </div>
  );
}
