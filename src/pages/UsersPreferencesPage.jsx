import { useMemo, useState } from 'react';
import { FileText, Star } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const sessions = ['2026-2027', '2025-2026', '2024-2025'];
const landingPages = ['Dashboard', 'Employee Portal', 'Fee', 'Attendance'];

const actionItems = [
  { id: 'student-list', label: 'Student List', color: 'text-emerald-700 bg-emerald-50', favoriteColor: '#16a34a' },
  { id: 'collect-fee', label: 'Collect Fee', color: 'text-emerald-700 bg-emerald-50', favoriteColor: '#16a34a' },
  { id: 'fee-summary-college-wise', label: 'Fee Summary - College Wise', color: 'text-emerald-700 bg-emerald-50', favoriteColor: '#16a34a' },
  { id: 'notice', label: 'Notice', color: 'text-emerald-700 bg-emerald-50', favoriteColor: '#16a34a' },
  { id: 'student-attendance', label: 'Student Attendance', color: 'text-emerald-700 bg-emerald-50', favoriteColor: '#16a34a' },
  { id: 'college-wise-summary', label: 'College Wise Summary - All Subject', color: 'text-emerald-700 bg-emerald-50', favoriteColor: '#16a34a' },
  { id: 'employee', label: 'Employee', color: 'text-emerald-700 bg-emerald-50', favoriteColor: '#16a34a' },
  { id: 'books', label: 'Books', color: 'text-emerald-700 bg-emerald-50', favoriteColor: '#16a34a' },
];

const reportItems = [
  { id: 'strength-report', label: 'Strength Report' },
  { id: 'combined-daily-collection-report', label: 'Combined Daily Collection Report' },
  { id: 'due-fee-report', label: 'Due Fee Report' },
  { id: 'due-fee-report-college-wise', label: 'Due Fee Report College Wise' },
  { id: 'employee-report', label: 'Employee Report' },
  { id: 'allocated-subject-report', label: 'Allocated Subject Report' },
];

export default function UsersPreferencesPage() {
  const [selectedSession, setSelectedSession] = useState(sessions[0]);
  const [landingPage, setLandingPage] = useState(landingPages[0]);
  const [saved, setSaved] = useState(false);
  const [favoriteActions, setFavoriteActions] = useState(() => actionItems.reduce((acc, item) => ({ ...acc, [item.id]: false }), {}));
  const [reportQuery, setReportQuery] = useState('');

  const filteredReports = useMemo(() => {
    const query = reportQuery.trim().toLowerCase();
    if (!query) return reportItems;
    return reportItems.filter((item) => item.label.toLowerCase().includes(query));
  }, [reportQuery]);

  const toggleFavorite = (id) => {
    setFavoriteActions((current) => ({ ...current, [id]: !current[id] }));
  };

  const handleSave = () => {
    toast.success('User preferences saved successfully');
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="min-h-[calc(100vh-88px)] bg-[#F8FAFC] p-6 font-sans text-slate-900">
      <ToastContainer position="top-right" autoClose={1500} hideProgressBar />

      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Dashboard &gt; Users Preferences</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <h1 className="text-3xl font-bold text-slate-900">User Preferences</h1>
          <div className="flex items-center gap-3 text-base text-slate-500">
            <span className="h-6 w-[1px] bg-slate-300" />
            <span className="text-slate-500">Preferences of User</span>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Complete User Preferences of Admin</h2>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="min-w-[220px]">
              <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Select Session</label>
              <select
                value={selectedSession}
                onChange={(event) => setSelectedSession(event.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              >
                {sessions.map((session) => (
                  <option key={session} value={session}>{session}</option>
                ))}
              </select>
            </div>
            <div className="min-w-[220px]">
              <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Default Landing Page</label>
              <select
                value={landingPage}
                onChange={(event) => setLandingPage(event.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              >
                {landingPages.map((page) => (
                  <option key={page} value={page}>{page}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center justify-center rounded-lg bg-[#1E293B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 hover-gradient-border"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <h2 className="mb-5 text-2xl font-bold text-slate-900">Favorites</h2>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-xl font-semibold text-slate-900">Actions</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {actionItems.map((item) => {
              const isFavorite = favoriteActions[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleFavorite(item.id)}
                  className="group flex flex-col items-start rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left transition hover:bg-emerald-100 hover-gradient-border"
                >
                  <div
                    className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"
                    style={{ color: isFavorite ? item.favoriteColor : '#14532d', backgroundColor: isFavorite ? `${item.favoriteColor}20` : '#d1fae5' }}
                  >
                    <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                  </div>
                  <span className={`text-sm font-semibold ${isFavorite ? 'text-emerald-700' : 'text-slate-700'}`}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-semibold text-slate-900">Reports</h3>
            <input
              type="text"
              value={reportQuery}
              onChange={(event) => setReportQuery(event.target.value)}
              placeholder="Search reports..."
              className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none sm:w-auto"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((report) => (
              <div key={report.id} className="flex h-full flex-col rounded-2xl border border-emerald-200 bg-emerald-600 p-5 text-white transition hover:bg-emerald-700 hover-gradient-border">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-white">
                  <FileText size={18} />
                </div>
                <div className="text-sm font-semibold break-words whitespace-normal">{report.label}</div>
              </div>
            ))}
            {filteredReports.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No reports match your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
