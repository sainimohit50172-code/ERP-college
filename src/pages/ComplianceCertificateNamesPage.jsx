import { useMemo, useState } from 'react';
import { BadgeCheck, CheckCircle2, Edit3, FileText, Plus, Search, ShieldCheck, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useCreateResource, useDeleteResource, useResourceList, useUpdateResource } from '../hooks/useResourceHooks.js';

const resource = 'compliance-certificate-names';
const emptyForm = { name: '', code: '', issuingAuthority: '', validity: '', status: 'Active', description: '' };
const emptyItems = [];

const getValue = (item, keys, fallback = '-') => keys.reduce((value, key) => value ?? item?.[key], null) || fallback;

export default function ComplianceCertificateNamesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formValues, setFormValues] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const { data, isLoading } = useResourceList(resource, { page: 1, pageSize: 100 });
  const createResource = useCreateResource(resource);
  const updateResource = useUpdateResource(resource);
  const deleteResource = useDeleteResource(resource);
  const items = data?.items || emptyItems;

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = !term || [item.name, item.code, item.issuingAuthority, item.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
      const status = getValue(item, ['status', 'state'], 'Active');
      return matchesSearch && (statusFilter === 'All' || status === statusFilter);
    });
  }, [items, searchTerm, statusFilter]);

  const activeCount = items.filter((item) => getValue(item, ['status', 'state'], 'Active') === 'Active').length;
  const inactiveCount = items.length - activeCount;

  const openCreate = () => {
    setEditingItem(null);
    setFormValues(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormValues({
      ...emptyForm,
      ...item,
      name: getValue(item, ['name', 'certificateName', 'title'], ''),
      code: getValue(item, ['code', 'certificateCode'], ''),
      issuingAuthority: getValue(item, ['issuingAuthority', 'authority'], ''),
      validity: getValue(item, ['validity', 'validityPeriod'], ''),
      status: getValue(item, ['status', 'state'], 'Active'),
      description: getValue(item, ['description'], ''),
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setFormValues(emptyForm);
  };

  const updateField = (field, value) => setFormValues((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formValues.name.trim() || !formValues.code.trim()) {
      toast.error('Certificate name and code are required.');
      return;
    }

    const payload = {
      ...formValues,
      name: formValues.name.trim(),
      code: formValues.code.trim().toUpperCase(),
      issuingAuthority: formValues.issuingAuthority.trim(),
      validity: formValues.validity.trim(),
      description: formValues.description.trim(),
    };

    try {
      if (editingItem) {
        await updateResource.mutateAsync({ id: editingItem.id ?? editingItem._id, payload });
        toast.success('Certificate name updated successfully.');
      } else {
        await createResource.mutateAsync(payload);
        toast.success('Certificate name created successfully.');
      }
      closeForm();
    } catch (error) {
      toast.error(error?.message || 'Could not save certificate name.');
    }
  };

  const handleDelete = async (item) => {
    const name = getValue(item, ['name', 'certificateName', 'title'], 'this certificate name');
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await deleteResource.mutateAsync(item.id ?? item._id);
      toast.success('Certificate name deleted.');
    } catch (error) {
      toast.error(error?.message || 'Could not delete certificate name.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] space-y-6 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f0fdf4_100%)] px-3 pb-8 sm:px-5 lg:px-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
        <div className="relative px-5 py-6 sm:px-7 sm:py-7">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-[80px] bg-emerald-50" />
          <div className="relative">
            <Breadcrumb items={[{ label: 'Settings', to: '/settings' }, { label: 'Institute Setup', to: '/settings/institute' }, { label: 'Compliance Certificate Names' }]} />
            <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" /> Compliance setup
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Compliance Certificate Names</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">Create and maintain the certificate names used across compliance documents and institutional records.</p>
              </div>
              <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(16,185,129,0.2)] transition hover:-translate-y-0.5 hover:bg-emerald-700">
                <Plus className="h-4 w-4" /> Add certificate name
              </button>
            </div>
          </div>
        </div>
        <div className="grid border-t border-slate-100 sm:grid-cols-3">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:border-b-0 sm:border-r"><div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600"><FileText className="h-5 w-5" /></div><div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total templates</p><p className="mt-1 text-2xl font-semibold text-slate-900">{items.length}</p></div></div>
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:border-b-0 sm:border-r"><div className="rounded-xl bg-sky-50 p-2.5 text-sky-600"><CheckCircle2 className="h-5 w-5" /></div><div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Active</p><p className="mt-1 text-2xl font-semibold text-slate-900">{activeCount}</p></div></div>
          <div className="flex items-center gap-3 px-5 py-4"><div className="rounded-xl bg-amber-50 p-2.5 text-amber-600"><BadgeCheck className="h-5 w-5" /></div><div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Inactive</p><p className="mt-1 text-2xl font-semibold text-slate-900">{inactiveCount}</p></div></div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Certificate directory</p><h2 className="mt-1 text-2xl font-semibold text-slate-900">Manage certificate names</h2></div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 sm:min-w-[280px]"><Search className="h-4 w-4 shrink-0 text-slate-400" /><span className="sr-only">Search certificates</span><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by name, code or authority" className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400" /></label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"><option value="All">All statuses</option><option value="Active">Active</option><option value="Inactive">Inactive</option></select>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="bg-[#101824] text-xs uppercase tracking-[0.12em] text-white"><tr><th className="px-4 py-4">Certificate name</th><th className="px-4 py-4">Code</th><th className="px-4 py-4">Issuing authority</th><th className="px-4 py-4">Validity</th><th className="px-4 py-4">Status</th><th className="px-4 py-4 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoading ? <tr><td colSpan="6" className="px-4 py-12 text-center text-slate-500">Loading certificate names...</td></tr> : filteredItems.length === 0 ? <tr><td colSpan="6" className="px-4 py-14 text-center"><BadgeCheck className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 font-medium text-slate-700">No certificate names found</p><p className="mt-1 text-sm text-slate-500">Add your first compliance certificate name to get started.</p></td></tr> : filteredItems.map((item, index) => {
                const status = getValue(item, ['status', 'state'], 'Active');
                return <tr key={item.id ?? item._id ?? index} className="transition hover:bg-emerald-50/40"><td className="px-4 py-4 font-semibold text-slate-900">{getValue(item, ['name', 'certificateName', 'title'])}<div className="mt-1 max-w-xs truncate text-xs font-normal text-slate-500">{getValue(item, ['description'], '')}</div></td><td className="px-4 py-4 font-mono text-xs font-semibold text-slate-600">{getValue(item, ['code', 'certificateCode'])}</td><td className="px-4 py-4 text-slate-600">{getValue(item, ['issuingAuthority', 'authority'])}</td><td className="px-4 py-4 text-slate-600">{getValue(item, ['validity', 'validityPeriod'])}</td><td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{status}</span></td><td className="px-4 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => openEdit(item)} aria-label={`Edit ${getValue(item, ['name', 'certificateName', 'title'], 'certificate')}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"><Edit3 className="h-4 w-4" /></button><button type="button" onClick={() => handleDelete(item)} aria-label={`Delete ${getValue(item, ['name', 'certificateName', 'title'], 'certificate')}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"><Trash2 className="h-4 w-4" /></button></div></td></tr>;
              })}
            </tbody>
          </table>
        </div>
      </section>

      <Modal isOpen={isFormOpen} onClose={closeForm} title={editingItem ? 'Edit certificate name' : 'Add certificate name'} footer={<><button type="button" onClick={closeForm} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"><X className="h-4 w-4" /> Cancel</button><button type="button" onClick={() => document.getElementById('compliance-certificate-name-form')?.requestSubmit()} disabled={createResource.isPending || updateResource.isPending} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"><CheckCircle2 className="h-4 w-4" /> Save</button></>}>
        <form id="compliance-certificate-name-form" onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <label htmlFor="certificate-name" className="grid gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">Certificate name<input id="certificate-name" value={formValues.name} onChange={(event) => updateField('name', event.target.value)} placeholder="e.g. Fire Safety Certificate" className="rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>
          <label htmlFor="certificate-code" className="grid gap-1.5 text-sm font-medium text-slate-700">Certificate code<input id="certificate-code" value={formValues.code} onChange={(event) => updateField('code', event.target.value)} placeholder="e.g. FSC-001" className="rounded-xl border border-slate-300 px-3 py-2.5 uppercase outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>
          <label htmlFor="certificate-status" className="grid gap-1.5 text-sm font-medium text-slate-700">Status<select id="certificate-status" value={formValues.status} onChange={(event) => updateField('status', event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"><option value="Active">Active</option><option value="Inactive">Inactive</option></select></label>
          <label htmlFor="certificate-authority" className="grid gap-1.5 text-sm font-medium text-slate-700">Issuing authority<input id="certificate-authority" value={formValues.issuingAuthority} onChange={(event) => updateField('issuingAuthority', event.target.value)} placeholder="e.g. Municipal Corporation" className="rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>
          <label htmlFor="certificate-validity" className="grid gap-1.5 text-sm font-medium text-slate-700">Validity<input id="certificate-validity" value={formValues.validity} onChange={(event) => updateField('validity', event.target.value)} placeholder="e.g. 1 year" className="rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>
          <label htmlFor="certificate-description" className="grid gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">Description<textarea id="certificate-description" rows="3" value={formValues.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Add a short note about this certificate" className="rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>
        </form>
      </Modal>
    </div>
  );
}
