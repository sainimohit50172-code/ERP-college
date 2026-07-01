export default function TransportList({ transports = [] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Transports</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-600">
        {transports.map((t) => (
          <li key={t.id} className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{t.name || t.id}</div>
              <div className="text-xs text-slate-500">{t.type || 'Bus'} · {t.capacity || 'N/A'}</div>
            </div>
            <div className="text-xs text-slate-500">{t.status || 'Active'}</div>
          </li>
        ))}
        {!transports.length && <li className="text-sm text-slate-500">No transport records</li>}
      </ul>
    </div>
  );
}
