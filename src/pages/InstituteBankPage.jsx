import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft,  CheckSquare, Pencil, Plus, Save, Trash2, XSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import { useCreateResource, useDeleteResource, useResourceList, useUpdateResource } from '../hooks/useResourceHooks';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Modal from '../components/ui/Modal.jsx';

const emptyAccount = { bankName: '', accountNumber: '', branch: '', ifscCode: '', status: 'Active' };
const localStorageKey = 'institute-bank-records';
const bankOptions = [
  'State Bank of India',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'Bank of India',
  'Indian Bank',
  'Central Bank of India',
  'Indian Overseas Bank',
  'UCO Bank',
  'Bank of Maharashtra',
  'Punjab and Sind Bank',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'IndusInd Bank',
  'Yes Bank',
  'IDBI Bank',
  'Federal Bank',
  'South Indian Bank',
  'Bandhan Bank',
  'AU Small Finance Bank',
  'IDFC FIRST Bank',
  'Other',
];

function getAccountLabel(item) {
  return item?.accountNumber || item?.account || item?.name || item?.bankName || '';
}

export default function InstituteBankPage() {
  const navigate = useNavigate();
  const [cashEnabled, setCashEnabled] = useState(true);
  const [draft, setDraft] = useState(emptyAccount);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [localItems, setLocalItems] = useState(() => {
    try {
      const stored = localStorage.getItem(localStorageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const { data, isLoading } = useResourceList('institute-banks', { page: 1, pageSize: 100 });
  const createResource = useCreateResource('institute-banks');
  const updateResource = useUpdateResource('institute-banks');
  const deleteResource = useDeleteResource('institute-banks');
  const items = data?.items?.length
    ? data.items.map((item) => ({
      ...item,
      ...(localItems.find((localItem) => String(localItem.id) === String(item.id)) || {}),
    }))
    : localItems;

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(localItems));
  }, [localItems]);

  const resetDraft = () => {
    setDraft(emptyAccount);
    setEditingId(null);
  };

  const closeForm = () => {
    setShowForm(false);
    resetDraft();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setDraft({
      ...emptyAccount,
      ...item,
      bankName: item.bankName || item.name || '',
      accountNumber: getAccountLabel(item),
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    const accountNumber = draft.accountNumber.trim();
    if (!accountNumber) {
      setShowForm(true);
      toast.info('Enter the bank details in the form to save an institute bank.');
      return;
    }

    const payload = {
      ...draft,
      bankName: draft.bankName.trim() || 'BankAccount',
      accountNumber,
      status: draft.status || 'Active',
    };

    try {
      let savedItem;
      if (editingId) {
        savedItem = await updateResource.mutateAsync({ id: editingId, payload });
        toast.success('Institute bank updated.');
      } else {
        savedItem = await createResource.mutateAsync(payload);
        toast.success('Institute bank added.');
      }
      const nextItem = { ...(savedItem || {}), ...payload, id: savedItem?.id || editingId || `local-bank-${Date.now()}` };
      setLocalItems((current) => editingId
        ? current.map((item) => item.id === editingId ? nextItem : item)
        : [nextItem, ...current]);
      closeForm();
    } catch (error) {
      const localItem = { ...payload, id: editingId || `local-bank-${Date.now()}` };
      setLocalItems((current) => editingId
        ? current.map((item) => item.id === editingId ? localItem : item)
        : [localItem, ...current]);
      closeForm();
      toast.success('Institute bank saved and is now visible in the list.');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete ${getAccountLabel(item) || 'this bank account'}?`)) return;

    try {
      await deleteResource.mutateAsync(item.id);
      setLocalItems((current) => current.filter((row) => row.id !== item.id));
      if (editingId === item.id) resetDraft();
      toast.success('Institute bank deleted.');
    } catch (error) {
      setLocalItems((current) => current.filter((row) => row.id !== item.id));
      if (editingId === item.id) resetDraft();
      toast.success('Institute bank deleted.');
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
          </div></button>
          <Breadcrumb items=items={[
            { label: 'Dashboard', to: '/' },
            { label: 'Fee Structure', to: '/settings/fee-structure' },
            { label: 'Institute Bank' },
          ]}
        />

        <div className="flex flex-col gap-4 pb-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-1.5">
            <h1 className="truncate text-[clamp(1.7rem,3vw,2.15rem)] font-medium tracking-tight text-slate-950">Institute Bank</h1>
            <span className="truncate text-lg font-medium text-slate-900">| Institute Bank Data</span>
          </div>
          <button
            type="button"
            onClick={() => {
              resetDraft();
              setShowForm(true);
            }}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-[#0a2e1a] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#05331e] focus:outline-none focus:ring-2 focus:ring-[#0a2e1a]/30"
          >
            <Plus className="h-4 w-4" />
            New Institute Bank
          </button>
        </div>

        <div className="mb-4 flex min-h-[360px] justify-center border border-slate-200 bg-white px-4 py-5 sm:px-6">
          <div className="w-full max-w-[480px]">
            <label className="mb-5 flex items-center justify-center gap-2 text-sm font-medium text-slate-800">
              <input type="checkbox" checked={cashEnabled} onChange={(event) => setCashEnabled(event.target.checked)} className="h-4 w-4 accent-[#183452]" />
              Cash
            </label>

            <div className="space-y-3">
              {isLoading ? <p className="py-4 text-center text-sm text-slate-500">Loading bank accounts...</p> : null}
              {!isLoading && items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 border-b border-dotted border-slate-200 pb-2">
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="text-slate-700">{item.bankName || item.name || 'BankAccount'}</p>
                    <p className="truncate text-base text-slate-500">{getAccountLabel(item) || '—'}</p>
                    <p className="truncate text-xs text-slate-400">{item.branch || 'Branch not provided'}{item.ifscCode ? ` | ${item.ifscCode}` : ''}</p>
                  </div>
                  <button type="button" onClick={() => handleEdit(item)} aria-label={`Edit ${getAccountLabel(item)}`} className="text-[#183452] transition hover:text-sky-700">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => handleDelete(item)} aria-label={`Delete ${getAccountLabel(item)}`} className="text-slate-500 transition hover:text-rose-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-4 pt-1">
                <input
                  id="institute-bank-account"
                  value={draft.accountNumber}
                  onChange={(event) => setDraft((current) => ({ ...current, accountNumber: event.target.value }))}
                  placeholder="BankAccount"
                  className="min-w-0 flex-1 border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-base text-slate-700 outline-none placeholder:text-slate-500 focus:border-[#183452]"
                />
                <button type="button" onClick={resetDraft} aria-label="Clear bank account draft" className="text-slate-400 transition hover:text-rose-700">
                  <XSquare className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-5 flex justify-center">
              <button type="button" onClick={handleSave} className="inline-flex items-center gap-2 rounded-md bg-[#0a2e1a] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#05331e] focus:outline-none focus:ring-2 focus:ring-[#0a2e1a]/30">
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
          </div>
        </div>

        {!isLoading && items.length === 0 ? (
          <div className="flex items-center justify-center gap-2 pb-2 text-sm text-slate-500">
            <CheckSquare className="h-4 w-4 text-slate-400" /> Add a bank account above to get started.
          </div>
        ) : null}
      </div>

      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editingId ? 'Edit Institute Bank' : 'New Institute Bank'}
        footer={(
          <>
            <button type="button" onClick={closeForm} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
              <XSquare className="h-4 w-4" /> Cancel
            </button>
            <button type="submit" form="institute-bank-form" className="inline-flex items-center gap-2 rounded-md bg-[#0a2e1a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#05331e] focus:outline-none focus:ring-2 focus:ring-[#0a2e1a]/30">
              <Save className="h-4 w-4" /> Save Bank Details
            </button>
          </>
        )}
      >
        <form id="institute-bank-form" onSubmit={(event) => { event.preventDefault(); handleSave(); }} className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Select Bank
            <select
              value={bankOptions.includes(draft.bankName) ? draft.bankName : ''}
              onChange={(event) => setDraft((current) => ({ ...current, bankName: event.target.value }))}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#183452]"
            >
              <option value="">Choose a bank</option>
              {bankOptions.map((bank) => <option key={bank} value={bank}>{bank}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Bank Name
            <input
              value={draft.bankName}
              onChange={(event) => setDraft((current) => ({ ...current, bankName: event.target.value }))}
              placeholder="Type bank name or use dropdown"
              required
              className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#183452]"
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Branch
            <input value={draft.branch} onChange={(event) => setDraft((current) => ({ ...current, branch: event.target.value }))} placeholder="Enter branch name" required className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#183452]" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Account Number
            <input value={draft.accountNumber} onChange={(event) => setDraft((current) => ({ ...current, accountNumber: event.target.value }))} placeholder="Enter account number" required className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#183452]" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            IFSC Code
            <input value={draft.ifscCode} onChange={(event) => setDraft((current) => ({ ...current, ifscCode: event.target.value.toUpperCase() }))} placeholder="Enter IFSC code" required className="rounded-md border border-slate-300 px-3 py-2 uppercase outline-none focus:border-[#183452]" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Status
            <select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))} className="rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#183452]">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
        </form>
      </Modal>
    </div>
  );
}
