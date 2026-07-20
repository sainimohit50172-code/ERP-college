import { useEffect, useMemo, useState } from 'react';
import { Download, RefreshCw, Search, Filter } from 'lucide-react';
import api from '../api/axios.js';

const STATUS_OPTIONS = ['Applied', 'Accepted', 'Rejected', 'Converted'];
const PROGRAM_OPTIONS = ['B.Sc. Computer Science', 'BCA Cyber Security', 'BBA Marketing', 'B.Sc. Nursing'];

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB');
  } catch (error) {
    return dateStr;
  }
}

function downloadCsv(rows) {
  const header = [
    'S.No',
    'Application ID',
    'Applicant Name',
    'Program',
    'Status',
    'Email',
    'Phone',
    'Applied On',
    'Created At',
  ];

  const csvRows = [header.join(',')];
  rows.forEach((row, index) => {
    const values = [
      index + 1,
      row.id,
      row.applicant_name,
      row.program,
      row.status,
      row.email || '',
      row.phone || '',
      formatDate(row.applied_on),
      formatDate(row.created_at),
    ];
    csvRows.push(values.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','));
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'admission-summary-report.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdmissionSummaryReportPage() {
  const [admissions, setAdmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    program: '',
  });

  const fetchAdmissions = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await api.get('/admissions/', {
        params: {
          page: 1,
          page_size: 200,
        },
      });
      const payload = response?.data?.data || response?.data || {};
      const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
      setAdmissions(items);
    } catch (err) {
      setError('Could not load admission records.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const filteredAdmissions = useMemo(() => {
    return admissions.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.applicant_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.program?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.status?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.phone?.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus = !filters.status || item.status === filters.status;
      const matchesProgram = !filters.program || item.program === filters.program;

      const appliedDate = item.applied_on ? new Date(item.applied_on).setHours(0, 0, 0, 0) : null;
      const startDate = filters.startDate ? new Date(filters.startDate).setHours(0, 0, 0, 0) : null;
      const endDate = filters.endDate ? new Date(filters.endDate).setHours(0, 0, 0, 0) : null;

      const matchesStart = !startDate || (appliedDate !== null && appliedDate >= startDate);
      const matchesEnd = !endDate || (appliedDate !== null && appliedDate <= endDate);

      return matchesSearch && matchesStatus && matchesProgram && matchesStart && matchesEnd;
    });
  }, [admissions, filters, searchText]);

  const totals = useMemo(() => {
    const count = filteredAdmissions.length;
    const statusCounts = STATUS_OPTIONS.reduce((acc, status) => {
      acc[status] = filteredAdmissions.filter((item) => item.status === status).length;
      return acc;
    }, {});
    return {
      count,
      ...statusCounts,
    };
  }, [filteredAdmissions]);

  return (
    <div className="min-h-screen bg-slate-50 py-6 text-slate-900">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.28em] text-slate-500">
            Dashboard <span className="mx-2">&gt;</span> Admission Reports <span className="mx-2">&gt;</span> Admission Summary Report
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-primary-navy">Admission Summary Report</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            View admissions summary with search, filters and live data from the backend.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => downloadCsv(filteredAdmissions)}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary-navy px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-navy-dark"
          >
            <Download size={16} /> Export
          </button>
          <button
            type="button"
            onClick={fetchAdmissions}
            className="inline-flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 hover-gradient-border"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="mb-6 rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Search</label>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Search size={16} className="text-slate-500" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search by name, program, status, email or phone"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Status</label>
              <select
                value={filters.status}
                onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-navy focus:ring-2 focus:ring-primary-navy/10"
              >
                <option value="">All Status</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Program</label>
              <select
                value={filters.program}
                onChange={(event) => setFilters((current) => ({ ...current, program: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-navy focus:ring-2 focus:ring-primary-navy/10"
              >
                <option value="">All Programs</option>
                {PROGRAM_OPTIONS.map((program) => (
                  <option key={program} value={program}>{program}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Date range</label>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-navy focus:ring-2 focus:ring-primary-navy/10"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-navy focus:ring-2 focus:ring-primary-navy/10"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <div className="flex items-center gap-2 text-slate-500">
            <Filter size={16} /> Filters applied
          </div>
          <div className="flex flex-wrap gap-3 text-slate-700">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[13px]">Total records: {totals.count}</span>
            {STATUS_OPTIONS.filter((status) => filters.status === '' || filters.status === status).map((status) => (
              <span key={status} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[13px]">
                {status}: {totals[status] || 0}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm text-slate-700">
            <thead className="bg-primary-navy text-white">
              <tr>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold uppercase tracking-[0.12em]">S.No</th>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold uppercase tracking-[0.12em]">Application ID</th>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold uppercase tracking-[0.12em]">Applicant Name</th>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold uppercase tracking-[0.12em]">Program</th>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold uppercase tracking-[0.12em]">Status</th>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold uppercase tracking-[0.12em]">Email</th>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold uppercase tracking-[0.12em]">Phone</th>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold uppercase tracking-[0.12em]">Applied On</th>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold uppercase tracking-[0.12em]">Created At</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-16 text-center text-slate-500">Loading admissions...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="9" className="px-4 py-16 text-center text-red-600">{error}</td>
                </tr>
              ) : filteredAdmissions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-16 text-center text-slate-500">No admission records match the selected filters.</td>
                </tr>
              ) : (
                filteredAdmissions.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-4 py-4 text-slate-700">{index + 1}</td>
                    <td className="px-4 py-4 text-slate-900 font-semibold">{item.id}</td>
                    <td className="px-4 py-4 text-slate-900">{item.applicant_name || '—'}</td>
                    <td className="px-4 py-4 text-slate-900">{item.program || '—'}</td>
                    <td className="px-4 py-4 text-slate-700">{item.status || '—'}</td>
                    <td className="px-4 py-4 text-slate-700 break-words">{item.email || '—'}</td>
                    <td className="px-4 py-4 text-slate-700">{item.phone || '—'}</td>
                    <td className="px-4 py-4 text-slate-700">{formatDate(item.applied_on)}</td>
                    <td className="px-4 py-4 text-slate-700">{formatDate(item.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredAdmissions.length > 0 && (
              <tfoot className="bg-slate-100 text-slate-900">
                <tr>
                  <td className="px-4 py-4 font-semibold">Totals</td>
                  <td colSpan="3" className="px-4 py-4">{totals.count} records</td>
                  <td className="px-4 py-4">Accepted: {totals.Accepted}</td>
                  <td className="px-4 py-4">Rejected: {totals.Rejected}</td>
                  <td className="px-4 py-4">Converted: {totals.Converted}</td>
                  <td colSpan="2" className="px-4 py-4">Applied range: {filters.startDate || 'Any'} – {filters.endDate || 'Any'}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
