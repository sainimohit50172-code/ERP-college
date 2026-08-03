import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, RefreshCw, X } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios.js';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const defaultValues = {
  shiftName: '',
  startTime: '',
  endTime: '',
};

const statusOptions = ['Active', 'Inactive'];

export default function ExamShiftMasterPage() {
  const [shifts, setShifts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formValues, setFormValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});

  const loadShifts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/coe/exam-shifts');
      setShifts(response.data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Unable to load exam shifts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadShifts();
  }, []);

  const resetForm = () => {
    setFormValues(defaultValues);
    setErrors({});
  };

  const openForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const handleRefresh = () => {
    resetForm();
    toast.info('Form reset.');
  };

  const handleInputChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formValues.shiftName.trim()) nextErrors.shiftName = 'Shift Name is required.';
    if (!formValues.startTime) nextErrors.startTime = 'Start Time is required.';
    if (!formValues.endTime) nextErrors.endTime = 'End Time is required.';
    if (formValues.startTime && formValues.endTime && formValues.endTime <= formValues.startTime) {
      nextErrors.endTime = 'End Time must be greater than Start Time.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await api.post('/coe/exam-shifts', {
        shiftName: formValues.shiftName.trim(),
        startTime: formValues.startTime,
        endTime: formValues.endTime,
        status: 'Active',
      });
      await loadShifts();
      closeForm();
      toast.success('Exam shift added successfully.');
    } catch (error) {
      toast.error(error?.response?.data?.detail || error?.message || 'Unable to add exam shift.');
    } finally {
      setIsSaving(false);
    }
  };

  const emptyState = useMemo(() => (
    <tr>
      <td colSpan="6" className="py-20 text-center text-sm font-semibold text-slate-500">No Records Found!</td>
    </tr>
  ), []);

  return (
    <div className="min-h-[calc(100vh-7rem)] rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-3 shadow-[0_18px_45px_rgba(15,23,42,0.06)] lg:p-5">
      <div className="rounded-[22px] border border-slate-200/70 bg-white/95 p-4 shadow-inner sm:p-6">
        <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'COE Master', to: '/settings/coe' }, { label: 'Exam Shift Master' }]} />
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">COE Master</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Exam Shift Master</h1>
          </div>
          <button
            type="button"
            onClick={openForm}
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
              className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              style={{ minHeight: '100px' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="grid flex-1 gap-3 sm:grid-cols-[1.4fr_1fr_1fr_auto]">
                  <label className="text-sm text-slate-700">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Shift Name *</span>
                    <input
                      type="text"
                      value={formValues.shiftName}
                      onChange={(event) => handleInputChange('shiftName', event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500"
                    />
                    {errors.shiftName && <p className="mt-1 text-xs text-rose-600">{errors.shiftName}</p>}
                  </label>
                  <label className="text-sm text-slate-700">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Start Time *</span>
                    <input
                      type="time"
                      value={formValues.startTime}
                      onChange={(event) => handleInputChange('startTime', event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500"
                    />
                    {errors.startTime && <p className="mt-1 text-xs text-rose-600">{errors.startTime}</p>}
                  </label>
                  <label className="text-sm text-slate-700">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">End Time *</span>
                    <input
                      type="time"
                      value={formValues.endTime}
                      onChange={(event) => handleInputChange('endTime', event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500"
                    />
                    {errors.endTime && <p className="mt-1 text-xs text-rose-600">{errors.endTime}</p>}
                  </label>
                  <div className="flex items-end justify-end">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSaving}
                      className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#1E3A5F] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#16374d] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                    aria-label="Refresh"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full border-collapse text-sm text-slate-900">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-4">#</th>
                <th className="px-4 py-4">Shift Name</th>
                <th className="px-4 py-4">Start Time</th>
                <th className="px-4 py-4">End Time</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center text-sm text-slate-500">Loading exam shifts...</td>
                </tr>
              ) : shifts.length === 0 ? (
                emptyState
              ) : (
                shifts.map((shift, index) => (
                  <tr key={shift.id} className="border-t border-slate-200">
                    <td className="px-4 py-4 font-medium text-slate-700">{index + 1}</td>
                    <td className="px-4 py-4 text-slate-700">{shift.shiftName}</td>
                    <td className="px-4 py-4 text-slate-700">{shift.startTime}</td>
                    <td className="px-4 py-4 text-slate-700">{shift.endTime}</td>
                    <td className="px-4 py-4 text-slate-700">{shift.status}</td>
                    <td className="px-4 py-4 text-slate-700">—</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
