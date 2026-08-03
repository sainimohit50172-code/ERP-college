import { useEffect, useMemo, useState } from 'react';
import { Eye, Pencil, Plus, Save, Search, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../api/axios.js';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Button from '../components/ui/Button.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import Modal from '../components/ui/Modal.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import ERPFixedSwitch from '../components/ui/ERPFixedSwitch.jsx';
import ToggleField from '../components/common/ToggleField.jsx';

const defaults = { feeHeadName: '', feeHeadCode: '', receiptHead: '', feeCategory: '', displayOrder: 0, amountType: 'Fixed', isRefundable: false, taxApplicable: false, status: 'Active', description: '' };

export default function FeeHeadConfigurationPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editor, setEditor] = useState(null);
  const [view, setView] = useState(null);
  const [remove, setRemove] = useState(null);
  const [query, setQuery] = useState('');
  const [sortAscending, setSortAscending] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({ defaultValues: defaults });

  const loadItems = async () => {
    setIsLoading(true);
    try { const response = await api.get('/coe/fee-heads'); setItems(response.data?.data || []); }
    catch (error) { toast.error(error?.response?.data?.detail || 'Unable to load fee heads.'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadItems(); }, []);

  const visibleItems = useMemo(() => items.filter((item) => `${item.feeHeadName} ${item.feeHeadCode} ${item.feeCategory} ${item.receiptHead}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sortAscending ? a.displayOrder - b.displayOrder : b.displayOrder - a.displayOrder), [items, query, sortAscending]);
  const openCreate = () => { reset(defaults); setEditor({ item: null }); };
  const openEdit = (item) => { reset({ ...defaults, ...item }); setEditor({ item }); };
  const closeEditor = () => { setEditor(null); reset(defaults); };
  const saveFeeHead = async (values) => {
    setIsSaving(true);
    try {
      const response = editor?.item ? await api.put(`/coe/fee-heads/${editor.item.id}`, values) : await api.post('/coe/fee-heads', values);
      toast.success(editor?.item ? 'Fee head updated successfully.' : 'Fee head created successfully.');
      if (response.data?.data) setItems((current) => editor?.item ? current.map((item) => item.id === editor.item.id ? response.data.data : item) : [...current, response.data.data]);
      closeEditor();
    } catch (error) { toast.error(error?.response?.data?.detail || 'Unable to save fee head.'); }
    finally { setIsSaving(false); }
  };
  const updateStatus = async (item) => {
    const status = item.status === 'Active' ? 'Inactive' : 'Active';
    try { const response = await api.patch(`/coe/fee-heads/${item.id}/status?status_value=${status}`); setItems((current) => current.map((row) => row.id === item.id ? response.data.data : row)); toast.success(`Fee head ${status.toLowerCase()}.`); }
    catch (error) { toast.error(error?.response?.data?.detail || 'Unable to update status.'); }
  };
  const deleteFeeHead = async () => {
    try { await api.delete(`/coe/fee-heads/${remove.id}`); setItems((current) => current.map((item) => item.id === remove.id ? { ...item, status: 'Inactive' } : item)); setRemove(null); toast.success('Fee head moved to inactive status.'); }
    catch (error) { toast.error(error?.response?.data?.detail || 'Unable to delete fee head.'); }
  };

  return <div className="min-h-[calc(100vh-7rem)] rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-3 shadow-[0_18px_45px_rgba(15,23,42,0.06)] lg:p-5"><div className="rounded-[22px] border border-slate-200/70 bg-white/95 p-4 shadow-inner sm:p-6">
    <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'COE Master', to: '/settings/coe' }, { label: 'Exam Fee Setup', to: '/coe/exam-fee-setup' }, { label: 'Fee Head Configuration' }]} />
    <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center"><div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">COE Master</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Fee Head Configuration</h1></div><Button onClick={() => toast.success('Fee head configuration is up to date.')}><Save className="mr-2 inline h-4 w-4" />Save</Button></div>
    <div className="mt-6 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/40 p-5 text-center shadow-sm"><Button onClick={openCreate} variant="secondary" className="border-emerald-300 bg-white text-emerald-700"><Plus className="mr-2 inline h-4 w-4" />Add Fee Head</Button></div>
    <div className="mt-6 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search fee heads..." className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500" /></div><button type="button" onClick={() => setSortAscending((value) => !value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">Order {sortAscending ? 'Ascending' : 'Descending'}</button></div>
    {isLoading ? <p className="py-12 text-center text-sm text-slate-500">Loading fee heads...</p> : visibleItems.length === 0 ? <p className="py-12 text-center text-sm text-slate-500">No fee heads configured yet.</p> : <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleItems.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900">{item.feeHeadName}</h2><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">{item.feeHeadCode}</p></div><ERPFixedSwitch checked={item.status === 'Active'} onChange={() => updateStatus(item)} label={`${item.feeHeadName} status`} /></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-slate-400">Category</p><p className="font-medium text-slate-700">{item.feeCategory}</p></div><div><p className="text-xs text-slate-400">Receipt Head</p><p className="font-medium text-slate-700">{item.receiptHead}</p></div></div><div className="mt-4 flex items-center justify-between"><StatusBadge status={item.status} /><div className="flex gap-1"><button title="View" type="button" onClick={() => setView(item)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Eye className="h-4 w-4" /></button><button title="Edit" type="button" onClick={() => openEdit(item)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button><button title="Delete" type="button" onClick={() => setRemove(item)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button></div></div></article>)}</div>}
    <Modal isOpen={Boolean(editor)} onClose={closeEditor} title={editor?.item ? 'Edit Fee Head' : 'Add Fee Head'} footer={<><Button variant="secondary" onClick={closeEditor}>Cancel</Button><Button type="submit" form="fee-head-form" isLoading={isSaving}>Save</Button></>}><form id="fee-head-form" onSubmit={handleSubmit(saveFeeHead)} className="grid gap-4 sm:grid-cols-2"><label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Fee Head Name *</span><input {...register('feeHeadName', { required: 'Fee Head Name is required' })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />{errors.feeHeadName && <span className="mt-1 block text-xs text-rose-600">{errors.feeHeadName.message}</span>}</label><label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Fee Head Code *</span><input {...register('feeHeadCode', { required: 'Fee Head Code is required' })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />{errors.feeHeadCode && <span className="mt-1 block text-xs text-rose-600">{errors.feeHeadCode.message}</span>}</label><label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Receipt Head</span><input {...register('receiptHead', { required: 'Receipt Head is required' })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" /></label><label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Fee Category</span><input {...register('feeCategory', { required: 'Fee Category is required' })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" /></label><label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Display Order</span><input type="number" min="0" {...register('displayOrder', { required: 'Display Order is required', valueAsNumber: true, min: { value: 0, message: 'Display Order cannot be negative' } })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />{errors.displayOrder && <span className="mt-1 block text-xs text-rose-600">{errors.displayOrder.message}</span>}</label><label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Amount Type</span><select {...register('amountType')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"><option>Fixed</option><option>Variable</option></select></label><ToggleField label="Refundable" checked={watch('isRefundable')} onChange={(value) => setValue('isRefundable', value)} /><ToggleField label="Tax Applicable" checked={watch('taxApplicable')} onChange={(value) => setValue('taxApplicable', value)} /><label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Status</span><select {...register('status')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"><option>Active</option><option>Inactive</option><option>Draft</option></select></label><label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Description</span><textarea rows={4} {...register('description')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" /></label></form></Modal>
    <Modal isOpen={Boolean(view)} onClose={() => setView(null)} title="Fee Head Details" footer={<Button variant="secondary" onClick={() => setView(null)}>Close</Button>}><div className="grid gap-3 sm:grid-cols-2">{Object.entries(view || {}).map(([key, value]) => <div key={key} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs uppercase tracking-wide text-slate-400">{key}</p><p className="mt-1 text-sm text-slate-800">{String(value ?? '—')}</p></div>)}</div></Modal>
    <ConfirmDialog open={Boolean(remove)} title="Delete fee head?" description="This will move the fee head to Inactive status and preserve its record." onCancel={() => setRemove(null)} onConfirm={deleteFeeHead} confirmLabel="Delete" />
  </div></div>;
}
