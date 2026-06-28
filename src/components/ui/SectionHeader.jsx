export default function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-slate-200/70 bg-white/95 px-6 py-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{subtitle}</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-950">{title}</h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
