import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GripVertical, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../api/axios.js';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Button from '../components/ui/Button.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import Modal from '../components/ui/Modal.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';

const FILTER_OPTIONS = [
  'Previous Dues',
  'Transport',
  'Miscellaneous',
  'Cheque Bounce',
  'Fine',
  'Library Fine',
  'Subject Fee',
  'Library Book Security',
  'Library Book Lost Fine',
];

const DEFAULT_FORM_VALUES = {
  feeHeadName: '',
  feeType: 'Fixed',
  displayOrder: 0,
  status: 'Active',
  description: '',
  feeHeadCode: '',
  receiptHead: '',
  feeCategory: '',
  isRefundable: false,
  taxApplicable: false,
};

const getAutoCode = (label) => {
  if (!label) return '';
  return label
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/g, '');
};

export default function FeeHeadManagementPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editorItem, setEditorItem] = useState(null);
  const [removeItem, setRemoveItem] = useState(null);
  const [query, setQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [dragSourceId, setDragSourceId] = useState(null);
  const [originalOrder, setOriginalOrder] = useState([]);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: DEFAULT_FORM_VALUES });

  const loadFeeHeads = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/coe/fee-heads');
      const fetched = (response.data?.data || []).map((item) => ({
        ...item,
        displayOrder: Number(item.displayOrder ?? item.display_order ?? 0),
      })).sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id);
      setItems(fetched);
      setOriginalOrder(fetched.map((item) => item.id));
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Unable to load fee heads.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeeHeads();
  }, []);

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const hasFilters = selectedFilters.length > 0;

    return items.filter((item) => {
      const content = `${item.feeHeadName} ${item.feeCategory} ${item.receiptHead}`.toLowerCase();
      if (hasFilters) {
        const matchesFilter = selectedFilters.some((filter) => content.includes(filter.toLowerCase()));
        if (!matchesFilter) return false;
      }
      if (!normalizedQuery) return true;
      return content.includes(normalizedQuery);
    });
  }, [items, query, selectedFilters]);

  const hasOrderChanges = useMemo(() => {
    return items.some((item, index) => item.id !== originalOrder[index]);
  }, [items, originalOrder]);

  const handleToggleFilter = (filter) => {
    setSelectedFilters((current) =>
      current.includes(filter)
        ? current.filter((value) => value !== filter)
        : [...current, filter],
    );
  };

  const openCreate = () => {
    reset(DEFAULT_FORM_VALUES);
    setEditorItem(null);
    setShowModal(true);
  };

  const openEdit = (item) => {
    reset({
      feeHeadName: item.feeHeadName || '',
      feeType: item.amountType || 'Fixed',
      displayOrder: Number(item.displayOrder ?? 0),
      status: item.status || 'Active',
      description: item.description || '',
      feeHeadCode: item.feeHeadCode || getAutoCode(item.feeHeadName),
      receiptHead: item.receiptHead || item.feeHeadName || '',
      feeCategory: item.feeCategory || '',
      isRefundable: item.isRefundable ?? false,
      taxApplicable: item.taxApplicable ?? false,
    });
    setEditorItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditorItem(null);
    reset(DEFAULT_FORM_VALUES);
  };

  const handleDragStart = (itemId) => {
    setDragSourceId(itemId);
  };

  const handleDragEnter = (targetId) => {
    if (!dragSourceId || dragSourceId === targetId) return;
    setItems((current) => {
      const sourceIndex = current.findIndex((item) => item.id === dragSourceId);
      const targetIndex = current.findIndex((item) => item.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) return current;
      const next = [...current];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next.map((item, index) => ({ ...item, displayOrder: index + 1 }));
    });
  };

  const handleDragEnd = () => {
    setDragSourceId(null);
  };

  const saveOrder = async () => {
    if (!hasOrderChanges) {
      toast.info('No changes to save.');
      return;
    }

    setIsSaving(true);
    try {
      await Promise.all(
        items.map((item) => api.put(`/coe/fee-heads/${item.id}`, { displayOrder: item.displayOrder })),
      );
      toast.success('Fee head order saved successfully.');
      await loadFeeHeads();
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Unable to save fee head order.');
    } finally {
      setIsSaving(false);
    }
  };

  const submitFeeHead = async (values) => {
    const payload = {
      feeHeadName: values.feeHeadName.trim(),
      feeHeadCode: values.feeHeadCode.trim() || getAutoCode(values.feeHeadName),
      receiptHead: values.receiptHead.trim() || values.feeHeadName.trim(),
      feeCategory: values.feeCategory.trim() || 'General',
      displayOrder: Number(values.displayOrder ?? items.length + 1),
      amountType: values.feeType,
      isRefundable: values.isRefundable,
      taxApplicable: values.taxApplicable,
      status: values.status,
      description: values.description?.trim() || null,
    };

    try {
      const response = editorItem
        ? await api.put(`/coe/fee-heads/${editorItem.id}`, payload)
        : await api.post('/coe/fee-heads', payload);

      const saved = response.data?.data;
      if (saved) {
        setItems((current) => {
          const next = editorItem
            ? current.map((item) => (item.id === saved.id ? { ...item, ...saved, displayOrder: Number(saved.displayOrder ?? item.displayOrder) } : item))
            : [...current, { ...saved, displayOrder: Number(saved.displayOrder ?? current.length + 1) }];
          return next.sort((a, b) => a.displayOrder - b.displayOrder);
        });
      }

      toast.success(editorItem ? 'Fee head updated successfully.' : 'Fee head created successfully.');
      closeModal();
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Unable to save fee head.');
    }
  };

  const confirmDelete = async () => {
    if (!removeItem) return;
    try {
      await api.delete(`/coe/fee-heads/${removeItem.id}`);
      setItems((current) => current.map((item) => (item.id === removeItem.id ? { ...item, status: 'Inactive' } : item)));
      toast.success('Fee head deleted successfully.');
      setRemoveItem(null);
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Unable to delete fee head.');
    }
  };

  return (
    <div className="space-y-6 px-4 pb-6 sm:px-0">
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Fee Structure', to: '/settings/fee-structure' }, { label: 'Fee Head' }]} />

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">Fee Structure</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Fee Head</h1>
          </div>
          <Button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
            <Plus className="h-4 w-4" /> New Fee Head
          </Button>
        </div>

        <div className="mb-5 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="flex flex-wrap gap-3">
              {FILTER_OPTIONS.map((filter) => (
                <label key={filter} className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50/70">
                  <input
                    type="checkbox"
                    checked={selectedFilters.includes(filter)}
                    onChange={() => handleToggleFilter(filter)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{filter}</span>
                </label>
              ))}
            </div>
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search fee heads..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white px-1 py-1 shadow-sm">
            {isLoading ? (
              <div className="py-20 text-center text-sm text-slate-500">Loading fee heads...</div>
            ) : visibleItems.length === 0 ? (
              <div className="py-20 text-center text-sm text-slate-500">No fee heads found. Adjust filters, search, or add a new fee head.</div>
            ) : (
              <div className="space-y-3">
                {visibleItems.map((item, index) => (
                  <article
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(item.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDragEnter={() => handleDragEnter(item.id)}
                    onDragEnd={handleDragEnd}
                    className="group flex items-center justify-between gap-4 rounded-[20px] border border-slate-200 bg-white px-4 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">{item.feeHeadName || 'Untitled Fee Head'}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>{item.feeCategory || 'General'}</span>
                          <span>•</span>
                          <span>{item.status || 'Active'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden min-w-[180px] items-center gap-2 sm:flex">
                      <StatusBadge status={item.status} />
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Order {item.displayOrder}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                        aria-label="Edit fee head"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRemoveItem(item)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
                        aria-label="Delete fee head"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <span className="inline-flex h-10 w-10 cursor-grab items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100" title="Drag to reorder">
                        <GripVertical className="h-4 w-4" />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            To change the order of Fee Heads you can use drag and drop and then click Save.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button type="button" onClick={saveOrder} disabled={!hasOrderChanges || isSaving} isLoading={isSaving} className="min-w-[150px]">
              Save
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/settings/fee-structure/fee-head-group')} className="min-w-[150px]">
              Next
            </Button>
          </div>
        </div>
      </div>

      <Modal
        title={editorItem ? 'Edit Fee Head' : 'New Fee Head'}
        isOpen={showModal}
        onClose={closeModal}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" form="fee-head-form" isLoading={false}>
              Save
            </Button>
          </>
        }
      >
        <form id="fee-head-form" onSubmit={handleSubmit(submitFeeHead)} className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="block text-sm font-semibold text-slate-700">Fee Head Name *</span>
            <input
              type="text"
              {...register('feeHeadName', { required: 'Fee Head Name is required' })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
            />
            {errors.feeHeadName && <p className="text-xs text-rose-600">{errors.feeHeadName.message}</p>}
          </label>

          <label className="space-y-2">
            <span className="block text-sm font-semibold text-slate-700">Fee Type *</span>
            <select
              {...register('feeType', { required: 'Fee Type is required' })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
            >
              <option value="Fixed">Fixed</option>
              <option value="Variable">Variable</option>
            </select>
            {errors.feeType && <p className="text-xs text-rose-600">{errors.feeType.message}</p>}
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="block text-sm font-semibold text-slate-700">Description</span>
            <textarea
              rows="4"
              {...register('description')}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
            />
          </label>

          <label className="space-y-2">
            <span className="block text-sm font-semibold text-slate-700">Display Order</span>
            <input
              type="number"
              {...register('displayOrder', {
                valueAsNumber: true,
                min: { value: 0, message: 'Order must be zero or greater' },
              })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
            />
            {errors.displayOrder && <p className="text-xs text-rose-600">{errors.displayOrder.message}</p>}
          </label>

          <label className="space-y-2">
            <span className="block text-sm font-semibold text-slate-700">Status</span>
            <select
              {...register('status', { required: 'Status is required' })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            {errors.status && <p className="text-xs text-rose-600">{errors.status.message}</p>}
          </label>

          <input type="hidden" {...register('feeHeadCode')} />
          <input type="hidden" {...register('receiptHead')} />
          <input type="hidden" {...register('feeCategory')} />
          <input type="hidden" {...register('isRefundable')} />
          <input type="hidden" {...register('taxApplicable')} />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(removeItem)}
        title="Delete fee head?"
        description="This will move the fee head to inactive status and preserve its record."
        confirmLabel="Delete"
        onCancel={() => setRemoveItem(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
