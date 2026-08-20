import { useMemo, useState } from 'react';
import { CalendarRange, Eye, FileDown, Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import { useCreateResource, useDeleteResource, useResourceList, useUpdateResource } from '../hooks/useResourceHooks';

const defaultForm = {
  code: '',
  name: '',
  description: '',
  start_month: 1,
  end_month: 12,
  status: 'Active'
};

const pageSize = 10;
const localStorageKey = 'erp:leave-cycles';
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const getMonthName = (value) => monthNames[Number(value) - 1] || '-';
const getCycleLabel = (item) => `${getMonthName(item.start_month)} - ${getMonthName(item.end_month)}`;
const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const readLocalCycles = () => {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(localStorageKey) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocalCycles = (items) => {
  if (typeof window !== 'undefined') window.localStorage.setItem(localStorageKey, JSON.stringify(items));
};

export default function HRMLeaveCyclePage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [localCycles, setLocalCycles] = useState(readLocalCycles);

  const { data: cyclesData, isLoading } = useResourceList('leaveCycles', { page: 1, pageSize: 100 });
  const createCycle = useCreateResource('leaveCycles');
  const updateCycle = useUpdateResource('leaveCycles');
  const deleteCycle = useDeleteResource('leaveCycles');

  const cycles = useMemo(() => {
    const merged = [...localCycles, ...(cyclesData?.items || [])];
    return [...new Map(merged.map((item) => [String(item.id), item])).values()];
  }, [cyclesData, localCycles]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cycles.filter((item) => {
      const matchesSearch = !q || [item.code, item.name, item.description, item.status, getCycleLabel(item)].filter(Boolean).join(' ').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || (item.status || 'Active') === statusFilter;
      const matchesMonth = monthFilter === 'All' || String(item.start_month || 1) === monthFilter || String(item.end_month || 12) === monthFilter;
      return matchesSearch && matchesStatus && matchesMonth;
    });
  }, [cycles, monthFilter, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleCycles = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const resetFilters = () => { setSearch(''); setStatusFilter('All'); setMonthFilter('All'); setCurrentPage(1); };

  const openAdd = () => {
    setIsEditing(false);
    setSelected(null);
    setForm(defaultForm);
    setIsOpen(true);
  };

  const openEdit = (item) => {
    setIsEditing(true);
    setSelected(item);
    setForm({
      code: item.code || '',
      name: item.name || '',
      description: item.description || '',
      start_month: item.start_month ?? 1,
      end_month: item.end_month ?? 12,
      status: item.status || 'Active',
    });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelected(null);
    setForm(defaultForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const code = form.code.trim();
    const name = form.name.trim();

    if (!code || !name) {
      toast.error('Code and name are required.');
      return;
    }
    if (Number(form.start_month) > Number(form.end_month)) {
      toast.error('End month must be after the start month.');
      return;
    }

    const payload = {
      code,
      name,
      description: form.description.trim() || null,
      start_month: Number(form.start_month),
      end_month: Number(form.end_month),
      status: form.status,
    };

    try {
      if (isEditing && selected) {
        const updated = await updateCycle.mutateAsync({ id: selected.id, payload });
        const nextItem = { ...selected, ...payload, ...(updated || {}) };
        const nextLocal = localCycles.some((item) => String(item.id) === String(selected.id))
          ? localCycles.map((item) => String(item.id) === String(selected.id) ? nextItem : item)
          : [...localCycles, nextItem];
        setLocalCycles(nextLocal);
        writeLocalCycles(nextLocal);
        toast.success('Leave cycle updated successfully');
      } else {
        const created = await createCycle.mutateAsync(payload);
        const nextItem = { ...payload, ...(created || {}), id: created?.id || `local-cycle-${Date.now()}`, createdAt: created?.createdAt || new Date().toISOString() };
        const nextLocal = [nextItem, ...localCycles];
        setLocalCycles(nextLocal);
        writeLocalCycles(nextLocal);
        toast.success('Leave cycle created successfully');
      }
      closeModal();
    } catch {
      const fallbackItem = { ...payload, id: selected?.id || `local-cycle-${Date.now()}`, createdAt: selected?.createdAt || new Date().toISOString() };
      const nextLocal = isEditing && selected
        ? localCycles.map((item) => String(item.id) === String(selected.id) ? { ...item, ...fallbackItem } : item)
        : [fallbackItem, ...localCycles];
      setLocalCycles(nextLocal);
      writeLocalCycles(nextLocal);
      toast.success(isEditing ? 'Leave cycle updated locally' : 'Leave cycle saved locally');
      closeModal();
    }
  };

  const handleDelete = async (item) => {
    if (!item?.id || !window.confirm(`Delete leave cycle "${item.name}"?`)) return;
    await deleteCycle.mutateAsync(item.id).catch(() => null);
    const nextLocal = localCycles.filter((cycle) => String(cycle.id) !== String(item.id));
    setLocalCycles(nextLocal);
    writeLocalCycles(nextLocal);
    toast.success('Leave cycle deleted successfully');
  };

  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-5 border-b border-slate-200/80 pb-4">
          <div className="mb-3 flex items-center gap-3">
            <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'HRM Master', to: '/settings/hrm' }, { label: 'Leave Cycle Master' }]} />
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-600">HRM Master</p><h1 className="mt-1 text-[16px] font-medium tracking-tight text-slate-900">HRM Leave Cycle Master</h1></div>
            <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"><FileDown className="h-3.5 w-3.5" /> Print</button><button type="button" onClick={openAdd} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f5132] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0d432b]"><Plus className="h-3.5 w-3.5" /> Add New Cycle</button></div>
          </div>
        </div>

        <section className="mb-5 rounded-[16px] border border-slate-200 bg-white p-3 shadow-sm"><div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-800"><Search className="h-3.5 w-3.5" /> Filters &amp; Search</div><div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4"><label htmlFor="leave-cycle-search" className="text-[10px] font-semibold text-slate-600">Cycle code or name<input id="leave-cycle-search" name="leave_cycle_search" value={search} onChange={(event) => { setSearch(event.target.value); setCurrentPage(1); }} placeholder="Search leave cycle..." className="mt-1 h-[20px] w-full rounded-md border border-slate-200 px-2 text-[10px] font-normal outline-none focus:border-emerald-400" /></label><label htmlFor="leave-cycle-month-filter" className="text-[10px] font-semibold text-slate-600">Cycle month<select id="leave-cycle-month-filter" name="leave_cycle_month_filter" value={monthFilter} onChange={(event) => { setMonthFilter(event.target.value); setCurrentPage(1); }} className="mt-1 h-[20px] w-full rounded-md border border-slate-200 px-2 text-[10px] font-normal outline-none focus:border-emerald-400"><option value="All">All</option>{monthNames.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select></label><label htmlFor="leave-cycle-status-filter" className="text-[10px] font-semibold text-slate-600">Status<select id="leave-cycle-status-filter" name="leave_cycle_status_filter" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1); }} className="mt-1 h-[20px] w-full rounded-md border border-slate-200 px-2 text-[10px] font-normal outline-none focus:border-emerald-400"><option>All</option><option>Active</option><option>Inactive</option></select></label><div className="flex items-end justify-end gap-2"><button type="button" onClick={() => setCurrentPage(1)} className="inline-flex items-center gap-1 rounded-lg bg-[#0f5132] px-3 py-1.5 text-[10px] font-semibold text-white"><Search className="h-3 w-3" /> Search</button><button type="button" onClick={resetFilters} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"><RotateCcw className="h-3 w-3" /> Reset</button></div></div></section>

        <section className="flex-1 overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5"><div className="flex items-center gap-2 text-xs font-semibold text-slate-800"><CalendarRange className="h-3.5 w-3.5" /> Leave Cycle List</div><span className="text-[10px] text-slate-500">Showing {visibleCycles.length} of {filtered.length} entries</span></div><div className="overflow-x-auto"><table className="min-w-full border-collapse text-center text-[10px]"><thead><tr className="bg-[#0f5132] text-white"><th className="border-r border-white/30 px-3 py-2.5 font-semibold">S.No.</th>
                    <th className="border-r border-white/30 px-4 py-3 font-semibold">Code</th>
                    <th className="border-r border-white/30 px-4 py-3 font-semibold">Name</th>
                    <th className="border-r border-white/30 px-4 py-3 font-semibold">Cycle</th>
                    <th className="border-r border-white/30 px-3 py-2.5 font-semibold">Description</th>
                    <th className="border-r border-white/30 px-3 py-2.5 font-semibold">Created On</th>
                    <th className="border-r border-white/30 px-3 py-2.5 font-semibold">Status</th>
                    <th className="px-3 py-2.5 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>{isLoading ? <tr><td colSpan="8" className="py-12 text-center text-slate-500">Loading leave cycles...</td></tr> : visibleCycles.length === 0 ? <tr><td colSpan="8" className="py-12 text-center text-slate-500">No leave cycles found.</td></tr> : visibleCycles.map((item, index) => <tr key={item.id} className="border-b border-slate-200 text-slate-700 odd:bg-slate-50/50 hover:bg-emerald-50/30"><td className="border-r border-white px-3 py-2">{(currentPage - 1) * pageSize + index + 1}</td><td className="border-r border-white px-3 py-2 font-semibold text-slate-900">{item.code || '-'}</td><td className="border-r border-white px-3 py-2 font-semibold text-slate-900">{item.name || '-'}</td><td className="border-r border-white px-3 py-2">{getCycleLabel(item)}</td><td className="max-w-[220px] truncate border-r border-white px-3 py-2 text-left" title={item.description || ''}>{item.description || '-'}</td><td className="border-r border-white px-3 py-2">{formatDate(item.created_at || item.createdAt)}</td><td className="border-r border-white px-3 py-2"><span className="rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-700">{item.status || 'Active'}</span></td><td className="px-3 py-2"><div className="flex justify-center gap-1"><button type="button" onClick={() => { setSelected(item); setIsViewOpen(true); }} aria-label="View leave cycle" title="View" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"><Eye className="h-3 w-3" /></button><button type="button" onClick={() => openEdit(item)} aria-label="Edit leave cycle" title="Edit" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"><Pencil className="h-3 w-3" /></button><button type="button" onClick={() => handleDelete(item)} aria-label="Delete leave cycle" title="Delete" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50"><Trash2 className="h-3 w-3" /></button></div></td></tr>)}</tbody></table></div><div className="flex flex-col gap-2 border-t border-slate-200 px-3 py-3 text-[10px] text-slate-600 sm:flex-row sm:items-center sm:justify-between"><span>Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries</span><div className="flex items-center gap-1"><button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="rounded-md border border-slate-200 px-2 py-1 disabled:opacity-40">Previous</button>{Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 5).map((page) => <button key={page} type="button" onClick={() => setCurrentPage(page)} className={`rounded-md border px-2.5 py-1 ${page === currentPage ? 'border-[#0f5132] bg-[#0f5132] text-white' : 'border-slate-200 bg-white'}`}>{page}</button>)}<button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="rounded-md border border-slate-200 px-2 py-1 disabled:opacity-40">Next</button></div></div></section>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">{isEditing ? 'Edit Leave Cycle' : 'Add Leave Cycle'}</h2>
              <button type="button" onClick={closeModal} className="text-slate-500 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label htmlFor="leave-cycle-code" className="block text-sm font-medium text-slate-700">
                  Code
                  <input id="leave-cycle-code" name="code" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} aria-label="Leave cycle code" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </label>
                <label htmlFor="leave-cycle-name" className="block text-sm font-medium text-slate-700">
                  Name
                  <input id="leave-cycle-name" name="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-label="Leave cycle name" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </label>
              </div>

              <label htmlFor="leave-cycle-description" className="block text-sm font-medium text-slate-700">
                Description
                <textarea id="leave-cycle-description" name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} aria-label="Leave cycle description" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label htmlFor="leave-cycle-start-month" className="block text-sm font-medium text-slate-700">
                  Start month
                  <select id="leave-cycle-start-month" name="start_month" value={form.start_month} onChange={(e) => setForm({ ...form, start_month: Number(e.target.value) })} aria-label="Leave cycle start month" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                    {monthNames.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}
                  </select>
                </label>
                <label htmlFor="leave-cycle-end-month" className="block text-sm font-medium text-slate-700">
                  End month
                  <select id="leave-cycle-end-month" name="end_month" value={form.end_month} onChange={(e) => setForm({ ...form, end_month: Number(e.target.value) })} aria-label="Leave cycle end month" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                    {monthNames.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}
                  </select>
                </label>
              </div>

              <label htmlFor="leave-cycle-status" className="block text-sm font-medium text-slate-700">
                Status
                <select id="leave-cycle-status" name="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} aria-label="Leave cycle status" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">{isEditing ? 'Save Changes' : 'Create Cycle'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isViewOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-900">Leave Cycle Details</h2><button type="button" onClick={() => { setIsViewOpen(false); setSelected(null); }} aria-label="Close details" className="text-slate-500 hover:text-slate-700">X</button></div>
            <div className="grid gap-3 text-xs text-slate-700"><p><strong>Code:</strong> {selected.code || '-'}</p><p><strong>Name:</strong> {selected.name || '-'}</p><p><strong>Cycle:</strong> {getCycleLabel(selected)}</p><p><strong>Description:</strong> {selected.description || '-'}</p><p><strong>Status:</strong> {selected.status || 'Active'}</p><p><strong>Created On:</strong> {formatDate(selected.created_at || selected.createdAt)}</p></div>
            <div className="mt-5 flex justify-end"><button type="button" onClick={() => { setIsViewOpen(false); setSelected(null); }} className="rounded-lg bg-[#0f5132] px-3 py-1.5 text-xs font-semibold text-white">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
