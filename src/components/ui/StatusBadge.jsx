export default function StatusBadge({ status }) {
  const variants = {
    Active: 'bg-emerald-500/15 text-emerald-700',
    Available: 'bg-emerald-500/15 text-emerald-700',
    Occupied: 'bg-amber-500/15 text-amber-700',
    Pending: 'bg-amber-500/15 text-amber-700',
    UnderMaintenance: 'bg-amber-500/15 text-amber-700',
    Due: 'bg-amber-500/15 text-amber-700',
    Scheduled: 'bg-sky-500/15 text-sky-700',
    Completed: 'bg-sky-500/15 text-sky-700',
    Closed: 'bg-rose-500/15 text-rose-700',
    Rejected: 'bg-rose-500/15 text-rose-700',
    Approved: 'bg-emerald-500/15 text-emerald-700',
    Inactive: 'bg-slate-300/20 text-slate-600',
    Assigned: 'bg-sky-500/15 text-sky-700',
    Cancelled: 'bg-rose-500/15 text-rose-700',
    Draft: 'bg-slate-300/20 text-slate-600',
    'In Review': 'bg-sky-500/15 text-sky-700',
    'Admission Confirmed': 'bg-emerald-500/15 text-emerald-700',
    'Fee Collected': 'bg-emerald-500/15 text-emerald-700',
  };
  return (
    <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.08em] uppercase ${variants[status] || 'bg-slate-200/80 text-slate-700'}`}>
      {status}
    </span>
  );
}
