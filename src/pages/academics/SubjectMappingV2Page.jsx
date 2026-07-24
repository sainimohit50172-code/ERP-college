import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RefreshCw, Plus, Printer, ChevronRight, ChevronDown, Eye, Trash2 } from 'lucide-react';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';
import Button from '../../components/ui/Button.jsx';
import SearchableSelect from '../../components/ui/SearchableSelect.jsx';
import { getMappings, deleteMapping } from '../../services/subjectMappingV2Service.js';

const colleges = [
  'All',
  'Roorkee College of Agricultural Sciences',
  'Roorkee College of Allied Health Sciences',
  'Roorkee College of Business Studies',
  'Roorkee College of Engineering',
  'Roorkee College of Smart Computing',
];

const semesters = ['All', 'Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];
const sections = ['All', 'A', 'B', 'C', 'D'];

const mapOptions = (list) => list.map((item) => ({ label: item, value: item }));

const collegeOptions = mapOptions(colleges);
const semesterOptions = mapOptions(semesters);
const sectionOptions = mapOptions(sections);

function Badge({ children, bg, color }) {
  return (
    <div className="inline-flex items-center justify-center rounded-full px-4 py-1 h-[34px] text-sm font-medium transition-transform hover:scale-[1.02] shadow-sm" style={{ background: bg, color }}>
      {children}
    </div>
  );
}

function Confirm({ open, onCancel, onConfirm, text = 'Are you sure?' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <h3 className="text-lg font-semibold">Confirm</h3>
        <p className="mt-2 text-sm text-slate-600">{text}</p>
        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">Cancel</button>
          <button onClick={onConfirm} className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function SubjectMappingV2Page() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [college, setCollege] = useState('All');
  const [course, setCourse] = useState('All');
  const [semester, setSemester] = useState('All');
  const [section, setSection] = useState('All');
  const [search, setSearch] = useState('');

  const [expanded, setExpanded] = useState({});
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const items = getMappings();
    setData(items);
  }, []);

  useEffect(() => {
    let out = data.slice();
    if (college !== 'All') out = out.filter((r) => r.college === college);
    if (course !== 'All') out = out.filter((r) => r.course === course);
    if (semester !== 'All') out = out.filter((r) => r.semester === semester);
    if (section !== 'All') out = out.filter((r) => r.section === section);
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter((r) => r.course.toLowerCase().includes(q) || r.college.toLowerCase().includes(q));
    }
    setFiltered(out);
    setPage(1);
  }, [data, college, course, semester, section, search]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const shown = filtered.slice((page - 1) * perPage, page * perPage);

  const handleToggle = (id) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  const handleDelete = (id) => {
    setToDelete(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    deleteMapping(toDelete);
    setData(getMappings());
    setToast('Deleted successfully');
    setConfirmOpen(false);
    setToDelete(null);
    setTimeout(() => setToast(''), 2200);
  };

  const handleRefresh = () => setData(getMappings());

  const handlePrint = () => window.print();

  const allCourses = useMemo(() => {
    const set = new Set(data.map((d) => d.course));
    return ['All', ...Array.from(set)];
  }, [data]);

  return (
    <div className="w-full min-w-0 px-[10px] pb-8 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-400">
            <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Institute Setup', to: '/settings/institute' }, { label: 'Academics', to: '/settings/institute/academics' }, { label: 'Subject Mapping V2' }]} />
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Subject Mapping V2</h1>
          <div className="text-sm text-slate-500">Subject Mapping V2</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-2">
            <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search subject or course" className="w-60 border-none bg-transparent outline-none text-sm text-slate-700" />
          </div>

          <button type="button" onClick={handlePrint} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:shadow hover:scale-[1.02] transition">
            <Printer className="h-4 w-4" /> Print
          </button>
          <Link to="/settings/institute/academics/subject-college-mapping/new">
            <Button className="inline-flex items-center gap-2" variant="primary"><Plus className="h-4 w-4" /> Add New Subject College Mapping</Button>
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-5">
          <div>
            <label className="text-xs font-semibold text-slate-500">All College</label>
            <SearchableSelect options={collegeOptions} value={college} onChange={setCollege} placeholder="All" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">All Course</label>
            <SearchableSelect options={allCourses.map((courseName) => ({ label: courseName, value: courseName }))} value={course} onChange={setCourse} placeholder="All" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">All Semester</label>
            <SearchableSelect options={semesterOptions} value={semester} onChange={setSemester} placeholder="All" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">All Section</label>
            <SearchableSelect options={sectionOptions} value={section} onChange={setSection} placeholder="All" />
          </div>
          <div className="flex items-end">
            <button onClick={handleRefresh} className="w-full inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:shadow transition"><RefreshCw className="h-4 w-4" /> Refresh</button>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="divide-y divide-slate-200">
          {shown.map((row) => (
            <div key={row.id} className="px-4 py-3">
              <div className="flex items-center gap-3">
                <button onClick={() => handleToggle(row.id)} className="rounded-full p-2 hover:bg-slate-50 transition"><span className="sr-only">Expand</span>{expanded[row.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</button>
                <div className="flex-1 flex items-center gap-4">
                  <div className="w-[260px]"><Badge bg="#EAF4FF" color="#1E40AF">{row.college}</Badge></div>
                  <div className="w-[360px]"><Badge bg="#F3E8FF" color="#6B21A8">{row.course}</Badge></div>
                  <div className="w-[120px]"><Badge bg="#FEF3C7" color="#92400E">{row.semester}</Badge></div>
                  <div className="w-[120px]"><Badge bg="#DCFCE7" color="#166534">{row.section}</Badge></div>
                  <div className="w-[120px]"><Badge bg="#ECFEFF" color="#155E75">{row.subjects.length} subjects</Badge></div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => navigate(`/settings/institute/academics/subject-college-mapping-v2/view/${row.id}`)} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:text-sky-600 focus:outline-none" aria-label="View mapping">
                    <Eye className="h-[18px] w-[18px]" />
                  </button>
                  <button onClick={() => navigate(`/settings/institute/academics/subject-mapping-v2/edit/${row.id}`)} className="rounded-2xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:scale-[1.02] transition">Edit</button>
                  <button type="button" onClick={() => handleDelete(row.id)} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:text-rose-600 focus:outline-none" aria-label="Delete mapping">
                    <Trash2 className="h-[18px] w-[18px]" />
                  </button>
                </div>
              </div>

              {expanded[row.id] ? (
                <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="grid gap-3 md:grid-cols-3">
                    {row.subjects.map((s) => (
                      <div key={s.id} className="rounded-md border border-slate-200 bg-white p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-slate-800">{s.name}</div>
                          <div className="text-xs text-slate-500">Seq {s.sequence}</div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge bg="#F3E8FF" color="#6B21A8">{s.assessmentModel}</Badge>
                          <Badge bg="#FEF3C7" color="#92400E">{s.mode}</Badge>
                          <Badge bg="#DCFCE7" color="#166534">{s.type}</Badge>
                        </div>
                        <div className="mt-2 text-sm text-slate-600">Teacher: <span className="font-medium text-slate-800">{s.teacher}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="text-sm text-slate-500">Showing { (page-1)*perPage + 1 } – { Math.min(page*perPage, total) } of { total }</div>
          <div className="flex items-center gap-3">
            <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <div className="flex items-center gap-2">
              <button disabled={page<=1} onClick={() => setPage((p) => Math.max(1, p-1))} className="rounded-2xl border border-slate-200 bg-white px-3 py-2">Prev</button>
              <div className="text-sm">{page} / {pages}</div>
              <button disabled={page>=pages} onClick={() => setPage((p) => Math.min(pages, p+1))} className="rounded-2xl border border-slate-200 bg-white px-3 py-2">Next</button>
            </div>
          </div>
        </div>
      </div>

      <Confirm open={confirmOpen} onCancel={() => setConfirmOpen(false)} onConfirm={confirmDelete} text="Delete this mapping?" />

      {toast ? <div className="fixed bottom-5 right-5 z-50 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">{toast}</div> : null}
    </div>
  );
}
