import { useState } from 'react';
import { Check, Edit3, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useResourceList, useCreateResource, useUpdateResource, useDeleteResource } from '../../hooks/useResourceHooks';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';
import Button from '../../components/ui/Button.jsx';

const createResultRow = () => ({
  id: `result-${Date.now()}-${Math.random()}`,
  text: '',
  isEditing: true,
});

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('en-GB') : '—');

export default function ResultSetupListPage() {
  const [inputRows, setInputRows] = useState([]);
  const [savedDrafts, setSavedDrafts] = useState({});
  const [editStates, setEditStates] = useState({});

  const { data, isLoading } = useResourceList('results', { page: 1, pageSize: 200 });
  const savedResults = data?.items || [];
  const createResult = useCreateResource('results');
  const updateResult = useUpdateResource('results');
  const deleteResult = useDeleteResource('results');

  const hasSavedResults = savedResults.length > 0;

  const handleAddResultRow = () => {
    setInputRows((current) => [...current, createResultRow()]);
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

  const handleSaveResults = async () => {
    const validRows = inputRows
      .map((row) => ({ ...row, text: row.text.trim() }))
      .filter((row) => row.text.length > 0);

    if (!validRows.length) return;

    const now = new Date().toISOString();

    try {
      await Promise.all(
        validRows.map((row) =>
          createResult.mutateAsync({ text: row.text, status: 'Active', createdDate: now })
        )
      );
      setInputRows([]);
      setSavedDrafts({});
      toast.success(`${validRows.length} result${validRows.length === 1 ? '' : 's'} created`);
    } catch (error) {
      toast.error(error?.message || 'Could not save results');
    }
  };

  const handleToggleSavedEdit = (id) => {
    const result = savedResults.find((item) => item.id === id);
    if (!result) return;

    setSavedDrafts((current) => ({
      ...current,
      [id]: current[id] ?? result.text,
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
    if (!draft) return;

    try {
      await updateResult.mutateAsync({ id, payload: { text: draft } });
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
      toast.success('Result updated');
    } catch (error) {
      toast.error(error?.message || 'Could not update result');
    }
  };

  const handleDeleteSavedResult = async (id) => {
    if (!window.confirm('Delete this result?')) return;

    try {
      await deleteResult.mutateAsync(id);
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
      toast.success('Result deleted');
    } catch (error) {
      toast.error(error?.message || 'Could not delete result');
    }
  };

  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Breadcrumb
              items={[
                { label: 'Dashboard', to: '/' },
                { label: 'Academics Setup', to: '/settings/institute' },
                { label: 'Result Setup List' },
              ]}
            />
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Results</h1>
              <span className="text-sm text-slate-500">Results List</span>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={handleAddResultRow}
            className="inline-flex h-11 items-center gap-2 rounded-[20px] bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            New Result
          </Button>
        </div>

        <div className="mt-5 rounded-[20px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="space-y-4">
            {inputRows.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-slate-300 bg-white/80 px-4 py-7 text-sm text-slate-500">
                Click <span className="font-semibold text-slate-900">New Result</span> to add a result.
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
                        placeholder="Add Result"
                        disabled={!row.isEditing}
                        className={`w-full rounded-2xl border ${row.isEditing ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-100'} px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 ${row.isEditing ? '' : 'opacity-80'}`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleEnableInputRowEdit(row.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
                      aria-label="Edit result"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveInputRow(row.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                      aria-label="Delete result"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="button"
                variant="primary"
                onClick={handleSaveResults}
                className="inline-flex h-11 items-center gap-2 rounded-[20px] bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <Check className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </div>

        {hasSavedResults && (
          <div className="mt-6 overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-slate-950 text-slate-100">
                  <tr>
                    <th className="sticky top-0 border-b border-slate-700 px-4 py-3 font-semibold uppercase tracking-[0.14em]">S.No</th>
                    <th className="sticky top-0 border-b border-slate-700 px-4 py-3 font-semibold uppercase tracking-[0.14em]">Result</th>
                    <th className="sticky top-0 border-b border-slate-700 px-4 py-3 font-semibold uppercase tracking-[0.14em]">Created Date</th>
                    <th className="sticky top-0 border-b border-slate-700 px-4 py-3 font-semibold uppercase tracking-[0.14em]">Status</th>
                    <th className="sticky top-0 border-b border-slate-700 px-4 py-3 font-semibold uppercase tracking-[0.14em]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {savedResults.map((row, index) => {
                    const isEditing = Boolean(editStates[row.id]);
                    return (
                      <tr key={row.id} className="border-b border-slate-200 transition hover:bg-slate-50">
                        <td className="px-4 py-4 align-top font-semibold text-slate-900">{index + 1}</td>
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
                              onClick={() => (isEditing ? handleConfirmSavedEdit(row.id) : handleToggleSavedEdit(row.id))}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
                              aria-label={isEditing ? 'Save result changes' : 'Edit result'}
                            >
                              {isEditing ? <Check className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSavedResult(row.id)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                              aria-label="Delete saved result"
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
          </div>
        )}
      </div>
    </div>
  );
}
