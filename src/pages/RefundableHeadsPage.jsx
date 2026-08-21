import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft,  ArrowRight, Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useCreateResource, useDeleteResource, useResourceList, useUpdateResource } from '../hooks/useResourceHooks';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const defaultValues = {
  feeHeadName: '',
  feeHeadCode: '',
  receiptHead: '',
  feeCategory: 'Refundable',
  displayOrder: 0,
  amountType: 'Fixed',
  isRefundable: true,
  taxApplicable: false,
  status: 'Active',
  description: '',
};

export default function RefundableHeadsPage() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formValues, setFormValues] = useState(defaultValues);
  const [selectedSession, setSelectedSession] = useState('');
  const [showTable, setShowTable] = useState(true);

  const { data, isLoading } = useResourceList('fee-heads', { page: 1, pageSize: 100 });
  const createResource = useCreateResource('fee-heads');
  const updateResource = useUpdateResource('fee-heads');
  const deleteResource = useDeleteResource('fee-heads');
  const feeHeads = data?.items || [];

  const openCreate = () => {
    setEditItem(null);
    setFormValues({ ...defaultValues, displayOrder: refundableHeads.length + 1 });
    setShowForm(true);
    setShowTable(true);
  };

  const refundableHeads = feeHeads.filter((item) => item?.isRefundable === true || String(item?.isRefundable).toLowerCase() === 'true');

  const openEdit = (item) => {
    setEditItem(item);
    setFormValues({
      feeHeadName: item.feeHeadName || item.name || '',
      feeHeadCode: item.feeHeadCode || item.code || '',
      receiptHead: item.receiptHead || item.feeHeadName || item.name || '',
      feeCategory: item.feeCategory || 'Refundable',
      displayOrder: Number(item.displayOrder ?? item.display_order ?? refundableHeads.length + 1),
      amountType: item.amountType || 'Fixed',
      isRefundable: true,
      taxApplicable: item.taxApplicable ?? false,
      status: item.status || 'Active',
      description: item.description || '',
    });
    setShowForm(true);
    setShowTable(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditItem(null);
    setFormValues(defaultValues);
  };

  const handleSessionGo = () => {
    if (!selectedSession) {
      toast.info('Select a session first.');
      return;
    }
    setShowTable(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!formValues.feeHeadName.trim() || !formValues.feeHeadCode.trim()) {
      toast.error('Refundable head name and code are required.');
      return;
    }

    const payload = {
      feeHeadName: formValues.feeHeadName.trim(),
      feeHeadCode: formValues.feeHeadCode.trim(),
      receiptHead: formValues.receiptHead.trim() || formValues.feeHeadName.trim(),
      feeCategory: formValues.feeCategory.trim() || 'Refundable',
      displayOrder: Number(formValues.displayOrder ?? refundableHeads.length + 1),
      amountType: formValues.amountType || 'Fixed',
      isRefundable: true,
      taxApplicable: formValues.taxApplicable ?? false,
      status: formValues.status,
      description: formValues.description.trim() || null,
    };

    try {
      if (editItem) {
        await updateResource.mutateAsync({ id: editItem.id, payload });
        toast.success('Refundable head updated.');
      } else {
        await createResource.mutateAsync(payload);
        toast.success('Refundable head created.');
      }
      closeForm();
    } catch (error) {
      toast.error(error?.message || 'Could not save refundable head.');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete ${item.name || 'this refundable head'}?`)) return;
    try {
      await deleteResource.mutateAsync(item.id);
      toast.success('Refundable head deleted.');
    } catch (error) {
      toast.error(error?.message || 'Could not delete refundable head.');
    }
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
            { label: 'Refundable Heads' },
          ]}
        />

        <div className="flex flex-col gap-4 pb-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-1.5">
            <h1 className="truncate text-[clamp(1.7rem,3vw,2.15rem)] font-medium tracking-tight text-slate-950">Refundable Heads</h1>
            <span className="truncate text-lg font-medium text-slate-900">| Refundable Heads Data</span>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-[#05331e] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#042d1a] focus:outline-none focus:ring-2 focus:ring-[#05331e]/30"
          >
            <Plus className="h-4 w-4" /> New Refundable Head
          </button>
        </div>

        <div className="mb-4 flex min-h-[80px] items-start justify-between border border-slate-200 bg-slate-50 px-4 py-4">
          <label className="flex w-full max-w-[220px] flex-col gap-1 text-xs font-medium text-slate-700">
            <span className="sr-only">Copy from Session</span>
            <select
              value={selectedSession}
              onChange={(event) => {
                setSelectedSession(event.target.value);
                setShowTable(false);
              }}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-900"
            >
              <option value="">Copy from Session</option>
              <option value="2026-27-odd">2026-27 Odd</option>
              <option value="2025-26-even">2025-26 Even</option>
            </select>
          </label>
          <button
            type="button"
            onClick={handleSessionGo}
            className="inline-flex items-center gap-2 rounded-md bg-[#05331e] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#042d1a] focus:outline-none focus:ring-2 focus:ring-[#05331e]/30"
          >
            Go <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {showTable ? (
          <div className="space-y-6">
            {showForm && (
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">1. Refundable Head</p>
                    <p className="mt-1 text-sm text-slate-500">Fill the details and click Save to add or update this refundable head.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {editItem ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEditItem(null);
                          setFormValues(defaultValues);
                        }}
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Clear
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={closeForm}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
                      aria-label="Close form"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
                  <input type="hidden" id="isRefundable" name="isRefundable" value="true" />
                  <label htmlFor="feeHeadName" className="grid gap-2 text-sm font-medium text-slate-700">
                    Refundable Head Name
                    <input
                      id="feeHeadName"
                      name="feeHeadName"
                      value={formValues.feeHeadName}
                      onChange={(event) => setFormValues((current) => ({ ...current, feeHeadName: event.target.value }))}
                      placeholder="Enter refundable head name"
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                    />
                  </label>
                  <label htmlFor="feeHeadCode" className="grid gap-2 text-sm font-medium text-slate-700">
                    Code
                    <input
                      id="feeHeadCode"
                      name="feeHeadCode"
                      value={formValues.feeHeadCode}
                      onChange={(event) => setFormValues((current) => ({ ...current, feeHeadCode: event.target.value }))}
                      placeholder="Enter code"
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                    />
                  </label>
                  <label htmlFor="receiptHead" className="grid gap-2 text-sm font-medium text-slate-700">
                    Receipt Head
                    <input
                      id="receiptHead"
                      name="receiptHead"
                      value={formValues.receiptHead}
                      onChange={(event) => setFormValues((current) => ({ ...current, receiptHead: event.target.value }))}
                      placeholder="Enter receipt head"
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                    />
                  </label>
                  <label htmlFor="feeCategory" className="grid gap-2 text-sm font-medium text-slate-700">
                    Fee Category
                    <input
                      id="feeCategory"
                      name="feeCategory"
                      value={formValues.feeCategory}
                      readOnly
                      className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none"
                    />
                  </label>
                  <label htmlFor="displayOrder" className="grid gap-2 text-sm font-medium text-slate-700">
                    Display Order
                    <input
                      id="displayOrder"
                      name="displayOrder"
                      type="number"
                      min="1"
                      value={formValues.displayOrder}
                      onChange={(event) => setFormValues((current) => ({ ...current, displayOrder: Number(event.target.value) }))}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                    />
                  </label>
                  <label htmlFor="amountType" className="grid gap-2 text-sm font-medium text-slate-700">
                    Amount Type
                    <select
                      id="amountType"
                      name="amountType"
                      value={formValues.amountType}
                      onChange={(event) => setFormValues((current) => ({ ...current, amountType: event.target.value }))}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                    >
                      <option value="Fixed">Fixed</option>
                      <option value="Variable">Variable</option>
                    </select>
                  </label>
                  <div className="grid gap-2 text-sm font-medium text-slate-700">
                    <span>Tax Applicable</span>
                    <label htmlFor="taxApplicable" className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        id="taxApplicable"
                        name="taxApplicable"
                        type="checkbox"
                        checked={formValues.taxApplicable}
                        onChange={(event) => setFormValues((current) => ({ ...current, taxApplicable: event.target.checked }))}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900"
                      />
                      Apply tax for this refundable head
                    </label>
                  </div>
                  <label htmlFor="status" className="grid gap-2 text-sm font-medium text-slate-700">
                    Status
                    <select
                      id="status"
                      name="status"
                      value={formValues.status}
                      onChange={(event) => setFormValues((current) => ({ ...current, status: event.target.value }))}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </label>
                  <label htmlFor="description" className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
                    Description
                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      value={formValues.description}
                      onChange={(event) => setFormValues((current) => ({ ...current, description: event.target.value }))}
                      placeholder="Enter description"
                      className="min-h-[120px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                    />
                  </label>
                  <div className="sm:col-span-2 flex justify-center pt-2">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/30"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              {isLoading ? (
                <p className="text-center text-sm text-slate-600">Loading refundable heads...</p>
              ) : refundableHeads.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-slate-300/70 bg-slate-50 px-6 py-12 text-center text-sm font-medium text-slate-600">
                  No refundable heads found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left border-separate border-spacing-0">
                    <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                      <tr>
                        <th className="border-b border-slate-200 px-4 py-3">Name</th>
                        <th className="border-b border-slate-200 px-4 py-3">Code</th>
                        <th className="border-b border-slate-200 px-4 py-3">Receipt Head</th>
                        <th className="border-b border-slate-200 px-4 py-3">Fee Category</th>
                        <th className="border-b border-slate-200 px-4 py-3">Display Order</th>
                        <th className="border-b border-slate-200 px-4 py-3">Amount Type</th>
                        <th className="border-b border-slate-200 px-4 py-3">Tax Applicable</th>
                        <th className="border-b border-slate-200 px-4 py-3">Status</th>
                        <th className="border-b border-slate-200 px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {refundableHeads.map((item) => (
                        <tr key={item.id} className="border-t border-slate-200">
                          <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{item.feeHeadName || item.name || 'Untitled'}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-700">{item.feeHeadCode || item.code || 'N/A'}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-700">{item.receiptHead || item.feeHeadName || 'N/A'}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-700">{item.feeCategory || 'Refundable'}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-700">{item.displayOrder ?? item.display_order ?? '-'}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-700">{item.amountType || item.amount_type || 'Fixed'}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-700">{item.taxApplicable || item.tax_applicable ? 'Yes' : 'No'}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-700">{item.status || 'Active'}</td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEdit(item)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
                                aria-label={`Edit ${item.feeHeadName || item.name || 'refundable head'}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(item)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-rose-600 transition hover:bg-rose-50"
                                aria-label={`Delete ${item.feeHeadName || item.name || 'refundable head'}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
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
        ) : (
          <div className="rounded-[24px] border border-dashed border-slate-300/70 bg-slate-50 px-6 py-20 text-center text-sm font-medium text-slate-600">
            Select a session and click Go to view refundable heads.
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
