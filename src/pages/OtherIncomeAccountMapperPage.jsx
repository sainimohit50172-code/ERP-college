import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft,  ChevronDown, Plus, Save, Trash2, Pencil } from 'lucide-react';
import { toast } from 'react-toastify';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import {
  useCreateResource,
  useDeleteResource,
  useResourceList,
  useUpdateResource,
} from '../hooks/useResourceHooks';

const emptyForm = {
  otherIncomeHeadId: '',
  accountName: '',
  accountCode: '',
  status: 'Active',
  description: '',
};

export default function OtherIncomeAccountMapperPage() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formValues, setFormValues] = useState(emptyForm);

  const { data: headsData, isLoading: headsLoading } = useResourceList('other-income-heads', { page: 1, pageSize: 100 });
  const { data: mapperData, isLoading: mapperLoading } = useResourceList('other-income-account-mappers', { page: 1, pageSize: 100 });
  const createResource = useCreateResource('other-income-account-mappers');
  const updateResource = useUpdateResource('other-income-account-mappers');
  const deleteResource = useDeleteResource('other-income-account-mappers');

  const headOptions = useMemo(() => (headsData?.items || []).filter(Boolean), [headsData]);
  const mapperItems = useMemo(() => (mapperData?.items || []).filter(Boolean), [mapperData]);

  const resetForm = () => {
    setShowForm(false);
    setEditItem(null);
    setFormValues(emptyForm);
  };

  const openCreateForm = () => {
    setEditItem(null);
    setFormValues(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditItem(item);
    setFormValues({
      otherIncomeHeadId: item.otherIncomeHeadId ?? item.other_income_head_id ?? item.head?.id ?? '',
      accountName: item.accountName ?? item.account_name ?? '',
      accountCode: item.accountCode ?? item.account_code ?? '',
      status: item.status || 'Active',
      description: item.description || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const selectedHeadId = Number(formValues.otherIncomeHeadId);
    if (!selectedHeadId) {
      toast.error('Please select a valid head.');
      return;
    }

    const accountName = formValues.accountName.trim();
    const accountCode = formValues.accountCode.trim();
    if (!accountName || !accountCode) {
      toast.error('Account name and account code are required.');
      return;
    }

    const payload = {
      otherIncomeHeadId: selectedHeadId,
      accountName,
      accountCode,
      description: formValues.description.trim(),
      status: formValues.status || 'Active',
    };

    try {
      if (editItem) {
        await updateResource.mutateAsync({ id: editItem.id, payload });
        toast.success('Mapper updated successfully.');
      } else {
        await createResource.mutateAsync(payload);
        toast.success('Mapper saved successfully.');
      }
      resetForm();
    } catch (error) {
      toast.error(error?.message || 'Could not save mapper details.');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete mapping for ${item.accountName || 'this account'}?`)) return;

    try {
      await deleteResource.mutateAsync(item.id);
      toast.success('Mapping deleted.');
    } catch (error) {
      toast.error(error?.message || 'Could not delete mapping.');
    }
  };

  return (
    <div className="min-h-screen rounded-[18px] bg-[#dfe5ea] text-slate-900">
      <div className="px-4 pb-5 pt-6">
        <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-[#f3f5f7] shadow-sm">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
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
              { label: 'Finance', to: '/finance' },
              { label: 'Other Income Account Mapper' },
            ]} />

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 rounded-[10px] bg-[#05331e] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#042d1a]"
            >
              <Plus className="h-4 w-4" />
              Add New Details
            </button>


          </div>

          <div className="px-5 pb-3 pt-2">
            <h1 className="text-[clamp(1.65rem,1.8vw,2rem)] font-medium tracking-tight text-slate-950">
              Other Income Account Mapper
            </h1>
          </div>

          {showForm && (
            <div className="bg-[#dfe5ea] px-5 pb-2 pt-2">
              <form onSubmit={handleSubmit} className="mx-auto flex max-w-[980px] flex-wrap items-end justify-center gap-6 rounded-[10px] bg-[#f5f7f9] px-4 py-4 shadow-inner">
                <div className="flex w-[260px] flex-col gap-2">
                  <label htmlFor="other-income-select-head" className="text-sm font-medium text-slate-700">Select Head</label>
                  <div className="relative">
                    <select
                      id="other-income-select-head"
                      name="headId"
                      value={formValues.otherIncomeHeadId}
                      onChange={(event) => setFormValues((current) => ({ ...current, otherIncomeHeadId: event.target.value }))}
                      className="w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2.5 pr-8 text-sm text-slate-700 outline-none focus:border-slate-400"
                      disabled={headsLoading}
                    >
                      <option value="">Select Head</option>
                      {headOptions.map((head) => (
                        <option key={head.id} value={head.id}>
                          {head.name || head.code || `Head ${head.id}`}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                  </div>
                </div>

                <div className="flex w-[220px] flex-col gap-2">
                  <label htmlFor="other-income-account-name" className="text-sm font-medium text-slate-700">Account Name</label>
                  <input
                    id="other-income-account-name"
                    name="accountName"
                    type="text"
                    value={formValues.accountName}
                    onChange={(event) => setFormValues((current) => ({ ...current, accountName: event.target.value }))}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
                    placeholder="Enter account name"
                  />
                </div>

                <div className="flex w-[180px] flex-col gap-2">
                  <label htmlFor="other-income-account-code" className="text-sm font-medium text-slate-700">Account Code</label>
                  <input
                    id="other-income-account-code"
                    name="accountCode"
                    type="text"
                    value={formValues.accountCode}
                    onChange={(event) => setFormValues((current) => ({ ...current, accountCode: event.target.value }))}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
                    placeholder="Code"
                  />
                </div>

                <div className="flex w-[180px] flex-col gap-2">
                  <label htmlFor="other-income-status" className="text-sm font-medium text-slate-700">Status</label>
                  <select
                    id="other-income-status"
                    name="status"
                    value={formValues.status}
                    onChange={(event) => setFormValues((current) => ({ ...current, status: event.target.value }))}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex w-[220px] flex-col gap-2">
                  <label htmlFor="other-income-description" className="text-sm font-medium text-slate-700">Description</label>
                  <input
                    id="other-income-description"
                    name="description"
                    type="text"
                    value={formValues.description}
                    onChange={(event) => setFormValues((current) => ({ ...current, description: event.target.value }))}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
                    placeholder="Optional"
                  />
                </div>

                <button
                  type="button"
                  aria-label="Cancel form"
                  onClick={resetForm}
                  className="mb-2 flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-[9px] bg-[#0d2348] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0c1d3f]"
                >
                  <Save className="h-4 w-4" />
                  {editItem ? 'Update' : 'Save'}
                </button>
              </form>
            </div>
          )}

          <div className="bg-[#dfe5ea] px-5 pb-5 pt-3">
            <div className="overflow-hidden rounded-[10px] border border-slate-200 bg-[#f5f7f9]">
              <div className="flex min-h-[110px] w-full items-center justify-center py-4">
              </div>

              {mapperLoading ? (
                <div className="px-4 pb-4 text-sm text-slate-600">Loading mappings...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                      <tr>
                        <th className="px-4 py-3">Head</th>
                        <th className="px-4 py-3">Account Name</th>
                        <th className="px-4 py-3">Account Code</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {mapperItems.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-4 py-10 text-center text-sm font-medium text-slate-700">
                            No Records found !
                          </td>
                        </tr>
                      ) : (
                        mapperItems.map((item) => {
                          const headName = item.head?.name || headOptions.find((head) => head.id === (item.otherIncomeHeadId ?? item.other_income_head_id))?.name || '-';
                          return (
                            <tr key={item.id}>
                              <td className="px-4 py-3 font-medium text-slate-900">{headName}</td>
                              <td className="px-4 py-3 text-slate-700">{item.accountName || item.account_name || '-'}</td>
                              <td className="px-4 py-3 text-slate-700">{item.accountCode || item.account_code || '-'}</td>
                              <td className="px-4 py-3 text-slate-700">{item.status || 'Active'}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => openEditForm(item)}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#183452] hover:underline"
                                    aria-label={`Edit mapping ${item.accountName || item.account_name || item.id}`}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(item)}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:underline"
                                    aria-label={`Delete mapping ${item.accountName || item.account_name || item.id}`}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
