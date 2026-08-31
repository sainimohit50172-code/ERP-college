import { useMemo, useState } from 'react';
import { BarChart3, Check, Download, FileJson, FileSpreadsheet, Printer, RotateCcw, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { useERP } from '../services/ERPContext.jsx';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const get = (student, key, metaKey = key) => student?.[key] ?? student?.meta?.[metaKey] ?? student?.[key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)] ?? '';
const text = (value) => String(value ?? '').trim();
const csvValue = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

function normalizeStudent(student) {
  return {
    id: student?.id,
    name: text(student?.name || `${get(student, 'firstName')} ${get(student, 'lastName')}`),
    college: text(get(student, 'college') || get(student, 'collegeName')) || 'Unassigned College',
    course: text(get(student, 'course')) || 'Unassigned Course',
    semester: text(get(student, 'semester')) || 'Unassigned Semester',
    section: text(get(student, 'section')) || 'Unassigned Section',
    gender: text(get(student, 'gender')) || 'Not specified',
    status: text(get(student, 'status')) || 'Active',
  };
}

export default function StudentStrengthReportPage() {
  const { students = [] } = useERP();
  const [search, setSearch] = useState('');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
    const [semester, setSemester] = useState('');
  const [section, setSection] = useState('');
  const [status, setStatus] = useState('');
  const [gender, setGender] = useState('');
  const [groupBy, setGroupBy] = useState('course');
  const [sortOrder, setSortOrder] = useState('desc');
  const [format, setFormat] = useState('csv');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);

  const records = useMemo(() => (Array.isArray(students) ? students : []).map(normalizeStudent), [students]);
  const options = useMemo(() => ({
    colleges: [...new Set(records.map((row) => row.college))].sort(),
    courses: [...new Set(records.map((row) => row.course))].sort(),
    semesters: [...new Set(records.map((row) => row.semester))].sort(),
    sections: [...new Set(records.map((row) => row.section))].sort(),
    genders: [...new Set(records.map((row) => row.gender))].sort(),
  }), [records]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return records.filter((row) => (!term || Object.values(row).join(' ').toLowerCase().includes(term)) && (!college || row.college === college) && (!course || row.course === course) && (!semester || row.semester === semester) && (!section || row.section === section) && (!status || row.status === status) && (!gender || row.gender === gender));
  }, [college, course, gender, records, search, section, semester, status]);
  const grouped = useMemo(() => {
    const keys = { college: 'college', course: 'course', semester: 'semester', section: 'section' };
    const groups = filtered.reduce((map, row) => {
      const key = row[keys[groupBy]] || 'Unassigned';
      const current = map.get(key) || { key, total: 0, male: 0, female: 0, other: 0, active: 0, inactive: 0, colleges: new Set(), courses: new Set() };
      current.total += 1;
      if (row.gender.toLowerCase() === 'male') current.male += 1;
      else if (row.gender.toLowerCase() === 'female') current.female += 1;
      else current.other += 1;
      if (row.status.toLowerCase() === 'active') current.active += 1;
      else current.inactive += 1;
      current.colleges.add(row.college);
      current.courses.add(row.course);
      map.set(key, current);
      return map;
    }, new Map());
    return [...groups.values()].map((row) => ({ ...row, colleges: [...row.colleges], courses: [...row.courses] })).sort((a, b) => sortOrder === 'desc' ? b.total - a.total : a.total - b.total);
  }, [filtered, groupBy, sortOrder]);
  const totalPages = Math.max(1, Math.ceil(grouped.length / pageSize));
  const visible = grouped.slice((page - 1) * pageSize, page * pageSize);
  const maxStrength = grouped[0]?.total || 1;
  const selectedData = selectedRows.length ? grouped.filter((row) => selectedRows.includes(row.key)) : grouped;
  const stats = useMemo(() => ({ total: filtered.length, active: filtered.filter((row) => row.status.toLowerCase() === 'active').length, male: filtered.filter((row) => row.gender.toLowerCase() === 'male').length, female: filtered.filter((row) => row.gender.toLowerCase() === 'female').length }), [filtered]);

  const reset = () => { setSearch(''); setCollege(''); setCourse(''); setSemester(''); setSection(''); setStatus(''); setGender(''); setPage(1); setSelectedRows([]); };
  const exportData = () => {
    if (!selectedData.length) { toast.info('No strength data available to export'); return; }
    const header = ['S.No', `${groupBy[0].toUpperCase()}${groupBy.slice(1)}`, 'Total Strength', 'Male', 'Female', 'Other', 'Active', 'Inactive', 'Colleges', 'Courses'];
    const payload = selectedData.map((row, index) => [index + 1, row.key, row.total, row.male, row.female, row.other, row.active, row.inactive, row.colleges.join('; '), row.courses.join('; ')]);
    const content = format === 'json' ? JSON.stringify(selectedData, null, 2) : [header, ...payload].map((row) => row.map(csvValue).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `student-strength-${groupBy}-${new Date().toISOString().slice(0, 10)}.${format}`; link.click(); URL.revokeObjectURL(url); toast.success(`${selectedData.length} strength groups exported`);
  };
  const allVisibleSelected = visible.length > 0 && visible.every((row) => selectedRows.includes(row.key));
  const toggleVisible = () => setSelectedRows((current) => allVisibleSelected ? current.filter((key) => !visible.some((row) => row.key === key)) : [...new Set([...current, ...visible.map((row) => row.key)])]);

  return (
    <div className="min-h-screen bg-[#f5f6fa] px-2 py-5 text-slate-900 sm:px-3 lg:px-4"><div className="mx-auto w-full max-w-[1600px]">
      <header className="mb-5 flex flex-col gap-4 border-b border-slate-200/80 pb-5 lg:flex-row lg:items-end lg:justify-between"><div><Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Students', to: '/students' }, { label: 'Reports' }, { label: 'Strength Report' }]} /><div className="mt-3 flex items-start gap-3"><div className="rounded-2xl bg-[#0f5132] p-3 text-white shadow-lg shadow-emerald-100"><BarChart3 className="h-6 w-6" /></div><div><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-600">Student Reports</p><h1 className="mt-1 text-[22px] font-semibold tracking-tight text-slate-950 sm:text-[28px]">Strength Report</h1><p className="mt-1 text-xs text-slate-500">Analyse student strength by college, course, semester and section.</p></div></div></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"><Printer className="h-4 w-4" />Print</button><button type="button" onClick={exportData} disabled={!selectedData.length} className="inline-flex items-center gap-2 rounded-lg bg-[#1d3557] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#16324f] disabled:opacity-50"><Download className="h-4 w-4" />Export {format.toUpperCase()}</button></div></header>
      <section className="mb-4 rounded-2xl bg-[#101824] p-4 text-white shadow-[0_16px_35px_rgba(16,24,36,0.12)] sm:p-5"><div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">Strength controls</p><h2 className="mt-1 text-lg font-semibold">Build your student strength view</h2><p className="mt-1 text-xs text-slate-400">{filtered.length} students match the current filters</p></div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:min-w-[940px]"><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search student, college or course..." className="h-9 rounded-lg border border-white/15 bg-white/10 px-3 text-xs text-white outline-none placeholder:text-slate-400 focus:border-emerald-300" /><select value={college} onChange={(event) => { setCollege(event.target.value); setPage(1); }} className="h-9 rounded-lg border border-white/15 bg-white/10 px-2 text-xs text-white outline-none [&>option]:text-slate-900"><option value="">All colleges</option>{options.colleges.map((item) => <option key={item}>{item}</option>)}</select><select value={course} onChange={(event) => { setCourse(event.target.value); setPage(1); }} className="h-9 rounded-lg border border-white/15 bg-white/10 px-2 text-xs text-white outline-none [&>option]:text-slate-900"><option value="">All courses</option>{options.courses.map((item) => <option key={item}>{item}</option>)}</select><select value={semester} onChange={(event) => { setSemester(event.target.value); setPage(1); }} className="h-9 rounded-lg border border-white/15 bg-white/10 px-2 text-xs text-white outline-none [&>option]:text-slate-900"><option value="">All semesters</option>{options.semesters.map((item) => <option key={item}>{item}</option>)}</select><select value={section} onChange={(event) => { setSection(event.target.value); setPage(1); }} className="h-9 rounded-lg border border-white/15 bg-white/10 px-2 text-xs text-white outline-none [&>option]:text-slate-900"><option value="">All sections</option>{options.sections.map((item) => <option key={item}>{item}</option>)}</select><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-9 rounded-lg border border-white/15 bg-white/10 px-2 text-xs text-white outline-none [&>option]:text-slate-900"><option value="">All status</option><option>Active</option><option>Inactive</option><option>Alumni</option></select><select value={gender} onChange={(event) => { setGender(event.target.value); setPage(1); }} className="h-9 rounded-lg border border-white/15 bg-white/10 px-2 text-xs text-white outline-none [&>option]:text-slate-900"><option value="">All genders</option>{options.genders.map((item) => <option key={item}>{item}</option>)}</select><select value={groupBy} onChange={(event) => { setGroupBy(event.target.value); setPage(1); }} className="h-9 rounded-lg border border-white/15 bg-white/10 px-2 text-xs text-white outline-none [&>option]:text-slate-900"><option value="college">Group by college</option><option value="course">Group by course</option><option value="semester">Group by semester</option><option value="section">Group by section</option></select></div></div><div className="mt-3 flex justify-end border-t border-white/10 pt-3"><button type="button" onClick={reset} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10"><RotateCcw className="h-3.5 w-3.5" />Reset filters</button></div></section>
      <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Total strength" value={stats.total} detail="Students in current view" icon={Users} tone="emerald" /><Stat label="Active students" value={stats.active} detail="Current active records" icon={Check} /><Stat label="Male students" value={stats.male} detail="Gender distribution" icon={Users} /><Stat label="Female students" value={stats.female} detail="Gender distribution" icon={Users} /></section>
      <section className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3"><div><h2 className="text-sm font-semibold text-slate-900">Strength distribution</h2><p className="mt-1 text-[11px] text-slate-500">Grouped by {groupBy}, with gender and status split</p></div><div className="flex items-center gap-2"><div className="flex rounded-lg border border-slate-200 p-1"><button type="button" onClick={() => setFormat('csv')} className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${format === 'csv' ? 'bg-[#1d3557] text-white' : 'text-slate-600'}`}><FileSpreadsheet className="h-3.5 w-3.5" />CSV</button><button type="button" onClick={() => setFormat('json')} className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${format === 'json' ? 'bg-[#1d3557] text-white' : 'text-slate-600'}`}><FileJson className="h-3.5 w-3.5" />JSON</button></div><button type="button" onClick={() => setSortOrder((value) => value === 'desc' ? 'asc' : 'desc')} className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-700">{sortOrder === 'desc' ? 'Highest first' : 'Lowest first'}</button><button type="button" onClick={toggleVisible} disabled={!visible.length} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-700 disabled:opacity-40"><Check className="h-3.5 w-3.5" />{allVisibleSelected ? 'Clear page' : 'Select page'}</button></div></div><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-xs"><thead className="bg-[#1d3557] text-white"><tr><th className="w-12 px-4 py-3"><input type="checkbox" checked={allVisibleSelected} onChange={toggleVisible} aria-label="Select visible strength groups" /></th><th className="px-4 py-3">S.No</th><th className="px-4 py-3">{groupBy}</th><th className="px-4 py-3">College / Course</th><th className="px-4 py-3">Gender split</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Strength</th><th className="px-4 py-3 text-right">Total</th></tr></thead><tbody>{visible.length ? visible.map((row, index) => <tr key={row.key} className="border-b border-slate-100 odd:bg-white even:bg-slate-50/70"><td className="px-4 py-4"><input type="checkbox" checked={selectedRows.includes(row.key)} onChange={() => setSelectedRows((current) => current.includes(row.key) ? current.filter((key) => key !== row.key) : [...current, row.key])} aria-label={`Select ${row.key}`} /></td><td className="px-4 py-4 font-semibold text-slate-500">{(page - 1) * pageSize + index + 1}</td><td className="px-4 py-4 font-semibold text-slate-900">{row.key}</td><td className="px-4 py-4 text-slate-600">{row.colleges.join(', ')}<p className="mt-1 text-[10px] text-slate-400">{row.courses.join(', ')}</p></td><td className="px-4 py-4"><span className="font-semibold text-sky-700">M {row.male}</span><span className="mx-2 text-slate-300">|</span><span className="font-semibold text-pink-600">F {row.female}</span>{row.other ? <span className="ml-2 text-slate-500">O {row.other}</span> : null}</td><td className="px-4 py-4"><span className="text-emerald-700">{row.active} active</span><span className="ml-2 text-slate-500">{row.inactive} other</span></td><td className="px-4 py-4"><div className="h-2 min-w-[130px] rounded-full bg-slate-100"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.max(8, (row.total / maxStrength) * 100)}%` }} /></div></td><td className="px-4 py-4 text-right text-lg font-bold text-slate-950">{row.total}</td></tr>) : <tr><td colSpan="8" className="px-4 py-16 text-center text-slate-500">No students match the current filters.</td></tr>}</tbody></table></div><div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>Showing {visible.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, grouped.length)} of {grouped.length} groups</span><div className="flex items-center gap-2"><select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5">{PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size} / page</option>)}</select><button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 disabled:opacity-40">Previous</button><span className="font-semibold text-slate-700">{page} / {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 disabled:opacity-40">Next</button></div></div></section>
    </div></div>
  );
}

function Stat({ label, value, detail, icon: Icon, tone = 'slate' }) {
  return <div className={`rounded-2xl border p-4 shadow-sm ${tone === 'emerald' ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-200 bg-white'}`}><div className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] ${tone === 'emerald' ? 'text-emerald-700' : 'text-slate-500'}`}>{label}<Icon className={`h-4 w-4 ${tone === 'emerald' ? 'text-emerald-600' : 'text-sky-600'}`} /></div><p className="mt-3 text-2xl font-bold text-slate-950">{value}</p><p className="mt-1 text-[11px] text-slate-500">{detail}</p></div>;
}
