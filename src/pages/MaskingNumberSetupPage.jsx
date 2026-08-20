import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios.js';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Button from '../components/ui/Button.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import Modal from '../components/ui/Modal.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';

const defaultValues = {
  name: '',
  prefix: '',
  suffix: '',
  startNumber: '',
  endNumber: '',
  currentNumber: '',
  description: '',
  status: 'Active',
  generationType: 'Sequence',
};

const statusOptions = ['Active', 'Inactive', 'Draft'];
const generationTypeOptions = ['Sequence', 'Random'];

export default function MaskingNumberSetupPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editor, setEditor] = useState(null);
  const [remove, setRemove] = useState(null);
  const [formValues, setFormValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [hasLoadedExisting, setHasLoadedExisting] = useState(false);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/coe/masking-number-setup');
      const loadedItems = response.data?.data || [];
      setItems(loadedItems);
      if (!hasLoadedExisting && loadedItems.length > 0) {
        setHasLoadedExisting(true);
        const firstItem = loadedItems[0];
        setFormValues({
          name: firstItem.name || '',
          prefix: firstItem.prefix || '',
          suffix: firstItem.suffix || '',
          startNumber: firstItem.startNumber?.toString() || '',
          endNumber: firstItem.endNumber?.toString() || '',
          currentNumber: firstItem.currentNumber?.toString() || '',
          description: firstItem.description || '',
          status: firstItem.status || 'Active',
          generationType: firstItem.generationType || 'Sequence',
        });
        setEditor(firstItem);
        setIsFormOpen(true);
      }
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Unable to load masking number settings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const resetForm = () => {
    setFormValues(defaultValues);
    setErrors({});
  };

  const openCreate = () => {
    resetForm();
    setEditor(null);
    setIsFormOpen(true);
  };

  const openEdit = (item) => {
    setFormValues({
      name: item.name || '',
      prefix: item.prefix || '',
      suffix: item.suffix || '',
      startNumber: item.startNumber?.toString() || '',
      endNumber: item.endNumber?.toString() || '',
      currentNumber: item.currentNumber?.toString() || '',
      description: item.description || '',
      status: item.status || 'Active',
      generationType: item.generationType || 'Sequence',
    });
    setErrors({});
    setEditor(item);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const handleInput = (field, value) => {
    setFormValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formValues.name.trim()) nextErrors.name = 'Name is required.';
    if (!formValues.startNumber) nextErrors.startNumber = 'Start Number is required.';
    if (!formValues.endNumber) nextErrors.endNumber = 'End Number is required.';
    if (!formValues.generationType) nextErrors.generationType = 'Generation Type is required.';
    const start = Number(formValues.startNumber);
    const end = Number(formValues.endNumber);
    if (formValues.startNumber && formValues.endNumber && (!Number.isFinite(start) || !Number.isFinite(end) || start <= 0 || end <= 0)) {
      nextErrors.startNumber = nextErrors.startNumber || 'Start Number and End Number must be valid positive values.';
    }
    if (start > end) nextErrors.endNumber = 'End Number must be greater than or equal to Start Number.';
    if (formValues.currentNumber) {
      const current = Number(formValues.currentNumber);
      if (!Number.isFinite(current) || current < start || current > end) {
        nextErrors.currentNumber = 'Current Number must be between Start Number and End Number.';
      }
    }
    if (formValues.generationType && !['Sequence', 'Random'].includes(formValues.generationType)) {
      nextErrors.generationType = 'Generation Type must be Sequence or Random.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveItem = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    const payload = {
      name: formValues.name.trim(),
      prefix: formValues.prefix.trim() || null,
      suffix: formValues.suffix.trim() || null,
      startNumber: Number(formValues.startNumber),
      endNumber: Number(formValues.endNumber),
      currentNumber: formValues.currentNumber ? Number(formValues.currentNumber) : undefined,
      description: formValues.description.trim() || null,
      status: formValues.status,
      generationType: formValues.generationType,
    };

    try {
      if (editor) {
        await api.put(`/coe/masking-number-setup/${editor.id}`, payload);
        toast.success('Masking number setup updated successfully.');
      } else {
        await api.post('/coe/masking-number-setup', payload);
        toast.success('Masking number setup created successfully.');
      }
      closeForm();
      await loadItems();
    } catch (error) {
      toast.error(error?.response?.data?.detail || error?.message || 'Unable to save masking number setup.');
    } finally {
      setIsSaving(false);
    }
  };

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

  const emptyState = useMemo(() => (
    <tr>
      <td colSpan="9" className="py-20 text-center text-sm font-semibold text-slate-500">No masking number settings found.</td>
    </tr>
  ), []);

  return (
    <div className="min-h-[calc(100vh-7rem)] rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-3 shadow-[0_18px_45px_rgba(15,23,42,0.06)] lg:p-5">
      <div className="rounded-[22px] border border-slate-200/70 bg-white/95 p-4 shadow-inner sm:p-6">
        <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'COE Master', to: '/settings/coe' }, { label: 'Masking Number Setup' }]} />
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">COE Master</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Masking Number Setup</h1>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#1E3A5F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#16374d]"
          >
            <Plus className="h-4 w-4" />
            Add New
          </button>
        </div>

        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800">{editor ? 'Edit Masking Number Setup' : 'Create Masking Number Setup'}</p>
                  <p className="text-sm text-slate-500">Define a masking number series for COE numbering.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setFormValues(defaultValues)} className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Reset</button>
                  <button type="button" onClick={closeForm} className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Close</button>
                </div>
              </div>
              <form onSubmit={saveItem} className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                <label htmlFor="masking-name" className="grid gap-2 text-sm text-slate-700">
                  <span className="font-semibold uppercase tracking-[0.24em] text-slate-500">Name *</span>
                  <input id="masking-name" name="name" value={formValues.name} onChange={(event) => handleInput('name', event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500" />
                  {errors.name && <p className="text-xs text-rose-600">{errors.name}</p>}
                </label>
                <label htmlFor="masking-status" className="grid gap-2 text-sm text-slate-700">
                  <span className="font-semibold uppercase tracking-[0.24em] text-slate-500">Status</span>
                  <select id="masking-status" name="status" value={formValues.status} onChange={(event) => handleInput('status', event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500">
                    {statusOptions.map((value) => <option key={value}>{value}</option>)}
                  </select>
                </label>
                <label htmlFor="masking-gen-type" className="grid gap-2 text-sm text-slate-700">
                  <span className="font-semibold uppercase tracking-[0.24em] text-slate-500">Generation Type</span>
                  <select id="masking-gen-type" name="generationType" value={formValues.generationType} onChange={(event) => handleInput('generationType', event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500">
                    {generationTypeOptions.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                  {errors.generationType && <p className="text-xs text-rose-600">{errors.generationType}</p>}
                </label>
                <label htmlFor="masking-prefix" className="grid gap-2 text-sm text-slate-700">
                  <span className="font-semibold uppercase tracking-[0.24em] text-slate-500">Prefix</span>
                  <input id="masking-prefix" name="prefix" value={formValues.prefix} onChange={(event) => handleInput('prefix', event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500" />
                </label>
                <label htmlFor="masking-suffix" className="grid gap-2 text-sm text-slate-700">
                  <span className="font-semibold uppercase tracking-[0.24em] text-slate-500">Suffix</span>
                  <input id="masking-suffix" name="suffix" value={formValues.suffix} onChange={(event) => handleInput('suffix', event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500" />
                </label>
                <label htmlFor="masking-start" className="grid gap-2 text-sm text-slate-700">
                  <span className="font-semibold uppercase tracking-[0.24em] text-slate-500">Start Number *</span>
                  <input id="masking-start" name="startNumber" value={formValues.startNumber} onChange={(event) => handleInput('startNumber', event.target.value)} type="number" min="1" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500" />
                  {errors.startNumber && <p className="text-xs text-rose-600">{errors.startNumber}</p>}
                </label>
                <label htmlFor="masking-end" className="grid gap-2 text-sm text-slate-700">
                  <span className="font-semibold uppercase tracking-[0.24em] text-slate-500">End Number *</span>
                  <input id="masking-end" name="endNumber" value={formValues.endNumber} onChange={(event) => handleInput('endNumber', event.target.value)} type="number" min="1" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500" />
                  {errors.endNumber && <p className="text-xs text-rose-600">{errors.endNumber}</p>}
                </label>
                <label htmlFor="masking-current" className="grid gap-2 text-sm text-slate-700">
                  <span className="font-semibold uppercase tracking-[0.24em] text-slate-500">Current Number</span>
                  <input id="masking-current" name="currentNumber" value={formValues.currentNumber} onChange={(event) => handleInput('currentNumber', event.target.value)} type="number" min="1" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500" />
                  {errors.currentNumber && <p className="text-xs text-rose-600">{errors.currentNumber}</p>}
                </label>
                <label className="lg:col-span-2 grid gap-2 text-sm text-slate-700">
                  <span className="font-semibold uppercase tracking-[0.24em] text-slate-500">Description</span>
                  <textarea value={formValues.description} onChange={(event) => handleInput('description', event.target.value)} rows="3" className="min-h-[110px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500" />
                </label>
                <div className="lg:col-span-2 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <span className="text-sm text-slate-500">Leave current number empty to default to Start Number.</span>
                  <Button type="submit" isLoading={isSaving} className="self-end">{editor ? 'Update' : 'Create'}</Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 overflow-x-auto rounded-[24px] border border-slate-200/70 bg-white shadow-sm">
          <table className="min-w-full table-fixed divide-y divide-slate-200 text-left text-sm text-slate-900">
            <colgroup>
              <col className="w-12" />
              <col className="w-[20%]" />
              <col className="w-[12%]" />
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
            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="py-20 text-center text-sm text-slate-500">Loading masking number settings...</td>
                </tr>
              ) : items.length === 0 ? (
                emptyState
              ) : (
                items.map((item, index) => (
                  <tr key={item.id} className="border-t border-slate-200 hover:bg-slate-50 transition">
                    <td className="px-4 py-4 font-medium text-slate-700">{index + 1}</td>
                    <td className="px-4 py-4 text-slate-700">{item.name}</td>
                    <td className="px-4 py-4 text-slate-700 whitespace-nowrap">{item.prefix || '—'}</td>
                    <td className="px-4 py-4 text-slate-700 whitespace-nowrap">{item.suffix || '—'}</td>
                    <td className="px-4 py-4 text-slate-700 whitespace-nowrap">{item.startNumber}</td>
                    <td className="px-4 py-4 text-slate-700 whitespace-nowrap">{item.endNumber}</td>
                    <td className="px-4 py-4 text-slate-700 whitespace-nowrap">{item.currentNumber}</td>
                    <td className="px-4 py-4 text-slate-700"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-4 text-slate-700">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => toggleStatus(item)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">{item.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
                        <button type="button" onClick={() => openEdit(item)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"><Pencil className="mr-1 inline h-3.5 w-3.5" />Edit</button>
                        <button type="button" onClick={() => setRemove(item)} className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"><Trash2 className="mr-1 inline h-3.5 w-3.5" />Remove</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmDialog open={Boolean(remove)} title="Remove masking number setup?" description="This will soft delete the record and hide it from active lists." onCancel={() => setRemove(null)} onConfirm={confirmDelete} confirmLabel="Remove" />
    </div>
  );
}
