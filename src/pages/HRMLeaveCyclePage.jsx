import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Trash2, PencilLine } from 'lucide-react';
import { toast } from 'react-toastify';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import { useCreateResource, useDeleteResource, useResourceList, useUpdateResource } from '../hooks/useResourceHooks';

const defaultForm = {
  code: '',
  name: '',
  description: '',
  start_month: 1,
  end_month: 12,
  status: 'Active',
};

export default function HRMLeaveCyclePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const { data: cyclesData, isLoading } = useResourceList('leaveCycles', { page: 1, pageSize: 100 });
  const createCycle = useCreateResource('leaveCycles');
  const updateCycle = useUpdateResource('leaveCycles');
  const deleteCycle = useDeleteResource('leaveCycles');

  const cycles = useMemo(() => cyclesData?.items || [], [cyclesData]);
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return cycles.filter((item) => {
      if (!q) return true;
      return [item.code, item.name, item.description, item.status].filter(Boolean).join(' ').toLowerCase().includes(q);
    });
  }, [cycles, search]);

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
        await updateCycle.mutateAsync({ id: selected.id, payload });
        toast.success('Leave cycle updated successfully');
      } else {
        await createCycle.mutateAsync(payload);
        toast.success('Leave cycle created successfully');
      }
      closeModal();
    } catch (error) {
      toast.error(error?.message || 'Failed to save leave cycle');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this leave cycle?')) return;
    try {
      await deleteCycle.mutateAsync(id);
      toast.success('Leave cycle deleted successfully');
    } catch (error) {
      toast.error(error?.message || 'Failed to delete leave cycle');
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
            <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'HRM Master', to: '/settings/hrm' }, { label: 'Leave Cycle' }]} />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold text-slate-900">Leave Cycle <span className="text-slate-500">| HRM Master</span></h1>
            <button type="button" onClick={openAdd} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-emerald-700">
              <Plus className="h-4 w-4" /> Add Leave Cycle
            </button>
          </div>
        </div>

        <div className="flex-1 rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex max-w-md items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leave cycle..."
              className="w-full border-0 bg-transparent text-sm text-slate-900 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-slate-500">Loading leave cycles...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500">No leave cycles found.</div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Code</th>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Cycle</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{item.code}</td>
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3">{item.start_month || 1} - {item.end_month || 12}</td>
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
                    {[...Array(12)].map((_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}
                  </select>
                </label>
                <label htmlFor="leave-cycle-end-month" className="block text-sm font-medium text-slate-700">
                  End month
                  <select id="leave-cycle-end-month" name="end_month" value={form.end_month} onChange={(e) => setForm({ ...form, end_month: Number(e.target.value) })} aria-label="Leave cycle end month" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                    {[...Array(12)].map((_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}
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
    </div>
  );
}
