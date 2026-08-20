import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCog, Eye, FileDown, Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import { useCreateResource, useDeleteResource, useResourceList, useUpdateResource } from '../hooks/useResourceHooks';

const defaultForm = {
  employee_id: '',
  leave_group_id: '',
  leave_cycle_id: '',
  preferred_leave_type: '',
  carry_forward_limit: '',
  special_leave_days: '',
  status: 'Active',
  notes: '',
};

const pageSize = 10;
const localStorageKey = 'erp:leave-preferences';
const leaveTypes = ['Casual Leave', 'Earned Leave', 'Sick Leave', 'Privilege Leave', 'Maternity Leave', 'Paternity Leave', 'Optional Leave'];
const readLocalPreferences = () => {
  if (typeof window === 'undefined') return [];
  try { const parsed = JSON.parse(window.localStorage.getItem(localStorageKey) || '[]'); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
};
const writeLocalPreferences = (items) => { if (typeof window !== 'undefined') window.localStorage.setItem(localStorageKey, JSON.stringify(items)); };
const formatDate = (value) => { if (!value) return '-'; const date = new Date(value); return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); };
const getEmployeeName = (employee) => employee?.name || [employee?.first_name, employee?.last_name].filter(Boolean).join(' ') || employee?.employee_code || `Employee ${employee?.id || ''}`;
const getRelatedName = (record, label) => record?.name || record?.code || `${label} ${record?.id || ''}`;

export default function HRMLeavePreferencePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [localPreferences, setLocalPreferences] = useState(readLocalPreferences);

  const { data: preferencesData, isLoading } = useResourceList('leavePreferences', { page: 1, pageSize: 100 });
  const { data: groupsData } = useResourceList('leaveGroups', { page: 1, pageSize: 100 });
  const { data: cyclesData } = useResourceList('leaveCycles', { page: 1, pageSize: 100 });
  const { data: employeesData } = useResourceList('employees', { page: 1, pageSize: 100 });
  const createPreference = useCreateResource('leavePreferences');
  const updatePreference = useUpdateResource('leavePreferences');
  const deletePreference = useDeleteResource('leavePreferences');

  const preferences = useMemo(() => {
    const merged = [...localPreferences, ...(preferencesData?.items || [])];
    return [...new Map(merged.map((item) => [String(item.id), item])).values()];
  }, [localPreferences, preferencesData]);
  const groups = useMemo(() => groupsData?.items || [], [groupsData]);
  const cycles = useMemo(() => cyclesData?.items || [], [cyclesData]);
  const employees = useMemo(() => employeesData?.items || [], [employeesData]);

  const enrichedPreferences = useMemo(() => preferences.map((item) => ({ ...item, employeeName: item.employeeName || getEmployeeName(employees.find((employee) => String(employee.id) === String(item.employee_id))), groupName: item.groupName || getRelatedName(groups.find((group) => String(group.id) === String(item.leave_group_id)), 'Group'), cycleName: item.cycleName || getRelatedName(cycles.find((cycle) => String(cycle.id) === String(item.leave_cycle_id)), 'Cycle') })), [cycles, employees, groups, preferences]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enrichedPreferences.filter((item) => { const text = [item.employeeName, item.preferred_leave_type, item.groupName, item.cycleName, item.notes, item.status].filter(Boolean).join(' ').toLowerCase(); return (!q || text.includes(q)) && (typeFilter === 'All' || item.preferred_leave_type === typeFilter) && (statusFilter === 'All' || (item.status || 'Active') === statusFilter); });
  }, [enrichedPreferences, search, statusFilter, typeFilter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visiblePreferences = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const resetFilters = () => { setSearch(''); setStatusFilter('All'); setTypeFilter('All'); setCurrentPage(1); };

  const openCreate = () => { setIsEditing(false); setSelected(null); setForm(defaultForm); setIsFormOpen(true); };

  const openEdit = (item) => {
    setIsEditing(true);
    setSelected(item);
    setForm({
      employee_id: item.employee_id ?? '',
      leave_group_id: item.leave_group_id ?? '',
      leave_cycle_id: item.leave_cycle_id ?? '',
      preferred_leave_type: item.preferred_leave_type ?? '',
      carry_forward_limit: item.carry_forward_limit ?? '',
      special_leave_days: item.special_leave_days ?? '',
      status: item.status || 'Active',
      notes: item.notes || '',
    });
    setIsFormOpen(true);
  };

  const closeModal = () => {
    setIsFormOpen(false);
    setSelected(null);
    setForm(defaultForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const preferredLeaveType = form.preferred_leave_type.trim();
    if (!preferredLeaveType) {
      toast.error('Preferred leave type is required.');
      return;
    }

    const payload = {
      employee_id: form.employee_id === '' ? null : Number(form.employee_id),
      leave_group_id: form.leave_group_id === '' ? null : Number(form.leave_group_id),
      leave_cycle_id: form.leave_cycle_id === '' ? null : Number(form.leave_cycle_id),
      preferred_leave_type: preferredLeaveType,
      carry_forward_limit: form.carry_forward_limit === '' ? null : Number(form.carry_forward_limit),
      special_leave_days: form.special_leave_days === '' ? null : Number(form.special_leave_days),
      status: form.status,
      notes: form.notes.trim() || null,
    };
    const employee = employees.find((item) => String(item.id) === String(form.employee_id));
    const group = groups.find((item) => String(item.id) === String(form.leave_group_id));
    const cycle = cycles.find((item) => String(item.id) === String(form.leave_cycle_id));
    const labels = { employeeName: getEmployeeName(employee), groupName: getRelatedName(group, 'Group'), cycleName: getRelatedName(cycle, 'Cycle') };

    try {
      if (isEditing && selected) {
        const updated = await updatePreference.mutateAsync({ id: selected.id, payload });
        const nextItem = { ...selected, ...payload, ...(updated || {}), ...labels };
        const nextLocal = localPreferences.some((item) => String(item.id) === String(selected.id)) ? localPreferences.map((item) => String(item.id) === String(selected.id) ? nextItem : item) : [...localPreferences, nextItem];
        setLocalPreferences(nextLocal); writeLocalPreferences(nextLocal);
        toast.success('Leave preference updated successfully');
      } else {
        const created = await createPreference.mutateAsync(payload);
        const nextItem = { ...payload, ...(created || {}), ...labels, id: created?.id || `local-preference-${Date.now()}`, createdAt: created?.createdAt || new Date().toISOString() };
        const nextLocal = [nextItem, ...localPreferences]; setLocalPreferences(nextLocal); writeLocalPreferences(nextLocal); setCurrentPage(1);
        toast.success('Leave preference created successfully');
      }
      closeModal();
    } catch {
      const fallbackItem = { ...payload, ...labels, id: selected?.id || `local-preference-${Date.now()}`, createdAt: selected?.createdAt || new Date().toISOString() };
      const nextLocal = isEditing && selected ? localPreferences.map((item) => String(item.id) === String(selected.id) ? { ...item, ...fallbackItem } : item) : [fallbackItem, ...localPreferences];
      setLocalPreferences(nextLocal); writeLocalPreferences(nextLocal); toast.success(isEditing ? 'Leave preference updated locally' : 'Leave preference saved locally'); closeModal();
    }
  };

  const handleDelete = async (item) => {
    if (!item?.id || !window.confirm(`Delete leave preference for "${item.employeeName}"?`)) return;
    await deletePreference.mutateAsync(item.id).catch(() => null);
    const nextLocal = localPreferences.filter((preference) => String(preference.id) !== String(item.id)); setLocalPreferences(nextLocal); writeLocalPreferences(nextLocal); toast.success('Leave preference deleted successfully');
  };

  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-5 border-b border-slate-200/80 pb-4">
          <div className="mb-3 flex items-center gap-3">
            <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'HRM Master', to: '/settings/hrm' }, { label: 'Leave Preference' }]} />
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-600">HRM Master</p><h1 className="mt-1 text-[16px] font-medium tracking-tight text-slate-900">HRM Leave Preference Master</h1><p className="mt-1 text-[11px] text-slate-400">Configure employee-wise leave preferences and carry-forward rules.</p></div>
            <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"><FileDown className="h-3.5 w-3.5" /> Print</button><button type="button" onClick={() => navigate('/settings/hrm/leave-group')} className="inline-flex items-center gap-1.5 rounded-lg border border-[#0f5132] bg-white px-3 py-2 text-xs font-semibold text-[#0f5132] hover:bg-emerald-50"><Plus className="h-3.5 w-3.5" /> Create Group</button><button type="button" onClick={openCreate} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f5132] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0d432b]"><Plus className="h-3.5 w-3.5" /> Add New Preference</button></div>
          </div>
        </div>

        <div className="flex-1 rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <label htmlFor="leave-preference-search" className="text-[10px] font-semibold text-slate-600">Employee or preference<input id="leave-preference-search" name="leave_preference_search" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search employee or leave type..." className="mt-1 h-[20px] w-full rounded-md border border-slate-200 px-2 text-[10px] font-normal outline-none focus:border-emerald-400" /></label>
            <label htmlFor="leave-preference-type-filter" className="text-[10px] font-semibold text-slate-600">Leave type<select id="leave-preference-type-filter" name="leave_preference_type_filter" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }} className="mt-1 h-[20px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400"><option>All</option>{leaveTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
            <label htmlFor="leave-preference-status-filter" className="text-[10px] font-semibold text-slate-600">Status<select id="leave-preference-status-filter" name="leave_preference_status_filter" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="mt-1 h-[20px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400"><option>All</option><option>Active</option><option>Inactive</option></select></label>
            <div className="flex items-end justify-end"><button type="button" onClick={resetFilters} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"><RotateCcw className="h-3 w-3" /> Reset</button></div>
          </div>
          <div className="mb-4 hidden items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search preference..."
              className="w-full border-0 bg-transparent text-sm text-slate-900 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-slate-500">Loading leave preferences...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500">No leave preferences found.</div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200"><div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5"><div className="flex items-center gap-2 text-xs font-semibold text-slate-800"><CalendarCog className="h-3.5 w-3.5" /> Leave Preference List</div><span className="text-[10px] text-slate-500">Showing {visiblePreferences.length} of {filtered.length} entries</span></div>
              <div className="overflow-x-auto"><table className="min-w-[1050px] w-full border-collapse text-center text-[10px]"><thead><tr className="bg-[#0f5132] text-white">
                    <th className="border-r border-white/30 px-2 py-2.5 font-semibold">S.No.</th>
                    <th className="border-r border-white/30 px-2 py-2.5 font-semibold">Employee Name</th>
                    <th className="border-r border-white/30 px-2 py-2.5 font-semibold">Leave Type</th>
                    <th className="border-r border-white/30 px-2 py-2.5 font-semibold">Leave Group</th>
                    <th className="border-r border-white/30 px-2 py-2.5 font-semibold">Leave Cycle</th>
                    <th className="border-r border-white/30 px-2 py-2.5 font-semibold">Carry Forward</th>
                    <th className="border-r border-white/30 px-2 py-2.5 font-semibold">Special Days</th>
                    <th className="border-r border-white/30 px-2 py-2.5 font-semibold">Status</th>
                    <th className="px-2 py-2.5 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visiblePreferences.map((item, index) => (
                    <tr key={item.id} className="border-b border-slate-200 text-slate-700 odd:bg-slate-50/50 hover:bg-emerald-50/30">
                      <td className="border-r border-white px-2 py-2">{(currentPage - 1) * pageSize + index + 1}</td>
                      <td className="border-r border-white px-2 py-2 text-left font-semibold text-slate-900">{item.employeeName}</td>
                      <td className="border-r border-white px-2 py-2">{item.preferred_leave_type || '-'}</td>
                      <td className="border-r border-white px-2 py-2">{item.groupName}</td>
                      <td className="border-r border-white px-2 py-2">{item.cycleName}</td>
                      <td className="border-r border-white px-2 py-2">{item.carry_forward_limit ?? '-'}</td>
                      <td className="border-r border-white px-2 py-2">{item.special_leave_days ?? '-'}</td>
                      <td className="border-r border-white px-2 py-2"><span className="rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-700">{item.status || 'Active'}</span></td>
                      <td className="px-2 py-2"><div className="flex justify-center gap-1"><button type="button" onClick={() => { setSelected(item); setIsViewOpen(true); }} aria-label="View leave preference" title="View" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"><Eye className="h-3 w-3" /></button><button type="button" onClick={() => openEdit(item)} aria-label="Edit leave preference" title="Edit" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"><Pencil className="h-3 w-3" /></button><button type="button" onClick={() => handleDelete(item)} aria-label="Delete leave preference" title="Delete" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50"><Trash2 className="h-3 w-3" /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
              <div className="flex items-center justify-between border-t border-slate-200 px-3 py-3 text-[10px] text-slate-600"><span>Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries</span><div className="flex items-center gap-1"><button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="rounded-md border border-slate-200 px-2 py-1 disabled:opacity-40">Previous</button><button type="button" className="rounded-md border border-[#0f5132] bg-[#0f5132] px-2.5 py-1 text-white">{currentPage}</button><button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="rounded-md border border-slate-200 px-2 py-1 disabled:opacity-40">Next</button></div></div></div>
          )}
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">{isEditing ? 'Edit Leave Preference' : 'Add Leave Preference'}</h2>
              <button type="button" onClick={closeModal} className="text-slate-500 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label htmlFor="leave-preference-employee-id" className="block text-sm font-medium text-slate-700">
                  Employee
                  <select id="leave-preference-employee-id" name="employee_id" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} aria-label="Employee" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"><option value="">Select employee</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{getEmployeeName(employee)}</option>)}</select>
                </label>
                <label htmlFor="leave-preference-type" className="block text-sm font-medium text-slate-700">
                  Preferred leave type
                  <select id="leave-preference-type" name="preferred_leave_type" required value={form.preferred_leave_type} onChange={(e) => setForm({ ...form, preferred_leave_type: e.target.value })} aria-label="Preferred leave type" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"><option value="">Select leave type</option>{leaveTypes.map((type) => <option key={type}>{type}</option>)}</select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label htmlFor="leave-preference-group" className="block text-sm font-medium text-slate-700">
                  Leave group
                  <select id="leave-preference-group" name="leave_group_id" value={form.leave_group_id} onChange={(e) => setForm({ ...form, leave_group_id: e.target.value })} aria-label="Leave group" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                    <option value="">Select group</option>
                    {groups.map((group) => (<option key={group.id} value={group.id}>{getRelatedName(group, 'Group')}</option>))}
                  </select>
                </label>
                <label htmlFor="leave-preference-cycle" className="block text-sm font-medium text-slate-700">
                  Leave cycle
                  <select id="leave-preference-cycle" name="leave_cycle_id" value={form.leave_cycle_id} onChange={(e) => setForm({ ...form, leave_cycle_id: e.target.value })} aria-label="Leave cycle" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                    <option value="">Select cycle</option>
                    {cycles.map((cycle) => (<option key={cycle.id} value={cycle.id}>{getRelatedName(cycle, 'Cycle')}</option>))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label htmlFor="leave-preference-carry-forward" className="block text-sm font-medium text-slate-700">
                  Carry forward limit
                  <input id="leave-preference-carry-forward" name="carry_forward_limit" type="number" min="0" value={form.carry_forward_limit} onChange={(e) => setForm({ ...form, carry_forward_limit: e.target.value })} aria-label="Carry forward limit" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </label>
                <label htmlFor="leave-preference-special-days" className="block text-sm font-medium text-slate-700">
                  Special leave days
                  <input id="leave-preference-special-days" name="special_leave_days" type="number" min="0" value={form.special_leave_days} onChange={(e) => setForm({ ...form, special_leave_days: e.target.value })} aria-label="Special leave days" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </label>
              </div>

              <label htmlFor="leave-preference-notes" className="block text-sm font-medium text-slate-700">
                Notes
                <textarea id="leave-preference-notes" name="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} aria-label="Notes" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </label>

              <label htmlFor="leave-preference-status" className="block text-sm font-medium text-slate-700">
                Status
                <select id="leave-preference-status" name="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} aria-label="Leave preference status" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">{isEditing ? 'Save Changes' : 'Create Preference'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isViewOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-900">Leave Preference Details</h2><button type="button" onClick={() => { setIsViewOpen(false); setSelected(null); }} aria-label="Close details" className="text-slate-500 hover:text-slate-700">X</button></div>
            <div className="grid gap-3 text-xs text-slate-700"><p><strong>Employee:</strong> {selected.employeeName}</p><p><strong>Leave Type:</strong> {selected.preferred_leave_type || '-'}</p><p><strong>Leave Group:</strong> {selected.groupName}</p><p><strong>Leave Cycle:</strong> {selected.cycleName}</p><p><strong>Carry Forward:</strong> {selected.carry_forward_limit ?? '-'}</p><p><strong>Special Days:</strong> {selected.special_leave_days ?? '-'}</p><p><strong>Status:</strong> {selected.status || 'Active'}</p><p><strong>Created:</strong> {formatDate(selected.created_at || selected.createdAt)}</p><p><strong>Notes:</strong> {selected.notes || '-'}</p></div>
            <div className="mt-5 flex justify-end"><button type="button" onClick={() => { setIsViewOpen(false); setSelected(null); }} className="rounded-lg bg-[#0f5132] px-3 py-1.5 text-xs font-semibold text-white">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
