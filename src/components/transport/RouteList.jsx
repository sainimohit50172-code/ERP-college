export default function RouteList({ routes = [] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Routes</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-600">
        {routes.map((r) => (
          <li key={r.id} className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{r.name || r.id}</div>
              <div className="text-xs text-slate-500">{r.stops?.length || 0} stops · {r.distance || 'N/A'}</div>
            </div>
            <div className="text-xs text-slate-500">{r.status || 'Active'}</div>
          </li>
        ))}
        {!routes.length && <li className="text-sm text-slate-500">No routes available</li>}
      </ul>
    </div>
  );
}
