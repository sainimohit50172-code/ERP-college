import { useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import { useERP } from '../services/ERPContext.jsx';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useResourceList } from '../hooks/useResourceHooks.js';
import api from '../api/axios.js';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Button from '../components/ui/Button.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import Modal from '../components/ui/Modal.jsx';
import SearchableSelect from '../components/ui/SearchableSelect.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Draft', label: 'Draft' },
];

const AUTO_FORM_DEFAULTS = {
  college: '',
  subject: '',
  name: '',
  prefix: '',
  suffix: '',
  generationType: 'Sequence',
  startNumber: '1',
  quantity: '10',
  description: '',
};

const EDIT_FORM_DEFAULTS = {
  collegeId: '',
  subjectId: '',
  name: '',
  prefix: '',
  suffix: '',
  generationType: 'Sequence',
  startNumber: '',
  endNumber: '',
  currentNumber: '',
  description: '',
  status: 'Active',
};

export default function MaskingNumberManagementPage() {
  const navigate = useNavigate();
  const { colleges = [] } = useERP();
  const { data: subjectsData = {} } = useResourceList('subjects', { page: 1, pageSize: 200 });
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [remove, setRemove] = useState(null);
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [isSavingAuto, setIsSavingAuto] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState(EDIT_FORM_DEFAULTS);
  const [editErrors, setEditErrors] = useState({});
  const [filter, setFilter] = useState({ college: '', subject: '', status: 'all', search: '' });
  const [autoForm, setAutoForm] = useState(AUTO_FORM_DEFAULTS);
  const [autoErrors, setAutoErrors] = useState({});

  const collegeOptions = useMemo(() => [
    { value: '', label: 'All colleges' },
    ...colleges.map((college) => {
      const label = typeof college === 'string' ? college : college.name || college.collegeName || college.label || String(college.id);
      return {
        value: String(label),
        label,
      };
    }),
  ], [colleges]);

  const subjectOptions = useMemo(() => [
    { value: '', label: 'All subjects' },
    ...(subjectsData?.items || []).map((subject) => ({
      value: String(subject.id ?? subject.name ?? ''),
      label: subject.name || subject.subjectName || subject.label || `Subject ${subject.id}`,
    })),
  ], [subjectsData]);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/coe/masking-number-setup');
      setItems(response.data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Unable to load masking number settings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const searchText = filter.search.trim().toLowerCase();
      const matchesSearch = !searchText || [item.name, item.prefix, item.suffix, item.description, item.generationType]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchText));

      const matchesStatus = filter.status === 'all' || item.status === filter.status;
      const matchesCollege = !filter.college || item.collegeId === filter.college || item.college === filter.college || item.collegeName === filter.college;
      const matchesSubject = !filter.subject || item.subjectId === filter.subject || item.subject === filter.subject || item.subjectName === filter.subject;

      return matchesSearch && matchesStatus && matchesCollege && matchesSubject;
    });
  }, [items, filter]);

  const confirmDelete = async () => {
    if (!remove) return;
    try {
      await api.delete(`/coe/masking-number-setup/${remove.id}`);
      toast.success('Masking number setup removed successfully.');
      setRemove(null);
      await loadItems();
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Unable to remove masking number setup.');
    }
  };

  const toggleStatus = async (item) => {
    const nextStatus = item.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.patch(`/coe/masking-number-setup/${item.id}/status?status_value=${nextStatus}`);
      setItems((current) => current.map((row) => (row.id === item.id ? { ...row, status: nextStatus } : row)));
      toast.success(`Masking number setup ${nextStatus.toLowerCase()}.`);
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Unable to update status.');
    }
  };

  const stats = useMemo(() => ({
    total: items.length,
    active: items.filter((item) => item.status === 'Active').length,
    inactive: items.filter((item) => item.status === 'Inactive').length,
    draft: items.filter((item) => item.status === 'Draft').length,
    sequence: items.filter((item) => item.generationType === 'Sequence').length,
    random: items.filter((item) => item.generationType === 'Random').length,
  }), [items]);

  const resetAutoForm = () => {
    setAutoForm(AUTO_FORM_DEFAULTS);
    setAutoErrors({});
  };

  const handleAutoSubmit = async (event) => {
    event.preventDefault();
    const name = autoForm.name.trim();
    const startNumber = Number(autoForm.startNumber) || 0;
    const quantity = Number(autoForm.quantity) || 0;
    const errors = {};

    if (!name) errors.name = 'A series name is required.';
    if (startNumber < 1) errors.startNumber = 'Start number must be at least 1.';
    if (quantity < 1) errors.quantity = 'Quantity must be at least 1.';

    if (Object.keys(errors).length > 0) {
      setAutoErrors(errors);
      return;
    }

    const endNumber = startNumber + quantity - 1;
    const payload = {
      name,
      prefix: autoForm.prefix || null,
      suffix: autoForm.suffix || null,
      startNumber,
      endNumber,
      currentNumber: startNumber,
      description: autoForm.description || null,
      status: 'Active',
      generationType: autoForm.generationType,
    };

    setIsSavingAuto(true);
    try {
      await api.post('/coe/masking-number-setup', payload);
      toast.success('Auto-generated masking numbers created successfully.');
      setShowAutoModal(false);
      resetAutoForm();
      await loadItems();
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Unable to auto-generate masking numbers.');
    } finally {
      setIsSavingAuto(false);
    }
  };

  const formattedPreview = () => {
    const startNumber = Number(autoForm.startNumber) || 1;
    const quantity = Number(autoForm.quantity) || 1;
    const endNumber = startNumber + quantity - 1;
    return `${autoForm.prefix || ''}${startNumber} → ${endNumber}${autoForm.suffix || ''}`;
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setEditForm({
      collegeId: item.collegeId?.toString() || item.college?.toString() || '',
      subjectId: item.subjectId?.toString() || item.subject?.toString() || '',
      name: item.name || '',
      prefix: item.prefix || '',
      suffix: item.suffix || '',
      generationType: item.generationType || 'Sequence',
      startNumber: item.startNumber?.toString() || '',
      endNumber: item.endNumber?.toString() || '',
      currentNumber: item.currentNumber?.toString() || '',
      description: item.description || '',
      status: item.status || 'Active',
    });
    setEditErrors({});
  };

  const closeEditModal = () => {
    setEditItem(null);
    setEditForm(EDIT_FORM_DEFAULTS);
    setEditErrors({});
  };

  const handleEditInput = (field, value) => {
    setEditForm((current) => ({ ...current, [field]: value }));
    setEditErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validateEditForm = () => {
    const nextErrors = {};
    if (!editForm.name.trim()) nextErrors.name = 'Name is required.';
    if (!editForm.startNumber) nextErrors.startNumber = 'Start number is required.';
    if (!editForm.endNumber) nextErrors.endNumber = 'End number is required.';
    const start = Number(editForm.startNumber);
    const end = Number(editForm.endNumber);
    if (editForm.startNumber && editForm.endNumber && (!Number.isFinite(start) || !Number.isFinite(end) || start <= 0 || end <= 0)) {
      nextErrors.startNumber = nextErrors.startNumber || 'Start and End numbers must be valid positive values.';
    }
    if (start > end) nextErrors.endNumber = 'End number must be greater than or equal to Start number.';
    if (editForm.currentNumber) {
      const current = Number(editForm.currentNumber);
      if (!Number.isFinite(current) || current < start || current > end) {
        nextErrors.currentNumber = 'Current number must be between Start and End.';
      }
    }
    setEditErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveEditItem = async () => {
    if (!editItem) return;
    if (!validateEditForm()) return;

    setIsSavingEdit(true);
    const payload = {
      name: editForm.name.trim(),
      prefix: editForm.prefix.trim() || null,
      suffix: editForm.suffix.trim() || null,
      startNumber: Number(editForm.startNumber),
      endNumber: Number(editForm.endNumber),
      currentNumber: editForm.currentNumber ? Number(editForm.currentNumber) : undefined,
      description: editForm.description.trim() || null,
      status: editForm.status,
      generationType: editForm.generationType,
    };

    try {
      const response = await api.put(`/coe/masking-number-setup/${editItem.id}`, payload);
      const updatedItem = response.data?.data || { ...editItem, ...payload };
      setItems((current) => current.map((item) => (item.id === editItem.id ? updatedItem : item)));
      toast.success('Masking number setup updated successfully.');
      closeEditModal();
    } catch (error) {
      toast.error(error?.response?.data?.detail || error?.message || 'Unable to update masking number setup.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-3 shadow-[0_18px_45px_rgba(15,23,42,0.06)] lg:p-5">
      <div className="rounded-[22px] border border-slate-200/70 bg-white/95 p-4 shadow-inner sm:p-6">
        <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'COE Master', to: '/settings/coe' }, { label: 'Masking Number Management' }]} />

        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">COE Master</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Masking Number Management</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">View existing masking number ranges, refine your selection, and generate new sequences from a premium workflow.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={loadItems} className="rounded-2xl px-4 py-2">
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button variant="primary" onClick={() => navigate('/coe/masking-number-setup')} className="rounded-2xl px-4 py-2">
              <Plus className="mr-2 h-4 w-4" /> Create setup
            </Button>
            <Button variant="success" onClick={() => setShowAutoModal(true)} className="rounded-2xl px-4 py-2">
              <Sparkles className="mr-2 h-4 w-4" /> Auto generate
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[24px] border border-slate-200/70 bg-emerald-50 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">Management insights</p>
                <p className="mt-2 text-sm text-slate-600">Current masking number setup health and recent distribution.</p>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" /> Live count
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[18px] border border-slate-200 bg-white p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Total setups</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{stats.total}</p>
              </div>
              <div className="rounded-[18px] border border-slate-200 bg-white p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Active</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{stats.active}</p>
              </div>
              <div className="rounded-[18px] border border-slate-200 bg-white p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Inactive</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{stats.inactive}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[18px] border border-slate-200 bg-white p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Sequence</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">{stats.sequence}</p>
              </div>
              <div className="rounded-[18px] border border-slate-200 bg-white p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Random</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">{stats.random}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Filter selection</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">College</label>
                <SearchableSelect
                  options={collegeOptions}
                  value={filter.college}
                  onChange={(value) => setFilter((prev) => ({ ...prev, college: value }))}
                  placeholder="Select college"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Subject</label>
                <SearchableSelect
                  options={subjectOptions}
                  value={filter.subject}
                  onChange={(value) => setFilter((prev) => ({ ...prev, subject: value }))}
                  placeholder="Select subject"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Status</label>
                <SearchableSelect
                  options={STATUS_OPTIONS}
                  value={filter.status}
                  onChange={(value) => setFilter((prev) => ({ ...prev, status: value }))}
                  placeholder="Status"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Search</label>
                <input
                  type="search"
                  value={filter.search}
                  onChange={(event) => setFilter((prev) => ({ ...prev, search: event.target.value }))}
                  placeholder="Name, prefix, suffix, description"
                  className="h-10 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200/70 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed divide-y divide-slate-200 text-left text-sm text-slate-900">
              <colgroup>
                <col className="w-12" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[14%]" />
              </colgroup>
              <thead className="bg-slate-900 text-xs uppercase tracking-[0.18em] text-white">
                <tr>
                  <th className="whitespace-nowrap border-b border-slate-700 px-4 py-4 font-semibold">#</th>
                  <th className="whitespace-nowrap border-b border-slate-700 px-4 py-4 font-semibold">Name</th>
                  <th className="whitespace-nowrap border-b border-slate-700 px-4 py-4 font-semibold">Prefix</th>
                  <th className="whitespace-nowrap border-b border-slate-700 px-4 py-4 font-semibold">Suffix</th>
                  <th className="whitespace-nowrap border-b border-slate-700 px-4 py-4 font-semibold">Start</th>
                  <th className="whitespace-nowrap border-b border-slate-700 px-4 py-4 font-semibold">End</th>
                  <th className="whitespace-nowrap border-b border-slate-700 px-4 py-4 font-semibold">Current</th>
                  <th className="whitespace-nowrap border-b border-slate-700 px-4 py-4 font-semibold">Status</th>
                  <th className="whitespace-nowrap border-b border-slate-700 px-4 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan="9" className="py-20 text-center text-sm text-slate-500">Loading masking number settings...</td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-20 text-center text-sm font-semibold text-slate-500">No masking number settings found.</td>
                  </tr>
                ) : (
                  filteredItems.map((item, index) => (
                    <tr key={item.id} className="border-y border-slate-200 transition hover:bg-slate-50">
                      <td className="px-4 py-4 font-semibold text-slate-700">{index + 1}</td>
                      <td className="px-4 py-4 text-slate-700">{item.name}</td>
                      <td className="px-4 py-4 text-slate-700 whitespace-nowrap">{item.prefix || '—'}</td>
                      <td className="px-4 py-4 text-slate-700 whitespace-nowrap">{item.suffix || '—'}</td>
                      <td className="px-4 py-4 text-slate-700 whitespace-nowrap">{item.startNumber}</td>
                      <td className="px-4 py-4 text-slate-700 whitespace-nowrap">{item.endNumber}</td>
                      <td className="px-4 py-4 text-slate-700 whitespace-nowrap">{item.currentNumber}</td>
                      <td className="px-4 py-4 text-slate-700"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => toggleStatus(item)}
                            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            {item.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setRemove(item)}
                            className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                          >
                            <Trash2 className="mr-1 inline h-3.5 w-3.5" /> Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        title="Edit Masking Number Setup"
        isOpen={Boolean(editItem)}
        onClose={closeEditModal}
        footer={(
          <>
            <Button variant="secondary" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button variant="primary" isLoading={isSavingEdit} onClick={saveEditItem}>
              Save changes
            </Button>
          </>
        )}
      >
        {editItem ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 text-sm text-slate-700">
              <span className="font-semibold uppercase tracking-[0.24em] text-slate-500">Name *</span>
              <input
                type="text"
                value={editForm.name}
                onChange={(event) => handleEditInput('name', event.target.value)}
                className="h-10 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
              />
              {editErrors.name && <p className="text-xs text-rose-600">{editErrors.name}</p>}
            </label>
            <label className="grid gap-2 text-sm text-slate-700">
              <span className="font-semibold uppercase tracking-[0.24em] text-slate-500">Generation Type</span>
              <select
                value={editForm.generationType}
                onChange={(event) => handleEditInput('generationType', event.target.value)}
                className="h-10 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
              >
                <option value="Sequence">Sequence</option>
                <option value="Random">Random</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm text-slate-700">
              <span className="font-semibold uppercase tracking-[0.24em] text-slate-500">Prefix</span>
              <input
                type="text"
                value={editForm.prefix}
                onChange={(event) => handleEditInput('prefix', event.target.value)}
                className="h-10 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
              />
            </label>
            <label className="grid gap-2 text-sm text-slate-700">
              <span className="font-semibold uppercase tracking-[0.24em] text-slate-500">Suffix</span>
              <input
                type="text"
                value={editForm.suffix}
                onChange={(event) => handleEditInput('suffix', event.target.value)}
                className="h-10 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
              />
            </label>
            <label className="grid gap-2 text-sm text-slate-700">
              <span className="font-semibold uppercase tracking-[0.24em] text-slate-500">Start Number *</span>
              <input
                type="number"
                min="1"
                value={editForm.startNumber}
                onChange={(event) => handleEditInput('startNumber', event.target.value)}
                className="h-10 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
              />
              {editErrors.startNumber && <p className="text-xs text-rose-600">{editErrors.startNumber}</p>}
            </label>
            <label className="grid gap-2 text-sm text-slate-700">
              <span className="font-semibold uppercase tracking-[0.24em] text-slate-500">End Number *</span>
              <input
                type="number"
                min="1"
                value={editForm.endNumber}
                onChange={(event) => handleEditInput('endNumber', event.target.value)}
                className="h-10 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
              />
              {editErrors.endNumber && <p className="text-xs text-rose-600">{editErrors.endNumber}</p>}
            </label>
            <label className="grid gap-2 text-sm text-slate-700">
              <span className="font-semibold uppercase tracking-[0.24em] text-slate-500">Current Number</span>
              <input
                type="number"
                min="1"
                value={editForm.currentNumber}
                onChange={(event) => handleEditInput('currentNumber', event.target.value)}
                className="h-10 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
              />
              {editErrors.currentNumber && <p className="text-xs text-rose-600">{editErrors.currentNumber}</p>}
            </label>
            <label className="lg:col-span-2 grid gap-2 text-sm text-slate-700">
              <span className="font-semibold uppercase tracking-[0.24em] text-slate-500">Description</span>
              <textarea
                rows="4"
                value={editForm.description}
                onChange={(event) => handleEditInput('description', event.target.value)}
                className="w-full rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
              />
            </label>
            <label className="lg:col-span-2 grid gap-2 text-sm text-slate-700">
              <span className="font-semibold uppercase tracking-[0.24em] text-slate-500">Status</span>
              <select
                value={editForm.status}
                onChange={(event) => handleEditInput('status', event.target.value)}
                className="h-10 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Draft">Draft</option>
              </select>
            </label>
          </div>
        ) : (
          <p className="text-sm text-slate-600">Select a row to edit.</p>
        )}
      </Modal>

      <Modal
        title="Auto Generate Masking Numbers"
        isOpen={showAutoModal}
        onClose={() => { setShowAutoModal(false); resetAutoForm(); }}
        footer={(
          <>
            <Button variant="secondary" onClick={() => { setShowAutoModal(false); resetAutoForm(); }}>
              Cancel
            </Button>
            <Button variant="primary" isLoading={isSavingAuto} onClick={handleAutoSubmit}>
              Generate numbers
            </Button>
          </>
        )}
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">College</label>
              <SearchableSelect
                options={collegeOptions}
                value={autoForm.college}
                onChange={(value) => setAutoForm((prev) => ({ ...prev, college: value }))}
                placeholder="Optional college"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Subject</label>
              <SearchableSelect
                options={subjectOptions}
                value={autoForm.subject}
                onChange={(value) => setAutoForm((prev) => ({ ...prev, subject: value }))}
                placeholder="Optional subject"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Series name *</label>
              <input
                type="text"
                value={autoForm.name}
                onChange={(event) => setAutoForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Enter series name"
                className="h-10 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
              />
              {autoErrors.name && <p className="mt-1 text-xs text-rose-600">{autoErrors.name}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Prefix</label>
              <input
                type="text"
                value={autoForm.prefix}
                onChange={(event) => setAutoForm((prev) => ({ ...prev, prefix: event.target.value }))}
                className="h-10 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Suffix</label>
              <input
                type="text"
                value={autoForm.suffix}
                onChange={(event) => setAutoForm((prev) => ({ ...prev, suffix: event.target.value }))}
                className="h-10 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Generation type</label>
              <SearchableSelect
                options={[
                  { value: 'Sequence', label: 'Sequence' },
                  { value: 'Random', label: 'Random' },
                ]}
                value={autoForm.generationType}
                onChange={(value) => setAutoForm((prev) => ({ ...prev, generationType: value }))}
                placeholder="Select generation type"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Start number *</label>
              <input
                type="number"
                min="1"
                value={autoForm.startNumber}
                onChange={(event) => setAutoForm((prev) => ({ ...prev, startNumber: event.target.value }))}
                className="h-10 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
              />
              {autoErrors.startNumber && <p className="mt-1 text-xs text-rose-600">{autoErrors.startNumber}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Quantity *</label>
              <input
                type="number"
                min="1"
                value={autoForm.quantity}
                onChange={(event) => setAutoForm((prev) => ({ ...prev, quantity: event.target.value }))}
                className="h-10 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
              />
              {autoErrors.quantity && <p className="mt-1 text-xs text-rose-600">{autoErrors.quantity}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
              <textarea
                rows="3"
                value={autoForm.description}
                onChange={(event) => setAutoForm((prev) => ({ ...prev, description: event.target.value }))}
                className="min-h-[110px] w-full rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[20px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-700">
          <p className="text-sm font-semibold text-slate-900">Preview</p>
          <p className="mt-2 text-sm text-slate-600">Range: <span className="font-semibold text-slate-950">{formattedPreview()}</span></p>
          <p className="mt-2 text-sm text-slate-600">This will create a new masking number setup that starts at the selected number and reserves the next {autoForm.quantity || 1} values.</p>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(remove)}
        title="Remove masking number setup?"
        description="This will soft delete the record and hide it from active lists."
        onCancel={() => setRemove(null)}
        onConfirm={confirmDelete}
        confirmLabel="Remove"
      />
    </div>
  );
}
