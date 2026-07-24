import { useEffect, useMemo, useRef, useState } from 'react';import { useNavigate } from 'react-router-dom';import { Download, FileText, RefreshCw, Plus, Printer, Filter, Copy } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import SearchableSelect from '../../components/ui/SearchableSelect.jsx';

function generateDemoMappings(count = 50) {
  const colleges = [
    'Roorkee College of Agricultural Sciences',
    'Roorkee College of Allied Health Sciences',
    'Roorkee College of Business Studies',
    'Roorkee College of Engineering',
    'Roorkee College of Smart Computing',
  ];
  const courses = [
    'B.Sc. Computer Science (Data Science)',
    'B.Tech. Hons. CSE',
    'BCA',
    'B.Com',
    'BBA',
  ];
  const semesters = ['Sem 1','Sem 2','Sem 3','Sem 4','Sem 5','Sem 6','Sem 7','Sem 8'];
  const sections = ['A','B','C','D'];

  const subjectPool = [
    'Data Structures','Operating System','Database Management System','Computer Networks','Object Oriented Programming','Software Engineering','Discrete Mathematics','Compiler Design','Machine Learning','Cloud Computing','Cyber Security','Human Computer Interaction','Artificial Intelligence'
  ];

  const facultyPool = [
    'Dr. Asha Verma','Mr. Vinay Pant','Ms. Priya Singh','Mr. Rohit Kumar','Ms. Anita Sharma','Mr. Suresh Tiwari','Ms. Kavita Joshi','Mr. Aman Verma','Ms. Sonal Gupta'
  ];

  const rows = [];
  for (let i = 0; i < count; i++) {
    const college = colleges[i % colleges.length];
    const course = courses[i % courses.length];
    const semester = semesters[i % semesters.length];
    const section = sections[i % sections.length];

    const subjects = [];
    const subjectCount = 3 + (i % 7); // 3..9 subjects
    for (let s = 0; s < subjectCount; s++) {
      const subj = subjectPool[(i + s) % subjectPool.length] + (s > 0 && Math.random() > 0.6 ? ' Practical' : '');
      const fac = facultyPool[(i + s) % facultyPool.length];
      subjects.push({ name: `${subj}`, faculty: fac });
    }

    rows.push({
      id: i + 1,
      college,
      course,
      semester,
      section,
      subjects,
    });
  }

  return { rows, colleges, courses, semesters, sections };
}

function MultiLineSubjects({ subjects = [] }) {
  const ref = useRef(null);
  return (
    <div ref={ref} className="max-h-[160px] overflow-y-auto pr-2">
      {subjects.map((s, idx) => (
        <div key={idx} className="mb-2">
          <div className="text-sm font-semibold text-slate-800">{idx + 1}. {s.name}</div>
          <div className="text-xs text-slate-500">{s.faculty}</div>
        </div>
      ))}
    </div>
  );
}

export default function SubjectCollegeMappingPage() {
  const demo = useMemo(() => generateDemoMappings(60), []);
  const [rows, setRows] = useState(demo.rows);
  const [filter, setFilter] = useState({ college: '', course: '', semester: '', section: '', subject: '', faculty: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflowX = 'hidden';
    return () => { document.body.style.overflowX = ''; };
  }, []);

  const colleges = demo.colleges.map((c) => ({ value: c, label: c }));
  const courses = demo.courses.map((c) => ({ value: c, label: c }));
  const semesters = demo.semesters.map((s) => ({ value: s, label: s }));
  const sections = demo.sections.map((s) => ({ value: s, label: s }));

  const filteredRows = useMemo(() => rows.filter((r) => {
    if (filter.college && r.college !== filter.college) return false;
    if (filter.course && r.course !== filter.course) return false;
    if (filter.semester && r.semester !== filter.semester) return false;
    if (filter.section && r.section !== filter.section) return false;
    if (filter.subject) {
      const found = r.subjects.some((s) => s.name.toLowerCase().includes(filter.subject.toLowerCase()));
      if (!found) return false;
    }
    if (filter.faculty) {
      const found = r.subjects.some((s) => s.faculty.toLowerCase().includes(filter.faculty.toLowerCase()));
      if (!found) return false;
    }
    return true;
  }), [rows, filter]);

  const handleDelete = (id) => {
    if (!window.confirm('Delete this mapping?')) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const columns = useMemo(() => [
    { key: 'sno', label: 'S.No', minWidth: '40px', render: (_v, _r, i) => i + 1 },
    { key: 'college', label: 'College', render: (v) => v },
    { key: 'course', label: 'Course', render: (v) => v },
    { key: 'semester', label: 'Semester', render: (v) => v, align: 'center' },
    { key: 'section', label: 'Section', render: (v) => v, align: 'center' },
    { key: 'subjects', label: 'Subjects - Employee', render: (v) => (<MultiLineSubjects subjects={v} />), minWidth: '320px' },
    { key: 'action', label: 'Action', render: (_v, row) => (
      <div className="flex items-center gap-2">
        <button type="button" className="text-slate-600 hover:text-slate-900" title="View" onClick={() => navigate(`/settings/institute/academics/subject-college-mapping/view/${row.id}`)}>👁️</button>
        <button type="button" className="text-slate-600 hover:text-slate-900" title="Edit" onClick={() => navigate(`/settings/institute/academics/subject-college-mapping/edit/${row.id}`)}>✎</button>
        <button title="Delete" type="button" className="text-red-600 hover:text-red-800" onClick={() => handleDelete(row.id)}>🗑️</button>
      </div>
    ), align: 'center' },
  ], [handleDelete, navigate]);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => { setRows(generateDemoMappings(60).rows); setLoading(false); }, 600);
  };

  const handleCopy = async () => {
    const csv = ['S.No,College,Course,Semester,Section,Subjects'].concat(filteredRows.map((r, i) => `${i+1},"${r.college}","${r.course}",${r.semester},${r.section},"${r.subjects.map(s=>s.name+' - '+s.faculty).join('; ')}"`)).join('\n');
    await navigator.clipboard.writeText(csv);
    alert('Table copied to clipboard');
  };

  const handleExport = () => {
    const csv = ['S.No,College,Course,Semester,Section,Subjects'].concat(filteredRows.map((r, i) => `${i+1},"${r.college}","${r.course}",${r.semester},${r.section},"${r.subjects.map(s=>s.name+' - '+s.faculty).join('; ')}"`)).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'subject-college-mapping.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen w-full min-w-0 pl-[10px] pr-[10px] pb-4">
      <nav className="text-sm text-slate-400 mb-2">Dashboard &gt; Institute Setup &gt; Academics &gt; Subject College Mapping</nav>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Subject College Mapping</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleCopy}><Copy className="h-4 w-4 mr-2"/>Copy</Button>
          <Button variant="secondary" onClick={handleRefresh}><RefreshCw className="h-4 w-4 mr-2"/>Refresh</Button>
          <Button variant="primary"><Plus className="h-4 w-4 mr-2"/>Add New Subject College Mapping</Button>
          <Button variant="secondary">Replace Teacher</Button>
          <Button variant="secondary" onClick={() => alert('Upload Excel (demo)')}><FileText className="h-4 w-4 mr-2"/>Upload Excel</Button>
          <Button variant="secondary" onClick={handlePrint}><Printer className="h-4 w-4 mr-2"/>Print</Button>
          <Button variant="secondary" onClick={handleExport}><Download className="h-4 w-4 mr-2"/>Excel</Button>
          <Button variant="ghost"><Filter className="h-4 w-4"/></Button>
        </div>
      </div>

      <div className="rounded-[8px] border border-transparent bg-transparent mb-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-1"><SearchableSelect options={colleges} value={filter.college} onChange={(v)=>setFilter(f=>({...f,college:v}))} placeholder="College" /></div>
          <div className="md:col-span-1"><SearchableSelect options={courses} value={filter.course} onChange={(v)=>setFilter(f=>({...f,course:v}))} placeholder="Course" /></div>
          <div className="md:col-span-1"><SearchableSelect options={semesters} value={filter.semester} onChange={(v)=>setFilter(f=>({...f,semester:v}))} placeholder="Semester" /></div>
          <div className="md:col-span-1"><SearchableSelect options={sections} value={filter.section} onChange={(v)=>setFilter(f=>({...f,section:v}))} placeholder="Section" /></div>
          <div className="md:col-span-1"><input value={filter.subject} onChange={(e)=>setFilter(f=>({...f,subject:e.target.value}))} placeholder="Subject" className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" /></div>
          <div className="md:col-span-1"><input value={filter.faculty} onChange={(e)=>setFilter(f=>({...f,faculty:e.target.value}))} placeholder="Faculty" className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" /></div>
        </div>
      </div>

      <div>
        <DataTable
          columns={columns}
          rows={filteredRows}
          initialPageSize={10}
          hideControls={false}
          loading={loading}
          headerClassName="bg-[#1E3A5F] text-white rounded-t-lg"
        />
      </div>
    </div>
  );
}
