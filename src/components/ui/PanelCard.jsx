export default function PanelCard({ title, items }) {
  return (
    <section className="rounded-[18px] border border-slate-200/70 bg-white/95 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">Live overview and recent updates.</p>
        </div>
        <button className="hover-gradient-border inline-flex items-center justify-center rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100" style={{ '--hover-gradient-radius': '16px' }}>
          View
        </button>
      </div>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div key={item} className="rounded-[14px] border border-slate-200/70 bg-slate-50 px-3 py-3 text-sm text-slate-700 shadow-sm">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
