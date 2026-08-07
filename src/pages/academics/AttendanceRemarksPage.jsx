import { useMemo, useState } from 'react';
import { Check, Edit3, Eye, Plus, Search, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';
import Button from '../../components/ui/Button.jsx';
import {
  useCreateResource,
  useDeleteResource,
  useResourceList,
  useUpdateResource,
} from '../../hooks/useResourceHooks';

const createAttendanceRemarkRow = () => ({
  id: `attendance-remark-${Date.now()}-${Math.random()}`,
  text: '',
  isEditing: true,
});

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('en-GB') : '—');

export default function AttendanceRemarksPage() {
  const [inputRows, setInputRows] = useState([]);
  const [savedDrafts, setSavedDrafts] = useState({});
  const [editStates, setEditStates] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewRemark, setViewRemark] = useState(null);

  const { data, isLoading } = useResourceList('remarks', { page: 1, pageSize: 200 });
  const savedRemarks = data?.items || [];
  const createRemark = useCreateResource('remarks');
  const updateRemark = useUpdateResource('remarks');
  const deleteRemark = useDeleteResource('remarks');

  const filteredRemarks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return savedRemarks;
    return savedRemarks.filter((item) =>
      String(item.text || '')
        .trim()
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [savedRemarks, searchQuery]);

  const pageCount = Math.max(1, Math.ceil(filteredRemarks.length / itemsPerPage));
  const pageItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRemarks.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRemarks, currentPage, itemsPerPage]);

  const handleAddAttendanceRemarkRow = () => {
    setInputRows((current) => [...current, createAttendanceRemarkRow()]);
  };

  const handleChangeInputRow = (id, value) => {
    setInputRows((current) =>
      current.map((row) => (row.id === id ? { ...row, text: value } : row))
    );
  };

  const handleEnableInputRowEdit = (id) => {
    setInputRows((current) =>
      current.map((row) => (row.id === id ? { ...row, isEditing: true } : row))
    );
  };

  const handleRemoveInputRow = (id) => {
    setInputRows((current) => current.filter((row) => row.id !== id));
  };

  const handleSaveAttendanceRemarks = async () => {
    const validRows = inputRows
      .map((row) => ({ ...row, text: row.text.trim() }))
      .filter((row) => row.text.length > 0);

    const existingTexts = new Set(
      savedRemarks.map((item) => String(item.text || '').trim().toLowerCase())
    );

    const normalizedSeen = new Set();
    const uniqueRows = [];
    let duplicateCount = 0;

    validRows.forEach((row) => {
      const normalized = row.text.toLowerCase();
      if (normalizedSeen.has(normalized) || existingTexts.has(normalized)) {
        duplicateCount += 1;
        return;
      }
      normalizedSeen.add(normalized);
      uniqueRows.push(row);
    });

    if (!uniqueRows.length) {
      toast.error('Please add at least one valid unique Attendance Remark.');
      return;
    }

    if (duplicateCount > 0) {
      toast.error('Duplicate Attendance Remarks were removed before saving.');
    }

    const now = new Date().toISOString();

    try {
      await Promise.all(
        uniqueRows.map((row) =>
          createRemark.mutateAsync({ text: row.text, status: 'Active', createdDate: now })
        )
      );
      setInputRows([]);
      setSavedDrafts({});
      setCurrentPage(1);
      toast.success(`${uniqueRows.length} attendance remark${uniqueRows.length === 1 ? '' : 's'} created`);
    } catch (error) {
      toast.error(error?.message || 'Could not save attendance remarks');
    }
  };

  const handleToggleSavedEdit = (id) => {
    const remark = savedRemarks.find((item) => item.id === id);
    if (!remark) return;

    setSavedDrafts((current) => ({
      ...current,
      [id]: current[id] ?? remark.text,
    }));
    setEditStates((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  const handleChangeSavedDraft = (id, value) => {
    setSavedDrafts((current) => ({ ...current, [id]: value }));
  };

  const handleConfirmSavedEdit = async (id) => {
    const draft = (savedDrafts[id] ?? '').trim();
    if (!draft) {
      toast.error('Attendance Remark cannot be blank.');
      return;
    }

    try {
      await updateRemark.mutateAsync({ id, payload: { text: draft } });
      setSavedDrafts((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      setEditStates((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      toast.success('Attendance Remark updated');
    } catch (error) {
      toast.error(error?.message || 'Could not update attendance remark');
    }
  };

  const handleDeleteSavedRemark = async (id) => {
    if (!window.confirm('Delete this attendance remark?')) return;

    try {
      await deleteRemark.mutateAsync(id);
      setSavedDrafts((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      setEditStates((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      if (viewRemark?.id === id) setViewRemark(null);
      toast.success('Attendance Remark deleted');
    } catch (error) {
      toast.error(error?.message || 'Could not delete attendance remark');
    }
  };

  const handleViewSavedRemark = (id) => {
    const remark = savedRemarks.find((item) => item.id === id);
    if (!remark) return;
    setViewRemark(remark);
  };

  const hasSavedRemarks = savedRemarks.length > 0;

  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Breadcrumb
              items={[
                { label: 'Dashboard', to: '/' },
                { label: 'Academics Setup', to: '/settings/institute' },
                { label: 'Attendance Remarks' },
              ]}
            />
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Attendance Remarks</h1>
              <span className="text-sm text-slate-500">Attendance Remarks List</span>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={handleAddAttendanceRemarkRow}
            className="inline-flex h-11 items-center gap-2 rounded-[20px] bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            New Attendance Remark
          </Button>
        </div>

        <div className="mt-5 rounded-[20px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="space-y-4">
            {inputRows.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-slate-300 bg-white/80 px-4 py-7 text-sm text-slate-500">
                Click <span className="font-semibold text-slate-900">New Attendance Remark</span> to add an attendance remark.
              </div>
            ) : (
              <div className="space-y-3">
                {inputRows.map((row) => (
                  <div
                    key={row.id}
                    className="grid gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:grid-cols-[1fr_auto_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <input
                        type="text"
                        value={row.text}
                        onChange={(event) => handleChangeInputRow(row.id, event.target.value)}
                        placeholder="Add Attendance Remark"
                        disabled={!row.isEditing}
                        className={`w-full rounded-2xl border ${row.isEditing ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-100'} px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 ${row.isEditing ? '' : 'opacity-80'}`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleEnableInputRowEdit(row.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
                      aria-label="Edit attendance remark"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveInputRow(row.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                      aria-label="Delete attendance remark"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 shadow-sm">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search Attendance Remarks"
                  className="w-full border-0 bg-transparent px-1 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSaveAttendanceRemarks}
                  className="inline-flex h-11 items-center gap-2 rounded-[20px] bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <Check className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>

        {hasSavedRemarks && (
          <div className="mt-6 overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">Showing attendance remarks list</div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                  Items Per Page:
                  <select
                    value={itemsPerPage}
                    onChange={(event) => {
                      setItemsPerPage(Number(event.target.value));
                      setCurrentPage(1);
                    }}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none"
                  >
                    {[5, 10, 20, 50].map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {viewRemark && (
              <div className="mb-4 rounded-[18px] border border-slate-200 bg-slate-50 p-4 shadow-sm sm:flex sm:items-start sm:justify-between">
                <div className="space-y-2 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">View Attendance Remark</p>
                  <p>{viewRemark.text}</p>
                  <p className="text-slate-500">Created: {formatDate(viewRemark.createdDate)}</p>
                  <p className="text-slate-500">Status: {viewRemark.status}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewRemark(null)}
                  className="mt-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 sm:mt-0"
                  aria-label="Close view"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-slate-950 text-slate-100">
                  <tr>
                    <th className="sticky top-0 border-b border-slate-700 px-4 py-3 font-semibold uppercase tracking-[0.14em]">S.No</th>
                    <th className="sticky top-0 border-b border-slate-700 px-4 py-3 font-semibold uppercase tracking-[0.14em]">Attendance Remark</th>
                    <th className="sticky top-0 border-b border-slate-700 px-4 py-3 font-semibold uppercase tracking-[0.14em]">Created Date</th>
                    <th className="sticky top-0 border-b border-slate-700 px-4 py-3 font-semibold uppercase tracking-[0.14em]">Status</th>
                    <th className="sticky top-0 border-b border-slate-700 px-4 py-3 font-semibold uppercase tracking-[0.14em]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((row, index) => {
                    const isEditing = Boolean(editStates[row.id]);
                    return (
                      <tr key={row.id} className="border-b border-slate-200 transition hover:bg-slate-50">
                        <td className="px-4 py-4 align-top font-semibold text-slate-900">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td className="px-4 py-4 align-top text-slate-900 min-w-[240px]">
                          {isEditing ? (
                            <input
                              type="text"
                              value={savedDrafts[row.id] ?? row.text}
                              onChange={(event) => handleChangeSavedDraft(row.id, event.target.value)}
                              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                            />
                          ) : (
                            <p className="text-sm text-slate-900">{row.text}</p>
                          )}
                        </td>
                        <td className="px-4 py-4 align-top text-slate-900">{formatDate(row.createdDate)}</td>
                        <td className="px-4 py-4 align-top text-slate-900">{row.status}</td>
                        <td className="px-4 py-4 align-top">
                          <div className="inline-flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleViewSavedRemark(row.id)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
                              aria-label="View attendance remark"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => (isEditing ? handleConfirmSavedEdit(row.id) : handleToggleSavedEdit(row.id))}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
                              aria-label={isEditing ? 'Save attendance remark changes' : 'Edit attendance remark'}
                            >
                              {isEditing ? <Check className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSavedRemark(row.id)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                              aria-label="Delete attendance remark"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-600">
                {filteredRemarks.length === 0
                  ? 'No attendance remarks found.'
                  : `Showing ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, filteredRemarks.length)} of ${filteredRemarks.length}`}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((current) => Math.max(1, current - 1))}
                  disabled={currentPage === 1}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((current) => Math.min(pageCount, current + 1))}
                  disabled={currentPage >= pageCount}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
