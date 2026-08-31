import { useMemo, useState } from 'react';
import { BarChart3, Download, Filter, Layers3, Printer, RotateCcw, Users } from 'lucide-react';
import { useResourceList } from '../hooks/useResourceHooks.js';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const storageKey = 'subject-combination-records';

const valueOf = (row, key) => row?.[key] ?? row?.[key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)] ?? '';
const splitSubjects = (value) => String(value || '').split(/[,;|]/).map((item) => item.trim()).filter(Boolean);
const csvValue = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export default function SubjectCombinationReportPage() {
  const [searchText, setSearchText] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
    const [batchFilter, setBatchFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortOrder, setSortOrder] = useState('desc');

  const { data, isLoading, error } = useResourceList('subject-combinations', { page: 1, pageSize: 100 });
  const localRows = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  }, []);
  const rows = useMemo(() => {
    const byId = new Map();
    [...(data?.items || []), ...localRows].forEach((row) => {
      const id = String(row?.id ?? `${valueOf(row, 'name')}-${valueOf(row, 'college')}-${valueOf(row, 'course')}`);
      byId.set(id, { ...(byId.get(id) || {}), ...row });
    });
    return [...byId.values()];
  }, [data?.items, localRows]);

  const options = useMemo(() => ({
    colleges: [...new Set(rows.map((row) => valueOf(row, 'college')).filter(Boolean))].sort(),
    courses: [...new Set(rows.map((row) => valueOf(row, 'course')).filter(Boolean))].sort(),
    batches: [...new Set(rows.map((row) => valueOf(row, 'batch')).filter(Boolean))].sort(),
  }), [rows]);

  const combinationRows = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      const searchable = [valueOf(row, 'name'), valueOf(row, 'college'), valueOf(row, 'course'), valueOf(row, 'batch'), valueOf(row, 'subjects')].join(' ').toLowerCase();
      return (!term || searchable.includes(term))
        && (!collegeFilter || valueOf(row, 'college') === collegeFilter)
        && (!courseFilter || valueOf(row, 'course') === courseFilter)
        && (!batchFilter || valueOf(row, 'batch') === batchFilter);
    });

    const groups = filtered.reduce((map, row) => {
      const name = String(valueOf(row, 'name') || 'Unnamed Combination');
      const current = map.get(name) || { name, records: 0, seats: 0, colleges: new Set(), courses: new Set(), batches: new Set(), subjects: new Set() };
      current.records += 1;
      current.seats += Number(valueOf(row, 'seats')) || 0;
      if (valueOf(row, 'college')) current.colleges.add(valueOf(row, 'college'));
      if (valueOf(row, 'course')) current.courses.add(valueOf(row, 'course'));
      if (valueOf(row, 'batch')) current.batches.add(valueOf(row, 'batch'));
      splitSubjects(valueOf(row, 'subjects')).forEach((subject) => current.subjects.add(subject));
      map.set(name, current);
      return map;
    }, new Map());

    return [...groups.values()].map((row) => ({ ...row, colleges: [...row.colleges], courses: [...row.courses], batches: [...row.batches], subjects: [...row.subjects] }))
      .sort((a, b) => sortOrder === 'desc' ? b.records - a.records || b.seats - a.seats : a.records - b.records || a.seats - b.seats);
  }, [batchFilter, collegeFilter, courseFilter, rows, searchText, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(combinationRows.length / pageSize));
  const visibleRows = combinationRows.slice((page - 1) * pageSize, page * pageSize);
  const maxRecords = combinationRows[0]?.records || 1;
  const stats = useMemo(() => ({
    combinations: combinationRows.length,
    records: combinationRows.reduce((total, row) => total + row.records, 0),
    seats: combinationRows.reduce((total, row) => total + row.seats, 0),
    subjects: new Set(combinationRows.flatMap((row) => row.subjects)).size,
  }), [combinationRows]);

  const resetFilters = () => { setSearchText(''); setCollegeFilter(''); setCourseFilter(''); setBatchFilter(''); setPage(1); };
  const exportCsv = () => {
    const header = ['S.No', 'Combination', 'Record Count', 'Configured Seats', 'College(s)', 'Course(s)', 'Batch(es)', 'Subjects'];
    const lines = [header, ...combinationRows.map((row, index) => [index + 1, row.name, row.records, row.seats, row.colleges.join('; '), row.courses.join('; '), row.batches.join('; '), row.subjects.join('; ')])];
    const url = URL.createObjectURL(new Blob([lines.map((line) => line.map(csvValue).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `subject-combination-count-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] px-2 py-5 text-slate-900 sm:px-3 lg:px-4">
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="mb-5 flex flex-col gap-4 border-b border-slate-200/80 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div><Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Students', to: '/students' }, { label: 'Reports' }, { label: 'Subject Combination Wise Count Report' }]} /><div className="mt-3 flex items-start gap-3"><div className="rounded-2xl bg-[#0f5132] p-3 text-white shadow-lg shadow-emerald-100"><Layers3 className="h-6 w-6" /></div><div><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-600">Student Reports</p><h1 className="mt-1 text-[22px] font-semibold tracking-tight text-slate-950 sm:text-[28px]">Subject Combination Wise Count Report</h1><p className="mt-1 text-xs text-slate-500">Compare configured combinations, seats and subject coverage across the institute.</p></div></div></div>
          <div className="flex flex-wrap gap-2"><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"><Printer className="h-4 w-4" />Print</button><button type="button" onClick={exportCsv} disabled={!combinationRows.length} className="inline-flex items-center gap-2 rounded-lg bg-[#1d3557] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#16324f] disabled:cursor-not-allowed disabled:opacity-50"><Download className="h-4 w-4" />Export CSV</button></div>
        </div>

        <section className="mb-4 rounded-2xl bg-[#101824] p-4 text-white shadow-[0_16px_35px_rgba(16,24,36,0.12)] sm:p-5"><div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">Report controls</p><h2 className="mt-1 text-lg font-semibold">Combination coverage</h2><p className="mt-1 text-xs text-slate-400">Filter and compare saved subject combinations</p></div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:min-w-[820px]"><input value={searchText} onChange={(event) => { setSearchText(event.target.value); setPage(1); }} placeholder="Search combination or subject..." className="h-9 rounded-lg border border-white/15 bg-white/10 px-3 text-xs text-white outline-none placeholder:text-slate-400 focus:border-emerald-300" /><select value={collegeFilter} onChange={(event) => { setCollegeFilter(event.target.value); setPage(1); }} className="h-9 rounded-lg border border-white/15 bg-white/10 px-2 text-xs text-white outline-none [&>option]:text-slate-900"><option value="">All colleges</option>{options.colleges.map((item) => <option key={item}>{item}</option>)}</select><select value={courseFilter} onChange={(event) => { setCourseFilter(event.target.value); setPage(1); }} className="h-9 rounded-lg border border-white/15 bg-white/10 px-2 text-xs text-white outline-none [&>option]:text-slate-900"><option value="">All courses</option>{options.courses.map((item) => <option key={item}>{item}</option>)}</select><select value={batchFilter} onChange={(event) => { setBatchFilter(event.target.value); setPage(1); }} className="h-9 rounded-lg border border-white/15 bg-white/10 px-2 text-xs text-white outline-none [&>option]:text-slate-900"><option value="">All batches</option>{options.batches.map((item) => <option key={item}>{item}</option>)}</select></div></div><div className="mt-3 flex justify-end border-t border-white/10 pt-3"><button type="button" onClick={resetFilters} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10"><RotateCcw className="h-3.5 w-3.5" />Reset filters</button></div></section>

        <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Unique combinations" value={stats.combinations} detail="After current filters" icon={Layers3} tone="emerald" /><Stat label="Combination records" value={stats.records} detail="Saved configuration rows" icon={BarChart3} /><Stat label="Configured seats" value={stats.seats} detail="Across visible combinations" icon={Users} /><Stat label="Unique subjects" value={stats.subjects} detail="Covered by combinations" icon={Filter} /></section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3"><div><h2 className="text-sm font-semibold text-slate-900">Combination distribution</h2><p className="mt-0.5 text-[11px] text-slate-500">Grouped count of subject-combination configurations</p></div><div className="flex items-center gap-2 text-xs text-slate-600"><button type="button" onClick={() => { setSortOrder((value) => value === 'desc' ? 'asc' : 'desc'); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold hover:bg-slate-100">{sortOrder === 'desc' ? 'Most used first' : 'Least used first'}</button><select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5">{PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size} / page</option>)}</select></div></div><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-xs"><thead className="bg-[#1d3557] text-white"><tr><th className="px-4 py-3">S.No</th><th className="px-4 py-3">Combination</th><th className="px-4 py-3">College / Course</th><th className="px-4 py-3">Batch</th><th className="px-4 py-3">Subjects</th><th className="px-4 py-3">Usage</th><th className="px-4 py-3 text-right">Count</th></tr></thead><tbody>{isLoading ? <tr><td colSpan="7" className="px-4 py-16 text-center text-slate-500">Loading subject combinations...</td></tr> : error ? <tr><td colSpan="7" className="px-4 py-16 text-center text-rose-600">Unable to load subject combinations.</td></tr> : visibleRows.length ? visibleRows.map((row, index) => <tr key={row.name} className="border-b border-slate-100 odd:bg-white even:bg-slate-50/70"><td className="px-4 py-4 font-semibold text-slate-500">{(page - 1) * pageSize + index + 1}</td><td className="px-4 py-4"><p className="font-semibold text-slate-900">{row.name}</p><p className="mt-1 text-[10px] text-emerald-700">{row.subjects.length} subjects · {row.seats || '—'} seats</p></td><td className="px-4 py-4"><p className="text-slate-700">{row.colleges.join(', ') || '—'}</p><p className="mt-1 text-[10px] text-slate-400">{row.courses.join(', ') || '—'}</p></td><td className="px-4 py-4 text-slate-700">{row.batches.join(', ') || '—'}</td><td className="max-w-[280px] px-4 py-4 text-slate-600">{row.subjects.join(', ') || 'No subjects listed'}</td><td className="px-4 py-4"><div className="flex items-center gap-2"><div className="h-2 min-w-[100px] flex-1 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.max(8, (row.records / maxRecords) * 100)}%` }} /></div><span className="whitespace-nowrap text-[10px] font-semibold text-slate-500">{row.seats || 0} seats</span></div></td><td className="px-4 py-4 text-right text-lg font-bold text-slate-950">{row.records}</td></tr>) : <tr><td colSpan="7" className="px-4 py-16 text-center text-slate-500">No combinations match the current filters.</td></tr>}</tbody></table></div><div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>Showing {combinationRows.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, combinationRows.length)} of {combinationRows.length} combinations</span><div className="flex items-center gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 disabled:opacity-40">Previous</button><span className="font-semibold text-slate-700">Page {page} of {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 disabled:opacity-40">Next</button></div></div></section>
      </div>
    </div>
  );
}

function Stat({ label, value, detail, icon: Icon, tone = 'slate' }) {
  return <div className={`rounded-2xl border p-4 shadow-sm ${tone === 'emerald' ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-200 bg-white'}`}><div className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] ${tone === 'emerald' ? 'text-emerald-700' : 'text-slate-500'}`}>{label}<Icon className={`h-4 w-4 ${tone === 'emerald' ? 'text-emerald-600' : 'text-sky-600'}`} /></div><p className="mt-3 text-2xl font-bold text-slate-950">{value}</p><p className="mt-1 text-[11px] text-slate-500">{detail}</p></div>;
}
