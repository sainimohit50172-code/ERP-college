import { useMemo, useState } from 'react';
import { ArrowLeft, CalendarClock, CheckCircle2, Download, Eye, FileDown, FileText, Pencil, Plus, RotateCcw, Search, Trash2, UploadCloud, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import { useCreateResource, useDeleteResource, useResourceList, useUpdateResource } from '../hooks/useResourceHooks';

const defaults = { title: '', documentType: 'Policy', relatedDepartment: 'HR', employeeName: '', employeeId: '', issueDate: '', expiryDate: '', status: 'Pending', fileName: '', notes: '' };
const documentTypes = ['Policy', 'Form', 'Agreement', 'Guideline', 'Identity Proof', 'Joining Document', 'Compliance Certificate'];
const statuses = ['All', 'Pending', 'Approved', 'Rejected', 'Expired'];
const localStorageKey = 'erp:hr-documents';
const readLocalDocuments = () => {
  if (typeof window === 'undefined') return [];
  try { const items = JSON.parse(window.localStorage.getItem(localStorageKey) || '[]'); return Array.isArray(items) ? items : []; } catch { return []; }
};
const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
const isExpired = (item) => item.expiryDate && new Date(item.expiryDate) < new Date(new Date().toDateString());
const isExpiringSoon = (item) => {
  if (!item.expiryDate) return false;
  const expiry = new Date(item.expiryDate).getTime();
  const today = Date.now();
  return expiry >= today && expiry <= today + (30 * 24 * 60 * 60 * 1000);
};

export default function HRDocumentsPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(defaults);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [type, setType] = useState('All');
  const [department, setDepartment] = useState('All');
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [localDocuments, setLocalDocuments] = useState(readLocalDocuments);
  const { data, isLoading } = useResourceList('hrDocuments', { page: 1, pageSize: 100 });
  const createDocument = useCreateResource('hrDocuments');
  const updateDocument = useUpdateResource('hrDocuments');
  const deleteDocument = useDeleteResource('hrDocuments');
  const documents = useMemo(() => {
    const merged = [...(data?.items || []), ...localDocuments];
    return [...new Map(merged.map((item) => [String(item.id), item])).values()];
  }, [data, localDocuments]);
  const departments = useMemo(() => [...new Set(documents.map((item) => item.relatedDepartment).filter(Boolean))].sort(), [documents]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return documents.filter((item) => {
      const effectiveStatus = isExpired(item) ? 'Expired' : (item.status || 'Pending');
      const haystack = [item.title, item.documentType, item.relatedDepartment, item.employeeName, item.employeeId, item.fileName, item.notes].filter(Boolean).join(' ').toLowerCase();
      return (!query || haystack.includes(query)) && (status === 'All' || effectiveStatus === status) && (type === 'All' || item.documentType === type) && (department === 'All' || item.relatedDepartment === department);
    });
  }, [documents, search, status, type, department]);
  const pending = documents.filter((item) => (item.status || 'Pending') === 'Pending').length;
  const approved = documents.filter((item) => (item.status || '') === 'Approved').length;
  const expiring = documents.filter(isExpiringSoon).length;
  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const openAdd = () => { setEditing(null); setForm(defaults); setIsOpen(true); };
  const openEdit = (item) => { setEditing(item); setForm({ ...defaults, ...item }); setIsOpen(true); };
  const closeModal = () => { setIsOpen(false); setEditing(null); setForm(defaults); };
  const saveLocal = (items) => { setLocalDocuments(items); window.localStorage.setItem(localStorageKey, JSON.stringify(items)); };

  const submit = async (event) => {
    event.preventDefault();
    const payload = { ...form, title: form.title.trim(), relatedDepartment: form.relatedDepartment.trim(), employeeName: form.employeeName.trim(), employeeId: form.employeeId.trim(), fileName: form.fileName.trim(), notes: form.notes.trim(), updatedAt: new Date().toISOString() };
    if (!payload.title || !payload.relatedDepartment) { toast.error('Document title and department are required.'); return; }
    if (payload.expiryDate && payload.issueDate && payload.expiryDate < payload.issueDate) { toast.error('Expiry date must be after issue date.'); return; }
    try {
      const saved = editing ? await updateDocument.mutateAsync({ id: editing.id, payload }) : await createDocument.mutateAsync(payload);
      const item = { ...payload, ...(saved || {}), id: saved?.id || editing?.id || `local-doc-${Date.now()}` };
      saveLocal(editing ? localDocuments.map((doc) => String(doc.id) === String(item.id) ? item : doc) : [item, ...localDocuments]);
      toast.success(editing ? 'Document updated successfully' : 'Document added successfully');
      closeModal();
    } catch {
      const item = { ...payload, id: editing?.id || `local-doc-${Date.now()}` };
      saveLocal(editing ? localDocuments.map((doc) => String(doc.id) === String(item.id) ? item : doc) : [item, ...localDocuments]);
      toast.success(editing ? 'Document saved locally' : 'Document added locally');
      closeModal();
    }
  };
  const remove = async (item) => {
    if (!window.confirm(`Delete document ${item.title}?`)) return;
    await deleteDocument.mutateAsync(item.id).catch(() => null);
    saveLocal(localDocuments.filter((doc) => String(doc.id) !== String(item.id)));
    toast.success('Document deleted successfully');
  };
  const exportCsv = () => {
    const rows = [['Title', 'Type', 'Department', 'Employee', 'Employee ID', 'Issue Date', 'Expiry Date', 'Status', 'File'], ...filtered.map((item) => [item.title, item.documentType, item.relatedDepartment, item.employeeName || '-', item.employeeId || '-', item.issueDate || '-', item.expiryDate || '-', isExpired(item) ? 'Expired' : item.status || 'Pending', item.fileName || '-'])];
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = 'hr-documents.csv'; link.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-5 border-b border-slate-200/80 pb-4"><div className="mb-3 flex items-center gap-2 text-[10px] text-slate-500"><button type="button" onClick={() => navigate(-1)} aria-label="Go back" title="Go back" className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"><ArrowLeft className="h-3.5 w-3.5" /></button><Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'HRM Master', to: '/settings/hrm' }, { label: 'HR Documents' }]} /></div><div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-600">HRM Master</p><h1 className="mt-1 text-[20px] font-semibold tracking-tight text-slate-900 sm:text-[24px]">HR Documents</h1><p className="mt-1 text-[11px] text-slate-400">Centralize employee documents, policies, approvals and expiry compliance.</p></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"><FileDown className="h-3.5 w-3.5" /> Print</button><button type="button" onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"><Download className="h-3.5 w-3.5" /> Export</button><button type="button" onClick={openAdd} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f5132] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0d432b]"><Plus className="h-3.5 w-3.5" /> Add document</button></div></div></div>

        <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[[FileText, 'Total documents', documents.length, 'HR records'], [CheckCircle2, 'Approved', approved, 'Ready for use'], [CalendarClock, 'Pending review', pending, 'Needs action'], [CalendarClock, 'Expiring soon', expiring, 'Next 30 days']].map(([Icon, label, value, hint]) => <div key={label} className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p><Icon className="h-4 w-4 text-emerald-600" /></div><p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p><p className="mt-1 text-[10px] text-slate-400">{hint}</p></div>)}</section>

        <section className="mb-5 rounded-[16px] border border-slate-200 bg-white p-3 shadow-sm"><div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-800"><Search className="h-3.5 w-3.5" /> Filters &amp; Search</div><div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5"><label htmlFor="hr-doc-search" className="text-[10px] font-semibold text-slate-600">Search documents<input id="hr-doc-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Title, employee, file..." className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400" /></label><label className="text-[10px] font-semibold text-slate-600">Status<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400">{statuses.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-[10px] font-semibold text-slate-600">Document type<select value={type} onChange={(event) => setType(event.target.value)} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400"><option>All</option>{documentTypes.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-[10px] font-semibold text-slate-600">Department<select value={department} onChange={(event) => setDepartment(event.target.value)} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400"><option>All</option>{departments.map((item) => <option key={item}>{item}</option>)}</select></label><button type="button" onClick={() => { setSearch(''); setStatus('All'); setType('All'); setDepartment('All'); }} className="inline-flex h-[28px] items-center justify-self-start gap-1 self-end whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-semibold text-slate-600 hover:bg-slate-100"><RotateCcw className="h-3 w-3" /> Reset</button></div></section>

        <section className="flex-1 overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5"><div className="flex items-center gap-2 text-xs font-semibold text-slate-800"><FileText className="h-3.5 w-3.5" /> Document Directory</div><span className="text-[10px] text-slate-500">Showing {filtered.length} of {documents.length} documents</span></div><div className="overflow-x-auto"><table className="min-w-[1200px] w-full border-collapse text-center text-[10px]"><thead><tr className="bg-[#0f5132] text-white"><th className="border-r border-white/30 px-3 py-2.5">S.No.</th><th className="border-r border-white/30 px-3 py-2.5 text-left">Document</th><th className="border-r border-white/30 px-3 py-2.5">Type</th><th className="border-r border-white/30 px-3 py-2.5">Employee</th><th className="border-r border-white/30 px-3 py-2.5">Department</th><th className="border-r border-white/30 px-3 py-2.5">Issue date</th><th className="border-r border-white/30 px-3 py-2.5">Expiry</th><th className="border-r border-white/30 px-3 py-2.5">Status</th><th className="px-3 py-2.5">Actions</th></tr></thead><tbody>{isLoading ? <tr><td colSpan="9" className="py-12 text-center text-slate-500">Loading HR documents...</td></tr> : filtered.length === 0 ? <tr><td colSpan="9" className="py-12 text-center text-slate-500">No HR documents found.</td></tr> : filtered.map((item, index) => { const effectiveStatus = isExpired(item) ? 'Expired' : (item.status || 'Pending'); return <tr key={item.id} className="border-b border-slate-200 text-slate-700 odd:bg-slate-50/50 hover:bg-emerald-50/30"><td className="border-r border-white px-3 py-2">{index + 1}</td><td className="border-r border-white px-3 py-2 text-left font-semibold text-slate-900">{item.title || '-'}<span className="block text-[9px] font-normal text-slate-400">{item.fileName || 'No file attached'}</span></td><td className="border-r border-white px-3 py-2">{item.documentType || '-'}</td><td className="border-r border-white px-3 py-2">{item.employeeName || 'Organization-wide'}</td><td className="border-r border-white px-3 py-2">{item.relatedDepartment || '-'}</td><td className="border-r border-white px-3 py-2">{formatDate(item.issueDate)}</td><td className={`border-r border-white px-3 py-2 ${effectiveStatus === 'Expired' || isExpiringSoon(item) ? 'font-semibold text-amber-700' : ''}`}>{formatDate(item.expiryDate)}</td><td className="border-r border-white px-3 py-2"><span className={`rounded-md px-2 py-1 text-[9px] font-semibold ${effectiveStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700' : effectiveStatus === 'Expired' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{effectiveStatus}</span></td><td className="px-3 py-2"><div className="flex justify-center gap-1"><button type="button" onClick={() => setViewing(item)} aria-label="View document" title="View" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"><Eye className="h-3 w-3" /></button><button type="button" onClick={() => openEdit(item)} aria-label="Edit document" title="Edit" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"><Pencil className="h-3 w-3" /></button><button type="button" onClick={() => remove(item)} aria-label="Delete document" title="Delete" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-rose-600 hover:bg-rose-50"><Trash2 className="h-3 w-3" /></button></div></td></tr>; })}</tbody></table></div></section>
      </div>

      {isOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"><div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">Document master</p><h2 className="text-xl font-semibold text-slate-900">{editing ? 'Edit HR document' : 'Add HR document'}</h2></div><button type="button" onClick={closeModal} aria-label="Close document form"><X className="h-4 w-4 text-slate-500" /></button></div><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700 sm:col-span-2">Document title<input required value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Employee handbook 2026" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500" /></label><label className="text-sm font-medium text-slate-700">Document type<select value={form.documentType} onChange={(event) => updateField('documentType', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500">{documentTypes.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-sm font-medium text-slate-700">Department<input required value={form.relatedDepartment} onChange={(event) => updateField('relatedDepartment', event.target.value)} placeholder="HR" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500" /></label><label className="text-sm font-medium text-slate-700">Employee name<input value={form.employeeName} onChange={(event) => updateField('employeeName', event.target.value)} placeholder="Leave blank for organization-wide" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500" /></label><label className="text-sm font-medium text-slate-700">Employee ID<input value={form.employeeId} onChange={(event) => updateField('employeeId', event.target.value)} placeholder="EMP-0001" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500" /></label><label className="text-sm font-medium text-slate-700">Issue date<input type="date" value={form.issueDate} onChange={(event) => updateField('issueDate', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500" /></label><label className="text-sm font-medium text-slate-700">Expiry date<input type="date" value={form.expiryDate} onChange={(event) => updateField('expiryDate', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500" /></label><label className="text-sm font-medium text-slate-700">Review status<select value={form.status} onChange={(event) => updateField('status', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500"><option>Pending</option><option>Approved</option><option>Rejected</option></select></label><label className="text-sm font-medium text-slate-700"><span className="flex items-center gap-1.5">File reference <UploadCloud className="h-3.5 w-3.5 text-emerald-600" /></span><input type="file" onChange={(event) => updateField('fileName', event.target.files?.[0]?.name || '')} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none file:mr-2 file:rounded file:border-0 file:bg-emerald-50 file:px-2 file:py-1 file:text-emerald-700" /></label><label className="text-sm font-medium text-slate-700 sm:col-span-2">Notes<textarea value={form.notes} onChange={(event) => updateField('notes', event.target.value)} rows="3" placeholder="Verification notes or document summary" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500" /></label><div className="flex justify-end gap-3 pt-2 sm:col-span-2"><button type="button" onClick={closeModal} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700">Cancel</button><button type="submit" disabled={createDocument.isPending || updateDocument.isPending} className="rounded-lg bg-[#0f5132] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{editing ? 'Save changes' : 'Add document'}</button></div></form></div></div>}
      {viewing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">Document record</p><h2 className="text-xl font-semibold text-slate-900">{viewing.title}</h2></div><button type="button" onClick={() => setViewing(null)} aria-label="Close document details"><X className="h-4 w-4 text-slate-500" /></button></div><div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4"><p className="text-xs text-emerald-700">{viewing.documentType || 'Document'} · {viewing.relatedDepartment || 'HR'}</p><p className="mt-2 font-semibold text-emerald-950">{viewing.fileName || 'No file reference attached'}</p></div><div className="mt-4 grid gap-3 text-sm text-slate-700"><p><strong>Employee:</strong> {viewing.employeeName || 'Organization-wide'}</p><p><strong>Employee ID:</strong> {viewing.employeeId || '-'}</p><p><strong>Issue date:</strong> {formatDate(viewing.issueDate)}</p><p><strong>Expiry date:</strong> {formatDate(viewing.expiryDate)}</p><p><strong>Status:</strong> {isExpired(viewing) ? 'Expired' : viewing.status || 'Pending'}</p><p><strong>Notes:</strong> {viewing.notes || '-'}</p></div><div className="mt-5 flex justify-end"><button type="button" onClick={() => setViewing(null)} className="rounded-lg bg-[#0f5132] px-4 py-2 text-xs font-semibold text-white">Close</button></div></div></div>}
    </div>
  );
}
