export default function AdvancedFilter({ label = 'Filter', value, onChange, options = [] }) {
  return (
    <div className="rounded-[32px] border border-slate-200/70 bg-white/95 p-4 shadow-soft">
      <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-3xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}
