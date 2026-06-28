export default function SearchFilter({ search, onSearch, filter, onFilter, options }) {
  return (
    <div className="grid gap-3 md:grid-cols-[1.6fr_1fr] xl:grid-cols-[2fr_1fr]">
      <div className="rounded-[32px] border border-slate-200/70 bg-white/95 p-4 shadow-soft">
        <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Search</label>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by name, email, course, or batch"
          className="w-full rounded-3xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          aria-label="Search records"
        />
      </div>
      <div className="rounded-[32px] border border-slate-200/70 bg-white/95 p-4 shadow-soft">
        <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Filter</label>
        <select
          value={filter}
          onChange={(e) => onFilter(e.target.value)}
          className="w-full rounded-3xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          aria-label="Filter records"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
