import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { useCreateResource, useResourceList, useResourceDetails, useUpdateResource } from '../hooks/useResourceHooks';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

export default function FeeHeadGroupPage() {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [detailName, setDetailName] = useState('');
  const [selectedFeeHead, setSelectedFeeHead] = useState('');
  const [details, setDetails] = useState([]);

  const { data: feeHeadData = { items: [] }, isLoading: feeHeadsLoading } = useResourceList('fee-heads', { page: 1, pageSize: 200 });
  const feeHeads = feeHeadData.items || [];
  const createFeeHeadGroup = useCreateResource('fee-head-groups');
  const updateFeeHeadGroup = useUpdateResource('fee-head-groups');

  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const { data: groupData, isLoading: groupLoading } = useResourceDetails('fee-head-groups', editId);

  const feeHeadOptions = feeHeads.length > 0
    ? feeHeads.map((item) => ({ value: String(item.id), label: item.feeHeadName || item.feeHeadCode || `Fee Head ${item.id}` }))
    : [
      { value: 'Previous Dues', label: 'Previous Dues' },
      { value: 'Academic Fees', label: 'Academic Fees' },
      { value: 'Other Fees', label: 'Other Fees' },
      { value: 'Hostel Fees', label: 'Hostel Fees' },
      { value: 'Transport', label: 'Transport' },
      { value: 'Miscellaneous Fee', label: 'Miscellaneous Fee' },
    ];

  useEffect(() => {
    if (!selectedFeeHead && feeHeadOptions.length > 0) {
      setSelectedFeeHead(feeHeadOptions[0].value);
    }
  }, [feeHeadOptions, selectedFeeHead]);

  useEffect(() => {
    if (groupData) {
      setGroupName(groupData.groupName || '');
      // map backend details preserving order
      const initialDetails = (groupData.details || []).map((d) => ({
        id: d.id ? String(d.id) : Date.now().toString(),
        name: d.name || '',
        feeHeadId: d.feeHeadId ? String(d.feeHeadId) : '',
        feeHeadName: d.feeHeadName || '',
      }));
      setDetails(initialDetails);
      // if there is at least one detail, set selectedFeeHead to first detail's feeHeadId
      if (initialDetails.length > 0) setSelectedFeeHead(initialDetails[0].feeHeadId || '');
    }
  }, [groupData]);

  const selectedFeeHeadName = useMemo(() => {
    const found = feeHeads.find((item) => String(item.id) === String(selectedFeeHead) || item.feeHeadCode === selectedFeeHead);
    return found ? found.feeHeadName || found.feeHeadCode || selectedFeeHead : selectedFeeHead;
  }, [feeHeads, selectedFeeHead]);

  const handleCopyFromSession = () => {
    toast.info('Copy From Session functionality will be implemented.');
  };

  const addDetail = () => {
    if (!detailName.trim()) {
      toast.error('Enter a detail name before adding details.');
      return;
    }
    if (!selectedFeeHead) {
      toast.error('Select a fee head before adding details.');
      return;
    }
    setDetails((current) => [
      ...current,
      {
        id: Date.now().toString(),
        name: detailName.trim(),
        feeHeadId: selectedFeeHead,
        feeHeadName: selectedFeeHeadName || 'Selected Fee Head',
      },
    ]);
    setDetailName('');
    toast.success('Detail added.');
  };

  const removeDetail = (id) => {
    setDetails((current) => current.filter((detail) => detail.id !== id));
  };

  const updateDetailField = (id, field, value) => {
    setDetails((current) => current.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const moveDetailUp = (id) => {
    setDetails((current) => {
      const idx = current.findIndex((d) => d.id === id);
      if (idx <= 0) return current;
      const copy = [...current];
      const [item] = copy.splice(idx, 1);
      copy.splice(idx - 1, 0, item);
      return copy;
    });
  };

  const moveDetailDown = (id) => {
    setDetails((current) => {
      const idx = current.findIndex((d) => d.id === id);
      if (idx === -1 || idx >= current.length - 1) return current;
      const copy = [...current];
      const [item] = copy.splice(idx, 1);
      copy.splice(idx + 1, 0, item);
      return copy;
    });
  };

  const handleSave = async () => {
    if (details.length === 0) {
      toast.error('Add at least one detail before saving.');
      return;
    }

    const payload = {
      groupName: groupName.trim() || details[0]?.name || 'Fee Head Group',
      // preserve existing groupCode when editing
      groupCode: groupData?.groupCode || `FHGP-${Date.now()}`,
      status: groupData?.status || 'Active',
      description: groupData?.description || `Fee head group with ${details.length} detail(s).`,
      details: details.map((detail) => ({
        name: detail.name,
        feeHeadId: Number(detail.feeHeadId),
      })),
    };

    try {
      if (editId) {
        const result = await updateFeeHeadGroup.mutateAsync({ id: editId, payload });
        // update local UI from result (avoid full reload). React Query will also invalidate/refetch via hook onSuccess.
        if (result) {
          setGroupName(result.groupName || payload.groupName);
          const mapped = (result.details || []).map((d) => ({
            id: d.id ? String(d.id) : Date.now().toString(),
            name: d.name || '',
            feeHeadId: d.feeHeadId ? String(d.feeHeadId) : '',
            feeHeadName: d.feeHeadName || (feeHeadOptions.find((o) => o.value === String(d.feeHeadId))?.label) || '',
          }));
          setDetails(mapped);
        }
        toast.success('Fee Head Group updated successfully.');
        return;
      }

      await createFeeHeadGroup.mutateAsync(payload);
      setDetails([]);
      setGroupName('');
      toast.success('Fee Head Group saved successfully.');
    } catch (error) {
      toast.error(error?.message || 'Failed to save Fee Head Group.');
    }
  };

  const handleNext = () => {
    navigate('/settings/fee-structure/fee-category');
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] bg-slate-50 px-[5px] py-5">
      <div className="w-full">
        <Breadcrumb
          items={[
            { label: 'Dashboard', to: '/' },
            { label: 'Settings', to: '/settings' },
            { label: 'Fee Structure', to: '/settings/fee-structure' },
            { label: 'Fee Head Group' },
          ]}
        />

        <div className="mt-6 w-full rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Fee Head Group</p>
              <div className="space-y-1">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Add Fee Head Group Details</h1>
                <p className="max-w-2xl text-sm text-slate-600">Enter the fee head group name, select matching fee heads and keep the details list updated before saving.</p>
              </div>
            </div>
            <div className="flex justify-start md:justify-end">
              <button
                type="button"
                onClick={handleCopyFromSession}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Copy From Session
              </button>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Group Name</span>
                <input
                  type="text"
                  value={groupName}
                  onChange={(event) => setGroupName(event.target.value)}
                  placeholder="Exam Fees Group"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Select Fee Head</span>
                <select
                  value={selectedFeeHead}
                  onChange={(event) => setSelectedFeeHead(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                >
                  <option value="">Select fee head</option>
                  {feeHeadOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Detail Name</span>
                <input
                  type="text"
                  value={detailName}
                  onChange={(event) => setDetailName(event.target.value)}
                  placeholder="Installment A"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                />
              </label>
              <div className="self-end">
                <button
                  type="button"
                  onClick={addDetail}
                  disabled={feeHeadsLoading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Plus className="h-4 w-4" /> Add Detail
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="space-y-3">
                {details.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
                    No details added yet. Use the form above to add fee head group details.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {details.map((detail, idx) => (
                      <div key={detail.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 space-y-1 sm:flex sm:gap-3 sm:items-center">
                          <input
                            value={detail.name}
                            onChange={(e) => updateDetailField(detail.id, 'name', e.target.value)}
                            placeholder="Detail name"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                          />
                          <select
                            value={detail.feeHeadId}
                            onChange={(e) => {
                              const v = e.target.value;
                              const found = feeHeadOptions.find((o) => o.value === v);
                              updateDetailField(detail.id, 'feeHeadId', v);
                              updateDetailField(detail.id, 'feeHeadName', found ? found.label : v);
                            }}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 sm:mt-0"
                          >
                            <option value="">Select fee head</option>
                            {feeHeadOptions.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => moveDetailUp(detail.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                            aria-label="Move up"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveDetailDown(detail.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                            aria-label="Move down"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeDetail(detail.id)}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                            aria-label="Remove detail"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:px-5 sm:py-5">
              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed border-collapse text-sm text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                      <th className="px-3 py-3 w-1/2">Detail</th>
                      <th className="px-3 py-3 w-1/3">Fee Head</th>
                      <th className="px-3 py-3 w-1/6">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.length > 0 ? (
                      details.map((detail) => (
                        <tr key={detail.id} className="border-b border-slate-200 last:border-0">
                            <td className="px-3 py-3">
                              <input
                                value={detail.name}
                                onChange={(e) => updateDetailField(detail.id, 'name', e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                              />
                            </td>
                            <td className="px-3 py-3">
                              <select
                                value={detail.feeHeadId}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  const found = feeHeadOptions.find((o) => o.value === v);
                                  updateDetailField(detail.id, 'feeHeadId', v);
                                  updateDetailField(detail.id, 'feeHeadName', found ? found.label : v);
                                }}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                              >
                                <option value="">Select fee head</option>
                                {feeHeadOptions.map((option) => (
                                  <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex gap-2">
                                <button type="button" onClick={() => moveDetailUp(detail.id)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs">Up</button>
                                <button type="button" onClick={() => moveDetailDown(detail.id)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs">Down</button>
                                <button
                                  type="button"
                                  onClick={() => removeDetail(detail.id)}
                                  className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                                >
                                  Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-3 py-6 text-center text-sm text-slate-500">
                          No fee head group details have been added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
