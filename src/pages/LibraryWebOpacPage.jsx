import { useState } from 'react';
import { BookOpen, ArrowRight, ChevronRight } from 'lucide-react';

export default function LibraryWebOpacPage() {
  const [activeTab, setActiveTab] = useState('book-search');
  const [searchBy, setSearchBy] = useState('Title');
  const [query, setQuery] = useState('');

  const instituteName = '';
  const instituteAddress = '';
  const visitorCount = 2;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 max-w-full">
      <div className="bg-[#1E293B] px-4 py-5 text-white">
        <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-[220px] text-sm leading-5 text-white/85">
            {instituteAddress.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold tracking-[0.06em] text-white">{instituteName}</div>
            <div className="mt-1 text-sm uppercase tracking-[0.32em] text-white/80">WEB OPAC</div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-white/90">
            <BookOpen className="h-5 w-5" />
            <span>Visitor Count : {visitorCount}</span>
          </div>
        </div>
      </div>

      <div className="w-full px-0 pb-10 pt-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="rounded-full bg-[#F1F5F9] p-1 shadow-sm">
            <div className="flex overflow-hidden rounded-full bg-[#F1F5F9]">
              {[
                { id: 'book-search', label: 'Book Search' },
                { id: 'subscription-search', label: 'Subscription Search' },
                { id: 'digital-library', label: 'Digital Library' },
              ].map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active ? 'bg-white text-slate-950' : 'text-slate-500'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <button className="inline-flex items-center gap-2 rounded-lg bg-[#1E293B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 hover-gradient-border">
              Student Login
            </button>
          </div>
        </div>

        <div className="mt-7 rounded-xl border border-[#E2E8F0] bg-white px-6 py-6 shadow-sm w-full max-w-full">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-bold text-slate-950">Book Search</h1>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E293B] text-white">✓</span>
                <span className="font-semibold text-slate-900">Select Search By</span>
              </div>
              <div className="h-px w-10 bg-slate-300" />
              <div className="flex items-center gap-2 text-slate-400">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300">1</span>
                <span>Enter Search</span>
              </div>
              <div className="h-px w-10 bg-slate-300" />
              <div className="flex items-center gap-2 text-slate-400">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300">2</span>
                <span>Click Go</span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
            <div className="space-y-2 text-sm text-slate-500">
              <label className="block uppercase tracking-[0.2em]">Search By</label>
              <select
                value={searchBy}
                onChange={(event) => setSearchBy(event.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-slate-900 outline-none"
              >
                {['Title', 'Author', 'ISBN', 'Subject', 'Publisher'].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm uppercase tracking-[0.2em] text-slate-500">Search</label>
              <div className="flex gap-3">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search..."
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-slate-900 outline-none"
                />
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1E293B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 hover-gradient-border"
                >
                  Go
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {activeTab !== 'book-search' && (
            <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-[#F8FAFC] p-8 text-center text-sm text-slate-500">
              Coming soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
