import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="rounded-[32px] border border-slate-200/70 bg-white/95 p-4 shadow-soft">
      <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Search</label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-3xl border border-slate-200/70 bg-slate-50 px-11 py-3 text-slate-900 outline-none placeholder:text-slate-400 transition duration-150 ease-out focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          aria-label="Search"
        />
      </div>
    </div>
  );
}
