import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';
import { useResourceList, useCreateResource, useUpdateResource, useDeleteResource } from '../../hooks/useResourceHooks';

export default function AttendanceMarksSetupPage() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', configs: [] });
  const [editingId, setEditingId] = useState(null);

  const { data: data = {} } = useResourceList('attendanceMarksSetups', { page: 1, pageSize: 200 });
  const createResource = useCreateResource('attendanceMarksSetups');
  const updateResource = useUpdateResource('attendanceMarksSetups');
  const deleteResource = useDeleteResource('attendanceMarksSetups');

  const demoRows = [
    {
      id: 'demo-1',
      name: 'Standard Attendance Marks',
      configs: [
        { id: 'cfg-1', marks: 10, min_attendance_percentage: 90, max_attendance_percentage: 100 },
        { id: 'cfg-2', marks: 8, min_attendance_percentage: 75, max_attendance_percentage: 89 },
        { id: 'cfg-3', marks: 5, min_attendance_percentage: 60, max_attendance_percentage: 74 },
      ],
    },
    {
      id: 'demo-2',
      name: 'Attendance Reward Scale',
      configs: [
        { id: 'cfg-4', marks: 12, min_attendance_percentage: 95, max_attendance_percentage: 100 },
        { id: 'cfg-5', marks: 9, min_attendance_percentage: 85, max_attendance_percentage: 94 },
      ],
    },
  ];
  const isDemoMode = !(data.items && data.items.length > 0);
  const rows = isDemoMode ? demoRows : data.items || [];

  useEffect(() => {
    document.title = 'Attendance Marks Setup - Academics';
  }, []);

  const resetForm = () => {
    setForm({ id: null, name: '', configs: [] });
    setEditingId(null);
  };

  const addConfigRow = () => {
    setForm((prev) => ({ ...prev, configs: [...(prev.configs || []), { marks: 0, min_attendance_percentage: 0, max_attendance_percentage: 100 }] }));
  };

  const updateConfigAt = (index, key, value) => {
    setForm((prev) => {
      const configs = [...(prev.configs || [])];
      configs[index] = { ...configs[index], [key]: value };
      return { ...prev, configs };
    });
  };

  const removeConfigAt = (index) => {
    setForm((prev) => {
      const configs = [...(prev.configs || [])];
      configs.splice(index, 1);
      return { ...prev, configs };
    });
  };

  const validateConfigs = (configs) => {
    // each min < max
    for (const cfg of configs) {
      if (Number(cfg.min_attendance_percentage) >= Number(cfg.max_attendance_percentage)) {
        return 'Each config must have min < max';
      }
    }
    // no overlapping ranges
    const ranges = configs.map((c) => [Number(c.min_attendance_percentage), Number(c.max_attendance_percentage)]).sort((a, b) => a[0] - b[0]);
    for (let i = 1; i < ranges.length; i++) {
      if (ranges[i][0] <= ranges[i - 1][1]) {
        return 'Config attendance ranges must not overlap';
      }
    }
    return null;
  };

  const saveRow = async (e) => {
    e.preventDefault();
    if (!form.name) { toast.error('Name is required'); return; }
    const err = validateConfigs(form.configs || []);
    if (err) { toast.error(err); return; }

    setSubmitting(true);
    try {
      const payload = { name: form.name, configs: form.configs };
      if (editingId) {
        await updateResource.mutateAsync({ id: editingId, payload });
        toast.success('Attendance marks setup updated');
      } else {
        await createResource.mutateAsync(payload);
        toast.success('Attendance marks setup created');
      }
      resetForm();
      setIsExpanded(false);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const editRow = (row) => {
    setEditingId(row.id);
    setForm({ id: row.id, name: row.name, configs: (row.configs || []).map((c) => ({ id: c.id, marks: c.marks, min_attendance_percentage: c.min_attendance_percentage, max_attendance_percentage: c.max_attendance_percentage })) });
    setIsExpanded(true);
  };

  const deleteRow = async (id) => {
    if (!window.confirm('Delete this attendance marks setup?')) return;
    setSubmitting(true);
    try {
      await deleteResource.mutateAsync(id);
      toast.success('Deleted');
      if (editingId === id) resetForm();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Failed to delete');
    } finally {
      setSubmitting(false);
    }
  };

  const pageCount = Math.max(1, Math.ceil((rows || []).length / pageSize));
  const displayedRows = (rows || []).slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen w-full min-w-0 px-[12px] pb-8 pt-4 lg:px-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Institute Setup', to: '/settings/institute' }, { label: 'Academics', to: '/settings/institute/academics' }, { label: 'Attendance Marks Setup' }]} />
          <div className="mt-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Attendance Marks Setup</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Define marks awarded for attendance percentage ranges.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setIsExpanded((p) => !p)} className="inline-flex items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
            <Plus className="h-4 w-4" /> {isExpanded ? 'Hide Form' : '+ Add New Attendance Marks Setup'}
          </button>
        </div>
      </div>

      <div className="rounded-[16px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <form onSubmit={saveRow} className="grid gap-4 lg:grid-cols-[1fr]">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Setup Name</label>
                <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Enter setup name" className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900" />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Marks Configs</label>
                  <button type="button" onClick={addConfigRow} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-1 text-sm font-semibold text-white">Add Row</button>
                </div>
                <div className="mt-3 space-y-3">
                  {(form.configs || []).map((cfg, idx) => (
                    <div key={idx} className="flex gap-2 items-end">
                      <div className="w-1/4">
                        <label className="text-xs text-slate-600">Marks</label>
                        <input type="number" value={cfg.marks} onChange={(e) => updateConfigAt(idx, 'marks', Number(e.target.value))} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
                      </div>
                      <div className="w-1/3">
                        <label className="text-xs text-slate-600">Min %</label>
                        <input type="number" value={cfg.min_attendance_percentage} onChange={(e) => updateConfigAt(idx, 'min_attendance_percentage', Number(e.target.value))} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
                      </div>
                      <div className="w-1/3">
                        <label className="text-xs text-slate-600">Max %</label>
                        <input type="number" value={cfg.max_attendance_percentage} onChange={(e) => updateConfigAt(idx, 'max_attendance_percentage', Number(e.target.value))} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
                      </div>
                      <div>
                        <button type="button" onClick={() => removeConfigAt(idx)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-rose-600 hover:bg-rose-50">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(form.configs || []).length === 0 && (
                    <div className="text-sm text-slate-500 mt-2">No config rows yet. Click the Add Row button to define marks rules.</div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white">{editingId ? 'Update Setup' : 'Save Setup'}</button>
                <button type="button" onClick={resetForm} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">Reset</button>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold">Attendance Marks Setups</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="bg-slate-900 text-left text-xs uppercase tracking-[0.18em] text-white">
                  <th className="px-4 py-3">S.No</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Configs</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {displayedRows.map((row, i) => (
                  <tr key={row.id} className="border-t border-slate-200">
                    <td className="px-4 py-4 text-slate-600">{(page - 1) * pageSize + i + 1}</td>
                    <td className="px-4 py-4 font-semibold text-slate-900">{row.name}</td>
                    <td className="px-4 py-4 text-slate-600">{(row.configs || []).length}</td>
                    <td className="px-4 py-4">
                      <div className="inline-flex items-center gap-2">
                        <button type="button" onClick={() => editRow(row)} disabled={submitting} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => deleteRow(row.id)} disabled={submitting} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-rose-600 hover:bg-rose-50">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {displayedRows.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-14 text-center text-sm text-slate-500">No Records found!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">Showing {displayedRows.length} of {rows.length} records {isDemoMode ? '(demo data)' : ''}</div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <button type="button" onClick={() => setPage((c) => Math.max(1, c - 1))} disabled={page === 1} className="rounded-lg px-3 py-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
              <span>Page {page} of {pageCount}</span>
              <button type="button" onClick={() => setPage((c) => Math.min(pageCount, c + 1))} disabled={page === pageCount} className="rounded-lg px-3 py-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

