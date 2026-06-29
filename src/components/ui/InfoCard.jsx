export default function InfoCard({ title, value, description, icon, accent }) {
  const accentClasses = accent || 'bg-emerald-50 text-emerald-700';
  return (
    <div className="rounded-[18px] border border-slate-200/70 bg-white/95 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{title}</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-3xl ${accentClasses}`}>
          {icon}
        </div>
      </div>
      {description && <p className="mt-4 text-sm text-slate-500">{description}</p>}
    </div>
  );
}
