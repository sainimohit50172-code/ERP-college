import { useEffect, useMemo, useState } from 'react';
import { Edit3, Plus, RefreshCw, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'react-toastify';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Button from '../components/ui/Button.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import Modal from '../components/ui/Modal.jsx';
import SearchableSelect from '../components/ui/SearchableSelect.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import api from '../api/axios.js';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Draft', label: 'Draft' },
];

const BUNDLE_TYPE_OPTIONS = [
  { value: 'all', label: 'All bundle types' },
  { value: 'Standard', label: 'Standard' },
  { value: 'Premium', label: 'Premium' },
  { value: 'Custom', label: 'Custom' },
];

const FORM_DEFAULTS = {
  bundleName: '',
  bundleCode: '',
  bundleType: 'Standard',
  status: 'Active',
  description: '',
};

export default function ManageBundlesPage() {
  const [bundles, setBundles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [deleteBundle, setDeleteBundle] = useState(null);
  const [filter, setFilter] = useState({ status: 'all', bundleType: 'all', search: '' });
  const [form, setForm] = useState(FORM_DEFAULTS);
  const [formErrors, setFormErrors] = useState({});

  const loadBundles = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/coe/manage-bundles');
      setBundles(response.data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Unable to load bundles.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBundles();
  }, []);

  const filteredBundles = useMemo(() => {
    return bundles.filter((bundle) => {
      const searchText = filter.search.trim().toLowerCase();
      const matchesSearch = !searchText || [bundle.bundleName, bundle.bundleCode, bundle.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchText));

      const matchesStatus = filter.status === 'all' || bundle.status === filter.status;
      const matchesType = filter.bundleType === 'all' || bundle.bundleType === filter.bundleType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [bundles, filter]);

  const stats = useMemo(() => ({
    total: bundles.length,
    active: bundles.filter((bundle) => bundle.status === 'Active').length,
    inactive: bundles.filter((bundle) => bundle.status === 'Inactive').length,
    draft: bundles.filter((bundle) => bundle.status === 'Draft').length,
  }), [bundles]);

  const openCreateModal = () => {
    setSelectedBundle(null);
    setForm(FORM_DEFAULTS);
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (bundle) => {
    setSelectedBundle(bundle);
    setForm({
      bundleName: bundle.bundleName || '',
      bundleCode: bundle.bundleCode || '',
      bundleType: bundle.bundleType || 'Standard',
      status: bundle.status || 'Active',
      description: bundle.description || '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const refreshBundles = async () => {
    await loadBundles();
    toast.success('Bundles refreshed.');
  };

  const validateForm = () => {
    const errors = {};

    if (!form.bundleName.trim()) {
      errors.bundleName = 'Bundle name is required.';
    }
    if (!form.bundleCode.trim()) {
      errors.bundleCode = 'Bundle code is required.';
    }
    if (!form.bundleType.trim()) {
      errors.bundleType = 'Bundle type is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const payload = {
      bundleName: form.bundleName.trim(),
      bundleCode: form.bundleCode.trim(),
      bundleType: form.bundleType.trim(),
      status: form.status,
      description: form.description?.trim() || null,
    };

    setIsSaving(true);
    try {
      if (selectedBundle) {
        await api.put(`/coe/manage-bundles/${selectedBundle.id}`, payload);
        toast.success('Bundle updated successfully.');
      } else {
        await api.post('/coe/manage-bundles', payload);
        toast.success('Bundle created successfully.');
      }
      setShowModal(false);
      await loadBundles();
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Unable to save bundle.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteBundle) {
      setShowDeleteDialog(false);
      return;
    }

    try {
      await api.delete(`/coe/manage-bundles/${deleteBundle.id}`);
      toast.success('Bundle deleted successfully.');
      setDeleteBundle(null);
      setShowDeleteDialog(false);
      await loadBundles();
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Unable to delete bundle.');
    }
  };

  const handleToggleStatus = async (bundle) => {
    const nextStatus = bundle.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.patch(`/coe/manage-bundles/${bundle.id}/status?status_value=${nextStatus}`);
      setBundles((current) => current.map((item) => (item.id === bundle.id ? { ...item, status: nextStatus } : item)));
      toast.success(`Bundle marked ${nextStatus.toLowerCase()}.`);
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Unable to update bundle status.');
    }
  };

  const columns = [
    { key: 'bundleName', label: 'Bundle Name', sortable: true, minWidth: '220px' },
    { key: 'bundleCode', label: 'Bundle Code', sortable: true, minWidth: '160px' },
    { key: 'bundleType', label: 'Bundle Type', sortable: true, minWidth: '140px' },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      minWidth: '260px',
      render: (bundle) => <span className="line-clamp-2 text-sm text-slate-600">{bundle.description || '—'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      align: 'center',
      minWidth: '120px',
      render: (bundle) => <StatusBadge status={bundle.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      align: 'right',
      minWidth: '220px',
      render: (bundle) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="secondary" className="rounded-2xl px-3 py-2 text-[11px]" onClick={() => openEditModal(bundle)}>
            <Edit3 className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="success" className="rounded-2xl px-3 py-2 text-[11px]" onClick={() => handleToggleStatus(bundle)}>
            {bundle.status === 'Active' ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />} {bundle.status === 'Active' ? 'Deactivate' : 'Activate'}
          </Button>
          <Button variant="danger" className="rounded-2xl px-3 py-2 text-[11px]" onClick={() => { setDeleteBundle(bundle); setShowDeleteDialog(true); }}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-[calc(100vh-7rem)] rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-3 shadow-[0_18px_45px_rgba(15,23,42,0.06)] lg:p-5">
      <div className="rounded-[22px] border border-slate-200/70 bg-white/95 p-4 shadow-inner sm:p-6">
        <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'COE Master', to: '/settings/coe' }, { label: 'Manage Bundles' }]} />

        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">COE Master</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Manage Bundles</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Create and manage premium COE bundles with the same premium workflow used across COE master pages.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={refreshBundles} className="rounded-2xl px-4 py-2">
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button variant="primary" onClick={openCreateModal} className="rounded-2xl px-4 py-2">
              <Plus className="mr-2 h-4 w-4" /> Create bundle
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[24px] border border-slate-200/70 bg-emerald-50 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">Bundle insights</p>
                <p className="mt-2 text-sm text-slate-600">Snapshot of bundle status and volume.</p>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" /> Live count
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[18px] border border-slate-200 bg-white p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Total bundles</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{stats.total}</p>
              </div>
              <div className="rounded-[18px] border border-slate-200 bg-white p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Active</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{stats.active}</p>
              </div>
              <div className="rounded-[18px] border border-slate-200 bg-white p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Inactive</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{stats.inactive}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[18px] border border-slate-200 bg-white p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Draft bundles</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">{stats.draft}</p>
              </div>
              <div className="rounded-[18px] border border-slate-200 bg-white p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Filtered bundle set</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">{filteredBundles.length}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Filters</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Status</label>
                <SearchableSelect
                  options={STATUS_OPTIONS}
                  value={filter.status}
                  onChange={(value) => setFilter((prev) => ({ ...prev, status: value }))}
                  placeholder="Select status"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Bundle type</label>
                <SearchableSelect
                  options={BUNDLE_TYPE_OPTIONS}
                  value={filter.bundleType}
                  onChange={(value) => setFilter((prev) => ({ ...prev, bundleType: value }))}
                  placeholder="Select bundle type"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Search</label>
                <input
                  type="search"
                  value={filter.search}
                  onChange={(event) => setFilter((prev) => ({ ...prev, search: event.target.value }))}
                  placeholder="Search by name, code, or description"
                  className="h-10 w-full rounded-[6px] border border-slate-200 px-3 text-sm text-slate-900 outline-none"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6">
          <DataTable
            columns={columns}
            rows={filteredBundles}
            loading={isLoading}
            hideControls
            headerClassName="bg-emerald-900 text-white"
            placeholder="Search managed bundles..."
            initialPageSize={10}
            tableMaxHeight={560}
          />
        </div>
      </div>

      <Modal
        title={selectedBundle ? 'Edit Bundle' : 'Create Bundle'}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" form="manage-bundle-form" variant="primary" isLoading={isSaving}>
              Save bundle
            </Button>
          </>
        )}
      >
        <form id="manage-bundle-form" onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Bundle Name</label>
            <input
              type="text"
              value={form.bundleName}
              onChange={(event) => setForm((prev) => ({ ...prev, bundleName: event.target.value }))}
              className="h-11 w-full rounded-[10px] border border-slate-200 px-3 text-sm text-slate-900 outline-none"
            />
            {formErrors.bundleName && <p className="mt-1 text-xs text-rose-600">{formErrors.bundleName}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Bundle Code</label>
            <input
              type="text"
              value={form.bundleCode}
              onChange={(event) => setForm((prev) => ({ ...prev, bundleCode: event.target.value }))}
              className="h-11 w-full rounded-[10px] border border-slate-200 px-3 text-sm text-slate-900 outline-none"
            />
            {formErrors.bundleCode && <p className="mt-1 text-xs text-rose-600">{formErrors.bundleCode}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Bundle Type</label>
              <SearchableSelect
                options={BUNDLE_TYPE_OPTIONS.filter((option) => option.value !== 'all')}
                value={form.bundleType}
                onChange={(value) => setForm((prev) => ({ ...prev, bundleType: value }))}
                placeholder="Select bundle type"
              />
              {formErrors.bundleType && <p className="mt-1 text-xs text-rose-600">{formErrors.bundleType}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Status</label>
              <SearchableSelect
                options={STATUS_OPTIONS.filter((option) => option.value !== 'all')}
                value={form.status}
                onChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
                placeholder="Select status"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              rows={4}
              className="w-full rounded-[10px] border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none"
              placeholder="Add optional bundle details"
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete bundle"
        description={`Are you sure you want to delete the bundle "${deleteBundle?.bundleName || ''}"? This action can be restored by recreating the bundle.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
