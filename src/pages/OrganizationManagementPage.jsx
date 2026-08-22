import { useMemo, useState } from 'react';
import { ArrowLeft, Building2, Download, Eye, FileDown, MapPin, Pencil, Plus, RotateCcw, Search, Trash2, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import { useCreateResource, useDeleteResource, useResourceList, useUpdateResource } from '../hooks/useResourceHooks';

const defaults = { code: '', name: '', head: '', officeLocation: '', address: '', email: '', phone: '', status: 'Active' };
const localStorageKey = 'erp:organizations';
const getLocation = (item) => item.officeLocation || item.location || '-';

const readLocalOrganizations = () => {
  if (typeof window === 'undefined') return [];
  try {
    const items = JSON.parse(window.localStorage.getItem(localStorageKey) || '[]');
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
};

export default function OrganizationManagementPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(defaults);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [location, setLocation] = useState('All');
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [localOrganizations, setLocalOrganizations] = useState(readLocalOrganizations);
  const { data } = useResourceList('organizations', { page: 1, pageSize: 500 });
  const createOrganization = useCreateResource('organizations');
  const updateOrganization = useUpdateResource('organizations');
  const deleteOrganization = useDeleteResource('organizations');
  const organizations = useMemo(() => {
    const merged = [...(data?.items || []), ...localOrganizations];
    return [...new Map(merged.map((item) => [String(item.id), item])).values()];
  }, [data, localOrganizations]);
  const locations = useMemo(() => [...new Set(organizations.map(getLocation).filter((item) => item !== '-'))].sort(), [organizations]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return organizations.filter((item) => {
      const matchesSearch = !query || [item.code, item.name, item.head, getLocation(item), item.email].filter(Boolean).join(' ').toLowerCase().includes(query);
      return matchesSearch && (status === 'All' || (item.status || 'Active') === status) && (location === 'All' || getLocation(item) === location);
    });
  }, [organizations, search, status, location]);
  const active = organizations.filter((item) => (item.status || 'Active') === 'Active').length;
  const heads = new Set(organizations.map((item) => item.head).filter(Boolean)).size;
  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const openAdd = () => { setEditing(null); setForm(defaults); setIsOpen(true); };
  const openEdit = (item) => { setEditing(item); setForm({ ...defaults, ...item, officeLocation: getLocation(item) }); setIsOpen(true); };
  const closeModal = () => { setIsOpen(false); setEditing(null); setForm(defaults); };

  const submit = async (event) => {
    event.preventDefault();
    const payload = { ...form, code: form.code.trim().toUpperCase(), name: form.name.trim(), head: form.head.trim(), officeLocation: form.officeLocation.trim(), address: form.address.trim(), email: form.email.trim(), phone: form.phone.trim() };
    if (!payload.code || !payload.name || !payload.head || !payload.officeLocation) { toast.error('Code, name, head and location are required.'); return; }
    try {
      const saved = editing
        ? await updateOrganization.mutateAsync({ id: editing.id, payload })
        : await createOrganization.mutateAsync(payload);
      const savedItem = { ...payload, ...(saved || {}), id: saved?.id || editing?.id || `local-org-${Date.now()}` };
      const nextLocal = editing
        ? localOrganizations.map((item) => String(item.id) === String(savedItem.id) ? savedItem : item)
        : [savedItem, ...localOrganizations];
      setLocalOrganizations(nextLocal);
      window.localStorage.setItem(localStorageKey, JSON.stringify(nextLocal));
      toast.success(editing ? 'Organization updated successfully' : 'Organization created successfully');
      closeModal();
    } catch {
      const fallbackItem = { ...payload, id: editing?.id || `local-org-${Date.now()}` };
      const nextLocal = editing
        ? localOrganizations.map((item) => String(item.id) === String(fallbackItem.id) ? fallbackItem : item)
        : [fallbackItem, ...localOrganizations];
      setLocalOrganizations(nextLocal);
      window.localStorage.setItem(localStorageKey, JSON.stringify(nextLocal));
      toast.success(editing ? 'Organization saved locally' : 'Organization added locally');
      closeModal();
    }
  };
  const remove = async (item) => {
    if (!window.confirm(`Delete organization ${item.name}?`)) return;
    await deleteOrganization.mutateAsync(item.id).catch(() => null);
    const nextLocal = localOrganizations.filter((organization) => String(organization.id) !== String(item.id));
    setLocalOrganizations(nextLocal);
    window.localStorage.setItem(localStorageKey, JSON.stringify(nextLocal));
    toast.success('Organization deleted successfully');
  };
  const exportCsv = () => {
    const headers = ['Code', 'Organization', 'Head', 'Location', 'Email', 'Phone', 'Status'];
    const rows = filtered.map((item) => [item.code, item.name, item.head, getLocation(item), item.email || '-', item.phone || '-', item.status || 'Active']);
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = 'organization-directory.csv'; link.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-5 border-b border-slate-200/80 pb-4">
          <div className="mb-3 flex items-center gap-2 text-[10px] text-slate-500"><Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'HRM Master', to: '/settings/hrm' }, { label: 'Organization Management' }]} /></div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-600">HRM Master</p><h1 className="mt-1 text-[20px] font-semibold tracking-tight text-slate-900 sm:text-[24px]">Organization Management</h1><p className="mt-1 text-[11px] text-slate-400">Manage entities, branches, reporting heads and office locations from one directory.</p></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"><FileDown className="h-3.5 w-3.5" /> Print</button><button type="button" onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"><Download className="h-3.5 w-3.5" /> Export</button><button type="button" onClick={openAdd} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f5132] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0d432b]"><Plus className="h-3.5 w-3.5" /> Add organization</button></div></div>
        </div>

        <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[[Building2, 'Total units', organizations.length, 'Registered entities'], [null, 'Active units', active, 'Operational locations'], [MapPin, 'Locations', locations.length, 'Branches and offices'], [Users, 'Reporting heads', heads, 'Unique responsible leads']].map(([Icon, label, value, hint]) => <div key={label} className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>{Icon ? <Icon className="h-4 w-4 text-emerald-600" /> : <span className="h-2 w-2 rounded-full bg-emerald-500" />}</div><p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p><p className="mt-1 text-[10px] text-slate-400">{hint}</p></div>)}</section>

        <section className="mb-5 rounded-[16px] border border-slate-200 bg-white p-3 shadow-sm"><div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-800"><Search className="h-3.5 w-3.5" /> Filters &amp; Search</div><div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4"><label htmlFor="organization-search" className="text-[10px] font-semibold text-slate-600">Search directory<input id="organization-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Code, name, head, location..." className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] font-normal outline-none focus:border-emerald-400" /></label><label htmlFor="organization-status" className="text-[10px] font-semibold text-slate-600">Status<select id="organization-status" value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400"><option>All</option><option>Active</option><option>Inactive</option></select></label><label htmlFor="organization-location" className="text-[10px] font-semibold text-slate-600">Office location<select id="organization-location" value={location} onChange={(event) => setLocation(event.target.value)} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400"><option>All</option>{locations.map((item) => <option key={item}>{item}</option>)}</select></label><button type="button" onClick={() => { setSearch(''); setStatus('All'); setLocation('All'); }} className="inline-flex h-[28px] w-fit items-center justify-self-start gap-1 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-semibold text-slate-600 hover:bg-slate-100"><RotateCcw className="h-3 w-3" /> Reset</button></div></section>

        <section className="flex-1 overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5"><div className="flex items-center gap-2 text-xs font-semibold text-slate-800"><Building2 className="h-3.5 w-3.5" /> Organization Directory</div><span className="text-[10px] text-slate-500">Showing {filtered.length} of {organizations.length} units</span></div><div className="overflow-x-auto"><table className="min-w-[980px] w-full border-collapse text-center text-[10px]"><thead><tr className="bg-[#0f5132] text-white"><th className="border-r border-white/30 px-3 py-2.5">S.No.</th><th className="border-r border-white/30 px-3 py-2.5">Code</th><th className="border-r border-white/30 px-3 py-2.5 text-left">Organization</th><th className="border-r border-white/30 px-3 py-2.5">Head</th><th className="border-r border-white/30 px-3 py-2.5">Location</th><th className="border-r border-white/30 px-3 py-2.5">Contact</th><th className="border-r border-white/30 px-3 py-2.5">Status</th><th className="px-3 py-2.5">Actions</th></tr></thead><tbody>{filtered.length === 0 ? <tr><td colSpan="8" className="py-12 text-center text-slate-500">No organizations found.</td></tr> : filtered.map((item, index) => <tr key={item.id} className="border-b border-slate-200 text-slate-700 odd:bg-slate-50/50 hover:bg-emerald-50/30"><td className="border-r border-white px-3 py-2">{index + 1}</td><td className="border-r border-white px-3 py-2 font-semibold text-emerald-700">{item.code || '-'}</td><td className="border-r border-white px-3 py-2 text-left font-semibold text-slate-900">{item.name || '-'}<span className="block text-[9px] font-normal text-slate-400">{item.address || 'Address not specified'}</span></td><td className="border-r border-white px-3 py-2">{item.head || '-'}</td><td className="border-r border-white px-3 py-2">{getLocation(item)}</td><td className="border-r border-white px-3 py-2 text-left">{item.email || '-'}<span className="block text-[9px] text-slate-400">{item.phone || '-'}</span></td><td className="border-r border-white px-3 py-2"><span className={`rounded-md px-2 py-1 text-[9px] font-semibold ${(item.status || 'Active') === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{item.status || 'Active'}</span></td><td className="px-3 py-2"><div className="flex justify-center gap-1"><button type="button" onClick={() => setViewing(item)} aria-label="View organization" title="View" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"><Eye className="h-3 w-3" /></button><button type="button" onClick={() => openEdit(item)} aria-label="Edit organization" title="Edit" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"><Pencil className="h-3 w-3" /></button><button type="button" onClick={() => remove(item)} aria-label="Delete organization" title="Delete" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-rose-600 hover:bg-rose-50"><Trash2 className="h-3 w-3" /></button></div></td></tr>)}</tbody></table></div></section>
      </div>

      {isOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"><div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">Organization master</p><h2 className="text-xl font-semibold text-slate-900">{editing ? 'Edit organization' : 'Add organization'}</h2></div><button type="button" onClick={closeModal} aria-label="Close organization form"><X className="h-4 w-4 text-slate-500" /></button></div><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">{[['code', 'Unit code', 'ORG-001'], ['name', 'Organization name', 'Central Administration'], ['head', 'Reporting head', 'Head of organization'], ['officeLocation', 'Office location', 'Main campus'], ['address', 'Address', 'Building, street, city'], ['email', 'Contact email', 'office@example.com'], ['phone', 'Contact phone', '+91 00000 00000']].map(([key, label, placeholder]) => <label key={key} className={`text-sm font-medium text-slate-700 ${key === 'address' ? 'sm:col-span-2' : ''}`}>{label}<input required={['code', 'name', 'head', 'officeLocation'].includes(key)} type={key === 'email' ? 'email' : 'text'} value={form[key]} onChange={(event) => updateField(key, event.target.value)} placeholder={placeholder} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500" /></label>)}<label className="text-sm font-medium text-slate-700">Status<select value={form.status} onChange={(event) => updateField('status', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500"><option>Active</option><option>Inactive</option></select></label><div className="flex justify-end gap-3 pt-3 sm:col-span-2"><button type="button" onClick={closeModal} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700">Cancel</button><button type="submit" disabled={createOrganization.isPending || updateOrganization.isPending} className="rounded-lg bg-[#0f5132] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{editing ? 'Save changes' : 'Create organization'}</button></div></form></div></div>}
      {viewing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">Organization record</p><h2 className="text-xl font-semibold text-slate-900">Unit details</h2></div><button type="button" onClick={() => setViewing(null)} aria-label="Close organization details"><X className="h-4 w-4 text-slate-500" /></button></div><div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5 text-center"><p className="text-xs text-emerald-700">Organization code</p><p className="mt-2 font-mono text-2xl font-semibold text-emerald-950">{viewing.code || '-'}</p></div><div className="mt-4 grid gap-3 text-sm text-slate-700"><p><strong>Name:</strong> {viewing.name || '-'}</p><p><strong>Reporting head:</strong> {viewing.head || '-'}</p><p><strong>Location:</strong> {getLocation(viewing)}</p><p><strong>Address:</strong> {viewing.address || '-'}</p><p><strong>Contact:</strong> {viewing.email || '-'} · {viewing.phone || '-'}</p><p><strong>Status:</strong> {viewing.status || 'Active'}</p></div><div className="mt-5 flex justify-end"><button type="button" onClick={() => setViewing(null)} className="rounded-lg bg-[#0f5132] px-4 py-2 text-xs font-semibold text-white">Close</button></div></div></div>}
    </div>
  );
}

