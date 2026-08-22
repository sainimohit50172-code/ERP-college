export default function PageHeader({ title, subtitle, description, action }) {
  return (
    <div className="erp-heading-strip mb-5 rounded-[12px] border border-slate-200 bg-slate-50/80 px-4 py-4 sm:px-5" data-page-heading-only={!action ? 'true' : undefined}>
      <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${action ? '' : 'hidden'}`}>
        <div className="erp-heading-strip__content min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-700">{subtitle}</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">{title}</h1>
          {description ? <p className="mt-1 max-w-3xl text-xs text-slate-500">{description}</p> : null}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
