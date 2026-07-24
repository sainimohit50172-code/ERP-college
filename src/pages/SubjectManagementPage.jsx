import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import SearchableSelect from '../components/ui/SearchableSelect.jsx';
import { Copy, Download, FileUp, Plus } from 'lucide-react';

const DEMO_SUBJECTS = (() => {
  const list = [
    ['Web Technologies', '24CAI501T', 4, 'Theory', 'MAJOR'],
    ['Web Technologies Lab', '24CAI501P', 1, 'Practical', 'MAJOR'],
    ['Software Engineering and Project Management', '24CAI502T', 4, 'Theory', 'MAJOR'],
    ['Application of ReactJs and NodeJs', '24CAI503T', 4, 'Theory', 'MAJOR'],
    ['Big Data Analytics', '24CAI504T', 4, 'Theory', 'MAJOR'],
    ['Natural Language Processing', '24CAI505T', 3, 'Theory', 'MAJOR'],
    ['Quantitative Aptitude and Logical Reasoning-III', '24SEC005T', 2, 'Theory', 'SEC'],
    ['Marketing Management', '24BCM104T', 4, 'Theory', 'MAJOR'],
    ['Business Mathematics and Statistics', '24BCM103T', 4, 'Theory', 'MAJOR'],
    ['Principles of Management', '24BCM101T', 3, 'Theory', 'MAJOR'],
    ['Artificial Intelligence', '24CS501T', 4, 'Theory', 'MAJOR'],
    ['Operating Systems', '24CS502T', 4, 'Theory', 'MAJOR'],
    ['DBMS', '24CS503T', 4, 'Theory', 'MAJOR'],
    ['Compiler Design', '24CS504T', 4, 'Theory', 'MAJOR'],
    ['Computer Networks', '24CS505T', 4, 'Theory', 'MAJOR'],
    ['Machine Learning', '24CS506T', 4, 'Theory', 'MAJOR'],
    ['Cloud Computing', '24CS507T', 4, 'Theory', 'MAJOR'],
    ['Cyber Security', '24CS508T', 4, 'Theory', 'MAJOR'],
    ['Human Computer Interaction', '24CS509T', 3, 'Theory', 'MAJOR'],
    ['Software Testing', '24CS510T', 3, 'Theory', 'MAJOR'],
    ['Data Mining', '24CS511T', 4, 'Theory', 'MAJOR'],
    ['Mobile Application Development', '24CS512T', 3, 'Theory', 'MAJOR'],
    ['Embedded Systems', '24CS513T', 4, 'Theory', 'MAJOR'],
    ['Computer Graphics', '24CS514T', 3, 'Theory', 'MAJOR'],
    ['Distributed Systems', '24CS515T', 4, 'Theory', 'MAJOR'],
    ['Information Retrieval', '24CS516T', 3, 'Theory', 'MAJOR'],
    ['Digital Signal Processing', '24CS517T', 4, 'Theory', 'MAJOR'],
    ['Data Structures', '24CS101T', 4, 'Theory', 'MAJOR'],
    ['Algorithms', '24CS102T', 4, 'Theory', 'MAJOR'],
    ['Discrete Mathematics', '24CS103T', 3, 'Theory', 'MAJOR'],
  ];
  return list.map((r, i) => ({
    id: i + 1,
    name: r[0],
    code: r[1],
    credits: r[2],
    mode: r[3],
    assessment_model: r[4],
  }));
})();

export default function SubjectManagementPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState(DEMO_SUBJECTS);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const fileRef = useRef(null);

  const columns = useMemo(() => [
    { key: 'sno', label: 'S.No' },
    { key: 'name', label: 'Subject Name', sortable: true },
    { key: 'code', label: 'Subject Code', sortable: true },
    { key: 'credits', label: 'Credit', sortable: true },
    { key: 'mode', label: 'Mode' },
    { key: 'assessment_model', label: 'Assessment Model' },
    { key: 'action', label: 'Action' },
  ], []);

  const tableRows = useMemo(() => rows.map((r, idx) => ({
    sno: idx + 1,
    id: r.id,
    name: r.name,
    code: r.code,
    credits: r.credits,
    mode: r.mode,
    assessment_model: r.assessment_model,
    action: '',
  })), [rows]);

  useEffect(() => {
    // ensure no body overflow
    document.body.style.overflowX = 'hidden';
    return () => { document.body.style.overflowX = ''; };
  }, []);

  const handleCopy = async () => {
    const csv = ['S.No,Subject Name,Subject Code,Credit,Mode,Assessment Model', ...rows.map((r, i) => `${i+1},"${r.name}",${r.code},${r.credits},${r.mode},${r.assessment_model}`)].join('\n');
    await navigator.clipboard.writeText(csv);
    alert('Table copied to clipboard');
  };

  const handleExport = () => {
    const csv = ['S.No,Subject Name,Subject Code,Credit,Mode,Assessment Model', ...rows.map((r, i) => `${i+1},"${r.name}",${r.code},${r.credits},${r.mode},${r.assessment_model}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subjects.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const items = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      if (cols.length < 6) continue;
      items.push({ id: rows.length + items.length + 1, name: cols[1].replace(/^"|"$/g, ''), code: cols[2], credits: Number(cols[3]) || 0, mode: cols[4], assessment_model: cols[5] });
    }
    if (items.length) setRows((prev) => [...prev, ...items]);
    alert(`Imported ${items.length} rows`);
    e.target.value = '';
  };

  const openAdd = () => { setEditing(null); setIsDrawerOpen(true); };
  const [isInlineOpen, setIsInlineOpen] = useState(false);
  const openInline = () => { setEditing(null); setIsInlineOpen((v) => !v); };

  const handleSave = (data, keepOpen = false) => {
    if (editing) {
      setRows((prev) => prev.map((r) => r.id === editing.id ? { ...r, ...data } : r));
    } else {
      const id = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
      setRows((prev) => [{ id, ...data }, ...prev]);
    }
    if (!keepOpen) setIsDrawerOpen(false);
  };

  const confirmDelete = (id) => { setToDelete(id); setConfirmOpen(true); };
  const doDelete = () => {
    setRows((prev) => prev.filter((r) => r.id !== toDelete));
    setConfirmOpen(false);
    setToDelete(null);
  };

  return (
    <div className="min-h-screen w-full min-w-0 pl-[10px] pr-[10px] pb-2.5">
      <nav className="text-sm text-slate-400 mb-2">Dashboard &gt; Institute Setup &gt; Academics &gt; Subject</nav>
      <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Subject <span className="text-base font-medium text-slate-600">| Subject</span></h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handleCopy}><Copy className="h-4 w-4 mr-2"/>Copy</Button>
            <Button variant="secondary" onClick={handleExport}><Download className="h-4 w-4 mr-2"/>Excel</Button>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleUpload} />
            <Button variant="secondary" onClick={() => fileRef.current?.click()}><FileUp className="h-4 w-4 mr-2"/>Upload Excel</Button>
            <Button variant="primary" onClick={openInline}><Plus className="h-4 w-4 mr-2"/>Add Subject</Button>
          </div>
        </div>

      {/* Search box above the table (single search) */}
      <div className="mb-4 max-w-full">
        <div className="relative max-w-2xl">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Subjects..."
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
          />
        </div>
      </div>

      {/* Inline compact Add Subject panel (collapsible) */}
      <div className={`w-full mb-2 overflow-hidden transition-all duration-300 ${isInlineOpen ? 'max-h-[240px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <CompactInlineForm
          onCancel={() => setIsInlineOpen(false)}
          onSave={(payload) => {
            const id = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
            setRows((prev) => [{ id, ...payload }, ...prev]);
            setIsInlineOpen(false);
          }}
        />
      </div>

      {/* Subject table occupies full width; hide DataTable internal controls to avoid duplicates */}
      <div className="w-full">
        <DataTable
          columns={columns}
          rows={tableRows}
          initialPageSize={10}
          hideControls={true}
          query={query}
          onQueryChange={(v) => setQuery(v)}
          onEdit={(row) => { setEditing(rows.find((r) => r.id === row.id)); setIsDrawerOpen(true); }}
          onDelete={(row) => confirmDelete(row.id)}
        />
      </div>
      

      <ConfirmDialog open={confirmOpen} title="Delete subject" description="Are you sure you want to delete this subject?" onCancel={() => setConfirmOpen(false)} onConfirm={doDelete} />
    </div>
  );
}

function CompactInlineForm({ onCancel = () => {}, onSave = () => {} }) {
  const [form, setForm] = useState({
    name: '',
    code: '',
    assessment_model: '',
    college: '',
    course: '',
    credits: 3,
    mode: '',
  });
  const [errors, setErrors] = useState({});

  const ASSESSMENT_OPTIONS = [
    'SCHOLASTIC','CO-SCHOLASTIC','DISCIPLINE','SKILL','MAJOR','MINOR','MDC','SEC','VAC','AEC','VOC'
  ].map((v) => ({ value: v, label: v }));

  const COLLEGE_OPTIONS = [
    'All',
    'Roorkee College of Agricultural Sciences',
    'Roorkee College of Allied Health Sciences',
    'Roorkee College of Business Studies',
    'Roorkee College of Engineering',
    'Roorkee College of Smart Computing',
  ].map((v) => ({ value: v, label: v }));

  const MODE_OPTIONS = ['THEORY','PRACTICAL'].map((v) => ({ value: v, label: v }));

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = 'Subject Name is required';
    if (!form.code?.trim()) e.code = 'Subject Code is required';
    if (!form.assessment_model) e.assessment_model = 'Assessment Model is required';
    if (!form.college) e.college = 'College is required';
    if (!form.mode) e.mode = 'Mode is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({ ...form });
    setForm({ name: '', code: '', assessment_model: '', college: '', course: '', credits: 3, mode: '' });
    setErrors({});
  };

  return (
    <div className="w-full rounded-md bg-transparent">
      <div className="w-full rounded-md border border-slate-100 p-3" style={{ boxShadow: 'none' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter Name" className="h-10 rounded-[6px] border border-slate-200 px-3" />
            {errors.name && <p className="mt-1 text-sm text-rose-400">{errors.name}</p>}
          </div>
          <div>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Enter Code" className="h-10 rounded-[6px] border border-slate-200 px-3" />
            {errors.code && <p className="mt-1 text-sm text-rose-400">{errors.code}</p>}
          </div>
          <div>
            <SearchableSelect
              options={ASSESSMENT_OPTIONS}
              value={form.assessment_model}
              onChange={(v) => setForm((s) => ({ ...s, assessment_model: v }))}
              placeholder="Select Assessment Model"
            />
            {errors.assessment_model && <p className="mt-1 text-sm text-rose-400">{errors.assessment_model}</p>}
          </div>
          <div>
            <SearchableSelect
              options={COLLEGE_OPTIONS}
              value={form.college}
              onChange={(v) => setForm((s) => ({ ...s, college: v }))}
              placeholder="Select College"
            />
            {errors.college && <p className="mt-1 text-sm text-rose-400">{errors.college}</p>}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
          <div>
            <input value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} placeholder="Select Course" className="h-10 rounded-[6px] border border-slate-200 px-3" />
          </div>
          <div>
            <input type="number" value={form.credits} onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })} placeholder="Credit Value" className="h-10 rounded-[6px] border border-slate-200 px-3" />
          </div>
          <div>
            <SearchableSelect
              options={MODE_OPTIONS}
              value={form.mode}
              onChange={(v) => setForm((s) => ({ ...s, mode: v }))}
              placeholder="Select Mode"
            />
            {errors.mode && <p className="mt-1 text-sm text-rose-400">{errors.mode}</p>}
          </div>
          <div className="flex items-center justify-end">
            <button type="button" onClick={submit} className="h-[38px] w-[90px] rounded-[6px] bg-sky-600 text-white">Add</button>
          </div>
        </div>
      </div>
    </div>
  );
}

