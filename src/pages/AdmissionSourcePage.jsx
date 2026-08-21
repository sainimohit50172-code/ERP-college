import { useMemo, useState } from 'react';
import {
  Copy,
  Eye,
  FileDown,
  Pencil,
  Plus,
  Radio,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Modal from '../components/ui/Modal.jsx';
import { toast } from '../utils/toast.js';

const storageKey = 'erp:admission-sources';
const pageSize = 8;
const sourceTypes = ['All types', 'Digital', 'Offline', 'Partner', 'Referral'];
const statuses = ['All', 'Active', 'Inactive', 'Draft'];
const emptyForm = {
  name: '',
  code: '',
  type: 'Digital',
  status: 'Active',
  priority: 'Medium',
  contact: '',
  description: '',
  autoAssign: false,
  trackingEnabled: true,
};
const defaultSources = [
  { id: 'source-website', name: 'University Website', code: 'WEBSITE', type: 'Digital', status: 'Active', priority: 'High', contact: 'Admissions Team', description: 'Organic enquiries from the official university website.', autoAssign: true, trackingEnabled: true, enquiries: 248, conversions: 64, updatedAt: '2026-08-21T10:00:00.000Z' },
  { id: 'source-google', name: 'Google Ads', code: 'GOOGLE-ADS', type: 'Digital', status: 'Active', priority: 'High', contact: 'Marketing Team', description: 'Paid search campaigns and admission landing pages.', autoAssign: true, trackingEnabled: true, enquiries: 186, conversions: 42, updatedAt: '2026-08-20T10:00:00.000Z' },
  { id: 'source-walkin', name: 'Walk-in Enquiry', code: 'WALK-IN', type: 'Offline', status: 'Active', priority: 'Medium', contact: 'Front Desk', description: 'Applicants visiting the campus admission office.', autoAssign: false, trackingEnabled: false, enquiries: 112, conversions: 39, updatedAt: '2026-08-19T10:00:00.000Z' },
  { id: 'source-referral', name: 'Student Referral', code: 'STU-REF', type: 'Referral', status: 'Draft', priority: 'Low', contact: 'Student Relations', description: 'Applicants referred by existing students or alumni.', autoAssign: false, trackingEnabled: true, enquiries: 58, conversions: 17, updatedAt: '2026-08-18T10:00:00.000Z' },
];

const readSources = () => {
  if (typeof window === 'undefined') return defaultSources;
  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) || 'null');
    return Array.isArray(stored) && stored.length ? stored : defaultSources;
  } catch {
    return defaultSources;
  }
};
const getNextId = () => `admission-source-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
const statusClass = (status) => status === 'Active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : status === 'Draft' ? 'bg-amber-50 text-amber-700 ring-amber-200' : 'bg-slate-100 text-slate-600 ring-slate-200';
const priorityClass = (priority) => priority === 'High' ? 'bg-rose-50 text-rose-700 ring-rose-200' : priority === 'Low' ? 'bg-slate-100 text-slate-600 ring-slate-200' : 'bg-amber-50 text-amber-700 ring-amber-200';

export default function AdmissionSourcePage() {
  const [sources, setSources] = useState(readSources);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All types');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [selectedSource, setSelectedSource] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');

  const persistSources = (nextSources) => {
    setSources(nextSources);
    window.localStorage.setItem(storageKey, JSON.stringify(nextSources));
  };
  const filteredSources = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return sources.filter((source) => {
      const matchesText = !query || [source.name, source.code, source.type, source.contact, source.description].join(' ').toLowerCase().includes(query);
      return matchesText && (typeFilter === 'All types' || source.type === typeFilter) && (statusFilter === 'All' || source.status === statusFilter);
    });
  }, [sources, searchTerm, typeFilter, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredSources.length / pageSize));
  const visibleSources = filteredSources.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const closeForm = () => { setIsFormOpen(false); setFormMode('create'); setSelectedSource(null); setForm(emptyForm); };
  const openCreate = () => { setFormMode('create'); setForm(emptyForm); setIsFormOpen(true); };
  const openEdit = (source) => { setFormMode('edit'); setSelectedSource(source); setForm({ ...emptyForm, ...source }); setIsFormOpen(true); };
  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    const name = form.name.trim();
    const code = form.code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    const duplicate = sources.some((source) => source.code === code && source.id !== selectedSource?.id);
    if (!name || code.length < 3) { toast.error('Enter a valid source name and unique code.'); return; }
    if (duplicate) { toast.error('This source code already exists.'); return; }
    const payload = { ...form, name, code, updatedAt: new Date().toISOString() };
    const nextSources = formMode === 'edit' && selectedSource ? sources.map((source) => source.id === selectedSource.id ? { ...source, ...payload } : source) : [...sources, { id: getNextId(), enquiries: 0, conversions: 0, ...payload }];
    persistSources(nextSources);
    toast.success(formMode === 'edit' ? 'Admission source updated.' : 'Admission source added.');
    closeForm();
  };
  const deleteSource = (source) => {
    if (!window.confirm(`Delete admission source "${source.name}"?`)) return;
    persistSources(sources.filter((item) => item.id !== source.id));
    setIsViewOpen(false);
    toast.success('Admission source deleted.');
  };
  const duplicateSource = (source) => {
    persistSources([...sources, { ...source, id: getNextId(), name: `${source.name} Copy`, code: `${source.code}-COPY`, status: 'Draft', enquiries: 0, conversions: 0, updatedAt: new Date().toISOString() }]);
    toast.success('Admission source duplicated as draft.');
  };
  const resetFilters = () => { setSearchTerm(''); setTypeFilter('All types'); setStatusFilter('All'); setCurrentPage(1); };
  const exportSources = () => {
    const csv = [['Name', 'Code', 'Type', 'Priority', 'Status', 'Enquiries', 'Conversions', 'Auto assign', 'Tracking'], ...sources.map((source) => [source.name, source.code, source.type, source.priority, source.status, source.enquiries, source.conversions, source.autoAssign, source.trackingEnabled])].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'admission-sources.csv'; link.click(); URL.revokeObjectURL(url);
    toast.success('Admission sources exported.');
  };
  const start = filteredSources.length ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(currentPage * pageSize, filteredSources.length);

  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f4f8f7_0%,#ffffff_48%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-5 border-b border-slate-200/80 pb-4"><Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Admission Setup', to: '/admission/setup' }, { label: 'Admission Master', to: '/admission/admissionMaster' }, { label: 'Admission Source' }]} /><div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-600">Admission Setup</p><h1 className="mt-1 text-[20px] font-semibold tracking-tight text-slate-900 sm:text-[24px]">Admission Source</h1><p className="mt-1 text-[11px] text-slate-400">Manage where applicants come from and keep campaign attribution ready for the counselling team.</p></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"><FileDown className="h-3.5 w-3.5" />Print</button><button type="button" onClick={exportSources} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"><FileDown className="h-3.5 w-3.5" />Export</button><button type="button" onClick={openCreate} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f5132] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#0d432b]"><Plus className="h-3.5 w-3.5" />Add Admission Source</button></div></div></div>
        <section className="mb-5 rounded-[16px] border border-slate-200 bg-white p-3 shadow-sm"><div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-800"><Search className="h-3.5 w-3.5" />Filters &amp; Search</div><div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4"><label htmlFor="admission-source-search" className="text-[10px] font-semibold text-slate-600">Search source<input id="admission-source-search" name="searchTerm" value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1); }} placeholder="Search source or code..." className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] font-normal outline-none focus:border-emerald-400" /></label><label htmlFor="admission-source-type" className="text-[10px] font-semibold text-slate-600">Source type<select id="admission-source-type" name="typeFilter" value={typeFilter} onChange={(event) => { setTypeFilter(event.target.value); setCurrentPage(1); }} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] font-normal outline-none focus:border-emerald-400">{sourceTypes.map((type) => <option key={type}>{type}</option>)}</select></label><label htmlFor="admission-source-status" className="text-[10px] font-semibold text-slate-600">Status<select id="admission-source-status" name="statusFilter" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1); }} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] font-normal outline-none focus:border-emerald-400">{statuses.map((status) => <option key={status}>{status}</option>)}</select></label><div className="flex items-end justify-end"><button type="button" onClick={resetFilters} className="inline-flex items-center gap-1 rounded-lg bg-[#0f5132] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#0d432b]"><X className="h-3.5 w-3.5" />Reset</button></div></div></section>
        <section className="flex-1 overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5"><div className="flex items-center gap-2 text-xs font-semibold text-slate-800"><Radio className="h-3.5 w-3.5" />Admission Source Registry</div><span className="text-[10px] text-slate-500">Showing {visibleSources.length} of {filteredSources.length} entries</span></div><div className="overflow-x-auto"><table className="min-w-full border-collapse text-center text-[10px]"><thead><tr className="bg-[#0f5132] text-white"><th className="border-r border-white/30 px-3 py-2.5 font-semibold">S.No.</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Source / Code</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Type</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Priority</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Enquiries</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Conversions</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Updated</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Status</th><th className="px-3 py-2.5 font-semibold">Actions</th></tr></thead><tbody>{visibleSources.length === 0 ? <tr><td colSpan="9" className="py-12 text-center text-slate-500">No admission sources found.</td></tr> : visibleSources.map((source, index) => <tr key={source.id} className="border-b border-slate-200 text-slate-700 odd:bg-slate-50/50 hover:bg-emerald-50/30"><td className="border-r border-white px-3 py-2">{(currentPage - 1) * pageSize + index + 1}</td><td className="border-r border-white px-3 py-2 text-left"><p className="font-semibold text-slate-900">{source.name}</p><p className="mt-0.5 font-mono text-[9px] text-emerald-700">{source.code}</p></td><td className="border-r border-white px-3 py-2">{source.type}</td><td className="border-r border-white px-3 py-2"><span className={`rounded-md px-2 py-1 text-[9px] font-semibold ring-1 ${priorityClass(source.priority)}`}>{source.priority}</span></td><td className="border-r border-white px-3 py-2 font-semibold text-slate-900">{Number(source.enquiries || 0).toLocaleString('en-IN')}</td><td className="border-r border-white px-3 py-2 font-semibold text-emerald-700">{Number(source.conversions || 0).toLocaleString('en-IN')}</td><td className="border-r border-white px-3 py-2">{formatDate(source.updatedAt)}</td><td className="border-r border-white px-3 py-2"><span className={`rounded-md px-2 py-1 text-[9px] font-semibold ring-1 ${statusClass(source.status)}`}>{source.status}</span></td><td className="px-3 py-2"><div className="flex justify-center gap-1"><button type="button" onClick={() => { setSelectedSource(source); setIsViewOpen(true); }} aria-label={`View ${source.name}`} title="View" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"><Eye className="h-3 w-3" /></button><button type="button" onClick={() => openEdit(source)} aria-label={`Edit ${source.name}`} title="Edit" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"><Pencil className="h-3 w-3" /></button><button type="button" onClick={() => duplicateSource(source)} aria-label={`Duplicate ${source.name}`} title="Duplicate" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-sky-50 hover:text-sky-700"><Copy className="h-3 w-3" /></button><button type="button" onClick={() => deleteSource(source)} aria-label={`Delete ${source.name}`} title="Delete" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3 w-3" /></button></div></td></tr>)}</tbody></table></div><div className="flex items-center justify-between border-t border-slate-200 px-3 py-2.5 text-[10px] text-slate-500"><span>Showing {start} to {end} of {filteredSources.length} entries</span><div className="flex items-center gap-1"><button type="button" onClick={() => setCurrentPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} className="rounded border border-slate-200 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40">Previous</button><button type="button" className="rounded border border-emerald-600 bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">{currentPage}</button><button type="button" onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage >= totalPages} className="rounded border border-slate-200 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40">Next</button></div></div></section>
      </div>
      <Modal isOpen={isFormOpen} onClose={closeForm} title={formMode === 'edit' ? 'Edit Admission Source' : 'Add Admission Source'} footer={<div className="flex justify-end gap-2"><button type="button" onClick={closeForm} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button type="submit" form="admission-source-form" className="rounded-lg bg-[#0f5132] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#0d432b]">{formMode === 'edit' ? 'Update source' : 'Save source'}</button></div>}><form id="admission-source-form" onSubmit={handleSubmit} className="space-y-4"><div className="grid gap-3 md:grid-cols-2"><label className="text-[10px] font-semibold text-slate-600">Source name<input id="source-name" name="name" required value={form.name} onChange={(event) => updateForm('name', event.target.value)} placeholder="e.g. Education Fair" className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400" /></label><label className="text-[10px] font-semibold text-slate-600">Source code<input id="source-code" name="code" required value={form.code} onChange={(event) => updateForm('code', event.target.value.toUpperCase())} placeholder="e.g. EDU-FAIR" className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] uppercase outline-none focus:border-emerald-400" /></label></div><div className="grid gap-3 md:grid-cols-3"><label className="text-[10px] font-semibold text-slate-600">Source type<select id="source-type" name="type" value={form.type} onChange={(event) => updateForm('type', event.target.value)} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400">{sourceTypes.slice(1).map((type) => <option key={type}>{type}</option>)}</select></label><label className="text-[10px] font-semibold text-slate-600">Priority<select id="source-priority" name="priority" value={form.priority} onChange={(event) => updateForm('priority', event.target.value)} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400"><option>High</option><option>Medium</option><option>Low</option></select></label><label className="text-[10px] font-semibold text-slate-600">Status<select id="source-status" name="status" value={form.status} onChange={(event) => updateForm('status', event.target.value)} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400"><option>Active</option><option>Inactive</option><option>Draft</option></select></label></div><label className="block text-[10px] font-semibold text-slate-600">Owner / contact<input id="source-contact" name="contact" value={form.contact} onChange={(event) => updateForm('contact', event.target.value)} placeholder="e.g. Marketing Team" className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400" /></label><label className="block text-[10px] font-semibold text-slate-600">Description<textarea id="source-description" name="description" value={form.description} onChange={(event) => updateForm('description', event.target.value)} rows={3} className="mt-1 w-full resize-none rounded-md border border-slate-200 px-2 py-2 text-[10px] outline-none focus:border-emerald-400" /></label><div className="grid gap-2 md:grid-cols-2"><label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-semibold text-slate-700"><input id="source-auto-assign" name="autoAssign" type="checkbox" checked={Boolean(form.autoAssign)} onChange={(event) => updateForm('autoAssign', event.target.checked)} className="h-3.5 w-3.5 accent-emerald-700" />Allow automatic counsellor assignment</label><label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-semibold text-slate-700"><input id="source-tracking" name="trackingEnabled" type="checkbox" checked={Boolean(form.trackingEnabled)} onChange={(event) => updateForm('trackingEnabled', event.target.checked)} className="h-3.5 w-3.5 accent-emerald-700" />Enable campaign tracking</label></div></form></Modal>
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Admission Source Details" footer={<div className="flex justify-end gap-2"><button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700">Close</button>{selectedSource && <button type="button" onClick={() => { setIsViewOpen(false); openEdit(selectedSource); }} className="rounded-lg bg-[#0f5132] px-3 py-2 text-[10px] font-semibold text-white">Edit source</button>}</div>}>{selectedSource && <div className="grid gap-3 text-xs text-slate-700 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Source</span><p className="mt-1 font-semibold text-slate-900">{selectedSource.name}</p><p className="mt-1 font-mono text-[10px] text-emerald-700">{selectedSource.code}</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Classification</span><p className="mt-1 font-semibold text-slate-900">{selectedSource.type}</p><p className="mt-1">{selectedSource.priority} priority</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Performance</span><p className="mt-1 font-semibold text-slate-900">{selectedSource.enquiries || 0} enquiries</p><p className="mt-1 text-emerald-700">{selectedSource.conversions || 0} conversions</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Controls</span><p className="mt-1">{selectedSource.autoAssign ? 'Auto assignment enabled' : 'Manual assignment'} • {selectedSource.trackingEnabled ? 'Tracking enabled' : 'Tracking disabled'}</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Description</span><p className="mt-1">{selectedSource.description || 'No description added.'}</p></div></div>}</Modal>
    </div>
  );
}
