export default function PanelCard({ title, items }) {
  return (
    <section className="rounded-[32px] border border-slate-200/70 bg-white/95 p-6 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">Live overview and recent updates.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-3xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">
          View
        </button>
      </div>
      <div className="mt-6 grid gap-4">
        {items.map((item) => (
          <div key={item} className="rounded-[28px] border border-slate-200/70 bg-slate-50 px-4 py-4 text-slate-700 shadow-sm">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
