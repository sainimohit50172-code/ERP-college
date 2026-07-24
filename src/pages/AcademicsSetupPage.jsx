import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ScanSearch } from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import SetupCard from '../components/ui/SetupCard.jsx';
import { academicsModuleConfig } from './academics/academicsModuleConfig.js';

const academicsCards = academicsModuleConfig.map((card) => ({
  ...card,
  subtitle: card.description,
  tag: card.status === 'existing' ? card.permission : card.title.toLowerCase().includes('assessment') ? 'assessment' : card.title.toLowerCase().includes('attendance') ? 'attendance' : card.title.toLowerCase().includes('schedule') ? 'scheduling' : 'subject',
}));

const skeletonCards = Array.from({ length: 8 }, (_, index) => index);

export default function AcademicsSetupPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'Institute Setup - Academics';
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredCards = useMemo(() => {
    const term = query.trim().toLowerCase();

    return academicsCards.filter((card) => {
      const matchesQuery = !term || `${card.title} ${card.subtitle}`.toLowerCase().includes(term);
      const matchesFilter = quickFilter === 'all' || card.tag === quickFilter;
      return matchesQuery && matchesFilter;
    });
  }, [query, quickFilter]);

  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-4 border-b border-slate-200/80 pb-4">
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: '/' },
              { label: 'Institute Setup', to: '/settings/institute' },
              { label: 'Academics' },
            ]}
          />

          <div className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-600">Academics</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Academic configuration hub</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-[15px]">
                Manage all academic configuration and institute academic setup from one place.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row xl:min-w-[520px]">
              <label className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-100">
                <ScanSearch className="h-4 w-4 text-slate-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search module"
                  aria-label="Search academic setup modules"
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>

              <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                <span className="text-slate-500">Quick filter</span>
                <select
                  value={quickFilter}
                  onChange={(event) => setQuickFilter(event.target.value)}
                  aria-label="Filter academic modules"
                  className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 outline-none"
                >
                  <option value="all">All</option>
                  <option value="assessment">Assessment</option>
                  <option value="attendance">Attendance</option>
                  <option value="scheduling">Scheduling</option>
                  <option value="subject">Subject</option>
                  <option value="students">Students</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2 xl:grid-cols-4">
            {skeletonCards.map((item) => (
              <div
                key={item}
                className="h-[190px] animate-pulse rounded-[18px] border border-slate-200 bg-slate-100/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
              >
                <div className="mb-5 h-14 w-14 rounded-[18px] bg-slate-200" />
                <div className="mb-3 h-4 w-3/4 rounded-full bg-slate-200" />
                <div className="h-3 w-2/3 rounded-full bg-slate-200" />
              </div>
            ))}
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex max-w-md flex-col items-center rounded-[24px] border border-slate-200 bg-slate-50/80 px-8 py-10 text-center shadow-sm">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[24px] bg-emerald-50 text-emerald-600">
                <BookOpen className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">No academic setup found</h2>
              <p className="mt-2 text-sm text-slate-500">Try another search term to discover the academic module you need.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2 xl:grid-cols-4">
            {filteredCards.map((card) => {
              const Icon = card.icon;
              return (
                <SetupCard
                  key={card.title}
                  icon={Icon}
                  title={card.title}
                  subtitle={card.subtitle}
                  ariaLabel={`Open ${card.title}`}
                  onClick={() => card.route && navigate(card.route)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
