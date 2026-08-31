import { useMemo, useState } from 'react';
import { Check, Download, FileJson, FileSpreadsheet, Filter, GraduationCap, Printer, RotateCcw, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { useERP } from '../services/ERPContext.jsx';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const get = (student, key, metaKey = key) => student?.[key] ?? student?.meta?.[metaKey] ?? student?.[key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)] ?? '';
const text = (value) => String(value ?? '').trim();
const csvValue = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const fields = [
  ['universityRollNo', 'University Roll No.'],
  ['admissionNo', 'Admission No.'],
  ['name', 'Student Name'],
  ['fatherName', 'Father Name'],
  ['college', 'College'],
  ['course', 'Course'],
  ['semester', 'Semester'],
  ['section', 'Section'],
  ['gender', 'Gender'],
  ['status', 'Status'],
];

function normalizeStudent(student) {
  return {
    id: student?.id,
    universityRollNo: text(get(student, 'universityRollNo')),
    admissionNo: text(get(student, 'admissionNo')),
    name: text(student?.name || `${get(student, 'firstName')} ${get(student, 'lastName')}`),
    fatherName: text(get(student, 'fatherName')),
    college: text(get(student, 'college') || get(student, 'collegeName')),
    course: text(get(student, 'course')),
    semester: text(get(student, 'semester')),
    section: text(get(student, 'section')),
    gender: text(get(student, 'gender')),
    status: text(get(student, 'status')) || 'Active',
  };
}

export default function UniversityDataPage() {
  const { students = [] } = useERP();
  const [search, setSearch] = useState('');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
    const [semester, setSemester] = useState('');
  const [status, setStatus] = useState('');
  const [format, setFormat] = useState('csv');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showColumns, setShowColumns] = useState(false);
  const [selectedFields, setSelectedFields] = useState(fields.map(([key]) => key));

  const records = useMemo(() => (Array.isArray(students) ? students : []).map(normalizeStudent), [students]);
  const options = useMemo(() => ({
    colleges: [...new Set(records.map((row) => row.college).filter(Boolean))].sort(),
    courses: [...new Set(records.map((row) => row.course).filter(Boolean))].sort(),
    semesters: [...new Set(records.map((row) => row.semester).filter(Boolean))].sort(),
  }), [records]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return records.filter((row) => {
      const searchable = Object.values(row).join(' ').toLowerCase();
      return (!term || searchable.includes(term)) && (!college || row.college === college) && (!course || row.course === course) && (!semester || row.semester === semester) && (!status || row.status === status);
    });
  }, [college, course, records, search, semester, status]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const exportRows = selectedIds.length ? filtered.filter((row) => selectedIds.includes(row.id)) : filtered;
  const allVisibleSelected = visible.length > 0 && visible.every((row) => selectedIds.includes(row.id));
  const activeFields = selectedFields.length ? selectedFields : fields.map(([key]) => key);
  const labelFor = (key) => fields.find(([field]) => field === key)?.[1] || key;

  const reset = () => { setSearch(''); setCollege(''); setCourse(''); setSemester(''); setStatus(''); setSelectedIds([]); setPage(1); };
  const toggleVisible = () => setSelectedIds((current) => allVisibleSelected ? current.filter((id) => !visible.some((row) => row.id === id)) : [...new Set([...current, ...visible.map((row) => row.id)])]);
  const exportData = () => {
    if (!exportRows.length) { toast.info('No university records available to export'); return; }
    const payload = exportRows.map((row) => Object.fromEntries(activeFields.map((key) => [key, row[key]])));
    const content = format === 'json' ? JSON.stringify(payload, null, 2) : [[...activeFields.map(labelFor)], ...payload.map((row) => activeFields.map((key) => row[key]))].map((row) => row.map(csvValue).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `university-data-${new Date().toISOString().slice(0, 10)}.${format}`; link.click(); URL.revokeObjectURL(url);
    toast.success(`${exportRows.length} university records exported`);
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] px-2 py-5 text-slate-900 sm:px-3 lg:px-4">
      <div className="mx-auto w-full max-w-[1600px]">
        <header className="mb-5 flex flex-col gap-4 border-b border-slate-200/80 pb-5 lg:flex-row lg:items-end lg:justify-between"><div><Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Students', to: '/students' }, { label: 'Reports' }, { label: 'University Data' }]} /><div className="mt-3 flex items-start gap-3"><div className="rounded-2xl bg-[#0f5132] p-3 text-white shadow-lg shadow-emerald-100"><GraduationCap className="h-6 w-6" /></div><div><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-600">Student Reports</p><h1 className="mt-1 text-[22px] font-semibold tracking-tight text-slate-950 sm:text-[28px]">University Data</h1><p className="mt-1 text-xs text-slate-500">Prepare clean student records for university submission and verification.</p></div></div></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"><Printer className="h-4 w-4" />Print</button><button type="button" onClick={exportData} disabled={!exportRows.length} className="inline-flex items-center gap-2 rounded-lg bg-[#1d3557] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#16324f] disabled:opacity-50"><Download className="h-4 w-4" />Export {format.toUpperCase()}</button></div></header>

        <section className="mb-4 rounded-2xl bg-[#101824] p-4 text-white shadow-[0_16px_35px_rgba(16,24,36,0.12)] sm:p-5"><div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">Submission workspace</p><h2 className="mt-1 text-lg font-semibold">Filter university records</h2><p className="mt-1 text-xs text-slate-400">{filtered.length} records match the current scope</p></div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5 xl:min-w-[900px]"><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search name, roll no, course..." className="h-9 rounded-lg border border-white/15 bg-white/10 px-3 text-xs text-white outline-none placeholder:text-slate-400 focus:border-emerald-300" /><select value={college} onChange={(event) => { setCollege(event.target.value); setPage(1); }} className="h-9 rounded-lg border border-white/15 bg-white/10 px-2 text-xs text-white outline-none [&>option]:text-slate-900"><option value="">All colleges</option>{options.colleges.map((item) => <option key={item}>{item}</option>)}</select><select value={course} onChange={(event) => { setCourse(event.target.value); setPage(1); }} className="h-9 rounded-lg border border-white/15 bg-white/10 px-2 text-xs text-white outline-none [&>option]:text-slate-900"><option value="">All courses</option>{options.courses.map((item) => <option key={item}>{item}</option>)}</select><select value={semester} onChange={(event) => { setSemester(event.target.value); setPage(1); }} className="h-9 rounded-lg border border-white/15 bg-white/10 px-2 text-xs text-white outline-none [&>option]:text-slate-900"><option value="">All semesters</option>{options.semesters.map((item) => <option key={item}>{item}</option>)}</select><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-9 rounded-lg border border-white/15 bg-white/10 px-2 text-xs text-white outline-none [&>option]:text-slate-900"><option value="">All status</option><option>Active</option><option>Inactive</option><option>Alumni</option></select></div></div><div className="mt-3 flex justify-end border-t border-white/10 pt-3"><button type="button" onClick={reset} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10"><RotateCcw className="h-3.5 w-3.5" />Reset filters</button></div></section>

        <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat label="University records" value={filtered.length} detail="Records in current view" icon={Users} tone="emerald" /><Stat label="With university roll no" value={filtered.filter((row) => row.universityRollNo).length} detail="Ready for submission" icon={GraduationCap} /><Stat label="Missing roll no" value={filtered.filter((row) => !row.universityRollNo).length} detail="Needs verification" icon={Filter} /><Stat label="Selected for export" value={exportRows.length} detail={selectedIds.length ? 'Manual selection' : 'All filtered records'} icon={FileSpreadsheet} /></section>

        <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Export format</p><p className="mt-1 text-sm font-semibold text-slate-900">Submission columns</p></div><div className="flex flex-wrap gap-2"><div className="flex rounded-lg border border-slate-200 p-1"><button type="button" onClick={() => setFormat('csv')} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${format === 'csv' ? 'bg-[#1d3557] text-white' : 'text-slate-600'}`}><FileSpreadsheet className="h-3.5 w-3.5" />CSV</button><button type="button" onClick={() => setFormat('json')} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${format === 'json' ? 'bg-[#1d3557] text-white' : 'text-slate-600'}`}><FileJson className="h-3.5 w-3.5" />JSON</button></div><button type="button" onClick={() => setShowColumns((value) => !value)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Filter className="h-3.5 w-3.5" />{showColumns ? 'Hide columns' : 'Choose columns'}</button></div></div>{showColumns && <div className="mt-4 grid gap-2 border-t border-slate-200 pt-4 sm:grid-cols-2 lg:grid-cols-5">{fields.map(([key, label]) => <label key={key} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700"><input type="checkbox" checked={activeFields.includes(key)} onChange={() => setSelectedFields((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key])} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />{label}</label>)}</div>}</section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3"><div><h2 className="text-sm font-semibold text-slate-900">University data preview</h2><p className="mt-1 text-[11px] text-slate-500">Verify roll numbers and student details before export.</p></div><button type="button" onClick={toggleVisible} disabled={!visible.length} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40"><Check className="h-3.5 w-3.5" />{allVisibleSelected ? 'Clear page' : 'Select page'}</button></div><div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left text-xs"><thead className="bg-[#1d3557] text-white"><tr><th className="w-12 px-4 py-3"><input type="checkbox" checked={allVisibleSelected} onChange={toggleVisible} aria-label="Select visible students" /></th><th className="px-4 py-3">S.No</th>{activeFields.map((key) => <th key={key} className="px-4 py-3 font-semibold">{labelFor(key)}</th>)}</tr></thead><tbody>{visible.length ? visible.map((row, index) => <tr key={row.id ?? index} className="border-b border-slate-100 odd:bg-white even:bg-slate-50/70"><td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => setSelectedIds((current) => current.includes(row.id) ? current.filter((id) => id !== row.id) : [...current, row.id])} aria-label={`Select ${row.name || 'student'}`} /></td><td className="px-4 py-3 font-semibold text-slate-500">{(page - 1) * pageSize + index + 1}</td>{activeFields.map((key) => <td key={key} className={`max-w-[220px] truncate px-4 py-3 ${key === 'universityRollNo' && !row[key] ? 'font-semibold text-rose-600' : 'text-slate-700'}`}>{row[key] || (key === 'universityRollNo' ? 'Missing' : '—')}</td>)}</tr>) : <tr><td colSpan={activeFields.length + 2} className="px-4 py-16 text-center text-slate-500">No university records match the current filters.</td></tr>}</tbody></table></div><div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>Showing {visible.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} records</span><div className="flex items-center gap-2"><select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5">{PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size} / page</option>)}</select><button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 disabled:opacity-40">Previous</button><span className="font-semibold text-slate-700">{page} / {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 disabled:opacity-40">Next</button></div></div></section>
      </div>
    </div>
  );
}

function Stat({ label, value, detail, icon: Icon, tone = 'slate' }) {
  return <div className={`rounded-2xl border p-4 shadow-sm ${tone === 'emerald' ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-200 bg-white'}`}><div className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] ${tone === 'emerald' ? 'text-emerald-700' : 'text-slate-500'}`}>{label}<Icon className={`h-4 w-4 ${tone === 'emerald' ? 'text-emerald-600' : 'text-sky-600'}`} /></div><p className="mt-3 text-2xl font-bold text-slate-950">{value}</p><p className="mt-1 text-[11px] text-slate-500">{detail}</p></div>;
}
