const stepClass = (active) =>
  `flex-1 text-center py-2 px-3 rounded-xl border ${active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`;

export default function WorkflowStepper({ statuses, currentStatus }) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {statuses.map((status) => {
        const active = status.key === currentStatus;
        return (
          <div key={status.key} className={stepClass(active)}>
            <div className="text-xs uppercase tracking-wide">{status.label}</div>
            <div className="mt-1 text-sm font-semibold">{active ? 'Current' : ''}</div>
          </div>
        );
      })}
    </div>
  );
}
