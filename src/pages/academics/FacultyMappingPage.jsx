import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { RefreshCw } from 'lucide-react';
import DataTable from '../../components/ui/DataTable.jsx';
import SearchableSelect from '../../components/ui/SearchableSelect.jsx';

function generateDemoRows(count = 50) {
  const colleges = [
    'Roorkee College of Agricultural Sciences',
    'Roorkee College of Allied Health Sciences',
    'Roorkee College of Business Studies',
    'Roorkee College of Engineering',
    'Roorkee College of Smart Computing',
  ];
  const courses = [
    'B.Sc. Computer Science (Data Science)',
    'B.Tech. Hons. AI-ML',
    'BCA',
    'B.Com',
    'BBA',
  ];
  const semesters = ['Sem 1','Sem 2','Sem 3','Sem 4','Sem 5','Sem 6','Sem 7','Sem 8'];
  const sections = ['A','B','C','D'];
  const trainers = [
    'Himanshu Verma (Trainer) - H.R.',
    'Anita Sharma (Trainer) - H.R.',
    'Rohit Kumar (Trainer) - H.R.',
    'Priya Singh (Trainer) - H.R.',
  ];
  const coordinators = ['Vinay Kumar Pant','Sonal Gupta','Aman Verma','Kavita Joshi','Ramesh Patel'];

  const rows = [];
  for (let i = 0; i < count; i++) {
    const college = colleges[i % colleges.length];
    const course = courses[i % courses.length];
    const semester = semesters[i % semesters.length];
    const section = sections[i % sections.length];
    const studentCount = Math.floor(Math.random() * 80) + 1;
    rows.push({
      id: i + 1,
      college,
      course,
      semester,
      section,
      studentCount,
      groupName: '',
      classTeacher: i % 20 === 0 ? trainers[0] : '',
      coordinators: i % 15 === 0 ? [coordinators[0]] : [],
    });
  }
  return { rows, trainers, coordinators, colleges, courses, semesters, sections };
}

function MultiSelect({ options = [], value = [], onChange = () => {}, placeholder = 'Select', menuZ = 9999 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current) return;
      if (ref.current.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const toggle = () => setOpen((s) => !s);

  const menu = open ? (
    <div ref={menuRef} className="rounded-md border border-slate-200 bg-white shadow-sm max-h-48 overflow-auto" style={{ minWidth: 220, zIndex: menuZ }}>
      {options.map((opt) => {
        const selected = value.includes(opt.value);
        return (
          <button key={opt.value} type="button" onClick={() => {
            if (selected) onChange(value.filter((v) => v !== opt.value)); else onChange([...value, opt.value]);
          }} className={`w-full px-3 py-2 text-left text-sm ${selected ? 'bg-slate-100' : 'hover:bg-slate-50'}`}>
            <div className="flex items-center justify-between"><span>{opt.label}</span>{selected && <span className="text-xs text-slate-500">Selected</span>}</div>
          </button>
        );
      })}
    </div>
  ) : null;

  return (
    <div className="relative" ref={ref}>
      <div onClick={toggle} className="min-h-[38px] w-full rounded-[6px] border border-slate-200 px-2 py-1 flex items-center gap-2 text-sm bg-white cursor-pointer">
        <div className="flex-1 flex flex-wrap gap-1">
          {value.length === 0 ? <span className="text-slate-500">{placeholder}</span> : value.map((v) => <span key={v} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-xs">{options.find(o=>o.value===v)?.label||v}</span>)}
        </div>
        <div className="text-slate-500">▾</div>
      </div>
      {open && createPortal(menu, document.body)}
    </div>
  );
}

export default function FacultyMappingPage() {
  const demo = useMemo(() => generateDemoRows(50), []);
  const [rows, setRows] = useState(demo.rows);
  const [trainers] = useState(demo.trainers.map((t) => ({ value: t, label: t })));
  const [coordinators] = useState(demo.coordinators.map((c) => ({ value: c, label: c })));
  const [colleges] = useState(demo.colleges.map((c) => ({ value: c, label: c })));
  const [courses] = useState(demo.courses.map((c) => ({ value: c, label: c })));
  const [semesters] = useState(demo.semesters.map((s) => ({ value: s, label: s })));
  const [sections] = useState(demo.sections.map((s) => ({ value: s, label: s })));

  const [filter, setFilter] = useState({ college: '', course: '', semester: '', section: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ensure no body overflow
    document.body.style.overflowX = 'hidden';
    return () => { document.body.style.overflowX = ''; };
  }, []);

  const filteredRows = useMemo(() => rows.filter((r) => {
    if (filter.college && r.college !== filter.college) return false;
    if (filter.course && r.course !== filter.course) return false;
    if (filter.semester && r.semester !== filter.semester) return false;
    if (filter.section && r.section !== filter.section) return false;
    return true;
  }), [rows, filter]);

  const columns = useMemo(() => [
    { key: 'checkbox', label: '', minWidth: '40px', render: (_v, row) => (
      <input type="checkbox" className="h-4 w-4" onChange={(e) => setRows((prev) => prev.map((p) => p.id === row.id ? { ...p, _selected: e.target.checked } : p))} checked={!!row._selected} />
    )},
    { key: 'college', label: 'College', render: (v) => v },
    { key: 'course', label: 'Course', render: (v) => v },
    { key: 'semester', label: 'Semester', render: (v) => v },
    { key: 'section', label: 'Section', render: (v) => v },
    { key: 'studentCount', label: 'Student Count', render: (v) => v, align: 'center' },
    { key: 'groupName', label: 'Group Name', render: (v, row) => (
      <div>
        <SearchableSelect options={[{value:'',label:'Select Groups'},{value:'G1',label:'Group 1'},{value:'G2',label:'Group 2'},{value:'G3',label:'Group 3'}]} value={row.groupName} onChange={(val) => setRows((prev)=>prev.map(p=>p.id===row.id?{...p,groupName:val}:p))} placeholder="Select Groups" />
      </div>
    )},
    { key: 'classTeacher', label: 'Class Teacher *', render: (v, row) => (
      <div>
        <SearchableSelect options={trainers} value={row.classTeacher} onChange={(val) => setRows((prev)=>prev.map(p=>p.id===row.id?{...p,classTeacher:val}:p))} placeholder="Select Class Teacher" />
      </div>
    )},
    { key: 'coordinators', label: 'Coordinators', render: (v, row) => (
      <div>
        <MultiSelect options={coordinators} value={row.coordinators} onChange={(val)=>setRows((prev)=>prev.map(p=>p.id===row.id?{...p,coordinators:val}:p))} placeholder="Select Coordinators" />
      </div>
    )},
    { key: 'action', label: 'Action', render: (_v, row) => (
      <div className="flex items-center gap-2">
        <button type="button" className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm" onClick={()=>alert('Edit row '+row.id)}>Edit</button>
      </div>
    )},
  ], [trainers, coordinators]);

  const totalCourses = rows.length;
  const mappedClassTeachers = rows.filter((r) => !!r.classTeacher).length;
  const mappedCoordinators = rows.filter((r) => r.coordinators && r.coordinators.length > 0).length;

  const go = () => {
    setLoading(true);
    setTimeout(()=> setLoading(false), 400);
  };

  const refresh = () => {
    setRows(generateDemoRows(50).rows);
  };

  return (
    <div className="min-h-screen w-full min-w-0 pl-[10px] pr-[10px] pb-2.5">
      <nav className="text-sm text-slate-400 mb-2">Dashboard &gt; Institute Setup &gt; Academics &gt; Faculty Mapping</nav>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">Faculty Mapping</h1>
        <p className="mt-1 text-sm text-slate-500">Manage faculty assignments across classes and coordinators.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 mb-4">
        <div className="overflow-hidden rounded-[12px] border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-500">TOTAL COURSES</div>
          <div className="mt-2 text-4xl font-semibold text-slate-900">{totalCourses}</div>
        </div>
        <div className="overflow-hidden rounded-[12px] border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-500">CLASS TEACHER</div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-semibold">{mappedClassTeachers} <span className="text-sm font-normal text-slate-500">mapped</span></div>
              <div className="text-sm text-slate-500">{mappedClassTeachers} / {totalCourses}</div>
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-[12px] border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-500">COORDINATORS</div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-semibold">{mappedCoordinators} <span className="text-sm font-normal text-slate-500">mapped</span></div>
              <div className="text-sm text-slate-500">{mappedCoordinators} / {totalCourses}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[12px] border border-slate-200 bg-white p-3 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Filter</h3>
          <div className="flex items-center gap-2">
            <button type="button" title="Refresh" onClick={refresh} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100">
              <RefreshCw className="h-4 w-4" />
            </button>
            <button type="button" onClick={go} className="h-9 px-4 rounded-[6px] bg-sky-600 text-white">Go</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div><SearchableSelect options={colleges} value={filter.college} onChange={(v)=>setFilter(f=>({...f,college:v}))} placeholder="Select College" /></div>
          <div><SearchableSelect options={courses} value={filter.course} onChange={(v)=>setFilter(f=>({...f,course:v}))} placeholder="Select Course" /></div>
          <div><SearchableSelect options={semesters} value={filter.semester} onChange={(v)=>setFilter(f=>({...f,semester:v}))} placeholder="Select Semester" /></div>
          <div><SearchableSelect options={sections} value={filter.section} onChange={(v)=>setFilter(f=>({...f,section:v}))} placeholder="Select Section" /></div>
        </div>
      </div>

      <div>
        <DataTable columns={columns} rows={filteredRows} initialPageSize={10} hideControls={false} loading={loading} headerClassName="bg-[#1E3A5F] text-white rounded-t-lg" />
      </div>
    </div>
  );
}
