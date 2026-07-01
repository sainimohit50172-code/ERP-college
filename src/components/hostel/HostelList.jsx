export default function HostelList({ hostels = [] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Hostels</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-600">
        {hostels.map((h) => (
          <li key={h.id} className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{h.name}</div>
              <div className="text-xs text-slate-500">{h.type || 'General'} · {h.campus || 'Main'}</div>
            </div>
            <div className="text-xs text-slate-500">{h.status || 'Active'}</div>
          </li>
        ))}
        {!hostels.length && <li className="text-sm text-slate-500">No hostels configured</li>}
      </ul>
    </div>
  );
}
