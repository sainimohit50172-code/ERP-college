import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useResourceList,
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
  useBulkImport,
  useBulkExport,
} from '../hooks/useResourceHooks';
import { FaBuilding, FaDownload, FaEdit, FaFileImport, FaPlus, FaTrash } from 'react-icons/fa';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';

const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

const defaultValues = {
  code: '',
  name: '',
  head: '',
  officeLocation: '',
  status: 'Active',
};

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export default function OrganizationManagementPage() {
  const importInputRef = useRef(null);
  const { data: organizationsData } = useResourceList('organizations', { page: 1, pageSize: 200 });
  const organizations = organizationsData?.items || [];
  const createOrganization = useCreateResource('organizations');
  const updateOrganization = useUpdateResource('organizations');
  const deleteOrganization = useDeleteResource('organizations');
  const importOrganization = useBulkImport('organizations');
  const exportOrganization = useBulkExport('organizations');

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [importStatus, setImportStatus] = useState('');
  const [_isExporting, setIsExporting] = useState(false);
  const pageSize = 6;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });

  const filteredOrganizations = useMemo(() => {
    return organizations.filter((organization) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = [organization.code, organization.name, organization.head, organization.officeLocation]
        .filter(Boolean)
        .some((field) => field.toString().toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || organization.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [organizations, search, filter]);

  const pageCount = Math.max(1, Math.ceil(filteredOrganizations.length / pageSize));
  const displayedOrganizations = filteredOrganizations.slice((page - 1) * pageSize, page * pageSize);
  const activeOrganizations = organizations.filter((organization) => organization.status === 'Active').length;

  const resetForm = () => {
    reset(defaultValues);
    setSelectedOrganization(null);
    setIsEditMode(false);
  };

  const openNewOrganizationModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditOrganizationModal = (organization) => {
    setSelectedOrganization(organization);
    setIsEditMode(true);
    reset({
      code: organization.code || '',
      name: organization.name || '',
      head: organization.head || '',
      officeLocation: organization.officeLocation || '',
      status: organization.status || 'Active',
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data) => {
    const payload = { ...data };
    if (isEditMode && selectedOrganization) {
      updateOrganization.mutate({ id: selectedOrganization.id, payload }, { onSuccess: () => { resetForm(); setPage(1); setIsModalOpen(false); } });
    } else {
      createOrganization.mutate(payload, { onSuccess: () => { resetForm(); setPage(1); setIsModalOpen(false); } });
    }
  };

  const handleDelete = (organization) => {
    if (!window.confirm(`Delete organization unit ${organization.name}?`)) return;
    deleteOrganization.mutate(organization.id);
  };

  const handleImport = (file) => {
    if (!file) return;
    setImportStatus('Importing organization units…');
    const formData = new FormData();
    formData.append('file', file);
    importOrganization.mutate(formData, {
      onSuccess: () => setImportStatus('Organization units imported successfully.'),
      onError: () => setImportStatus('Import failed. Please try a valid CSV file.'),
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    handleImport(file);
    event.target.value = '';
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportOrganization.mutateAsync();
      downloadBlob(blob, 'organizations-export.xlsx');
    } catch (error) {
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Organization management"
        subtitle="Configure company units, HR centers, and departmental locations."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700"
            >
              <FaDownload /> Export
            </button>
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700"
            >
              <FaFileImport /> Import
            </button>
            <button
              type="button"
              onClick={openNewOrganizationModal}
              className="inline-flex items-center gap-2 rounded-3xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              <FaPlus /> Add organization
            </button>
          </div>
        }
      />
      <input ref={importInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.3fr)]">
        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Organization units</p>
              <p className="mt-3 text-2xl font-semibold text-white">{organizations.length}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Active units</p>
              <p className="mt-3 text-2xl font-semibold text-white">{activeOrganizations}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Locations tracked</p>
              <p className="mt-3 text-2xl font-semibold text-white">{new Set(organizations.map((org) => org.officeLocation)).size}</p>
            </div>
          </div>
          <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Organization directory</h2>
                <p className="text-sm text-slate-400">Manage HR centers, branches, and shared services groups.</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} />
            </div>
            <div className="mt-4">
              <DataTable
                columns={['Code', 'Unit', 'Head', 'Location', 'Status', 'Actions']}
                rows={displayedOrganizations.map((organization) => [
                  organization.code,
                  organization.name,
                  organization.head,
                  organization.officeLocation,
                  <StatusBadge key={`${organization.id}-status`} status={organization.status} />,
                  <div key={`${organization.id}-actions`} className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openEditOrganizationModal(organization)}
                      className="rounded-full border border-white/10 bg-slate-800/80 px-3 py-2 text-xs text-slate-200 transition hover:bg-slate-700"
                    >
                      <FaEdit className="inline-block" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(organization)}
                      className="rounded-full border border-white/10 bg-rose-500/10 px-3 py-2 text-xs text-rose-300 transition hover:bg-rose-500/20"
                    >
                      <FaTrash className="inline-block" /> Remove
                    </button>
                  </div>,
                ])}
              />
            </div>
            <div className="mt-4">
              <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
            </div>
          </div>
        </div>
        <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/70 text-emerald-300">
              <FaBuilding className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">HR footprint</p>
              <h3 className="text-lg font-semibold text-white">Unit coverage</h3>
            </div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-[22px] border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Most common location</p>
              <p className="mt-2 text-2xl font-semibold text-white">{organizations[0]?.officeLocation || 'N/A'}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Total branches</p>
              <p className="mt-2 text-2xl font-semibold text-white">{new Set(organizations.map((org) => org.officeLocation)).size}</p>
            </div>
          </div>
        </div>
      </div>
      {importStatus && (
        <div className="rounded-[28px] border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-200">{importStatus}</div>
      )}
      <Modal
        title={isEditMode ? 'Update organization unit' : 'Add organization unit'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        footer={
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isEditMode ? 'Update unit' : 'Save unit'}
          </button>
        }
      >
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Unit code">
            <input
              type="text"
              {...register('code', { required: 'Code is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400"
              placeholder="ORG-01"
            />
            {errors.code && <p className="mt-1 text-sm text-rose-400">{errors.code.message}</p>}
          </FormField>
          <FormField label="Unit name">
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400"
              placeholder="Human Resources"
            />
            {errors.name && <p className="mt-1 text-sm text-rose-400">{errors.name.message}</p>}
          </FormField>
          <FormField label="Unit head">
            <input
              type="text"
              {...register('head', { required: 'Head is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400"
              placeholder="Ayesha Patel"
            />
            {errors.head && <p className="mt-1 text-sm text-rose-400">{errors.head.message}</p>}
          </FormField>
          <FormField label="Office location">
            <input
              type="text"
              {...register('officeLocation', { required: 'Location is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400"
              placeholder="Main campus"
            />
            {errors.officeLocation && <p className="mt-1 text-sm text-rose-400">{errors.officeLocation.message}</p>}
          </FormField>
          <FormField label="Status">
            <select
              {...register('status', { required: 'Status is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            {errors.status && <p className="mt-1 text-sm text-rose-400">{errors.status.message}</p>}
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
