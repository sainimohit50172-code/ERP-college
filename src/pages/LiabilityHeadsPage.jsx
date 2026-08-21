import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft,  Plus, Save, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useCreateResource, useDeleteResource, useResourceList, useUpdateResource } from '../hooks/useResourceHooks';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Modal from '../components/ui/Modal.jsx';

const defaultValues = {
  name: '',
  code: '',
  status: 'Active',
  description: '',
};

export default function LiabilityHeadsPage() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formValues, setFormValues] = useState(defaultValues);
  const [selectedSession, setSelectedSession] = useState('');
  const [showTable, setShowTable] = useState(false);

  const { data, isLoading } = useResourceList('liability-heads', { page: 1, pageSize: 100 });
  const createResource = useCreateResource('liability-heads');
  const updateResource = useUpdateResource('liability-heads');
  const deleteResource = useDeleteResource('liability-heads');
  const items = data?.items || [];

  const getDisplayValue = (item, keys) => keys.reduce((value, key) => value ?? item?.[key], null) || '-';

  const openCreate = () => {
    setEditItem(null);
    setFormValues(defaultValues);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setFormValues({ ...defaultValues, ...item });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditItem(null);
    setFormValues(defaultValues);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formValues.name.trim() || !formValues.code.trim()) {
      toast.error('Liability Head and Code are required.');
      return;
    }

    const payload = {
      ...formValues,
      name: formValues.name.trim(),
      code: formValues.code.trim(),
      description: formValues.description.trim(),
    };

    try {
      if (editItem) {
        await updateResource.mutateAsync({ id: editItem.id, payload });
        toast.success('Liability head updated.');
      } else {
        await createResource.mutateAsync(payload);
        toast.success('Liability head created.');
      }
      closeForm();
    } catch (error) {
      toast.error(error?.message || 'Could not save liability head.');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete ${item.name || 'this liability head'}?`)) return;

    try {
      await deleteResource.mutateAsync(item.id);
      toast.success('Liability head deleted.');
    } catch (error) {
      toast.error(error?.message || 'Could not delete liability head.');
    }
  };

  const handleSessionGo = () => {
    if (!selectedSession) {
      toast.info('Select a session first.');
      return;
    }

    setShowTable(true);
  };

  return (
    <div className="space-y-6 px-4 pb-6 sm:px-0">
      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Breadcrumb items={[
            { label: 'Dashboard', to: '/' },
            { label: 'Fee Structure', to: '/settings/fee-structure' },
            { label: 'Liability Heads' },
          ]}
        />

        <div className="flex flex-col gap-4 pb-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-1.5">
            <h1 className="truncate text-[clamp(1.7rem,3vw,2.15rem)] font-medium tracking-tight text-slate-950">Liability Heads</h1>
            <span className="truncate text-lg font-medium text-slate-900">| Liability Heads Data</span>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-[#0a2e1a] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#05331e] focus:outline-none focus:ring-2 focus:ring-[#0a2e1a]/30"
          >
            <Plus className="h-4 w-4" />
            New Liability Head
          </button>
        </div>

        <div className="mb-4 flex min-h-[80px] items-start justify-between border border-slate-200 bg-white px-4 py-4">
          <label className="flex w-full max-w-[190px] flex-col gap-1 text-xs font-medium text-slate-700">
            <span className="sr-only">Copy from Session</span>
            <select
              value={selectedSession}
              onChange={(event) => {
                setSelectedSession(event.target.value);
                setShowTable(false);
              }}
              className="w-full border-0 border-b border-slate-300 bg-transparent px-0 py-1.5 text-sm text-slate-700 outline-none focus:border-[#183452]"
            >
              <option value="">Copy from Session</option>
              <option value="2026-27-odd">2026-27 Odd</option>
              <option value="2025-26-even">2025-26 Even</option>
            </select>
          </label>
          <button
            type="button"
            onClick={handleSessionGo}
            className="inline-flex items-center gap-2 rounded-md bg-[#0a2e1a] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#05331e] focus:outline-none focus:ring-2 focus:ring-[#0a2e1a]/30"
          >
            Go <span aria-hidden="true" className="text-base leading-none">-&gt;</span>
          </button>
        </div>

        <div className={`px-0 pb-10 text-center ${showTable ? 'pt-8' : 'min-h-[32rem] pt-36'}`}>
          {!showTable ? null : isLoading ? (
            <p className="text-sm text-slate-600">Loading records...</p>
          ) : (
            <div className="mx-0 max-w-none overflow-x-auto border border-slate-200 bg-white text-center">
              <table className="min-w-full text-sm border-separate border-spacing-0">
                <thead className="bg-slate-100 text-center text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="border-r border-slate-200 px-4 py-3">Liability Head</th>
                    <th className="border-r border-slate-200 px-4 py-3">Code</th>
                    <th className="border-r border-slate-200 px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-10 text-center text-sm font-medium text-slate-700">No Records found !</td>
                    </tr>
                  ) : items.map((item) => (
                    <tr key={item.id} className="border-t border-slate-200">
                      <td className="border-r border-slate-200 px-4 py-3 font-medium text-slate-900">{getDisplayValue(item, ['name', 'liabilityHead', 'liability_head', 'head_name', 'title'])}</td>
                      <td className="border-r border-slate-200 px-4 py-3 text-slate-700">{getDisplayValue(item, ['code', 'headCode', 'head_code', 'codeValue'])}</td>
                      <td className="border-r border-slate-200 px-4 py-3 text-slate-700">{getDisplayValue(item, ['status', 'isActive', 'active', 'state'])}</td>
                      <td className="px-4 py-3">
                        <div className="mx-auto flex w-max items-center gap-2">
                          <button type="button" onClick={() => openEdit(item)} className="text-xs font-semibold text-[#183452] hover:underline">Edit</button>
                          <button type="button" onClick={() => handleDelete(item)} className="text-xs font-semibold text-rose-700 hover:underline">Delete</button>
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

      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editItem ? 'Edit Liability Head' : 'New Liability Head'}
        footer={(
          <>
            <button type="button" onClick={closeForm} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
              <X className="h-4 w-4" /> Cancel
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('liability-head-form')?.requestSubmit()}
              className="inline-flex items-center gap-2 rounded-md bg-[#0a2e1a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#05331e] focus:outline-none focus:ring-2 focus:ring-[#0a2e1a]/30"
            >
              <Save className="h-4 w-4" /> Save
            </button>
          </>
        )}
      >
        <form id="liability-head-form" onSubmit={handleSubmit} className="grid gap-4">
          <label htmlFor="liability-name" className="grid gap-1 text-sm font-medium text-slate-700">
            Liability Head
            <input
              id="liability-name"
              name="name"
              value={formValues.name}
              onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))}
              className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#183452]"
            />
          </label>
          <label htmlFor="liability-code" className="grid gap-1 text-sm font-medium text-slate-700">
            Code
            <input
              id="liability-code"
              name="code"
              value={formValues.code}
              onChange={(event) => setFormValues((current) => ({ ...current, code: event.target.value }))}
              className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#183452]"
            />
          </label>
          <label htmlFor="liability-status" className="grid gap-1 text-sm font-medium text-slate-700">
            Status
            <select
              id="liability-status"
              name="status"
              value={formValues.status}
              onChange={(event) => setFormValues((current) => ({ ...current, status: event.target.value }))}
              className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#183452]"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
          <label htmlFor="liability-description" className="grid gap-1 text-sm font-medium text-slate-700">
            Description
            <textarea
              id="liability-description"
              name="description"
              rows="3"
              value={formValues.description}
              onChange={(event) => setFormValues((current) => ({ ...current, description: event.target.value }))}
              className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#183452]"
            />
          </label>
        </form>
      </Modal>
    </div>
    </div>
  );
}
