import { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardList, Copy, Download, Edit3, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Modal from '../components/ui/Modal.jsx';

const storageKey = 'library-issue-types';
const defaultRows = [
  { id: 'student-standard', name: 'Student Standard', code: 'STU-STD', memberType: 'Student', loanDays: 14, renewalLimit: 2, finePerDay: 5, status: 'Active', description: 'Standard issue policy for enrolled students.' },
  { id: 'faculty-standard', name: 'Faculty Standard', code: 'FAC-STD', memberType: 'Faculty', loanDays: 30, renewalLimit: 3, finePerDay: 2, status: 'Active', description: 'Extended loan policy for teaching faculty.' },
  { id: 'reference-only', name: 'Reference Only', code: 'REF-ONLY', memberType: 'All members', loanDays: 1, renewalLimit: 0, finePerDay: 10, status: 'Active', description: 'Short-term issue for books that should remain available in the library.' },
];
const emptyForm = { name: '', code: '', memberType: 'Student', loanDays: 14, renewalLimit: 2, finePerDay: 5, status: 'Active', description: '' };

function readRows() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
    return Array.isArray(stored) ? stored : defaultRows;
  } catch {
    return defaultRows;
  }
}

function csvValue(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

export default function LibraryIssueTypesPage() {
  const [rows, setRows] = useState(readRows);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [memberFilter, setMemberFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const activeCount = rows.filter((row) => row.status === 'Active').length;
  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch = !query || [row.name, row.code, row.memberType, row.description].some((value) => String(value || '').toLowerCase().includes(query));
      const matchesMember = memberFilter === 'All' || row.memberType === memberFilter;
      const matchesStatus = statusFilter === 'All' || row.status === statusFilter;
      return matchesSearch && matchesMember && matchesStatus;
    });
  }, [memberFilter, rows, searchTerm, statusFilter]);

  const persist = (nextRows) => {
    setRows(nextRows);
    localStorage.setItem(storageKey, JSON.stringify(nextRows));
  };
  const openCreate = () => { setEditingId(null); setForm({ ...emptyForm }); setIsModalOpen(true); };
  const openEdit = (row) => { setEditingId(row.id); setForm({ ...emptyForm, ...row }); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setForm({ ...emptyForm }); };
  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const saveIssueType = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.code.trim()) { toast.error('Issue type name and code are required.'); return; }
    const duplicate = rows.some((row) => row.id !== editingId && row.code.toLowerCase() === form.code.trim().toLowerCase());
    if (duplicate) { toast.error('Issue type code must be unique.'); return; }
    const payload = { ...form, name: form.name.trim(), code: form.code.trim().toUpperCase(), loanDays: Number(form.loanDays), renewalLimit: Number(form.renewalLimit), finePerDay: Number(form.finePerDay) };
    const nextRows = editingId ? rows.map((row) => row.id === editingId ? { ...row, ...payload } : row) : [{ ...payload, id: `issue-type-${Date.now()}` }, ...rows];
    persist(nextRows);
    closeModal();
    toast.success(editingId ? 'Issue type updated.' : 'Issue type created.');
  };

  const deleteRow = (row) => {
    if (!window.confirm(`Delete ${row.name}?`)) return;
    persist(rows.filter((item) => item.id !== row.id));
    toast.success('Issue type deleted.');
  };
  const resetRows = () => { persist(defaultRows); toast.info('Issue type defaults restored.'); };
  const exportCsv = async (copyOnly = false) => {
    const headers = ['Issue type', 'Code', 'Member type', 'Loan days', 'Renewal limit', 'Fine per day', 'Status', 'Description'];
    const lines = [headers, ...filteredRows.map((row) => [row.name, row.code, row.memberType, row.loanDays, row.renewalLimit, row.finePerDay, row.status, row.description])].map((line) => line.map(csvValue).join(',')).join('\n');
    if (copyOnly) { await navigator.clipboard.writeText(lines); toast.success('Issue types copied.'); return; }
    const link = document.createElement('a');
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(lines)}`;
    link.download = 'library-issue-types.csv';
    link.click();
    toast.success('Issue types exported.');
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] space-y-6 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#eff6ff_100%)] px-3 pb-8 sm:px-5 lg:px-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
        <div className="relative px-5 py-6 sm:px-7 sm:py-7"><div className="absolute right-0 top-0 h-36 w-36 rounded-bl-[90px] bg-sky-50" /><div className="relative">
          <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Library Setup', to: '/library' }, { label: 'Library Issue Type' }]} />
          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700"><ClipboardList className="h-3.5 w-3.5" /> Circulation master</div><h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Library issue types</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">Define borrowing policies for different library members and keep every issue rule consistent.</p></div><button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(14,165,233,0.2)] transition hover:-translate-y-0.5 hover:bg-sky-700"><Plus className="h-4 w-4" /> Add issue type</button></div>
        </div></div>
        <div className="grid border-t border-slate-100 sm:grid-cols-3"><div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:border-b-0 sm:border-r"><div className="rounded-xl bg-sky-50 p-2.5 text-sky-600"><ClipboardList className="h-5 w-5" /></div><div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total policies</p><p className="mt-1 text-2xl font-semibold text-slate-900">{rows.length}</p></div></div><div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:border-b-0 sm:border-r"><div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600"><CheckCircle2 className="h-5 w-5" /></div><div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Active policies</p><p className="mt-1 text-2xl font-semibold text-slate-900">{activeCount}</p></div></div><div className="flex items-center gap-3 px-5 py-4"><div className="rounded-xl bg-amber-50 p-2.5 text-amber-600"><ClipboardList className="h-5 w-5" /></div><div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Showing</p><p className="mt-1 text-2xl font-semibold text-slate-900">{filteredRows.length}</p></div></div></div>
      </section>

      <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Policy directory</p><h2 className="mt-1 text-2xl font-semibold text-slate-900">Manage issue policies</h2></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => exportCsv(true)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"><Copy className="h-3.5 w-3.5" /> Copy</button><button type="button" onClick={() => exportCsv(false)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#101824] px-3 text-xs font-semibold text-white transition hover:bg-[#1a2635]"><Download className="h-3.5 w-3.5" /> Export</button><button type="button" onClick={resetRows} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"><RotateCcw className="h-3.5 w-3.5" /> Reset</button></div></div>
        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_150px]"><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search name, code or member type" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100" /><select value={memberFilter} onChange={(event) => setMemberFilter(event.target.value)} aria-label="Filter by member type" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"><option>All</option><option>Student</option><option>Faculty</option><option>Employee</option><option>All members</option></select><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"><option>All</option><option>Active</option><option>Inactive</option></select></div>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="bg-[#101824] text-xs uppercase tracking-[0.12em] text-white"><tr><th className="px-4 py-3">Issue type</th><th className="px-4 py-3">Code</th><th className="px-4 py-3">Member type</th><th className="px-4 py-3">Loan days</th><th className="px-4 py-3">Renewals</th><th className="px-4 py-3">Fine / day</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-center">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredRows.length === 0 ? <tr><td colSpan="8" className="px-4 py-16 text-center text-slate-500">No issue policies found. Add a policy to start configuring circulation.</td></tr> : filteredRows.map((row) => <tr key={row.id} className="transition hover:bg-sky-50/40"><td className="px-4 py-4"><p className="font-semibold text-slate-900">{row.name}</p><p className="mt-1 max-w-[260px] truncate text-xs text-slate-500">{row.description || 'No description added'}</p></td><td className="px-4 py-4 font-mono text-xs text-sky-700">{row.code}</td><td className="px-4 py-4 text-slate-700">{row.memberType}</td><td className="px-4 py-4 font-semibold text-slate-900">{row.loanDays}</td><td className="px-4 py-4 text-slate-700">{row.renewalLimit}</td><td className="px-4 py-4 text-slate-700">Rs. {row.finePerDay}</td><td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${row.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{row.status}</span></td><td className="px-4 py-4"><div className="flex justify-center gap-2"><button type="button" title="Edit" aria-label={`Edit ${row.name}`} onClick={() => openEdit(row)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"><Edit3 className="h-4 w-4" /></button><button type="button" title="Delete" aria-label={`Delete ${row.name}`} onClick={() => deleteRow(row)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div>
      </section>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? 'Edit library issue type' : 'Add library issue type'} footer={<><button type="button" onClick={closeModal} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"><X className="h-4 w-4" /> Cancel</button><button type="submit" form="library-issue-type-form" className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"><CheckCircle2 className="h-4 w-4" /> Save issue type</button></>}><form id="library-issue-type-form" onSubmit={saveIssueType} className="grid gap-4 sm:grid-cols-2"><label className="grid gap-1.5 text-sm font-semibold text-slate-700">Issue type name<input required value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="e.g. Student Standard" className="rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" /></label><label className="grid gap-1.5 text-sm font-semibold text-slate-700">Policy code<input required value={form.code} onChange={(event) => updateField('code', event.target.value.toUpperCase())} placeholder="STU-STD" className="rounded-xl border border-slate-300 px-3 py-2.5 font-mono font-normal outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" /></label><label className="grid gap-1.5 text-sm font-semibold text-slate-700">Member type<select value={form.memberType} onChange={(event) => updateField('memberType', event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"><option>Student</option><option>Faculty</option><option>Employee</option><option>All members</option></select></label><label className="grid gap-1.5 text-sm font-semibold text-slate-700">Status<select value={form.status} onChange={(event) => updateField('status', event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"><option>Active</option><option>Inactive</option></select></label><label className="grid gap-1.5 text-sm font-semibold text-slate-700">Loan period (days)<input type="number" min="1" value={form.loanDays} onChange={(event) => updateField('loanDays', event.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" /></label><label className="grid gap-1.5 text-sm font-semibold text-slate-700">Renewal limit<input type="number" min="0" value={form.renewalLimit} onChange={(event) => updateField('renewalLimit', event.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" /></label><label className="grid gap-1.5 text-sm font-semibold text-slate-700">Fine per day (Rs.)<input type="number" min="0" value={form.finePerDay} onChange={(event) => updateField('finePerDay', event.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" /></label><label className="grid gap-1.5 text-sm font-semibold text-slate-700 sm:col-span-2">Description<textarea rows="3" value={form.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Explain when this issue policy should be used" className="rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" /></label></form></Modal>
    </div>
  );
}