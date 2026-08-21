import { useMemo, useState } from 'react';
import {
  Copy,
  Eye,
  FileDown,
  Pencil,
  Plus,
  Search,
  Tags,
  Trash2,
  X,
} from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Modal from '../components/ui/Modal.jsx';
import { toast } from '../utils/toast.js';

const storageKey = 'erp:admission-tags';
const pageSize = 8;
const categories = ['All categories', 'Lead Quality', 'Applicant Type', 'Course Interest', 'Follow-up', 'Priority', 'Source'];
const statuses = ['All', 'Active', 'Inactive', 'Draft'];
const colors = [
  { name: 'Emerald', value: '#0f5132', className: 'bg-[#0f5132]' },
  { name: 'Sky', value: '#0369a1', className: 'bg-sky-700' },
  { name: 'Amber', value: '#b45309', className: 'bg-amber-700' },
  { name: 'Rose', value: '#be123c', className: 'bg-rose-700' },
  { name: 'Violet', value: '#6d28d9', className: 'bg-violet-700' },
];
const emptyForm = {
  name: '',
  code: '',
  category: 'Lead Quality',
  color: '#0f5132',
  status: 'Active',
  priority: 'Medium',
  description: '',
  autoApply: false,
};
const defaultTags = [
  { id: 'tag-hot-lead', name: 'Hot Lead', code: 'HOT-LEAD', category: 'Lead Quality', color: '#be123c', status: 'Active', priority: 'High', description: 'Applicant is ready for an immediate counselling follow-up.', autoApply: true, usageCount: 124, updatedAt: '2026-08-21T10:00:00.000Z' },
  { id: 'tag-scholarship', name: 'Scholarship Enquiry', code: 'SCHOLARSHIP', category: 'Applicant Type', color: '#6d28d9', status: 'Active', priority: 'High', description: 'Applicant requires scholarship or financial aid guidance.', autoApply: false, usageCount: 78, updatedAt: '2026-08-20T10:00:00.000Z' },
  { id: 'tag-follow-up', name: 'Follow-up Required', code: 'FOLLOW-UP', category: 'Follow-up', color: '#0369a1', status: 'Active', priority: 'Medium', description: 'Counsellor action is pending on this applicant.', autoApply: true, usageCount: 96, updatedAt: '2026-08-19T10:00:00.000Z' },
  { id: 'tag-international', name: 'International Applicant', code: 'INTL-APP', category: 'Applicant Type', color: '#0f5132', status: 'Draft', priority: 'Low', description: 'Applicant is applying from outside India.', autoApply: false, usageCount: 21, updatedAt: '2026-08-18T10:00:00.000Z' },
];

const readTags = () => {
  if (typeof window === 'undefined') return defaultTags;
  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) || 'null');
    return Array.isArray(stored) && stored.length ? stored : defaultTags;
  } catch {
    return defaultTags;
  }
};
const getNextId = () => `admission-tag-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
const priorityClass = (priority) => priority === 'High' ? 'bg-rose-50 text-rose-700 ring-rose-200' : priority === 'Low' ? 'bg-slate-100 text-slate-600 ring-slate-200' : 'bg-amber-50 text-amber-700 ring-amber-200';
const statusClass = (status) => status === 'Active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : status === 'Draft' ? 'bg-amber-50 text-amber-700 ring-amber-200' : 'bg-slate-100 text-slate-600 ring-slate-200';

export default function AdmissionTagsPage() {
  const [tags, setTags] = useState(readTags);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [selectedTag, setSelectedTag] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');

  const persistTags = (nextTags) => {
    setTags(nextTags);
    window.localStorage.setItem(storageKey, JSON.stringify(nextTags));
  };
  const filteredTags = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return tags.filter((tag) => {
      const matchesText = !query || [tag.name, tag.code, tag.category, tag.description].join(' ').toLowerCase().includes(query);
      return matchesText && (categoryFilter === 'All categories' || tag.category === categoryFilter) && (statusFilter === 'All' || tag.status === statusFilter);
    });
  }, [tags, searchTerm, categoryFilter, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredTags.length / pageSize));
  const visibleTags = filteredTags.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const closeForm = () => { setIsFormOpen(false); setFormMode('create'); setSelectedTag(null); setForm(emptyForm); };
  const openCreate = () => { setFormMode('create'); setForm(emptyForm); setIsFormOpen(true); };
  const openEdit = (tag) => { setFormMode('edit'); setSelectedTag(tag); setForm({ ...emptyForm, ...tag }); setIsFormOpen(true); };
  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    const name = form.name.trim();
    const code = form.code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    const duplicate = tags.some((tag) => tag.code === code && tag.id !== selectedTag?.id);
    if (!name || code.length < 3) { toast.error('Enter a valid tag name and code.'); return; }
    if (duplicate) { toast.error('This tag code already exists. Use a unique code.'); return; }
    const payload = { ...form, name, code, updatedAt: new Date().toISOString() };
    const nextTags = formMode === 'edit' && selectedTag ? tags.map((tag) => tag.id === selectedTag.id ? { ...tag, ...payload } : tag) : [...tags, { id: getNextId(), usageCount: 0, ...payload }];
    persistTags(nextTags);
    toast.success(formMode === 'edit' ? 'Admission tag updated.' : 'Admission tag added.');
    closeForm();
  };
  const deleteTag = (tag) => {
    if (!window.confirm(`Delete admission tag "${tag.name}"?`)) return;
    persistTags(tags.filter((item) => item.id !== tag.id));
    setIsViewOpen(false);
    toast.success('Admission tag deleted.');
  };
  const duplicateTag = (tag) => {
    persistTags([...tags, { ...tag, id: getNextId(), name: `${tag.name} Copy`, code: `${tag.code}-COPY`, status: 'Draft', usageCount: 0, updatedAt: new Date().toISOString() }]);
    toast.success('Admission tag duplicated as draft.');
  };
  const resetFilters = () => { setSearchTerm(''); setCategoryFilter('All categories'); setStatusFilter('All'); setCurrentPage(1); };
  const exportTags = () => {
    const csv = [['Name', 'Code', 'Category', 'Priority', 'Status', 'Usage', 'Auto apply'], ...tags.map((tag) => [tag.name, tag.code, tag.category, tag.priority, tag.status, tag.usageCount, tag.autoApply])].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'admission-tags.csv'; link.click(); URL.revokeObjectURL(url);
    toast.success('Admission tags exported.');
  };
  const start = filteredTags.length ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(currentPage * pageSize, filteredTags.length);

  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f4f8f7_0%,#ffffff_48%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-5 border-b border-slate-200/80 pb-4">
          <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Admission Setup', to: '/admission/setup' }, { label: 'Admission Master', to: '/admission/admissionMaster' }, { label: 'Admission Tags' }]} />
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-600">Admission Setup</p><h1 className="mt-1 text-[20px] font-semibold tracking-tight text-slate-900 sm:text-[24px]">Admission Tags</h1><p className="mt-1 text-[11px] text-slate-400">Create a smart applicant vocabulary for priority, follow-up and counselling workflows.</p></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"><FileDown className="h-3.5 w-3.5" />Print</button><button type="button" onClick={exportTags} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"><FileDown className="h-3.5 w-3.5" />Export</button><button type="button" onClick={openCreate} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f5132] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#0d432b]"><Plus className="h-3.5 w-3.5" />Add Admission Tag</button></div></div>
        </div>

        <section className="mb-5 rounded-[16px] border border-slate-200 bg-white p-3 shadow-sm"><div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-800"><Search className="h-3.5 w-3.5" />Filters &amp; Search</div><div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4"><label htmlFor="admission-tag-search" className="text-[10px] font-semibold text-slate-600">Search tag<input id="admission-tag-search" name="searchTerm" value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1); }} placeholder="Search tag or code..." className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] font-normal outline-none focus:border-emerald-400" /></label><label htmlFor="admission-tag-category" className="text-[10px] font-semibold text-slate-600">Category<select id="admission-tag-category" name="categoryFilter" value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setCurrentPage(1); }} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] font-normal outline-none focus:border-emerald-400">{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label htmlFor="admission-tag-status" className="text-[10px] font-semibold text-slate-600">Status<select id="admission-tag-status" name="statusFilter" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1); }} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] font-normal outline-none focus:border-emerald-400">{statuses.map((status) => <option key={status}>{status}</option>)}</select></label><div className="flex items-end justify-end"><button type="button" onClick={resetFilters} className="inline-flex items-center gap-1 rounded-lg bg-[#0f5132] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#0d432b]"><X className="h-3.5 w-3.5" />Reset</button></div></div></section>

        <section className="flex-1 overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5"><div className="flex items-center gap-2 text-xs font-semibold text-slate-800"><Tags className="h-3.5 w-3.5" />Admission Tag Registry</div><span className="text-[10px] text-slate-500">Showing {visibleTags.length} of {filteredTags.length} entries</span></div><div className="overflow-x-auto"><table className="min-w-full border-collapse text-center text-[10px]"><thead><tr className="bg-[#0f5132] text-white"><th className="border-r border-white/30 px-3 py-2.5 font-semibold">S.No.</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Tag / Code</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Category</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Priority</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Usage</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Updated</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Status</th><th className="px-3 py-2.5 font-semibold">Actions</th></tr></thead><tbody>{visibleTags.length === 0 ? <tr><td colSpan="8" className="py-12 text-center text-slate-500">No admission tags found.</td></tr> : visibleTags.map((tag, index) => <tr key={tag.id} className="border-b border-slate-200 text-slate-700 odd:bg-slate-50/50 hover:bg-emerald-50/30"><td className="border-r border-white px-3 py-2">{(currentPage - 1) * pageSize + index + 1}</td><td className="border-r border-white px-3 py-2 text-left"><div className="flex items-center gap-2"><span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: tag.color || '#0f5132' }} /><div><p className="font-semibold text-slate-900">{tag.name}</p><p className="mt-0.5 font-mono text-[9px] text-emerald-700">{tag.code}</p></div></div></td><td className="border-r border-white px-3 py-2">{tag.category}</td><td className="border-r border-white px-3 py-2"><span className={`rounded-md px-2 py-1 text-[9px] font-semibold ring-1 ${priorityClass(tag.priority)}`}>{tag.priority}</span></td><td className="border-r border-white px-3 py-2 font-semibold text-slate-900">{Number(tag.usageCount || 0).toLocaleString('en-IN')}{tag.autoApply && <span className="ml-1 text-[9px] text-emerald-700">Auto</span>}</td><td className="border-r border-white px-3 py-2">{formatDate(tag.updatedAt)}</td><td className="border-r border-white px-3 py-2"><span className={`rounded-md px-2 py-1 text-[9px] font-semibold ring-1 ${statusClass(tag.status)}`}>{tag.status}</span></td><td className="px-3 py-2"><div className="flex justify-center gap-1"><button type="button" onClick={() => { setSelectedTag(tag); setIsViewOpen(true); }} aria-label={`View ${tag.name}`} title="View" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"><Eye className="h-3 w-3" /></button><button type="button" onClick={() => openEdit(tag)} aria-label={`Edit ${tag.name}`} title="Edit" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"><Pencil className="h-3 w-3" /></button><button type="button" onClick={() => duplicateTag(tag)} aria-label={`Duplicate ${tag.name}`} title="Duplicate" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-sky-50 hover:text-sky-700"><Copy className="h-3 w-3" /></button><button type="button" onClick={() => deleteTag(tag)} aria-label={`Delete ${tag.name}`} title="Delete" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3 w-3" /></button></div></td></tr>)}</tbody></table></div><div className="flex items-center justify-between border-t border-slate-200 px-3 py-2.5 text-[10px] text-slate-500"><span>Showing {start} to {end} of {filteredTags.length} entries</span><div className="flex items-center gap-1"><button type="button" onClick={() => setCurrentPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} className="rounded border border-slate-200 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40">Previous</button><button type="button" className="rounded border border-emerald-600 bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">{currentPage}</button><button type="button" onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage >= totalPages} className="rounded border border-slate-200 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40">Next</button></div></div></section>
      </div>

      <Modal isOpen={isFormOpen} onClose={closeForm} title={formMode === 'edit' ? 'Edit Admission Tag' : 'Add Admission Tag'} footer={<div className="flex justify-end gap-2"><button type="button" onClick={closeForm} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button type="submit" form="admission-tag-form" className="rounded-lg bg-[#0f5132] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#0d432b]">{formMode === 'edit' ? 'Update tag' : 'Save tag'}</button></div>}><form id="admission-tag-form" onSubmit={handleSubmit} className="space-y-4"><div className="grid gap-3 md:grid-cols-2"><label className="text-[10px] font-semibold text-slate-600">Tag name<input id="tag-name" name="name" required value={form.name} onChange={(event) => updateForm('name', event.target.value)} placeholder="e.g. Hot Lead" className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400" /></label><label className="text-[10px] font-semibold text-slate-600">Tag code<input id="tag-code" name="code" required value={form.code} onChange={(event) => updateForm('code', event.target.value.toUpperCase())} placeholder="e.g. HOT-LEAD" className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] uppercase outline-none focus:border-emerald-400" /></label></div><div className="grid gap-3 md:grid-cols-3"><label className="text-[10px] font-semibold text-slate-600">Category<select id="tag-category" name="category" value={form.category} onChange={(event) => updateForm('category', event.target.value)} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400">{categories.slice(1).map((category) => <option key={category}>{category}</option>)}</select></label><label className="text-[10px] font-semibold text-slate-600">Priority<select id="tag-priority" name="priority" value={form.priority} onChange={(event) => updateForm('priority', event.target.value)} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400"><option>High</option><option>Medium</option><option>Low</option></select></label><label className="text-[10px] font-semibold text-slate-600">Status<select id="tag-status" name="status" value={form.status} onChange={(event) => updateForm('status', event.target.value)} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400"><option>Active</option><option>Inactive</option><option>Draft</option></select></label></div><div><span className="block text-[10px] font-semibold text-slate-600">Tag color</span><div className="mt-2 flex flex-wrap gap-2">{colors.map((color) => <button key={color.name} type="button" onClick={() => updateForm('color', color.value)} aria-label={`Use ${color.name} tag color`} className={`h-7 w-7 rounded-full border-2 ${form.color === color.value ? 'border-slate-950 ring-2 ring-emerald-200' : 'border-white ring-1 ring-slate-200'} ${color.className}`} />)}</div></div><label className="block text-[10px] font-semibold text-slate-600">Description<textarea id="tag-description" name="description" value={form.description} onChange={(event) => updateForm('description', event.target.value)} rows={3} className="mt-1 w-full resize-none rounded-md border border-slate-200 px-2 py-2 text-[10px] outline-none focus:border-emerald-400" /></label><label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-semibold text-slate-700"><input id="tag-auto-apply" name="autoApply" type="checkbox" checked={Boolean(form.autoApply)} onChange={(event) => updateForm('autoApply', event.target.checked)} className="h-3.5 w-3.5 accent-emerald-700" />Allow automatic assignment by workflow</label></form></Modal>

      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Admission Tag Details" footer={<div className="flex justify-end gap-2"><button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700">Close</button>{selectedTag && <button type="button" onClick={() => { setIsViewOpen(false); openEdit(selectedTag); }} className="rounded-lg bg-[#0f5132] px-3 py-2 text-[10px] font-semibold text-white">Edit tag</button>}</div>}>{selectedTag && <div className="grid gap-3 text-xs text-slate-700 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Tag</span><div className="mt-1 flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedTag.color }} /><p className="font-semibold text-slate-900">{selectedTag.name}</p></div><p className="mt-1 font-mono text-[10px] text-emerald-700">{selectedTag.code}</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Classification</span><p className="mt-1 font-semibold text-slate-900">{selectedTag.category}</p><p className="mt-1">{selectedTag.priority} priority</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Usage</span><p className="mt-1 font-semibold text-slate-900">{Number(selectedTag.usageCount || 0).toLocaleString('en-IN')} applicants</p><p className="mt-1">{selectedTag.autoApply ? 'Automatic assignment enabled' : 'Manual assignment only'}</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Status</span><p className="mt-2"><span className={`rounded-md px-2 py-1 text-[9px] font-semibold ring-1 ${statusClass(selectedTag.status)}`}>{selectedTag.status}</span></p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Description</span><p className="mt-1">{selectedTag.description || 'No description added.'}</p></div></div>}</Modal>
    </div>
  );
}
