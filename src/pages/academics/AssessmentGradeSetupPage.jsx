import { useEffect, useMemo, useState } from 'react';
import { Copy, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';
import { useResourceList, useCreateResource, useUpdateResource, useDeleteResource } from '../../hooks/useResourceHooks';

const GRADE_BANDS = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'E', 'F'];
const STATUS_OPTIONS = ['All', 'Active', 'Inactive'];
const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function AssessmentGradeSetupPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [createdDateFilter, setCreatedDateFilter] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', code: '', grade_band: '', min_score: '', max_score: '', grade_point: '', status: 'Active', description: '' });
  const [editingId, setEditingId] = useState(null);

  const { data: gradeSetupData = {}, isLoading, isError, error } = useResourceList('assessmentGradeSetups', { page: 1, pageSize: 200 });
  const createGradeSetup = useCreateResource('assessmentGradeSetups');
  const updateGradeSetup = useUpdateResource('assessmentGradeSetups');
  const deleteGradeSetup = useDeleteResource('assessmentGradeSetups');

  useEffect(() => {
    document.title = 'Assessment Grade Setup - Academics';
  }, []);

  const rows = gradeSetupData?.items || [];

  const filteredRows = useMemo(() => {
    const term = query.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch = [row.name, row.code, row.grade_band, row.description, row.status]
        .some((value) => value?.toString().toLowerCase().includes(term));

      const matchesStatus = statusFilter === 'All' || row.status === statusFilter;
      const matchesDate = !createdDateFilter || new Date(row.created_at).toISOString().slice(0, 10) === createdDateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [query, rows, statusFilter, createdDateFilter]);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, createdDateFilter, rows.length]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const displayedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  const resetForm = () => {
    setForm({ id: null, name: '', code: '', grade_band: '', min_score: '', max_score: '', grade_point: '', status: 'Active', description: '' });
    setEditingId(null);
  };

  const saveRow = async (event) => {
    event.preventDefault();
    if (!form.name || !form.grade_band) {
      toast.error('Assessment Grade Name and Grade Band are required.');
      return;
    }

    const payload = {
      name: form.name,
      code: form.code || form.grade_band,
      grade_band: form.grade_band,
      min_score: form.min_score ? Number(form.min_score) : null,
      max_score: form.max_score ? Number(form.max_score) : null,
      grade_point: form.grade_point ? Number(form.grade_point) : null,
      status: form.status,
      description: form.description,
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await updateGradeSetup.mutateAsync({ id: editingId, payload });
        toast.success('Assessment grade setup updated successfully.');
      } else {
        await createGradeSetup.mutateAsync(payload);
        toast.success('Assessment grade setup created successfully.');
      }
      resetForm();
      setIsExpanded(false);
    } catch (error) {
      console.error('Failed to save grade setup', error);
      toast.error(error?.message || 'Failed to save grade setup. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const editRow = (row) => {
    setEditingId(row.id);
    setForm({
      id: row.id,
      name: row.name,
      code: row.code,
      grade_band: row.grade_band,
      min_score: row.min_score ?? '',
      max_score: row.max_score ?? '',
      grade_point: row.grade_point ?? '',
      status: row.status,
      description: row.description,
    });
    setIsExpanded(true);
  };

  const deleteRow = async (id) => {
    if (!window.confirm('Delete this grade setup entry?')) return;
    setSubmitting(true);
    try {
      await deleteGradeSetup.mutateAsync(id);
      toast.success('Assessment grade setup deleted successfully.');
      if (editingId === id) resetForm();
    } catch (error) {
      console.error('Failed to delete grade setup', error);
      toast.error(error?.message || 'Failed to delete grade setup. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full min-w-0 px-[12px] pb-8 pt-4 lg:px-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Institute Setup', to: '/settings/institute' }, { label: 'Academics', to: '/settings/institute/academics' }, { label: 'Assessment Grade Setup' }]} />
          <div className="mt-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Assessment Grade Setup</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Create grade scale rules and achievement bands for academic assessments.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setIsExpanded((prev) => !prev)} className="inline-flex items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
            <Plus className="h-4 w-4" /> {isExpanded ? 'Hide Form' : 'Add Grade Setup'}
          </button>
          <button type="button" onClick={() => navigator.clipboard.writeText(JSON.stringify(rows, null, 2))} className="inline-flex items-center gap-2 rounded-[10px] bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition">
            <Copy className="h-4 w-4" /> Copy JSON
          </button>
        </div>
      </div>

      <div className="rounded-[16px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[620px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <form onSubmit={saveRow} className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Grade Name</label>
                <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Enter grade name" className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Grade Code</label>
                <input value={form.code} onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))} placeholder="Enter grade code" className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Grade Band</label>
                <select value={form.grade_band} onChange={(e) => setForm((prev) => ({ ...prev, grade_band: e.target.value }))} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                  <option value="">Select band</option>
                  {GRADE_BANDS.map((band) => <option key={band} value={band}>{band}</option>)}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Min Score</label>
                  <input value={form.min_score} onChange={(e) => setForm((prev) => ({ ...prev, min_score: e.target.value }))} type="number" min="0" max="100" placeholder="Min" className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Max Score</label>
                  <input value={form.max_score} onChange={(e) => setForm((prev) => ({ ...prev, max_score: e.target.value }))} type="number" min="0" max="100" placeholder="Max" className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Grade Point</label>
                <input value={form.grade_point} onChange={(e) => setForm((prev) => ({ ...prev, grade_point: e.target.value }))} type="number" step="0.1" min="0" max="5" placeholder="e.g. 4.0" className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Status</label>
                <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                  {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows="4" placeholder="Optional details about this grade band" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button type="submit" className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition">{editingId ? 'Update Setup' : 'Save Setup'}</button>
                <button type="button" onClick={resetForm} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Reset</button>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">Grade setup entries</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">{filteredRows.length} entries</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search grade setup..." className="h-11 min-w-[240px] rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
              {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <input type="date" value={createdDateFilter} onChange={(e) => setCreatedDateFilter(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-slate-900 text-left text-xs uppercase tracking-[0.18em] text-white">
                <th className="px-4 py-3">S.No</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Grade Band</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created On</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {displayedRows.map((row, index) => (
                <tr key={row.id} className="border-t border-slate-200">
                  <td className="px-4 py-4 text-slate-600">{(page - 1) * pageSize + index + 1}</td>
                  <td className="px-4 py-4 font-semibold text-slate-900">{row.name}</td>
                  <td className="px-4 py-4 text-slate-600">{row.grade_band || '–'}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${row.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{row.created_at ? new Date(row.created_at).toLocaleDateString() : '–'}</td>
                  <td className="px-4 py-4">
                    <div className="inline-flex items-center gap-2">
                      <button type="button" onClick={() => editRow(row)} disabled={submitting} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition disabled:cursor-not-allowed disabled:opacity-60">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => deleteRow(row.id)} disabled={submitting} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-rose-600 hover:bg-rose-50 transition disabled:cursor-not-allowed disabled:opacity-60">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {displayedRows.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-14 text-center text-sm text-slate-500">
                    No assessment grade setups match the current filters. Add a grade setup to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            Showing {displayedRows.length} of {filteredRows.length} filtered records
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Items per page
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                {PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
            </label>
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="rounded-lg px-3 py-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
              <span>Page {page} of {pageCount}</span>
              <button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page === pageCount} className="rounded-lg px-3 py-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar theme="light" />
    </div>
  );
}
