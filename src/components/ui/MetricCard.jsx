export default function MetricCard({ label, value, icon: Icon, delta }) {
  return (
    <article className="rounded-[28px] border border-slate-200/70 bg-white/95 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{label}</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500">{delta} vs last week</p>
    </article>
  );
}
