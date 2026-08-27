import { useMemo, useState } from 'react';
import { CalendarDays, Download, Edit3, Eye, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Modal from '../components/ui/Modal.jsx';

const pageConfigs = {
  specialisation: {
    title: 'Specialisation',
    subtitle: 'Specialisation',
    description: 'Manage specialisations used across advanced academic and institutional workflows.',
    storageKey: 'erp:advanced-specialisations',
    fields: [
      { name: 'name', label: 'Specialisation Name', placeholder: 'Enter specialisation name' },
      { name: 'code', label: 'Code', placeholder: 'Enter short code' },
    ],
  },
  'event-type': {
    title: 'Event Type',
    subtitle: 'Event Type Setting',
    description: 'Create event types to standardise seminars, activities, visits and institutional events.',
    storageKey: 'erp:advanced-event-types',
    fields: [
      { name: 'name', label: 'Event Type Name', placeholder: 'Enter event type' },
      { name: 'code', label: 'Code', placeholder: 'Enter short code' },
      { name: 'category', label: 'Event Category', type: 'select', options: ['Academic', 'Cultural', 'Sports', 'Seminar', 'Workshop', 'Placement', 'Other'] },
      { name: 'participation', label: 'Participation Mode', type: 'select', options: ['Individual', 'Group', 'Both'] },
    ],
    defaultValues: { name: '', code: '', category: 'Academic', participation: 'Both', status: 'Active', description: '' },
  },
  'event-group': {
    title: 'Event Group',
    subtitle: 'Event Group Setting',
    description: 'Organise related events into reusable groups for reporting and administration.',
    storageKey: 'erp:advanced-event-groups',
    fields: [{ name: 'name', label: 'Event Group Name', placeholder: 'Enter event group name' }],
  },
  'feedback-parameter': {
    title: 'Feedback Parameter',
    subtitle: 'Feedback Parameter Setting',
    description: 'Define the parameters used to collect consistent student, faculty and event feedback.',
    storageKey: 'erp:advanced-feedback-parameters',
    fields: [
      { name: 'name', label: 'Parameter Name', placeholder: 'Enter feedback parameter' },
      { name: 'code', label: 'Code', placeholder: 'Enter short code' },
    ],
  },
  'criteria-master': {
    title: 'Criteria Master',
    subtitle: 'Criteria Master Setting',
    description: 'Maintain evaluation criteria used by advanced assessment and review workflows.',
    storageKey: 'erp:advanced-criteria',
    fields: [
      { name: 'name', label: 'Criteria Name', placeholder: 'Enter criteria name' },
      { name: 'code', label: 'Code', placeholder: 'Enter short code' },
    ],
  },
  'submission-category': {
    title: 'Submission Category',
    subtitle: 'Submission Category Setting',
    description: 'Configure categories that classify submissions, publications and institutional records.',
    storageKey: 'erp:advanced-submission-categories',
    fields: [
      { name: 'name', label: 'Category Name', placeholder: 'Enter submission category' },
      { name: 'code', label: 'Code', placeholder: 'Enter short code' },
    ],
  },
};

const emptyForm = { name: '', code: '', status: 'Active', description: '' };
const pageSize = 8;

function readRows(storageKey) {
  if (typeof window === 'undefined') return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

const getId = () => `advanced-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const formatDate = (value) => new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export default function AdvancedMasterPage({ type }) {
  const config = pageConfigs[type] || pageConfigs.specialisation;
  const isEventType = type === 'event-type';
  const [rows, setRows] = useState(() => readRows(config.storageKey));
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ ...emptyForm, ...(config.defaultValues || {}) });
  const [editingRow, setEditingRow] = useState(null);
  const [viewingRow, setViewingRow] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const persist = (nextRows) => {
    setRows(nextRows);
    window.localStorage.setItem(config.storageKey, JSON.stringify(nextRows));
  };

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch = !query || Object.values(row).join(' ').toLowerCase().includes(query);
      return matchesSearch && (statusFilter === 'All' || row.status === statusFilter) && (!isEventType || categoryFilter === 'All Categories' || row.category === categoryFilter);
    });
  }, [rows, searchTerm, statusFilter, categoryFilter, isEventType]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingRow(null);
    setForm({ ...emptyForm, ...(config.defaultValues || {}) });
  };

  const openCreate = () => {
    setEditingRow(null);
    setForm({ ...emptyForm, ...(config.defaultValues || {}) });
    setIsFormOpen(true);
  };

  const openEdit = (row) => {
    setEditingRow(row);
    setForm({ ...emptyForm, ...(config.defaultValues || {}), ...row });
    setIsFormOpen(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const name = form.name.trim();
    const code = form.code.trim().toUpperCase();
    if (!name) {
      toast.error(`${config.title} name is required.`);
      return;
    }
    const duplicate = rows.some((row) => row.name.toLowerCase() === name.toLowerCase() && row.id !== editingRow?.id);
    if (duplicate) {
      toast.error('An entry with this name already exists.');
      return;
    }
    const payload = { ...form, name, code, updatedAt: new Date().toISOString() };
    const nextRows = editingRow
      ? rows.map((row) => row.id === editingRow.id ? { ...row, ...payload } : row)
      : [{ id: getId(), ...payload }, ...rows];
    persist(nextRows);
    setPage(1);
    toast.success(`${config.title} ${editingRow ? 'updated' : 'created'} successfully.`);
    closeForm();
  };

  const handleDelete = (row) => {
    if (!window.confirm(`Delete ${config.title.toLowerCase()} "${row.name}"?`)) return;
    persist(rows.filter((item) => item.id !== row.id));
    setPage(1);
    toast.success(`${config.title} deleted successfully.`);
  };

  const exportRows = () => {
    const headers = type === 'event-type' ? ['Name', 'Code', 'Category', 'Participation', 'Status', 'Description', 'Updated'] : ['Name', 'Code', 'Status', 'Description', 'Updated'];
    const csv = [headers, ...rows.map((row) => type === 'event-type' ? [row.name, row.code, row.category, row.participation, row.status, row.description, formatDate(row.updatedAt)] : [row.name, row.code, row.status, row.description, formatDate(row.updatedAt)])]
      .map((line) => line.map((value) => `"${String(value || '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}-master.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${config.title} data exported.`);
  };

  return (
    <div className={`no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4 ${isEventType ? 'border-teal-200/80 bg-[linear-gradient(135deg,#f0fdfa_0%,#ffffff_55%,#ecfeff_100%)]' : 'border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#eff6ff_100%)]'}`}>
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/95 p-3 shadow-inner sm:p-5">
        <div className="mb-5 flex flex-col gap-4 border-b border-slate-200/80 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Settings', to: '/settings' }, { label: 'Advanced Setup', to: '/settings/advanced' }, { label: config.title }]} />
            <div className="mt-4 flex items-center gap-3">
              {isEventType && <span className="rounded-xl bg-teal-50 p-2.5 text-teal-700"><CalendarDays className="h-5 w-5" /></span>}
              <div><p className={`text-[11px] font-semibold uppercase tracking-[0.28em] ${isEventType ? 'text-teal-600' : 'text-sky-600'}`}>{isEventType ? 'Event administration' : 'Advanced setup'}</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{config.title}</h1></div>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{config.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={exportRows} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><Download className="h-4 w-4" /> Export</button>
            <button type="button" onClick={openCreate} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition ${isEventType ? 'bg-teal-700 hover:bg-teal-800' : 'bg-[#17365d] hover:bg-[#102b4c]'}`}><Plus className="h-4 w-4" /> {isEventType ? 'Add Event Type' : 'Add New'}</button>
          </div>
        </div>

        <section className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-sm font-semibold text-slate-900">{config.title} registry</h2><p className="mt-1 text-xs text-slate-500">{filteredRows.length} entr{filteredRows.length === 1 ? 'y' : 'ies'} match the current view.</p></div>
            <div className="flex flex-wrap gap-2">
              <label htmlFor={`${type}-search`}><input id={`${type}-search`} value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setPage(1); }} placeholder={`Search ${config.title.toLowerCase()}...`} className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 sm:w-56" /></label>
              {isEventType && <select value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setPage(1); }} className="h-9 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-teal-400"><option>All Categories</option>{pageConfigs['event-type'].fields.find((field) => field.name === 'category').options.map((option) => <option key={option}>{option}</option>)}</select>}
              <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className="h-9 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-sky-400"><option value="All">All Status</option><option value="Active">Active</option><option value="Inactive">Inactive</option></select>
            </div>
          </div>
          <div className="overflow-x-auto"><table className="min-w-[680px] w-full border-collapse text-sm"><thead><tr className="bg-[#17365d] text-left text-xs uppercase tracking-[0.14em] text-white"><th className="px-4 py-3">#</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Code</th>{type === 'event-type' && <><th className="px-4 py-3">Category</th><th className="px-4 py-3">Participation</th></>}<th className="px-4 py-3">Status</th><th className="px-4 py-3">Updated</th><th className="px-4 py-3 text-center">Actions</th></tr></thead><tbody>{visibleRows.length === 0 ? <tr><td colSpan={type === 'event-type' ? 8 : 6} className="py-16 text-center text-sm text-slate-500">No records found. Add your first {config.title.toLowerCase()}.</td></tr> : visibleRows.map((row, index) => <tr key={row.id} className="border-b border-slate-200 text-slate-700 odd:bg-slate-50/50 hover:bg-sky-50/40"><td className="px-4 py-3">{(page - 1) * pageSize + index + 1}</td><td className="px-4 py-3 font-semibold text-slate-900">{row.name}</td><td className="px-4 py-3 font-mono text-xs text-slate-600">{row.code || '-'}</td>{type === 'event-type' && <><td className="px-4 py-3">{row.category || '-'}</td><td className="px-4 py-3">{row.participation || '-'}</td></>}<td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{row.status}</span></td><td className="px-4 py-3 text-slate-500">{formatDate(row.updatedAt)}</td><td className="px-4 py-3"><div className="flex justify-center gap-1.5"><button type="button" onClick={() => setViewingRow(row)} title="View" aria-label={`View ${row.name}`} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"><Eye className="h-4 w-4" /></button><button type="button" onClick={() => openEdit(row)} title="Edit" aria-label={`Edit ${row.name}`} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"><Edit3 className="h-4 w-4" /></button><button type="button" onClick={() => handleDelete(row)} title="Delete" aria-label={`Delete ${row.name}`} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div>
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500"><span>Showing {filteredRows.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filteredRows.length)} of {filteredRows.length}</span><div className="flex gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40">Previous</button><span className="rounded-lg bg-slate-100 px-3 py-1.5 font-semibold text-slate-700">{page} / {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40">Next</button></div></div>
        </section>
      </div>

      <Modal isOpen={isFormOpen} onClose={closeForm} title={editingRow ? `Edit ${config.title}` : `Add ${config.title}`} footer={<div className="flex justify-end gap-2"><button type="button" onClick={closeForm} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"><X className="h-4 w-4" /> Cancel</button><button type="submit" form={`${type}-form`} className="inline-flex items-center gap-2 rounded-lg bg-[#17365d] px-4 py-2 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> {editingRow ? 'Update' : 'Save'}</button></div>}>
        <form id={`${type}-form`} onSubmit={handleSubmit} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2">{config.fields.map((field) => <label key={field.name} className="text-sm font-semibold text-slate-700">{field.label}{field.type === 'select' ? <select value={form[field.name] ?? ''} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-normal outline-none focus:border-sky-400">{field.options.map((option) => <option key={option}>{option}</option>)}</select> : <input required={field.name === 'name'} value={form[field.name] ?? ''} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))} placeholder={field.placeholder} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-normal outline-none focus:border-sky-400" />}</label>)}<label className="text-sm font-semibold text-slate-700">Status<select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-normal outline-none focus:border-sky-400"><option>Active</option><option>Inactive</option></select></label></div><label className="block text-sm font-semibold text-slate-700">Description<textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={4} placeholder="Add an optional description" className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-normal outline-none focus:border-sky-400" /></label></form>
      </Modal>

      <Modal isOpen={Boolean(viewingRow)} onClose={() => setViewingRow(null)} title={`${config.title} Details`} footer={<div className="flex justify-end gap-2"><button type="button" onClick={() => setViewingRow(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Close</button>{viewingRow && <button type="button" onClick={() => { setViewingRow(null); openEdit(viewingRow); }} className="rounded-lg bg-[#17365d] px-4 py-2 text-sm font-semibold text-white">Edit</button>}</div>}>{viewingRow && <div className="grid gap-3 text-sm sm:grid-cols-2"><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Name</p><p className="mt-1 font-semibold text-slate-900">{viewingRow.name}</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Code</p><p className="mt-1 font-mono text-slate-900">{viewingRow.code || '-'}</p></div>{type === 'event-type' && <><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Category</p><p className="mt-1 text-slate-900">{viewingRow.category || '-'}</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Participation</p><p className="mt-1 text-slate-900">{viewingRow.participation || '-'}</p></div></>}<div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Status</p><p className="mt-1 font-semibold text-slate-900">{viewingRow.status}</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Last updated</p><p className="mt-1 text-slate-900">{formatDate(viewingRow.updatedAt)}</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2"><p className="text-xs uppercase tracking-wide text-slate-500">Description</p><p className="mt-1 text-slate-700">{viewingRow.description || 'No description added.'}</p></div></div>}</Modal>
    </div>
  );
}