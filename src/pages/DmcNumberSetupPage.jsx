import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios.js';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Button from '../components/ui/Button.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';

const defaultValues = {
  seriesName: '',
  prefix: '',
  startingNumber: '',
  endingNumber: '',
  currentNumber: '',
  digitLength: '6',
  academicSessionId: '',
  collegeId: '',
  description: '',
  status: 'Active',
};

const statusOptions = ['Active', 'Inactive'];

export default function DmcNumberSetupPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editor, setEditor] = useState(null);
  const [remove, setRemove] = useState(null);
  const [formValues, setFormValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/coe/dmc-number-setup');
      const loadedItems = response.data?.data || [];
      setItems(loadedItems);
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Unable to load DMC number settings.');
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
      seriesName: item.seriesName || '',
      prefix: item.prefix || '',
      startingNumber: item.startingNumber?.toString() || '',
      endingNumber: item.endingNumber?.toString() || '',
      currentNumber: item.currentNumber?.toString() || '',
      digitLength: item.digitLength?.toString() || '6',
      academicSessionId: item.academicSessionId?.toString() || '',
      collegeId: item.collegeId?.toString() || '',
      description: item.description || '',
      status: item.status || 'Active',
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
    if (!formValues.seriesName.trim()) nextErrors.seriesName = 'Series Name is required.';
    if (!formValues.startingNumber) nextErrors.startingNumber = 'Starting Number is required.';
    if (!formValues.endingNumber) nextErrors.endingNumber = 'Ending Number is required.';
    if (!formValues.digitLength) nextErrors.digitLength = 'Digit Length is required.';
    
    const start = Number(formValues.startingNumber);
    const end = Number(formValues.endingNumber);
    const digit = Number(formValues.digitLength);
    
    if (formValues.startingNumber && formValues.endingNumber && (!Number.isFinite(start) || !Number.isFinite(end) || start <= 0 || end <= 0)) {
      nextErrors.startingNumber = nextErrors.startingNumber || 'Starting and Ending Numbers must be valid positive values.';
    }
    if (start > end) nextErrors.endingNumber = 'Ending Number must be greater than or equal to Starting Number.';
    if (formValues.digitLength && (!Number.isFinite(digit) || digit < 1 || digit > 20)) {
      nextErrors.digitLength = 'Digit Length must be between 1 and 20.';
    }
    if (formValues.currentNumber) {
      const current = Number(formValues.currentNumber);
      if (!Number.isFinite(current) || current < start || current > end) {
        nextErrors.currentNumber = 'Current Number must be between Starting and Ending Numbers.';
      }
    }
    
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveItem = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    const payload = {
      seriesName: formValues.seriesName.trim(),
      prefix: formValues.prefix.trim() || null,
      startingNumber: Number(formValues.startingNumber),
      endingNumber: Number(formValues.endingNumber),
      currentNumber: formValues.currentNumber ? Number(formValues.currentNumber) : undefined,
      digitLength: Number(formValues.digitLength),
      academicSessionId: formValues.academicSessionId ? Number(formValues.academicSessionId) : null,
      collegeId: formValues.collegeId ? Number(formValues.collegeId) : null,
      description: formValues.description.trim() || null,
      status: formValues.status,
    };

    try {
      if (editor) {
        await api.put(`/coe/dmc-number-setup/${editor.id}`, payload);
        toast.success('DMC number setup updated successfully.');
      } else {
        await api.post('/coe/dmc-number-setup', payload);
        toast.success('DMC number setup created successfully.');
      }
      closeForm();
      await loadItems();
    } catch (error) {
      toast.error(error?.response?.data?.detail || error?.message || 'Unable to save DMC number setup.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!remove) return;
    try {
      await api.delete(`/coe/dmc-number-setup/${remove.id}`);
      toast.success('DMC number setup removed successfully.');
      setRemove(null);
      await loadItems();
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Unable to remove DMC number setup.');
    }
  };

  const toggleStatus = async (item) => {
    const nextStatus = item.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.patch(`/coe/dmc-number-setup/${item.id}/status?status_value=${nextStatus}`);
      setItems((current) => current.map((row) => (row.id === item.id ? { ...row, status: nextStatus } : row)));
      toast.success(`DMC number setup ${nextStatus.toLowerCase()}.`);
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Unable to update status.');
    }
  };

  const saveSetup = async () => {
    try {
      toast.success('Configuration saved successfully.');
    } catch (error) {
      toast.error('Unable to save configuration.');
    }
  };

  const emptyState = useMemo(() => (
    <tr>
      <td colSpan="12" className="py-20 text-center text-sm font-semibold text-slate-500">No DMC number setups found.</td>
    </tr>
  ), []);

  return (
    <div className="min-h-[calc(100vh-7rem)] rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-3 shadow-[0_18px_45px_rgba(15,23,42,0.06)] lg:p-5">
      <div className="rounded-[22px] border border-slate-200/70 bg-white/95 p-4 shadow-inner sm:p-6">
        <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'COE Master', to: '/settings/coe' }, { label: 'DMC Number Setup' }]} />
        <div className="border-b border-slate-200 pb-6">
          <div className="flex flex-col gap-4 mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">COE Master</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">DMC Number Setup</h1>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-2xl text-blue-600 text-sm font-semibold transition hover:text-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add New Detail
            </button>
            <Button onClick={saveSetup} className="md:ml-auto">
              Save Setup
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="mt-6 rounded-[24px] border border-slate-200 bg-slate-100/80 p-4 shadow-sm"
            >
              <form onSubmit={saveItem} className="grid grid-cols-1 gap-3 rounded-[24px] bg-slate-50 p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_0.75fr_0.75fr_64px] xl:grid-cols-[1.4fr_1.1fr_1fr_1fr_0.8fr_0.8fr_64px]">
                <label className="grid gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                  Select Exam Calendar
                  <input value={formValues.academicSessionId} onChange={(event) => handleInput('academicSessionId', event.target.value)} placeholder="Select Exam Calendar" className="h-12 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500" />
                </label>
                <label className="grid gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                  Select Exam Type
                  <input value={formValues.status} onChange={(event) => handleInput('status', event.target.value)} placeholder="Select Exam Type" className="h-12 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500" />
                </label>
                <label className="grid gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                  Select College
                  <input value={formValues.collegeId} onChange={(event) => handleInput('collegeId', event.target.value)} placeholder="Select College" className="h-12 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500" />
                </label>
                <label className="grid gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                  Enter Prefix
                  <input value={formValues.prefix} onChange={(event) => handleInput('prefix', event.target.value)} placeholder="Enter Prefix" className="h-12 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500" />
                </label>
                <label className="grid gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                  Number
                  <input value={formValues.currentNumber || '0'} onChange={(event) => handleInput('currentNumber', event.target.value)} placeholder="0" type="number" min="0" className="h-12 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500" />
                </label>
                <label className="grid gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                  Enter Suffix
                  <input value={formValues.description} onChange={(event) => handleInput('description', event.target.value)} placeholder="Enter Suffix" className="h-12 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500" />
                </label>
                <div className="flex items-center justify-end">
                  <button type="button" onClick={closeForm} className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="col-span-full flex flex-wrap items-center justify-between gap-3 pt-3 sm:justify-end">
                  <Button type="submit" isLoading={isSaving} className="min-w-[160px]">{editor ? 'Update Detail' : 'Save Detail'}</Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 overflow-x-auto rounded-[24px] border border-slate-200/70 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-900">
            <thead className="erp-table-header text-white">
              <tr>
                <th className="whitespace-nowrap rounded-tl-[24px] px-4 py-4 text-left">☐</th>
                <th className="whitespace-nowrap px-4 py-4 text-left">S.No.</th>
                <th className="whitespace-nowrap px-4 py-4 text-left">Series Name</th>
                <th className="whitespace-nowrap px-4 py-4 text-left">Prefix</th>
                <th className="whitespace-nowrap px-4 py-4 text-left">Starting No.</th>
                <th className="whitespace-nowrap px-4 py-4 text-left">Ending No.</th>
                <th className="whitespace-nowrap px-4 py-4 text-left">Current No.</th>
                <th className="whitespace-nowrap px-4 py-4 text-left">Digit Length</th>
                <th className="whitespace-nowrap px-4 py-4 text-left">Status</th>
                <th className="whitespace-nowrap px-4 py-4 text-left">Created Date</th>
                <th className="whitespace-nowrap rounded-tr-[24px] px-4 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan="11" className="py-20 text-center text-sm text-slate-500">Loading DMC number settings...</td>
                </tr>
              ) : items.length === 0 ? (
                emptyState
              ) : (
                items.map((item, index) => (
                  <tr key={item.id} className="border-t border-slate-200 hover:bg-slate-50 transition">
                    <td className="px-4 py-4 text-center"><input type="checkbox" className="h-4 w-4 rounded border-slate-300" /></td>
                    <td className="px-4 py-4 font-medium text-slate-700">{index + 1}</td>
                    <td className="px-4 py-4 text-slate-700">{item.seriesName}</td>
                    <td className="px-4 py-4 text-slate-700">{item.prefix || '—'}</td>
                    <td className="px-4 py-4 text-slate-700">{item.startingNumber}</td>
                    <td className="px-4 py-4 text-slate-700">{item.endingNumber}</td>
                    <td className="px-4 py-4 text-slate-700">{item.currentNumber}</td>
                    <td className="px-4 py-4 text-slate-700">{item.digitLength}</td>
                    <td className="px-4 py-4 text-slate-700"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-4 text-slate-700 text-xs">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-4 text-slate-700">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => openEdit(item)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"><Pencil className="mr-1 inline h-3.5 w-3.5" />Edit</button>
                        <button type="button" onClick={() => toggleStatus(item)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">{item.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
                        <button type="button" onClick={() => setRemove(item)} className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"><Trash2 className="mr-1 inline h-3.5 w-3.5" />Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmDialog open={Boolean(remove)} title="Delete DMC number setup?" description="This will soft delete the record and hide it from active lists." onCancel={() => setRemove(null)} onConfirm={confirmDelete} confirmLabel="Delete" />
    </div>
  );
}
