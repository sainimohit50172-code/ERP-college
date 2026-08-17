import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft,  Eye, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import { useCreateResource, useResourceList } from '../hooks/useResourceHooks.js';

const makeRow = (id) => ({
  id,
  name: '',
  feeHead: '',
});

const fallbackFeeHeads = [
  'Academic Fees',
  'Examination Fees',
  'Hostel Fees',
  'Transport',
  'Library Fees',
  'Lab Fees',
  'Miscellaneous Fee',
];

export default function TuitionFeeCertificateGroupingPage() {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [rows, setRows] = useState([makeRow(Date.now())]);
  const [savedRecords, setSavedRecords] = useState([]);
  const { data: feeHeadData = { items: [] }, isLoading: feeHeadsLoading } = useResourceList('fee-heads', { page: 1, pageSize: 100 });

  const feeHeadOptions = useMemo(() => {
    const apiOptions = (feeHeadData?.items || []).map((item) => ({
      value: String(item.id ?? item.feeHeadId ?? ''),
      label: item.feeHeadName || item.name || item.feeHeadCode || 'Fee Head',
    }));

    if (apiOptions.length > 0) return apiOptions;

    return fallbackFeeHeads.map((label, index) => ({ value: String(index + 1), label }));
  }, [feeHeadData]);

  const createGrouping = useCreateResource('tuition-fee-certificate-groups');

  const addRow = () => {
    setRows((current) => [...current, makeRow(Date.now() + Math.random())]);
  };

  const removeRow = (id) => {
    setRows((current) => {
      if (current.length === 1) {
        return [makeRow(Date.now())];
      }
      return current.filter((row) => row.id !== id);
    });
  };

  const updateRow = (id, field, value) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const handleSave = async () => {
    const normalizedGroupName = groupName.trim();
    const validRows = rows.filter((row) => row.name.trim() || row.feeHead);

    if (!normalizedGroupName) {
      toast.error('Please enter a group name.');
      return;
    }

    if (validRows.length === 0) {
      toast.error('Please add at least one fee certificate detail.');
      return;
    }

    const payload = {
      groupName: normalizedGroupName,
      groupCode: `TFC-${Date.now().toString().slice(-6)}`,
      status: 'Active',
      description: `Tuition fee certificate grouping for ${normalizedGroupName}`,
      details: validRows.map((row) => {
        const selectedFeeHead = feeHeadOptions.find((option) => String(option.value) === String(row.feeHead));
        return {
          name: row.name.trim(),
          feeHeadId: row.feeHead ? Number(row.feeHead) || row.feeHead : null,
          feeHeadName: selectedFeeHead?.label || row.feeHead || '',
          feeHead: row.feeHead || selectedFeeHead?.label || '',
        };
      }),
    };

    try {
      const result = await createGrouping.mutateAsync(payload);
      const savedDetail = {
        id: result?.id ?? Date.now(),
        groupName: normalizedGroupName,
        groupCode: payload.groupCode,
        status: payload.status,
        description: payload.description,
        details: payload.details.map((detail, index) => ({
          ...detail,
          serialNo: index + 1,
        })),
      };

      setSavedRecords((current) => [savedDetail, ...current]);
      toast.success('Tuition fee certificate grouping saved successfully.');
      setGroupName('');
      setRows([makeRow(Date.now())]);
    } catch (error) {
      toast.error(error?.message || 'Could not save tuition fee certificate grouping.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] bg-[#e9edf1] px-4 py-4 sm:px-5 lg:px-6">
      <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </div></button>
          <Breadcrumb items=items={[
          { label: 'Dashboard', to: '/' },
          { label: 'Settings', to: '/settings' },
          { label: 'Fee Structure', to: '/settings/fee-structure' },
          { label: 'Tuition Fee Certificate Grouping' },
        ]}
      />

      <div className="mt-2 flex items-center gap-3 pb-3 text-[1.65rem] font-semibold tracking-[-0.06em] text-slate-900 sm:text-[2.15rem]">
        <span>Tuition Fee Certificate Grouping</span>
        <span className="h-8 w-px bg-slate-400/80" />
        <span className="text-[0.9rem] font-medium tracking-[0.02em] text-slate-500 sm:text-[1.05rem]">
          Tuition Fee Certificate Grouping
        </span>
      </div>

      <div className="rounded-[18px] border border-slate-200 bg-[#f3f5f7] p-0 shadow-[0_10px_14px_rgba(15,23,42,0.04)]">
        <div className="p-4 pb-3 sm:p-5 sm:pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:max-w-[400px]">
              <label htmlFor="group-name" className="mb-2 block text-[12px] font-medium text-slate-600">
                Group Name
              </label>
              <input
                id="group-name"
                name="groupName"
                type="text"
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                placeholder="Enter Group Name"
                className="h-[44px] w-full rounded-[8px] border border-slate-200 bg-white px-3 text-[15px] text-slate-800 outline-none transition focus:border-[#1E3A5F] focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div className="flex items-center gap-3 self-end md:gap-4">
              <button
                type="button"
                onClick={addRow}
                aria-label="Add new details"
                className="inline-flex items-center gap-2 border-0 bg-transparent p-0 text-sm font-medium text-[#1c6fb9] transition hover:text-[#14589a]"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#e7f1fb] text-[#1c6fb9]">
                  <Plus className="h-4 w-4" />
                </span>
                <span>Add New Details</span>
              </button>

              <button
                type="button"
                onClick={() => setRows([makeRow(Date.now())])}
                aria-label="Reset details"
                className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {rows.map((row) => (
              <div key={row.id} className="flex flex-col gap-3 md:flex-row md:items-end">
                <div className="w-full md:max-w-[48%]">
                  <label htmlFor={`student-name-${row.id}`} className="mb-2 block text-[12px] font-medium text-slate-600">
                    Student Name
                  </label>
                  <input
                    id={`student-name-${row.id}`}
                    name={`studentName-${row.id}`}
                    type="text"
                    value={row.name}
                    onChange={(event) => updateRow(row.id, 'name', event.target.value)}
                    placeholder="Enter Student Name"
                    className="h-[44px] w-full rounded-[8px] border border-slate-200 bg-white px-3 text-[15px] text-slate-800 outline-none transition focus:border-[#1E3A5F] focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div className="w-full md:max-w-[48%]">
                  <label htmlFor={`fee-head-${row.id}`} className="mb-2 block text-[12px] font-medium text-slate-600">
                    Select Fee Head
                  </label>
                  <select
                    id={`fee-head-${row.id}`}
                    name={`feeHead-${row.id}`}
                    value={row.feeHead}
                    onChange={(event) => updateRow(row.id, 'feeHead', event.target.value)}
                    disabled={feeHeadsLoading}
                    className="h-[44px] w-full rounded-[8px] border border-slate-200 bg-white px-3 text-[15px] text-slate-800 outline-none transition focus:border-[#1E3A5F] focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <option value="">Select Fee Heads</option>
                    {feeHeadOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end md:w-[80px]">
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
                      aria-label="Remove detail"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={createGrouping.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#0a2e1a] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_16px_rgba(10,46,26,0.18)] transition hover:bg-[#081f15] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {createGrouping.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[18px] border border-slate-200 bg-[#e9edf1] shadow-[0_10px_14px_rgba(15,23,42,0.04)]">
        <div className="px-4 py-3">
          <h2 className="text-[15px] font-semibold text-slate-800 sm:text-[17px]">Saved Records</h2>
        </div>

        {savedRecords.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-500">
            No saved certificate grouping records yet.
          </div>
        ) : (
          <div className="overflow-x-auto bg-[#e9edf1]">
            <table className="min-w-full table-fixed border-collapse text-left text-[14px] text-slate-700">
              <thead className="bg-[#0b4b3d] text-white">
                <tr>
                  {['S.NO', 'STUDENT NAME', 'GROUP NAME', 'GROUP CODE', 'STATUS', 'DESCRIPTION', 'FEE HEAD', 'ACTION'].map((heading, index) => (
                    <th
                      key={heading}
                      className={`border-r border-white/20 bg-[#0c5c4d] px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.02em] ${
                        index === 0 ? 'pl-3' : ''
                      }`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-[#f5f5f5]">
                {savedRecords.flatMap((record, recordIndex) =>
                  record.details.map((detail, detailIndex) => (
                    <tr key={`${record.id}-${detail.serialNo ?? detailIndex}`} className="align-top odd:bg-[#f5f5f5] even:bg-[#f1f3f2]">
                      <td className="border-r border-slate-200 px-2 py-2.5 text-center text-[12px]">{recordIndex + 1}</td>
                      <td className="border-r border-slate-200 px-2 py-2.5 text-center text-[12px]">{detail.name || '—'}</td>
                      <td className="border-r border-slate-200 px-2 py-2.5 text-center text-[12px]">{record.groupName}</td>
                      <td className="border-r border-slate-200 px-2 py-2.5 text-center text-[12px]">{record.groupCode}</td>
                      <td className="border-r border-slate-200 px-2 py-2.5 text-center text-[12px]">
                        <span className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                          {record.status}
                        </span>
                      </td>
                      <td className="border-r border-slate-200 px-2 py-2.5 text-center text-[12px]">{record.description}</td>
                      <td className="border-r border-slate-200 px-2 py-2.5 text-center text-[12px]">{detail.feeHeadName || detail.feeHead || '—'}</td>
                      <td className="px-2 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            aria-label="View record"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-sky-200 hover:text-sky-700"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label="Edit record"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-amber-200 hover:text-amber-700"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label="Delete record"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-rose-200 hover:text-rose-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
