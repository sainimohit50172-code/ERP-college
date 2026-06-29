export default function SummaryCard({ title, value, subtitle, icon: Icon, badge }) {
  return (
    <article className="rounded-[20px] border border-slate-200/70 bg-white/95 p-5 shadow-sm transition hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
          {subtitle ? <p className="mt-2 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {Icon ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700">
            <Icon className="h-6 w-6" />
          </div>
        ) : null}
      </div>
      {badge ? <div className="mt-4 inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">{badge}</div> : null}
    </article>
  );
}
