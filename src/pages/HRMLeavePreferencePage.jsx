import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Trash2, PencilLine } from 'lucide-react';
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

export default function HRMLeavePreferencePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const { data: preferencesData, isLoading } = useResourceList('leavePreferences', { page: 1, pageSize: 100 });
  const { data: groupsData } = useResourceList('leaveGroups', { page: 1, pageSize: 100 });
  const { data: cyclesData } = useResourceList('leaveCycles', { page: 1, pageSize: 100 });
  const createPreference = useCreateResource('leavePreferences');
  const updatePreference = useUpdateResource('leavePreferences');
  const deletePreference = useDeleteResource('leavePreferences');

  const preferences = useMemo(() => preferencesData?.items || [], [preferencesData]);
  const groups = useMemo(() => groupsData?.items || [], [groupsData]);
  const cycles = useMemo(() => cyclesData?.items || [], [cyclesData]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return preferences.filter((item) => {
      if (!q) return true;
      return [item.employee_id, item.preferred_leave_type, item.status, item.notes].filter(Boolean).join(' ').toLowerCase().includes(q);
    });
  }, [preferences, search]);

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
      employee_id: item.employee_id ?? '',
      leave_group_id: item.leave_group_id ?? '',
      leave_cycle_id: item.leave_cycle_id ?? '',
      preferred_leave_type: item.preferred_leave_type ?? '',
      carry_forward_limit: item.carry_forward_limit ?? '',
      special_leave_days: item.special_leave_days ?? '',
      status: item.status || 'Active',
      notes: item.notes || '',
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

    try {
      if (isEditing && selected) {
        await updatePreference.mutateAsync({ id: selected.id, payload });
        toast.success('Leave preference updated successfully');
      } else {
        await createPreference.mutateAsync(payload);
        toast.success('Leave preference created successfully');
      }
      closeModal();
    } catch (error) {
      toast.error(error?.message || 'Failed to save leave preference');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this leave preference?')) return;
    try {
      await deletePreference.mutateAsync(id);
      toast.success('Leave preference deleted successfully');
    } catch (error) {
      toast.error(error?.message || 'Failed to delete leave preference');
    }
  };

  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-6 border-b border-slate-200/80 pb-5">
          <div className="mb-4 flex items-center gap-3">
            <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'HRM Master', to: '/settings/hrm' }, { label: 'Leave Preference' }]} />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold text-slate-900">Leave Preference <span className="text-slate-500">| HRM Master</span></h1>
            <button type="button" onClick={openAdd} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-emerald-700">
              <Plus className="h-4 w-4" /> Add Preference
            </button>
          </div>
        </div>

        <div className="flex-1 rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex max-w-md items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5">
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
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Employee</th>
                    <th className="px-4 py-3 font-semibold">Leave Type</th>
                    <th className="px-4 py-3 font-semibold">Group</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{item.employee_id ?? 'N/A'}</td>
                      <td className="px-4 py-3">{item.preferred_leave_type || '—'}</td>
                      <td className="px-4 py-3">{item.leave_group_id ?? '—'}</td>
                      <td className="px-4 py-3"><span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">{item.status || 'Active'}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => openEdit(item)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"><PencilLine className="h-4 w-4" /></button>
                          <button type="button" onClick={() => handleDelete(item.id)} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">{isEditing ? 'Edit Leave Preference' : 'Add Leave Preference'}</h2>
              <button type="button" onClick={closeModal} className="text-slate-500 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label htmlFor="leave-preference-employee-id" className="block text-sm font-medium text-slate-700">
                  Employee ID
                  <input id="leave-preference-employee-id" name="employee_id" type="number" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} aria-label="Employee ID" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </label>
                <label htmlFor="leave-preference-type" className="block text-sm font-medium text-slate-700">
                  Preferred leave type
                  <input id="leave-preference-type" name="preferred_leave_type" value={form.preferred_leave_type} onChange={(e) => setForm({ ...form, preferred_leave_type: e.target.value })} aria-label="Preferred leave type" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="Casual Leave" />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label htmlFor="leave-preference-group" className="block text-sm font-medium text-slate-700">
                  Leave group
                  <select id="leave-preference-group" name="leave_group_id" value={form.leave_group_id} onChange={(e) => setForm({ ...form, leave_group_id: e.target.value })} aria-label="Leave group" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                    <option value="">Select group</option>
                    {groups.map((group) => (<option key={group.id} value={group.id}>{group.name}</option>))}
                  </select>
                </label>
                <label htmlFor="leave-preference-cycle" className="block text-sm font-medium text-slate-700">
                  Leave cycle
                  <select id="leave-preference-cycle" name="leave_cycle_id" value={form.leave_cycle_id} onChange={(e) => setForm({ ...form, leave_cycle_id: e.target.value })} aria-label="Leave cycle" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                    <option value="">Select cycle</option>
                    {cycles.map((cycle) => (<option key={cycle.id} value={cycle.id}>{cycle.name}</option>))}
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
    </div>
  );
}
