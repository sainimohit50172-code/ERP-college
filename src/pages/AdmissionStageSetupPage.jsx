import { useMemo, useState } from 'react';
import { CalendarRange, Eye, FileDown, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Modal from '../components/ui/Modal.jsx';
import { toast } from '../utils/toast.js';

const storageKey = 'erp:admission-stages';
const pageSize = 10;
const statuses = ['All', 'Active', 'Inactive', 'Draft'];
const categories = ['All categories', 'Enquiry', 'Verification', 'Counselling', 'Admission', 'Documents', 'Payment'];
const emptyForm = {
  name: '',
  code: '',
  sequence: '1',
  category: 'Enquiry',
  status: 'Active',
  fieldCount: '0',
  transactionRequired: false,
  documentRequired: false,
  allowBackdate: false,
  description: '',
};

const defaultStages = [
  {
    id: 'admission-stage-enquiry',
    name: 'Enquiry',
    code: 'ENQ',
    sequence: 1,
    category: 'Enquiry',
    status: 'Active',
    transactionRequired: false,
    documentRequired: false,
    allowBackdate: true,
    fieldCount: 8,
    description: 'Initial enquiry and prospect registration.',
    updatedAt: '2026-08-21T10:00:00.000Z',
  },
  {
    id: 'admission-stage-verification',
    name: 'Document Verification',
    code: 'DOC-VERIFY',
    sequence: 2,
    category: 'Verification',
    status: 'Active',
    transactionRequired: false,
    documentRequired: true,
    allowBackdate: false,
    fieldCount: 12,
    description: 'Verify submitted admission documents.',
    updatedAt: '2026-08-20T10:00:00.000Z',
  },
  {
    id: 'admission-stage-counselling',
    name: 'Counselling',
    code: 'COUNSEL',
    sequence: 3,
    category: 'Counselling',
    status: 'Draft',
    transactionRequired: false,
    documentRequired: false,
    allowBackdate: false,
    fieldCount: 6,
    description: 'Counsellor interaction and course selection.',
    updatedAt: '2026-08-19T10:00:00.000Z',
  },
];

const readStages = () => {
  if (typeof window === 'undefined') return defaultStages;
  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) || 'null');
    return Array.isArray(stored) && stored.length ? stored : defaultStages;
  } catch {
    return defaultStages;
  }
};

const getNextId = () => `admission-stage-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const badgeClass = (status) =>
  status === 'Active'
    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    : status === 'Draft'
      ? 'bg-amber-50 text-amber-700 ring-amber-200'
      : 'bg-slate-100 text-slate-600 ring-slate-200';

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function AdmissionStageSetupPage() {
  const [stages, setStages] = useState(readStages);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedStage, setSelectedStage] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const persistStages = (nextStages) => {
    setStages(nextStages);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, JSON.stringify(nextStages));
    }
  };

  const filteredStages = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return [...stages]
      .filter((stage) => {
        const matchesText =
          !query || [stage.name, stage.code, stage.category, stage.description]
            .join(' ')
            .toLowerCase()
            .includes(query);
        const matchesStatus = statusFilter === 'All' || stage.status === statusFilter;
        const matchesCategory = categoryFilter === 'All categories' || stage.category === categoryFilter;
        return matchesText && matchesStatus && matchesCategory;
      })
      .sort((left, right) => Number(left.sequence) - Number(right.sequence));
  }, [stages, searchTerm, statusFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredStages.length / pageSize));
  const visibleStages = filteredStages.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const closeForm = () => {
    setIsFormOpen(false);
    setFormMode('create');
    setSelectedStage(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    setFormMode('create');
    setSelectedStage(null);
    setForm({ ...emptyForm, sequence: String(stages.length + 1) });
    setIsFormOpen(true);
  };

  const openEdit = (stage) => {
    setFormMode('edit');
    setSelectedStage(stage);
    setForm({ ...emptyForm, ...stage, sequence: String(stage.sequence), fieldCount: String(stage.fieldCount ?? 0) });
    setIsFormOpen(true);
  };

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const code = form.code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    const sequence = Number(form.sequence);
    const fieldCount = Number(form.fieldCount);

    if (!name || !code || !Number.isInteger(sequence) || sequence < 1 || !Number.isInteger(fieldCount) || fieldCount < 0) {
      toast.error('Enter a valid stage name, code, sequence and field count.');
      return;
    }

    const payload = { ...form, name, code, sequence, fieldCount, updatedAt: new Date().toISOString() };
    const nextStages =
      formMode === 'edit' && selectedStage
        ? stages.map((stage) => (stage.id === selectedStage.id ? { ...stage, ...payload } : stage))
        : [...stages, { id: getNextId(), ...payload }];

    persistStages(nextStages);
    setCurrentPage(1);
    toast.success(formMode === 'edit' ? 'Admission stage updated.' : 'Admission stage added.');
    closeForm();
  };

  const onDelete = (stage) => {
    if (!window.confirm(`Delete stage "${stage.name}"?`)) return;
    persistStages(stages.filter((item) => item.id !== stage.id));
    setIsViewOpen(false);
    toast.success('Admission stage deleted.');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setCategoryFilter('All categories');
    setCurrentPage(1);
  };

  const start = filteredStages.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, filteredStages.length);

  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-5 border-b border-slate-200/80 pb-4">
          <div className="mb-3 flex items-center gap-3">
            <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Admission Setup', to: '/admission/setup' }, { label: 'Admission Master', to: '/admission/admissionMaster' }, { label: 'Stages Master Setup' }]} />
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-600">Admission Setup</p>
              <h1 className="mt-1 text-[16px] font-medium tracking-tight text-slate-900">Stages Master Setup</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                <FileDown className="h-3.5 w-3.5" /> Print
              </button>
              <button type="button" onClick={openCreate} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f5132] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0d432b]">
                <Plus className="h-3.5 w-3.5" /> Add New Stage
              </button>
            </div>
          </div>
        </div>

        <section className="mb-5 rounded-[16px] border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-800">
            <Search className="h-3.5 w-3.5" /> Filters &amp; Search
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            <label htmlFor="admission-stage-search" className="text-[10px] font-semibold text-slate-600">
              Search stage
              <input
                id="admission-stage-search"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search stage..."
                className="mt-1 h-[20px] w-full rounded-md border border-slate-200 px-2 text-[10px] font-normal outline-none focus:border-emerald-400"
              />
            </label>

            <label htmlFor="admission-stage-status" className="text-[10px] font-semibold text-slate-600">
              Status
              <select
                id="admission-stage-status"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="mt-1 h-[20px] w-full rounded-md border border-slate-200 px-2 text-[10px] font-normal outline-none focus:border-emerald-400"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>

            <label htmlFor="admission-stage-category" className="text-[10px] font-semibold text-slate-600">
              Category
              <select
                id="admission-stage-category"
                value={categoryFilter}
                onChange={(event) => {
                  setCategoryFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="mt-1 h-[20px] w-full rounded-md border border-slate-200 px-2 text-[10px] font-normal outline-none focus:border-emerald-400"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>

            <div className="flex items-end justify-end gap-2">
              <button type="button" onClick={resetFilters} className="inline-flex items-center gap-1 rounded-lg bg-[#0f5132] px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-[#0d432b]">
                Reset
              </button>
            </div>
          </div>
        </section>

        <section className="flex-1 overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <CalendarRange className="h-3.5 w-3.5" /> Admission Stage List
            </div>
            <span className="text-[10px] text-slate-500">Showing {visibleStages.length} of {filteredStages.length} entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-center text-[10px]">
              <thead>
                <tr className="bg-[#0f5132] text-white">
                  <th className="border-r border-white/30 px-3 py-2.5 font-semibold">S.No.</th>
                  <th className="border-r border-white/30 px-4 py-3 font-semibold">Code</th>
                  <th className="border-r border-white/30 px-4 py-3 font-semibold">Name</th>
                  <th className="border-r border-white/30 px-4 py-3 font-semibold">Category</th>
                  <th className="border-r border-white/30 px-3 py-2.5 font-semibold">Description</th>
                  <th className="border-r border-white/30 px-3 py-2.5 font-semibold">Created On</th>
                  <th className="border-r border-white/30 px-3 py-2.5 font-semibold">Status</th>
                  <th className="px-3 py-2.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStages.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-500">No stages found.</td>
                  </tr>
                ) : (
                  visibleStages.map((stage, index) => (
                    <tr key={stage.id} className="border-b border-slate-200 text-slate-700 odd:bg-slate-50/50 hover:bg-emerald-50/30">
                      <td className="border-r border-white px-3 py-2">{(currentPage - 1) * pageSize + index + 1}</td>
                      <td className="border-r border-white px-3 py-2 font-semibold text-slate-900">{stage.code || '-'}</td>
                      <td className="border-r border-white px-3 py-2 text-left font-semibold text-slate-900">{stage.name || '-'}</td>
                      <td className="border-r border-white px-3 py-2">{stage.category || '-'}</td>
                      <td className="max-w-[220px] truncate border-r border-white px-3 py-2 text-left" title={stage.description || ''}>{stage.description || '-'}</td>
                      <td className="border-r border-white px-3 py-2">{formatDate(stage.updatedAt || stage.createdAt)}</td>
                      <td className="border-r border-white px-3 py-2">
                        <span className={`rounded-md px-2 py-1 text-[9px] font-semibold ring-1 ${badgeClass(stage.status || 'Active')}`}>
                          {stage.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-center gap-1">
                          <button type="button" onClick={() => { setSelectedStage(stage); setIsViewOpen(true); }} aria-label="View stage" title="View" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100">
                            <Eye className="h-3 w-3" />
                          </button>
                          <button type="button" onClick={() => openEdit(stage)} aria-label="Edit stage" title="Edit" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700">
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button type="button" onClick={() => onDelete(stage)} aria-label="Delete stage" title="Delete" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2.5 text-[10px] text-slate-500">
            <span>Showing {filteredStages.length === 0 ? 0 : start} to {filteredStages.length === 0 ? 0 : end} of {filteredStages.length} entries</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                disabled={currentPage === 1}
                className="rounded border border-slate-200 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <button type="button" className="rounded border border-emerald-600 bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                {currentPage}
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
                disabled={currentPage >= totalPages}
                className="rounded border border-slate-200 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={formMode === 'edit' ? 'Edit Admission Stage' : 'Add Admission Stage'}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={closeForm} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" form="admission-stage-form" className="rounded-xl bg-[#0f5132] px-4 py-2 text-xs font-semibold text-white">Save stage</button>
          </div>
        }
      >
        <form id="admission-stage-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Stage name
              <input required value={form.name} onChange={(event) => updateForm('name', event.target.value)} placeholder="e.g. Offer Letter" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Stage code
              <input required value={form.code} onChange={(event) => updateForm('code', event.target.value)} placeholder="e.g. OFFER" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm uppercase focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Sequence
              <input required type="number" min="1" step="1" value={form.sequence} onChange={(event) => updateForm('sequence', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Category
              <select value={form.category} onChange={(event) => updateForm('category', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                {['Enquiry', 'Verification', 'Counselling', 'Admission', 'Documents', 'Payment'].map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Description
            <textarea value={form.description} onChange={(event) => updateForm('description', event.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Status
              <select value={form.status} onChange={(event) => updateForm('status', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Draft">Draft</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Fields
              <input type="number" min="0" value={form.fieldCount} onChange={(event) => updateForm('fieldCount', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" checked={form.transactionRequired} onChange={(event) => updateForm('transactionRequired', event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600" /> Transaction required</label>
            <label className="flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" checked={form.documentRequired} onChange={(event) => updateForm('documentRequired', event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600" /> Document required</label>
            <label className="flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" checked={form.allowBackdate} onChange={(event) => updateForm('allowBackdate', event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600" /> Allow backdate</label>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Admission Stage Details"
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Close</button>
            {selectedStage && (
              <button type="button" onClick={() => { setIsViewOpen(false); openEdit(selectedStage); }} className="rounded-xl bg-[#0f5132] px-4 py-2 text-xs font-semibold text-white">Edit stage</button>
            )}
          </div>
        }
      >
        {selectedStage && (
          <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Stage</span>
              <p className="mt-1 font-semibold text-slate-900">{selectedStage.name}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Code</span>
              <p className="mt-1 font-mono font-semibold text-slate-900">{selectedStage.code}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Category</span>
              <p className="mt-1">{selectedStage.category}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Status</span>
              <p className="mt-1"><span className={`rounded-full px-2 py-1 text-xs font-bold ring-1 ${badgeClass(selectedStage.status)}`}>{selectedStage.status}</span></p>
            </div>
            <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Description</span>
              <p className="mt-1">{selectedStage.description || 'No description added.'}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
