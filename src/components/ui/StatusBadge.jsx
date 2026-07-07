export default function StatusBadge({ status }) {
  const display = String(status || 'Unknown').trim();
  const normalized = display.toLowerCase().replace(/\s+/g, '');
  const variants = {
    active: 'bg-emerald-500/15 text-emerald-700',
    available: 'bg-emerald-500/15 text-emerald-700',
    occupied: 'bg-amber-500/15 text-amber-700',
    pending: 'bg-amber-500/15 text-amber-700',
    undermaintenance: 'bg-amber-500/15 text-amber-700',
    due: 'bg-amber-500/15 text-amber-700',
    scheduled: 'bg-sky-500/15 text-sky-700',
    completed: 'bg-sky-500/15 text-sky-700',
    closed: 'bg-rose-500/15 text-rose-700',
    rejected: 'bg-rose-500/15 text-rose-700',
    approved: 'bg-emerald-500/15 text-emerald-700',
    inactive: 'bg-slate-300/20 text-slate-600',
    assigned: 'bg-sky-500/15 text-sky-700',
    cancelled: 'bg-rose-500/15 text-rose-700',
    draft: 'bg-slate-300/20 text-slate-600',
    inreview: 'bg-sky-500/15 text-sky-700',
    admissionconfirmed: 'bg-emerald-500/15 text-emerald-700',
    feecollected: 'bg-emerald-500/15 text-emerald-700',
    alumni: 'bg-slate-200/80 text-slate-700',
  };
  return (
    <span className={`inline-flex max-w-full items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.08em] uppercase ${variants[normalized] || 'bg-slate-200/80 text-slate-700'}`}>
      {display}
    </span>
  );
}
