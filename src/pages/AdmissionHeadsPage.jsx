import { useMemo, useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  ClipboardList,
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

const storageKey = 'erp:admission-heads';
const pageSize = 8;
const categories = ['All categories', 'Application', 'Admission', 'Academic', 'Hostel', 'Transport', 'Other'];
const statuses = ['All', 'Active', 'Inactive', 'Draft'];
const emptyForm = {
  name: '',
  code: '',
  category: 'Admission',
  amount: '0',
  status: 'Active',
  taxApplicable: false,
  receiptRequired: true,
  refundable: false,
  description: '',
};

const defaultHeads = [
  { id: 'head-application', name: 'Application Fee', code: 'APP-FEE', category: 'Application', amount: 1000, status: 'Active', taxApplicable: false, receiptRequired: true, refundable: false, description: 'Fee collected with a new admission application.', updatedAt: '2026-08-21T10:00:00.000Z' },
  { id: 'head-registration', name: 'Registration Fee', code: 'REG-FEE', category: 'Admission', amount: 2500, status: 'Active', taxApplicable: false, receiptRequired: true, refundable: true, description: 'Registration charge for a confirmed applicant.', updatedAt: '2026-08-20T10:00:00.000Z' },
  { id: 'head-admission', name: 'Admission Processing Fee', code: 'ADM-PROC', category: 'Admission', amount: 5000, status: 'Active', taxApplicable: true, receiptRequired: true, refundable: false, description: 'One-time admission processing and documentation fee.', updatedAt: '2026-08-19T10:00:00.000Z' },
  { id: 'head-hostel', name: 'Hostel Registration Fee', code: 'HST-REG', category: 'Hostel', amount: 1500, status: 'Draft', taxApplicable: false, receiptRequired: true, refundable: false, description: 'Initial hostel allocation and registration charge.', updatedAt: '2026-08-18T10:00:00.000Z' },
];

const readHeads = () => {
  if (typeof window === 'undefined') return defaultHeads;
  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) || 'null');
    return Array.isArray(stored) && stored.length ? stored : defaultHeads;
  } catch {
    return defaultHeads;
  }
};

const getNextId = () => `admission-head-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
const formatAmount = (value) => `₹ ${Number(value || 0).toLocaleString('en-IN')}`;
const badgeClass = (status) => status === 'Active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : status === 'Draft' ? 'bg-amber-50 text-amber-700 ring-amber-200' : 'bg-slate-100 text-slate-600 ring-slate-200';

export default function AdmissionHeadsPage() {
  const [heads, setHeads] = useState(readHeads);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [selectedHead, setSelectedHead] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');

  const persistHeads = (nextHeads) => {
    setHeads(nextHeads);
    window.localStorage.setItem(storageKey, JSON.stringify(nextHeads));
  };

  const filteredHeads = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return heads.filter((head) => {
      const matchesText = !query || [head.name, head.code, head.category, head.description].join(' ').toLowerCase().includes(query);
      return matchesText && (categoryFilter === 'All categories' || head.category === categoryFilter) && (statusFilter === 'All' || head.status === statusFilter);
    });
  }, [heads, searchTerm, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredHeads.length / pageSize));
  const visibleHeads = filteredHeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const activeCount = heads.filter((head) => head.status === 'Active').length;
  const totalValue = heads.reduce((sum, head) => sum + Number(head.amount || 0), 0);

  const closeForm = () => {
    setIsFormOpen(false);
    setFormMode('create');
    setSelectedHead(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    setFormMode('create');
    setForm({ ...emptyForm });
    setIsFormOpen(true);
  };

  const openEdit = (head) => {
    setFormMode('edit');
    setSelectedHead(head);
    setForm({ ...emptyForm, ...head, amount: String(head.amount ?? 0) });
    setIsFormOpen(true);
  };

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    const name = form.name.trim();
    const code = form.code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    const amount = Number(form.amount);
    const duplicateCode = heads.some((head) => head.code === code && head.id !== selectedHead?.id);

    if (!name || code.length < 3 || !Number.isFinite(amount) || amount < 0) {
      toast.error('Enter a valid head name, code and non-negative amount.');
      return;
    }
    if (duplicateCode) {
      toast.error('This head code already exists. Use a unique code.');
      return;
    }

    const payload = { ...form, name, code, amount, updatedAt: new Date().toISOString() };
    const nextHeads = formMode === 'edit' && selectedHead
      ? heads.map((head) => head.id === selectedHead.id ? { ...head, ...payload } : head)
      : [...heads, { id: getNextId(), ...payload }];
    persistHeads(nextHeads);
    toast.success(formMode === 'edit' ? 'Admission head updated.' : 'Admission head added.');
    closeForm();
  };

  const deleteHead = (head) => {
    if (!window.confirm(`Delete admission head "${head.name}"?`)) return;
    persistHeads(heads.filter((item) => item.id !== head.id));
    setIsViewOpen(false);
    toast.success('Admission head deleted.');
  };

  const duplicateHead = (head) => {
    const copyHead = { ...head, id: getNextId(), name: `${head.name} Copy`, code: `${head.code}-COPY`, status: 'Draft', updatedAt: new Date().toISOString() };
    persistHeads([...heads, copyHead]);
    toast.success('Admission head duplicated as draft.');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All categories');
    setStatusFilter('All');
    setCurrentPage(1);
  };

  const exportHeads = () => {
    const csv = [['Name', 'Code', 'Category', 'Amount', 'Status', 'Tax applicable', 'Receipt required', 'Refundable'], ...heads.map((head) => [head.name, head.code, head.category, head.amount, head.status, head.taxApplicable, head.receiptRequired, head.refundable])]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'admission-heads.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Admission heads exported.');
  };

  const start = filteredHeads.length ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(currentPage * pageSize, filteredHeads.length);

  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f4f8f7_0%,#ffffff_48%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-5 border-b border-slate-200/80 pb-4">
          <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Admission Setup', to: '/admission/setup' }, { label: 'Admission Master', to: '/admission/admissionMaster' }, { label: 'Admission Heads' }]} />
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-600">Admission Setup</p><h1 className="mt-1 text-[20px] font-semibold tracking-tight text-slate-900 sm:text-[24px]">Admission Heads</h1><p className="mt-1 text-[11px] text-slate-400">Manage fee heads, receipt rules and collection controls for the admission journey.</p></div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"><FileDown className="h-3.5 w-3.5" />Print</button>
              <button type="button" onClick={exportHeads} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"><FileDown className="h-3.5 w-3.5" />Export</button>
              <button type="button" onClick={openCreate} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f5132] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#0d432b]"><Plus className="h-3.5 w-3.5" />Add Admission Head</button>
            </div>
          </div>
        </div>

        <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Total heads <Tags className="h-4 w-4" /></div><p className="mt-3 text-2xl font-bold text-emerald-950">{heads.length}</p><p className="mt-1 text-[11px] text-emerald-700">Configured collection heads</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Active heads <CheckCircle2 className="h-4 w-4 text-emerald-600" /></div><p className="mt-3 text-2xl font-bold text-slate-950">{activeCount}</p><p className="mt-1 text-[11px] text-slate-500">Available for admission billing</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Configured value <Banknote className="h-4 w-4 text-sky-600" /></div><p className="mt-3 text-lg font-bold text-slate-950">{formatAmount(totalValue)}</p><p className="mt-1 text-[11px] text-slate-500">Sum of default head amounts</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Receipt coverage <ClipboardList className="h-4 w-4 text-emerald-600" /></div><p className="mt-3 text-lg font-bold text-emerald-700">{heads.filter((head) => head.receiptRequired).length}/{heads.length || 0}</p><p className="mt-1 text-[11px] text-slate-500">Heads requiring receipt</p></div>
        </section>

        <section className="mb-5 rounded-[16px] border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-800"><Search className="h-3.5 w-3.5" />Filters &amp; Search</div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            <label htmlFor="admission-head-search" className="text-[10px] font-semibold text-slate-600">Search head<input id="admission-head-search" name="searchTerm" value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1); }} placeholder="Search name or code..." className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] font-normal outline-none focus:border-emerald-400" /></label>
            <label htmlFor="admission-head-category" className="text-[10px] font-semibold text-slate-600">Category<select id="admission-head-category" name="categoryFilter" value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setCurrentPage(1); }} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] font-normal outline-none focus:border-emerald-400">{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
            <label htmlFor="admission-head-status" className="text-[10px] font-semibold text-slate-600">Status<select id="admission-head-status" name="statusFilter" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1); }} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] font-normal outline-none focus:border-emerald-400">{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
            <div className="flex items-end justify-end"><button type="button" onClick={resetFilters} className="inline-flex items-center gap-1 rounded-lg bg-[#0f5132] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#0d432b]"><X className="h-3.5 w-3.5" />Reset</button></div>
          </div>
        </section>

        <section className="flex-1 overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5"><div className="flex items-center gap-2 text-xs font-semibold text-slate-800"><Tags className="h-3.5 w-3.5" />Admission Head Registry</div><span className="text-[10px] text-slate-500">Showing {visibleHeads.length} of {filteredHeads.length} entries</span></div>
          <div className="overflow-x-auto"><table className="min-w-full border-collapse text-center text-[10px]"><thead><tr className="bg-[#0f5132] text-white"><th className="border-r border-white/30 px-3 py-2.5 font-semibold">S.No.</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Head / Code</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Category</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Default Amount</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Rules</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Updated</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Status</th><th className="px-3 py-2.5 font-semibold">Actions</th></tr></thead><tbody>{visibleHeads.length === 0 ? <tr><td colSpan="8" className="py-12 text-center text-slate-500">No admission heads found.</td></tr> : visibleHeads.map((head, index) => <tr key={head.id} className="border-b border-slate-200 text-slate-700 odd:bg-slate-50/50 hover:bg-emerald-50/30"><td className="border-r border-white px-3 py-2">{(currentPage - 1) * pageSize + index + 1}</td><td className="border-r border-white px-3 py-2 text-left"><p className="font-semibold text-slate-900">{head.name}</p><p className="mt-0.5 font-mono text-[9px] text-emerald-700">{head.code}</p></td><td className="border-r border-white px-3 py-2">{head.category}</td><td className="border-r border-white px-3 py-2 font-semibold text-slate-900">{formatAmount(head.amount)}</td><td className="border-r border-white px-3 py-2"><div className="flex flex-wrap justify-center gap-1">{head.receiptRequired && <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] text-emerald-700">Receipt</span>}{head.taxApplicable && <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[9px] text-sky-700">Tax</span>}{head.refundable && <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[9px] text-amber-700">Refundable</span>}</div></td><td className="border-r border-white px-3 py-2">{formatDate(head.updatedAt)}</td><td className="border-r border-white px-3 py-2"><span className={`rounded-md px-2 py-1 text-[9px] font-semibold ring-1 ${badgeClass(head.status)}`}>{head.status}</span></td><td className="px-3 py-2"><div className="flex justify-center gap-1"><button type="button" onClick={() => { setSelectedHead(head); setIsViewOpen(true); }} aria-label={`View ${head.name}`} title="View" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"><Eye className="h-3 w-3" /></button><button type="button" onClick={() => openEdit(head)} aria-label={`Edit ${head.name}`} title="Edit" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"><Pencil className="h-3 w-3" /></button><button type="button" onClick={() => duplicateHead(head)} aria-label={`Duplicate ${head.name}`} title="Duplicate" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-sky-50 hover:text-sky-700"><Copy className="h-3 w-3" /></button><button type="button" onClick={() => deleteHead(head)} aria-label={`Delete ${head.name}`} title="Delete" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3 w-3" /></button></div></td></tr>)}</tbody></table></div>
          <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2.5 text-[10px] text-slate-500"><span>Showing {start} to {end} of {filteredHeads.length} entries</span><div className="flex items-center gap-1"><button type="button" onClick={() => setCurrentPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} className="rounded border border-slate-200 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40">Previous</button><button type="button" className="rounded border border-emerald-600 bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">{currentPage}</button><button type="button" onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage >= totalPages} className="rounded border border-slate-200 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40">Next</button></div></div>
        </section>
      </div>

      <Modal isOpen={isFormOpen} onClose={closeForm} title={formMode === 'edit' ? 'Edit Admission Head' : 'Add Admission Head'} footer={<div className="flex justify-end gap-2"><button type="button" onClick={closeForm} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button type="submit" form="admission-head-form" className="rounded-lg bg-[#0f5132] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#0d432b]">{formMode === 'edit' ? 'Update head' : 'Save head'}</button></div>}>
        <form id="admission-head-form" onSubmit={handleSubmit} className="space-y-4"><div className="grid gap-3 md:grid-cols-2"><label className="text-[10px] font-semibold text-slate-600">Head name<input id="head-name" name="name" required value={form.name} onChange={(event) => updateForm('name', event.target.value)} placeholder="e.g. Application Fee" className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400" /></label><label className="text-[10px] font-semibold text-slate-600">Head code<input id="head-code" name="code" required value={form.code} onChange={(event) => updateForm('code', event.target.value.toUpperCase())} placeholder="e.g. APP-FEE" className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] uppercase outline-none focus:border-emerald-400" /></label></div><div className="grid gap-3 md:grid-cols-3"><label className="text-[10px] font-semibold text-slate-600">Category<select id="head-category" name="category" value={form.category} onChange={(event) => updateForm('category', event.target.value)} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400">{categories.slice(1).map((category) => <option key={category}>{category}</option>)}</select></label><label className="text-[10px] font-semibold text-slate-600">Default amount<input id="head-amount" name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={(event) => updateForm('amount', event.target.value)} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400" /></label><label className="text-[10px] font-semibold text-slate-600">Status<select id="head-status" name="status" value={form.status} onChange={(event) => updateForm('status', event.target.value)} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400"><option>Active</option><option>Inactive</option><option>Draft</option></select></label></div><label className="block text-[10px] font-semibold text-slate-600">Description<textarea id="head-description" name="description" value={form.description} onChange={(event) => updateForm('description', event.target.value)} rows={3} className="mt-1 w-full resize-none rounded-md border border-slate-200 px-2 py-2 text-[10px] outline-none focus:border-emerald-400" /></label><div className="grid gap-2 md:grid-cols-3">{[['receiptRequired', 'Receipt required'], ['taxApplicable', 'Tax applicable'], ['refundable', 'Refundable']].map(([key, label]) => <label key={key} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-semibold text-slate-700"><input id={`head-${key}`} name={key} type="checkbox" checked={Boolean(form[key])} onChange={(event) => updateForm(key, event.target.checked)} className="h-3.5 w-3.5 accent-emerald-700" />{label}</label>)}</div></form>
      </Modal>

      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Admission Head Details" footer={<div className="flex justify-end gap-2"><button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700">Close</button>{selectedHead && <button type="button" onClick={() => { setIsViewOpen(false); openEdit(selectedHead); }} className="rounded-lg bg-[#0f5132] px-3 py-2 text-[10px] font-semibold text-white">Edit head</button>}</div>}>
        {selectedHead && <div className="grid gap-3 text-xs text-slate-700 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Head</span><p className="mt-1 font-semibold text-slate-900">{selectedHead.name}</p><p className="mt-1 font-mono text-[10px] text-emerald-700">{selectedHead.code}</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Amount</span><p className="mt-1 font-semibold text-slate-900">{formatAmount(selectedHead.amount)}</p><p className="mt-1">{selectedHead.category}</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Status</span><p className="mt-2"><span className={`rounded-md px-2 py-1 text-[9px] font-semibold ring-1 ${badgeClass(selectedHead.status)}`}>{selectedHead.status}</span></p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Rules</span><p className="mt-1">{selectedHead.receiptRequired ? 'Receipt required' : 'Receipt optional'}{selectedHead.taxApplicable ? ' • Tax enabled' : ''}{selectedHead.refundable ? ' • Refundable' : ''}</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Description</span><p className="mt-1">{selectedHead.description || 'No description added.'}</p></div></div>}
      </Modal>
    </div>
  );
}
