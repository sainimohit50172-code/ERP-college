import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BarChart3, Download, Filter, GraduationCap, Printer, RotateCcw, Users, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useERP } from '../services/ERPContext.jsx';
import { getAllocationsByCollege } from '../services/allocateSubjectService.js';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const asLabel = (value) => String(value || '').trim();

const csvValue = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export default function SubjectWiseCountReportPage() {
  const { colleges = [] } = useERP();
  const navigate = useNavigate();
  const { college } = useParams();
  const collegeOptions = useMemo(() => (
    (Array.isArray(colleges) ? colleges : [])
      .map((college) => (typeof college === 'string' ? college : college.name || college.label || String(college.id)))
      .filter(Boolean)
  ), [colleges]);

  const selectedCollege = college ? decodeURIComponent(college) : '';
  const [allocations, setAllocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
    const [courseFilter, setCourseFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    document.title = 'Subject Wise Count Report - Students';
  }, []);

  const loadReport = useCallback(async () => {
    if (!selectedCollege) {
      setAllocations([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = await getAllocationsByCollege(selectedCollege);
      setAllocations(Array.isArray(data) ? data : []);
      if (!data?.length) toast.info('No subject allocations found for this college');
    } catch (error) {
      setAllocations([]);
      toast.error(error.message || 'Unable to load subject count report');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCollege]);

  useEffect(() => {
    void Promise.resolve().then(loadReport);
  }, [loadReport]);

  const courseOptions = useMemo(() => [...new Set(allocations.map((item) => asLabel(item.course)).filter(Boolean))].sort(), [allocations]);
  const semesterOptions = useMemo(() => [...new Set(allocations.map((item) => asLabel(item.semester)).filter(Boolean))].sort(), [allocations]);

  const filteredAllocations = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();
    return allocations.filter((item) => {
      const matchesSearch = !normalizedSearch || [item.subject, item.subjectCode, item.faculty, item.course, item.semester, item.section]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch));
      return matchesSearch
        && (!courseFilter || item.course === courseFilter)
        && (!semesterFilter || item.semester === semesterFilter)
        && (!statusFilter || item.status === statusFilter);
    });
  }, [allocations, courseFilter, searchText, semesterFilter, statusFilter]);

  const subjectRows = useMemo(() => {
    const grouped = filteredAllocations.reduce((map, item) => {
      const key = asLabel(item.subject) || 'Unnamed Subject';
      const current = map.get(key) || {
        subject: key,
        subjectCode: asLabel(item.subjectCode) || '—',
        count: 0,
        courses: new Set(),
        semesters: new Set(),
        faculty: new Set(),
        allocated: 0,
        pending: 0,
      };
      current.count += 1;
      if (item.course) current.courses.add(item.course);
      if (item.semester) current.semesters.add(item.semester);
      if (item.faculty) current.faculty.add(item.faculty);
      if (item.status === 'Allocated') current.allocated += 1;
      if (item.status === 'Pending') current.pending += 1;
      map.set(key, current);
      return map;
    }, new Map());

    return [...grouped.values()]
      .map((row) => ({ ...row, courses: [...row.courses], semesters: [...row.semesters], faculty: [...row.faculty] }))
      .sort((a, b) => sortOrder === 'asc' ? a.count - b.count : b.count - a.count || a.subject.localeCompare(b.subject));
  }, [filteredAllocations, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(subjectRows.length / pageSize));
  const paginatedRows = subjectRows.slice((page - 1) * pageSize, page * pageSize);
  const maxCount = subjectRows[0]?.count || 1;

  const stats = useMemo(() => ({
    subjects: subjectRows.length,
    allocations: filteredAllocations.length,
    allocated: filteredAllocations.filter((item) => item.status === 'Allocated').length,
    faculty: new Set(filteredAllocations.map((item) => item.faculty).filter(Boolean)).size,
  }), [filteredAllocations, subjectRows.length]);

  const resetFilters = () => {
    setSearchText('');
    setCourseFilter('');
    setSemesterFilter('');
    setStatusFilter('');
    setPage(1);
  };

  const handleCollegeSelect = (college) => {
    navigate(`/students/reports/subject-wise/${encodeURIComponent(college)}`);
  };

  const handleChangeCollege = () => {
    resetFilters();
    navigate('/students/reports/subject-wise');
  };

  const exportCsv = () => {
    const rows = [
      ['S.No', 'Subject', 'Subject Code', 'Allocation Count', 'Courses', 'Semesters', 'Faculty Count', 'Allocated', 'Pending'],
      ...subjectRows.map((row, index) => [index + 1, row.subject, row.subjectCode, row.count, row.courses.join('; '), row.semesters.join('; '), row.faculty.length, row.allocated, row.pending]),
    ];
    const blob = new Blob([rows.map((row) => row.map(csvValue).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subject-wise-count-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Subject count report exported');
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] px-2 py-5 text-slate-900 sm:px-3 lg:px-4">
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="mb-5 flex flex-col gap-4 border-b border-slate-200/80 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Students', to: '/students' }, { label: 'Reports' }, { label: 'Subject Wise Count Report' }]} />
            <div className="mt-3 flex items-start gap-3">
              <div className="rounded-2xl bg-[#0f5132] p-3 text-white shadow-lg shadow-emerald-100"><BarChart3 className="h-6 w-6" /></div>
              <div><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-600">Student Reports</p><h1 className="mt-1 text-[22px] font-semibold tracking-tight text-slate-950 sm:text-[28px]">Subject Wise Count Report</h1><p className="mt-1 text-xs text-slate-500">Understand subject demand, allocation coverage and faculty distribution at a glance.</p></div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"><Printer className="h-4 w-4" />Print</button>
            <button type="button" onClick={exportCsv} disabled={!subjectRows.length || isLoading} className="inline-flex items-center gap-2 rounded-lg bg-[#1d3557] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#16324f] disabled:cursor-not-allowed disabled:opacity-50"><Download className="h-4 w-4" />Export CSV</button>
          </div>
        </div>

        {!selectedCollege ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center gap-3"><div className="rounded-xl bg-sky-50 p-2.5 text-sky-700"><GraduationCap className="h-5 w-5" /></div><div><h2 className="text-base font-semibold text-slate-900">Choose a college to open the report</h2><p className="mt-1 text-xs text-slate-500">Subject counts are calculated from the selected college&apos;s allocations.</p></div></div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {collegeOptions.length ? collegeOptions.map((college) => <button key={college} type="button" onClick={() => handleCollegeSelect(college)} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50"><p className="text-sm font-semibold text-slate-900">{college}</p><p className="mt-1 text-[11px] text-slate-500">Open subject distribution</p></button>) : <p className="col-span-full rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No colleges available.</p>}
            </div>
          </section>
        ) : (
          <>
            <section className="mb-4 rounded-2xl bg-[#101824] p-4 text-white shadow-[0_16px_35px_rgba(16,24,36,0.12)] sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">Report scope</p><h2 className="mt-1 text-lg font-semibold">{selectedCollege}</h2><p className="mt-1 text-xs text-slate-400">{filteredAllocations.length} allocation records contributing to this view</p></div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:min-w-[720px]">
                  <label className="relative sm:col-span-2 lg:col-span-1"><input value={searchText} onChange={(event) => { setSearchText(event.target.value); setPage(1); }} placeholder="Search subject, code, faculty..." className="h-9 w-full rounded-lg border border-white/15 bg-white/10 px-3 text-xs text-white outline-none placeholder:text-slate-400 focus:border-emerald-300" /></label>
                  <select value={courseFilter} onChange={(event) => { setCourseFilter(event.target.value); setPage(1); }} className="h-9 rounded-lg border border-white/15 bg-white/10 px-2 text-xs text-white outline-none [&>option]:text-slate-900"><option value="">All courses</option>{courseOptions.map((item) => <option key={item}>{item}</option>)}</select>
                  <select value={semesterFilter} onChange={(event) => { setSemesterFilter(event.target.value); setPage(1); }} className="h-9 rounded-lg border border-white/15 bg-white/10 px-2 text-xs text-white outline-none [&>option]:text-slate-900"><option value="">All semesters</option>{semesterOptions.map((item) => <option key={item}>{item}</option>)}</select>
                  <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className="h-9 rounded-lg border border-white/15 bg-white/10 px-2 text-xs text-white outline-none [&>option]:text-slate-900"><option value="">All status</option><option>Allocated</option><option>Pending</option></select>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3"><button type="button" onClick={handleChangeCollege} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white"><X className="h-3.5 w-3.5" />Change college</button><button type="button" onClick={resetFilters} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10"><RotateCcw className="h-3.5 w-3.5" />Reset filters</button></div>
            </section>

            <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Unique subjects" value={stats.subjects} detail="After current filters" icon={BarChart3} tone="emerald" /><Stat label="Total allocations" value={stats.allocations} detail="Student subject records" icon={GraduationCap} /><Stat label="Allocated status" value={stats.allocated} detail={`${stats.allocations ? Math.round((stats.allocated / stats.allocations) * 100) : 0}% coverage`} icon={Filter} /><Stat label="Faculty involved" value={stats.faculty} detail="Distinct faculty members" icon={Users} /></section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3"><div><h2 className="text-sm font-semibold text-slate-900">Subject distribution</h2><p className="mt-0.5 text-[11px] text-slate-500">Count of allocation records grouped by subject</p></div><div className="flex items-center gap-2 text-xs text-slate-600"><span>Sort count</span><button type="button" onClick={() => { setSortOrder((value) => value === 'desc' ? 'asc' : 'desc'); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold hover:bg-slate-100">{sortOrder === 'desc' ? 'High to low' : 'Low to high'}</button><select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5">{PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size} / page</option>)}</select></div></div>
              <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead className="bg-[#1d3557] text-white"><tr><th className="px-4 py-3 font-semibold">S.No</th><th className="px-4 py-3 font-semibold">Subject</th><th className="px-4 py-3 font-semibold">Course / Semester</th><th className="px-4 py-3 font-semibold">Faculty</th><th className="px-4 py-3 font-semibold">Distribution</th><th className="px-4 py-3 text-right font-semibold">Count</th></tr></thead><tbody>{isLoading ? <tr><td colSpan="6" className="px-4 py-16 text-center text-slate-500">Loading subject count report...</td></tr> : paginatedRows.length ? paginatedRows.map((row, index) => <tr key={row.subject} className="border-b border-slate-100 odd:bg-white even:bg-slate-50/70"><td className="px-4 py-4 font-semibold text-slate-500">{(page - 1) * pageSize + index + 1}</td><td className="px-4 py-4"><p className="font-semibold text-slate-900">{row.subject}</p><p className="mt-1 font-mono text-[10px] text-emerald-700">{row.subjectCode}</p></td><td className="px-4 py-4"><p className="text-slate-700">{row.courses.join(', ') || '—'}</p><p className="mt-1 text-[10px] text-slate-400">{row.semesters.join(', ') || '—'}</p></td><td className="px-4 py-4 text-slate-700">{row.faculty.length} faculty</td><td className="px-4 py-4"><div className="flex items-center gap-2"><div className="h-2 min-w-[120px] flex-1 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.max(8, (row.count / maxCount) * 100)}%` }} /></div><span className="text-[10px] font-semibold text-slate-500">{row.allocated} allocated{row.pending ? ` · ${row.pending} pending` : ''}</span></div></td><td className="px-4 py-4 text-right text-lg font-bold text-slate-950">{row.count}</td></tr>) : <tr><td colSpan="6" className="px-4 py-16 text-center text-slate-500">No subjects match the current filters.</td></tr>}</tbody></table></div>
              <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>Showing {subjectRows.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, subjectRows.length)} of {subjectRows.length} subjects</span><div className="flex items-center gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 disabled:opacity-40">Previous</button><span className="font-semibold text-slate-700">Page {page} of {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 disabled:opacity-40">Next</button></div></div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, detail, icon: Icon, tone = 'slate' }) {
  return <div className={`rounded-2xl border p-4 shadow-sm ${tone === 'emerald' ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-200 bg-white'}`}><div className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] ${tone === 'emerald' ? 'text-emerald-700' : 'text-slate-500'}`}>{label}<Icon className={`h-4 w-4 ${tone === 'emerald' ? 'text-emerald-600' : 'text-sky-600'}`} /></div><p className="mt-3 text-2xl font-bold text-slate-950">{value}</p><p className="mt-1 text-[11px] text-slate-500">{detail}</p></div>;
}
