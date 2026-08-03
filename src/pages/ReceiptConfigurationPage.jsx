import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../api/axios.js';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Button from '../components/ui/Button.jsx';

const defaultValues = { prefix: '', receiptNumber: 0, suffix: '' };

export default function ReceiptConfigurationPage() {
  const [configurationId, setConfigurationId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues });

  useEffect(() => {
    let active = true;
    api.get('/coe/receipt-configuration').then((response) => {
      if (!active) return;
      const data = response.data?.data || defaultValues;
      setConfigurationId(data.id || null);
      reset({ prefix: data.prefix || '', receiptNumber: Number(data.receiptNumber ?? 0), suffix: data.suffix || '' });
    }).catch((error) => {
      if (active) toast.error(error?.response?.data?.detail || 'Unable to load receipt configuration.');
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, [reset]);

  const saveConfiguration = async (values) => {
    setIsSaving(true);
    const payload = { prefix: values.prefix?.trim() || null, receiptNumber: Number(values.receiptNumber), suffix: values.suffix?.trim() || null, status: 'Active' };
    try {
      const response = configurationId
        ? await api.put(`/coe/receipt-configuration/${configurationId}`, payload)
        : await api.post('/coe/receipt-configuration', payload);
      setConfigurationId(response.data?.data?.id || configurationId);
      toast.success('Receipt Configuration Saved Successfully');
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Unable to save receipt configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-3 shadow-[0_18px_45px_rgba(15,23,42,0.06)] lg:p-5">
      <div className="rounded-[22px] border border-slate-200/70 bg-white/95 p-4 shadow-inner sm:p-6">
        <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'COE Master', to: '/settings/coe' }, { label: 'Exam Fee Setup', to: '/coe/exam-fee-setup' }, { label: 'Receipt Configuration' }]} />
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center">
          <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">COE Master</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Receipt Configuration</h1></div>
          <Button type="submit" form="receipt-configuration-form" isLoading={isSaving} disabled={isLoading}><Save className="mr-2 inline h-4 w-4" />Save</Button>
        </div>
        <form id="receipt-configuration-form" onSubmit={handleSubmit(saveConfiguration)} className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-5 md:grid-cols-3">
            <label><span className="mb-2 block text-sm font-semibold text-slate-700">Prefix</span><input type="text" placeholder="Enter Prefix" {...register('prefix', { maxLength: { value: 32, message: 'Prefix must be 32 characters or fewer.' } })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" />{errors.prefix && <span className="mt-1.5 block text-xs text-rose-600">{errors.prefix.message}</span>}<span className="mt-1.5 block text-xs text-slate-400">Example: HU</span></label>
            <label><span className="mb-2 block text-sm font-semibold text-slate-700">Number <span className="text-rose-500">*</span></span><input type="number" min="0" step="1" {...register('receiptNumber', { required: 'Number is required', valueAsNumber: true, min: { value: 0, message: 'Number cannot be negative.' }, validate: (value) => Number.isInteger(value) || 'Number must be a whole number.' })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" />{errors.receiptNumber && <span className="mt-1.5 block text-xs text-rose-600">{errors.receiptNumber.message}</span>}</label>
            <label><span className="mb-2 block text-sm font-semibold text-slate-700">Suffix</span><input type="text" placeholder="Enter Suffix" {...register('suffix', { maxLength: { value: 32, message: 'Suffix must be 32 characters or fewer.' } })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" />{errors.suffix && <span className="mt-1.5 block text-xs text-rose-600">{errors.suffix.message}</span>}<span className="mt-1.5 block text-xs text-slate-400">Example: 2026</span></label>
          </div>
        </form>
      </div>
    </div>
  );
}
