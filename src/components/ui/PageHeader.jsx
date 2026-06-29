export default function PageHeader({ title, subtitle, description, action }) {
  return (
    <div className="mb-6 rounded-[20px] border border-slate-200/70 bg-white/95 px-5 py-5 shadow-sm sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{subtitle}</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">{title}</h1>
          {description ? <p className="mt-3 max-w-3xl text-sm text-slate-500">{description}</p> : null}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
