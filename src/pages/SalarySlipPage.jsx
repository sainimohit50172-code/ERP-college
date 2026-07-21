import { useMemo, useState } from 'react';
import { ArrowRight, Calendar, Download, Search, UserCheck } from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import ViewButton from '../components/ui/ViewButton.jsx';

const mockSalaryRecords = [
  { id: 1, name: 'Aditi Sharma', code: 'EMP-101', month: '2026-07', basic: 52000, deductions: 3200, net: 48800, status: 'Paid' },
  { id: 2, name: 'Rahul Verma', code: 'EMP-102', month: '2026-07', basic: 46000, deductions: 2600, net: 43400, status: 'Pending' },
  { id: 3, name: 'Nisha Patel', code: 'EMP-103', month: '2026-06', basic: 38500, deductions: 1900, net: 36600, status: 'Processing' },
  { id: 4, name: 'Sunil Reddy', code: 'EMP-104', month: '2026-06', basic: 54500, deductions: 4150, net: 50350, status: 'Paid' },
  { id: 5, name: 'Mira Joshi', code: 'EMP-105', month: '2026-05', basic: 41000, deductions: 1900, net: 39100, status: 'Paid' },
  { id: 6, name: 'Karan Singh', code: 'EMP-106', month: '2026-05', basic: 47000, deductions: 2750, net: 44250, status: 'Pending' },
  { id: 7, name: 'Priya Nair', code: 'EMP-107', month: '2026-07', basic: 39500, deductions: 2100, net: 37400, status: 'Processing' },
];

const statusOptions = ['All', 'Paid', 'Pending', 'Processing'];

function formatMonth(value) {
  if (!value) return 'N/A';
  const [year, month] = value.split('-');
  return `${month}/${year}`;
}

function badgeStyles(status) {
  const base = 'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-medium';
  if (status === 'Paid') return `${base} bg-emerald-100 text-emerald-700`;
  if (status === 'Pending') return `${base} bg-amber-100 text-amber-700`;
  return `${base} bg-sky-100 text-sky-700`;
}

export default function SalarySlipPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startMonth, setStartMonth] = useState('2026-05');
  const [endMonth, setEndMonth] = useState('2026-07');
  const [activeFilters, setActiveFilters] = useState({ search: '', status: 'All', startMonth: '2026-05', endMonth: '2026-07' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filteredRecords = useMemo(() => {
    const search = activeFilters.search.toLowerCase().trim();
    return mockSalaryRecords.filter((record) => {
      const matchesName = record.name.toLowerCase().includes(search);
      const matchesStatus = activeFilters.status === 'All' || record.status === activeFilters.status;
      const withinStart = !activeFilters.startMonth || record.month >= activeFilters.startMonth;
      const withinEnd = !activeFilters.endMonth || record.month <= activeFilters.endMonth;
      return matchesName && matchesStatus && withinStart && withinEnd;
    });
  }, [activeFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const stats = useMemo(() => {
    const paidRecords = mockSalaryRecords.filter((rec) => rec.status === 'Paid');
    const pendingRecords = mockSalaryRecords.filter((rec) => rec.status === 'Pending');
    return {
      paid: new Set(paidRecords.map((rec) => rec.code)).size,
      payout: paidRecords.reduce((sum, rec) => sum + rec.net, 0),
      pending: pendingRecords.length,
    };
  }, []);

  const handleGo = () => {
    setActiveFilters({ search: searchTerm, status: statusFilter, startMonth, endMonth });
    setCurrentPage(1);
  };

  return (
    <div className="min-h-[calc(100vh-88px)] overflow-hidden bg-[#F8FAFC] py-6 font-sans">
      <div className="space-y-4">
        <div className="space-y-1 text-sm uppercase tracking-[0.2em] text-slate-500">
          <Breadcrumb items={[
            { label: 'Dashboard', to: '/' },
            { label: 'Employee Portal', to: '/employees' },
            { label: 'Salary Slip' },
          ]} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Salary Slip</h1>
      </div>

      <div className="mt-6 space-y-4">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[240px]">
              <label className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-[#64748B]">Search Employee</label>
              <div className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-slate-50 px-3 py-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search Employee"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none"
                />
                <button
                  type="button"
                  onClick={handleGo}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0F2E29] text-white transition hover:brightness-110 hover-gradient-border"
                  aria-label="Search"
                >
                  <Search size={16} />
                </button>
              </div>
            </div>

            <div className="min-w-[180px] flex-1">
              <label className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-[#64748B]">Start Month</label>
              <div className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-slate-50 px-3 py-2">
                <Calendar size={16} className="text-[#1E293B]" />
                <input
                  type="month"
                  value={startMonth}
                  onChange={(event) => setStartMonth(event.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 outline-none"
                />
              </div>
            </div>

            <div className="min-w-[180px] flex-1">
              <label className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-[#64748B]">End Month</label>
              <div className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-slate-50 px-3 py-2">
                <Calendar size={16} className="text-[#1E293B]" />
                <input
                  type="month"
                  value={endMonth}
                  onChange={(event) => setEndMonth(event.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 outline-none"
                />
              </div>
            </div>

            <div className="min-w-[160px] flex-1">
              <label className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-[#64748B]">Status</label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="ml-auto min-w-[120px]">
              <button
                type="button"
                onClick={handleGo}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1E293B] px-4 text-sm font-semibold text-white transition hover:bg-slate-800 hover-gradient-border"
              >
                Go
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <UserCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1E293B]">{stats.paid}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#64748B]">Total Employees Paid</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-[#1E293B]">
              <span className="text-lg font-bold">₹</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1E293B]">{stats.payout.toLocaleString()}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#64748B]">Total Payout This Month</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <span className="text-xl font-semibold">!</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1E293B]">{stats.pending}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#64748B]">Pending Slips</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-left text-sm">
              <thead className="bg-[#F8FAFC] text-[#64748B] uppercase tracking-[0.12em] text-xs">
                <tr>
                  <th className="px-4 py-3">Employee Name</th>
                  <th className="px-4 py-3">Employee Code</th>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Basic Salary</th>
                  <th className="px-4 py-3">Deductions</th>
                  <th className="px-4 py-3">Net Salary</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.length > 0 ? (
                  paginatedRecords.map((record) => (
                    <tr key={record.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                      <td className="px-4 py-4 text-sm font-semibold text-[#1E293B]">{record.name}</td>
                      <td className="px-4 py-4 text-sm text-[#1E293B]">{record.code}</td>
                      <td className="px-4 py-4 text-sm text-[#1E293B]">{formatMonth(record.month)}</td>
                      <td className="px-4 py-4 text-sm text-[#1E293B]">₹{record.basic.toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-[#1E293B]">₹{record.deductions.toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-[#1E293B]">₹{record.net.toLocaleString()}</td>
                      <td className="px-4 py-4">
                        <span className={badgeStyles(record.status)}>{record.status}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <ViewButton
                            title={`View slip for ${record.name}`}
                            ariaLabel={`View slip for ${record.name}`}
                            className="h-10 w-10 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                            onClick={() => handleViewSlip(record)}
                          />
                          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 hover-gradient-border">
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center text-sm text-slate-500">
                      <div className="mx-auto flex max-w-xs flex-col items-center gap-2">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <FileText size={24} />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">No Records found</p>
                        <p className="text-xs text-slate-500">Try changing the search or filter settings.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-500">Showing {paginatedRecords.length} of {filteredRecords.length} records</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((current) => Math.max(1, current - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${currentPage === page ? 'bg-[#1E293B] text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-[#E2E8F0]'}`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setCurrentPage((current) => Math.min(totalPages, current + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
