export default function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="erp-heading-strip mb-4 flex flex-col gap-3 rounded-[12px] border border-slate-200 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5" data-page-heading-only={!action ? 'true' : undefined}>
      <div className="erp-heading-strip__content">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-700">{subtitle}</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-950">{title}</h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
