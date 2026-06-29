export default function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-[18px] border border-slate-200/70 bg-white/95 px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{subtitle}</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-950">{title}</h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
