import { Bell, Search, Sparkles, UserCircle2 } from 'lucide-react';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const formatBreadcrumb = (segment) =>
  segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function Topbar() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = useMemo(
    () => ['Dashboard', ...pathSegments.map(formatBreadcrumb)],
    [pathSegments]
  );

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 px-4 py-4 shadow-sm backdrop-blur-xl md:px-8 xl:px-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb} className="inline-flex items-center gap-2">
                {index > 0 && <span className="text-slate-300">/</span>}
                <span>{crumb}</span>
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-950">Executive dashboard</h1>
              <p className="text-sm text-slate-500">Premium operations overview for the university leadership team.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/70 px-4 py-2 text-sm text-emerald-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Smart analytics enabled
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 rounded-3xl border border-slate-200/80 bg-slate-50 px-4 py-3 shadow-sm">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              type="search"
              placeholder="Search records, reports, students..."
              className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex h-12 w-12 items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
              <Bell className="h-5 w-5" />
            </button>
            <button className="inline-flex h-12 items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
              <UserCircle2 className="h-5 w-5 text-emerald-600" />
              <span>Super Admin</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
