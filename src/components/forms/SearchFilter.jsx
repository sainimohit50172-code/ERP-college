export default function SearchFilter({ search, onSearch, filter, onFilter, options }) {
  return (
    <div className="grid gap-3 md:grid-cols-[1.35fr_0.8fr]">
      <div className="rounded-[16px] border border-slate-200/70 bg-white/95 p-3 shadow-sm">
        <label className="mb-1.5 block text-[11px] uppercase tracking-[0.24em] text-slate-500">Search</label>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by name, email, course, or batch"
          className="h-10 w-full min-w-0 rounded-2xl border border-slate-200/70 bg-slate-50 px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          aria-label="Search records"
        />
      </div>
      <div className="rounded-[16px] border border-slate-200/70 bg-white/95 p-3 shadow-sm">
        <label className="mb-1.5 block text-[11px] uppercase tracking-[0.24em] text-slate-500">Filter</label>
        <select
          value={filter}
          onChange={(e) => onFilter(e.target.value)}
          className="h-10 w-full min-w-0 rounded-2xl border border-slate-200/70 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
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
