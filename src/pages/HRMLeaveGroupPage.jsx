import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Download, Eye, FileDown, Pencil, Plus, RotateCcw, Search, Trash2, Upload } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Modal from '../components/ui/Modal.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { useBulkImport, useCreateResource, useDeleteResource, useResourceList, useUpdateResource } from '../hooks/useResourceHooks';

const emptyForm = { code: '', name: '', description: '', annual_allocation_days: '', carry_forward_days: '', status: 'Active' };
const pageSizeOptions = [10, 25, 50];
const localStorageKey = 'erp:leave-groups:pending';

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatNumber = (value) => value === null || value === undefined || value === '' ? '-' : value;

function Field({ id, label, children, className = '' }) {
  return <label htmlFor={id} className={`block text-[10px] font-semibold text-slate-600 ${className}`}>{label}{children}</label>;
}

export default function HRMLeaveGroupPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [localGroups, setLocalGroups] = useState(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(window.localStorage.getItem(localStorageKey) || '[]'); } catch { return []; }
  });
  const [hiddenGroupIds, setHiddenGroupIds] = useState([]);
  const uploadInputRef = useRef(null);

  const { data: groupsData, isLoading } = useResourceList('leaveGroups', { page: 1, pageSize: 100 });
  const createGroup = useCreateResource('leaveGroups');
  const updateGroup = useUpdateResource('leaveGroups');
  const deleteGroup = useDeleteResource('leaveGroups');
  const bulkImport = useBulkImport('leaveGroups');
  const groups = useMemo(() => {
    const serverGroups = (groupsData?.items || []).filter((group) => !hiddenGroupIds.includes(String(group.id)));
    const mergedGroups = serverGroups.map((serverGroup) => {
      const localGroup = localGroups.find((group) => String(group.id) === String(serverGroup.id) || String(group.code).toLowerCase() === String(serverGroup.code).toLowerCase());
      return localGroup ? { ...serverGroup, ...localGroup } : serverGroup;
    });
    const serverKeys = new Set(serverGroups.flatMap((group) => [String(group.id), String(group.code).toLowerCase()]));
    return [...localGroups.filter((group) => !serverKeys.has(String(group.id)) && !serverKeys.has(String(group.code).toLowerCase()) && !hiddenGroupIds.includes(String(group.id))), ...mergedGroups];
  }, [groupsData, localGroups, hiddenGroupIds]);

  useEffect(() => {
    window.localStorage.setItem(localStorageKey, JSON.stringify(localGroups));
  }, [localGroups]);

  const filteredGroups = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return groups.filter((group) => {
      const searchable = [group.name, group.code, group.description, group.status].filter(Boolean).join(' ').toLowerCase();
      return (!query || searchable.includes(query)) && (statusFilter === 'All' || (group.status || 'Active') === statusFilter);
    }).sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
  }, [groups, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / pageSize));
  const visibleGroups = filteredGroups.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetFilters = () => { setSearchTerm(''); setStatusFilter('All'); setCurrentPage(1); };
  const openCreate = () => { setIsEditing(false); setSelectedGroup(null); setForm(emptyForm); setIsFormOpen(true); };
  const openEdit = (group) => {
    setIsEditing(true);
    setSelectedGroup(group);
    setForm({ code: group.code || '', name: group.name || '', description: group.description || '', annual_allocation_days: group.annual_allocation_days ?? '', carry_forward_days: group.carry_forward_days ?? '', status: group.status || 'Active' });
    setIsFormOpen(true);
  };
  const closeForm = () => { setIsFormOpen(false); setIsEditing(false); setSelectedGroup(null); setForm(emptyForm); };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const code = form.code.trim();
    const name = form.name.trim();
    if (!code || !name) { toast.error('Leave group name and code are required.'); return; }
    const payload = { code, name, description: form.description.trim() || null, annual_allocation_days: form.annual_allocation_days === '' ? null : Number(form.annual_allocation_days), carry_forward_days: form.carry_forward_days === '' ? null : Number(form.carry_forward_days), status: form.status };
    try {
      if (isEditing && selectedGroup?.id) {
        const updated = await updateGroup.mutateAsync({ id: selectedGroup.id, payload });
        const updatedGroup = { ...selectedGroup, ...updated, ...payload };
        setLocalGroups((current) => [...current.filter((group) => String(group.id) !== String(selectedGroup.id)), updatedGroup]);
        queryClient.setQueriesData({ queryKey: ['leaveGroups'], exact: false }, (current) => {
          if (!current?.items) return current;
          return { ...current, items: current.items.map((item) => String(item.id) === String(selectedGroup.id) ? { ...item, ...updated, ...payload } : item) };
        });
        toast.success('Leave group updated successfully');
      } else {
        const created = await createGroup.mutateAsync(payload);
        const responseId = created?.id ?? created?._id ?? created?.uuid;
        const createdGroup = {
          ...payload,
          ...(created || {}),
          id: responseId || `local-leave-group-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        };
        if (createdGroup.id) {
          setLocalGroups((current) => [...current.filter((group) => String(group.id) !== String(createdGroup.id)), createdGroup]);
        }
        queryClient.setQueriesData({ queryKey: ['leaveGroups'], exact: false }, (current) => {
          if (!current?.items) return current;
          const retainedItems = current.items.filter((item) => item.id != null && String(item.id) !== String(createdGroup.id));
          return { ...current, items: [createdGroup, ...retainedItems], total: Math.max(Number(current.total || 0), retainedItems.length + 1) };
        });
        setCurrentPage(1);
        toast.success('Leave group created successfully');
      }
      closeForm();
    } catch (error) { toast.error(error?.message || 'Failed to save leave group'); }
  };

  const handleDelete = async (group) => {
    if (!group?.id || !window.confirm(`Delete leave group "${group.name}"? This action cannot be undone.`)) return;
    try {
      await deleteGroup.mutateAsync(group.id);
      setHiddenGroupIds((current) => [...new Set([...current, String(group.id)])]);
      setLocalGroups((current) => current.filter((item) => String(item.id) !== String(group.id)));
      toast.success('Leave group deleted successfully');
    } catch (error) { toast.error(error?.message || 'Failed to delete leave group'); }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    setIsUploadOpen(false);
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      await bulkImport.mutateAsync(formData);
      toast.success('Leave groups imported successfully');
    } catch (error) { toast.error(error?.message || 'Leave group import failed'); }
  };

  const exportCsv = () => {
    const headers = ['Leave Group Name', 'Group Code', 'Description', 'Annual Allocation Days', 'Carry Forward Days', 'Status'];
    const rows = filteredGroups.map((group) => [group.name, group.code, group.description, group.annual_allocation_days, group.carry_forward_days, group.status || 'Active']);
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = 'leave-group-records.csv'; link.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <style>{'table[class*="min-w-[980px]"] col:first-child { width: 100px; min-width: 100px; }'}</style>
      <div className="flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-5 border-b border-slate-200/80 pb-4">
          <div className="mb-3 flex items-center gap-3"><Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'HRM Master', to: '/settings/hrm' }, { label: 'Leave Group Master' }]} /></div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-600">HRM Master</p><h1 className="mt-1 text-[24px] font-semibold tracking-tight text-slate-900">Leave Group Master</h1><p className="mt-1 text-[11px] text-slate-400">Manage leave policy groups, allocation limits and carry-forward rules.</p></div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-[#0f5132] bg-white px-3 py-2 text-[10px] font-semibold text-[#0f5132] hover:bg-emerald-50"><FileDown className="h-3.5 w-3.5" /> Print</button>
              <div className="relative"><button type="button" onClick={() => setIsUploadOpen((open) => !open)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#0f5132] bg-white px-3 py-2 text-[10px] font-semibold text-[#0f5132] hover:bg-emerald-50"><Upload className="h-3.5 w-3.5" /> Upload <ChevronDown className="h-3 w-3" /></button>{isUploadOpen && <div className="absolute right-0 top-9 z-20 w-28 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"><button type="button" onClick={() => uploadInputRef.current?.click()} className="block w-full rounded-md px-2 py-1.5 text-left text-[10px] text-slate-700 hover:bg-slate-100">Upload</button><button type="button" onClick={() => uploadInputRef.current?.click()} className="block w-full rounded-md px-2 py-1.5 text-left text-[10px] text-slate-700 hover:bg-slate-100">Import</button></div>}<input ref={uploadInputRef} id="leave-group-import-file" name="leave_group_import_file" type="file" accept=".csv,.xlsx,.xls" onChange={handleImport} className="hidden" /></div>
              <button type="button" onClick={openCreate} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f5132] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#0d432b]"><Plus className="h-3.5 w-3.5" /> Add New Leave Group</button>
            </div>
          </div>
        </div>

        <section className="mb-5 rounded-[16px] border border-slate-200 bg-white p-3 shadow-sm"><div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-800"><Search className="h-3.5 w-3.5" /> Search &amp; Filter</div><div className="flex flex-col gap-2 lg:flex-row lg:items-end"><Field id="leave-group-search" label="Search leave group" className="w-full lg:w-[300px]"><input id="leave-group-search" name="search" value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1); }} placeholder="Name, code or description..." className="mt-1 h-[20px] w-full rounded-md border border-slate-200 px-2 text-[10px] font-normal text-slate-700 outline-none focus:border-emerald-400" /></Field><Field id="leave-group-status-filter" label="Status" className="w-full lg:w-[300px]"><select id="leave-group-status-filter" name="status_filter" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1); }} className="mt-1 h-[20px] w-full rounded-md border border-slate-200 px-2 text-[10px] font-normal text-slate-700 outline-none focus:border-emerald-400"><option>All</option><option>Active</option><option>Inactive</option></select></Field><button type="button" onClick={resetFilters} className="inline-flex h-[20px] items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"><RotateCcw className="h-3 w-3" /> Reset</button></div></section>

        <section className="flex-1 overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-2 border-b border-slate-200 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xs font-semibold text-slate-800">Leave Group Records</h2><p className="mt-0.5 text-[10px] text-slate-400">Manage configured leave policy groups.</p></div><div className="flex items-center gap-2"><button type="button" onClick={exportCsv} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[10px] text-slate-700 hover:bg-slate-100"><Download className="h-3 w-3" /> CSV</button><label htmlFor="leave-group-page-size" className="text-[10px] text-slate-500">Rows</label><select id="leave-group-page-size" name="page_size" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setCurrentPage(1); }} className="h-[20px] rounded-md border border-slate-200 px-1 text-[10px]">{pageSizeOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></div></div><div className="overflow-x-auto"><table className="min-w-[980px] w-full border-collapse text-center text-[10px]"><colgroup><col className="w-[60px]" /><col className="w-[180px]" /><col className="w-[110px]" /><col className="w-[220px]" /><col className="w-[130px]" /><col className="w-[150px]" /><col className="w-[95px]" /><col className="w-[110px]" /></colgroup><thead><tr className="bg-[#0f5132] text-white"><th className="border-r border-white px-2 py-2.5 font-semibold">S.No.</th><th className="border-r border-white px-2 py-2.5 font-semibold">Leave Group Name</th><th className="border-r border-white px-2 py-2.5 font-semibold">Group Code</th><th className="border-r border-white px-2 py-2.5 font-semibold">Description</th><th className="border-r border-white px-2 py-2.5 font-semibold">Annual Days</th><th className="border-r border-white px-2 py-2.5 font-semibold">Carry Forward</th><th className="border-r border-white px-2 py-2.5 font-semibold">Status</th><th className="px-2 py-2.5 font-semibold">Actions</th></tr></thead><tbody>{isLoading ? <tr><td colSpan="8" className="py-12 text-slate-500">Loading leave groups...</td></tr> : visibleGroups.length === 0 ? <tr><td colSpan="8" className="py-12 text-slate-500">No leave groups found.</td></tr> : visibleGroups.map((group, index) => <tr key={group.id} className="border-b border-slate-200 text-slate-700 odd:bg-slate-50/50 hover:bg-emerald-50/30"><td className="border-r border-slate-200 px-2 py-2">{(currentPage - 1) * pageSize + index + 1}</td><td className="border-r border-slate-200 px-2 py-2 font-semibold text-slate-900">{group.name}</td><td className="border-r border-slate-200 px-2 py-2 font-medium">{group.code}</td><td className="border-r border-slate-200 px-2 py-2 text-slate-500">{group.description || '-'}</td><td className="border-r border-slate-200 px-2 py-2">{formatNumber(group.annual_allocation_days)}</td><td className="border-r border-slate-200 px-2 py-2">{formatNumber(group.carry_forward_days)}</td><td className="border-r border-slate-200 px-2 py-2"><StatusBadge status={group.status || 'Active'} /></td><td className="px-2 py-2"><div className="flex justify-center gap-1"><button type="button" onClick={() => { setSelectedGroup(group); setIsViewOpen(true); }} className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100" title="View" aria-label={`View ${group.name}`}><Eye className="h-3 w-3" /></button><button type="button" onClick={() => openEdit(group)} className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700" title="Edit" aria-label={`Edit ${group.name}`}><Pencil className="h-3 w-3" /></button><button type="button" onClick={() => handleDelete(group)} className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50" title="Delete" aria-label={`Delete ${group.name}`}><Trash2 className="h-3 w-3" /></button></div></td></tr>)}</tbody></table></div><div className="flex flex-col gap-2 border-t border-slate-200 px-3 py-3 text-[10px] text-slate-600 sm:flex-row sm:items-center sm:justify-between"><span>Showing {filteredGroups.length ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredGroups.length)} of {filteredGroups.length} entries</span><div className="flex items-center gap-1"><button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="rounded-md border border-slate-200 px-2 py-1 disabled:opacity-40">Previous</button>{Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 5).map((page) => <button key={page} type="button" onClick={() => setCurrentPage(page)} className={`rounded-md border px-2.5 py-1 ${page === currentPage ? 'border-[#0f5132] bg-[#0f5132] text-white' : 'border-slate-200 bg-white'}`}>{page}</button>)}<button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="rounded-md border border-slate-200 px-2 py-1 disabled:opacity-40">Next</button></div></div></section>
      </div>

      <Modal isOpen={isFormOpen} onClose={closeForm} title={isEditing ? 'Edit Leave Group' : 'Add New Leave Group'} footer={<div className="flex justify-end gap-2"><button type="button" onClick={closeForm} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100">Cancel</button><button type="submit" form="leave-group-form" disabled={createGroup.isPending || updateGroup.isPending} className="rounded-lg bg-[#0f5132] px-3 py-1.5 text-[10px] font-semibold text-white disabled:opacity-60">{createGroup.isPending || updateGroup.isPending ? 'Saving...' : 'Save'}</button></div>}><form id="leave-group-form" onSubmit={handleSubmit} className="space-y-3"><div className="grid gap-3 sm:grid-cols-2"><Field id="leave-group-name" label="Leave Group Name"><input id="leave-group-name" name="name" required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="mt-1 h-[20px] w-full rounded-md border border-slate-200 px-2 text-[10px] text-slate-700 outline-none focus:border-emerald-400" /></Field><Field id="leave-group-code" label="Group Code"><input id="leave-group-code" name="code" required value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} className="mt-1 h-[20px] w-full rounded-md border border-slate-200 px-2 text-[10px] text-slate-700 outline-none focus:border-emerald-400" /></Field></div><Field id="leave-group-description" label="Description"><textarea id="leave-group-description" name="description" rows="2" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="mt-1 min-h-[44px] w-full resize-none rounded-md border border-slate-200 px-2 py-1 text-[10px] text-slate-700 outline-none focus:border-emerald-400" /></Field><div className="grid gap-3 sm:grid-cols-3"><Field id="leave-group-annual-days" label="Annual Allocation Days"><input id="leave-group-annual-days" name="annual_allocation_days" type="number" min="0" value={form.annual_allocation_days} onChange={(event) => setForm((current) => ({ ...current, annual_allocation_days: event.target.value }))} className="mt-1 h-[20px] w-full rounded-md border border-slate-200 px-2 text-[10px] text-slate-700 outline-none focus:border-emerald-400" /></Field><Field id="leave-group-carry-days" label="Carry Forward Days"><input id="leave-group-carry-days" name="carry_forward_days" type="number" min="0" value={form.carry_forward_days} onChange={(event) => setForm((current) => ({ ...current, carry_forward_days: event.target.value }))} className="mt-1 h-[20px] w-full rounded-md border border-slate-200 px-2 text-[10px] text-slate-700 outline-none focus:border-emerald-400" /></Field><Field id="leave-group-status" label="Status"><select id="leave-group-status" name="status" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="mt-1 h-[20px] w-full rounded-md border border-slate-200 px-2 text-[10px] text-slate-700 outline-none focus:border-emerald-400"><option>Active</option><option>Inactive</option></select></Field></div></form></Modal>
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Leave Group Details" footer={<button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-[#0f5132] px-3 py-1.5 text-[10px] font-semibold text-white">Close</button>}>{selectedGroup && <div className="grid gap-3 text-xs text-slate-700 sm:grid-cols-2"><p><strong>Leave Group:</strong> {selectedGroup.name}</p><p><strong>Code:</strong> {selectedGroup.code}</p><p className="sm:col-span-2"><strong>Description:</strong> {selectedGroup.description || '-'}</p><p><strong>Annual Allocation:</strong> {formatNumber(selectedGroup.annual_allocation_days)}</p><p><strong>Carry Forward:</strong> {formatNumber(selectedGroup.carry_forward_days)}</p><p><strong>Status:</strong> {selectedGroup.status || 'Active'}</p><p><strong>Created:</strong> {formatDateTime(selectedGroup.created_at)}</p></div>}</Modal>
    </div>
  );
}
