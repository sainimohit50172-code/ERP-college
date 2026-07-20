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
import { FaChartLine, FaDownload, FaEdit, FaFileImport, FaPlus, FaTrash } from 'react-icons/fa';
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
  title: '',
  level: '1',
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

export default function DesignationManagementPage() {
  const importInputRef = useRef(null);
  const { data: designationsData } = useResourceList('designations', { page: 1, pageSize: 200 });
  const designations = designationsData?.items || [];
  const createDesignation = useCreateResource('designations');
  const updateDesignation = useUpdateResource('designations');
  const deleteDesignation = useDeleteResource('designations');
  const importDesignation = useBulkImport('designations');
  const exportDesignation = useBulkExport('designations');

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [importStatus, setImportStatus] = useState('');
  const [_isExporting, setIsExporting] = useState(false);
  const pageSize = 6;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });

  const filteredDesignations = useMemo(() => {
    return designations.filter((designation) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = [designation.code, designation.title, designation.level]
        .filter(Boolean)
        .some((field) => field.toString().toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || designation.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [designations, search, filter]);

  const pageCount = Math.max(1, Math.ceil(filteredDesignations.length / pageSize));
  const displayedDesignations = filteredDesignations.slice((page - 1) * pageSize, page * pageSize);
  const activeDesignations = designations.filter((designation) => designation.status === 'Active').length;
  const averageLevel = designations.length
    ? (designations.reduce((sum, designation) => sum + Number(designation.level || 0), 0) / designations.length).toFixed(1)
    : '0.0';

  const resetForm = () => {
    reset(defaultValues);
    setSelectedDesignation(null);
    setIsEditMode(false);
  };

  const openNewDesignationModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditDesignationModal = (designation) => {
    setSelectedDesignation(designation);
    setIsEditMode(true);
    reset({
      code: designation.code || '',
      title: designation.title || '',
      level: String(designation.level || '1'),
      status: designation.status || 'Active',
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data) => {
    const payload = {
      ...data,
      level: Number(data.level),
    };
    if (isEditMode && selectedDesignation) {
      updateDesignation.mutate({ id: selectedDesignation.id, payload }, { onSuccess: () => { resetForm(); setPage(1); setIsModalOpen(false); } });
    } else {
      createDesignation.mutate(payload, { onSuccess: () => { resetForm(); setPage(1); setIsModalOpen(false); } });
    }
  };

  const handleDelete = (designation) => {
    if (!window.confirm(`Delete designation ${designation.title}?`)) return;
    deleteDesignation.mutate(designation.id);
  };

  const handleImport = (file) => {
    if (!file) return;
    setImportStatus('Importing designations…');
    const formData = new FormData();
    formData.append('file', file);
    importDesignation.mutate(formData, {
      onSuccess: () => setImportStatus('Designations imported successfully.'),
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
      const blob = await exportDesignation.mutateAsync();
      downloadBlob(blob, 'designations-export.xlsx');
    } catch (error) {
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Designation management"
        subtitle="Manage role levels, job titles, and HR staffing hierarchies."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700 hover-gradient-border"
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
              onClick={openNewDesignationModal}
              className="inline-flex items-center gap-2 rounded-3xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 hover-gradient-border"
            >
              <FaPlus /> Add designation
            </button>
          </div>
        }
      />
      <input ref={importInputRef} type="file" accept=".csv" className="hidden hover-gradient-border" onChange={handleFileChange} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.3fr)]">
        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total designations</p>
              <p className="mt-3 text-2xl font-semibold text-white">{designations.length}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Active titles</p>
              <p className="mt-3 text-2xl font-semibold text-white">{activeDesignations}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Average level</p>
              <p className="mt-3 text-2xl font-semibold text-white">{averageLevel}</p>
            </div>
          </div>
          <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Designation catalog</h2>
                <p className="text-sm text-slate-400">Create job titles and map position levels across HR operations.</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} />
            </div>
            <div className="mt-4">
              <DataTable
                columns={['Code', 'Title', 'Level', 'Status', 'Actions']}
                rows={displayedDesignations.map((designation) => [
                  designation.code,
                  designation.title,
                  designation.level,
                  <StatusBadge key={`${designation.id}-status`} status={designation.status} />,
                  <div key={`${designation.id}-actions`} className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openEditDesignationModal(designation)}
                      className="rounded-full border border-white/10 bg-slate-800/80 px-3 py-2 text-xs text-slate-200 transition hover:bg-slate-700"
                    >
                      <FaEdit className="inline-block" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(designation)}
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
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
              <FaChartLine className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">HR hierarchy</p>
              <h3 className="text-lg font-semibold text-white">Position planning</h3>
            </div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-[22px] border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Most common title</p>
              <p className="mt-2 text-2xl font-semibold text-white">{designations[0]?.title || 'N/A'}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Levels covered</p>
              <p className="mt-2 text-2xl font-semibold text-white">{designations.length ? Math.max(...designations.map((item) => Number(item.level || 0))) : 0}</p>
            </div>
          </div>
        </div>
      </div>
      {importStatus && (
        <div className="rounded-[28px] border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-200">{importStatus}</div>
      )}
      <Modal
        title={isEditMode ? 'Update designation' : 'Add designation'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        footer={
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60 hover-gradient-border"
          >
            {isEditMode ? 'Update designation' : 'Save designation'}
          </button>
        }
      >
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Designation code">
            <input
              type="text"
              {...register('code', { required: 'Code is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 hover-gradient-border"
              placeholder="HR-01"
            />
            {errors.code && <p className="mt-1 text-sm text-rose-400">{errors.code.message}</p>}
          </FormField>
          <FormField label="Designation title">
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 hover-gradient-border"
              placeholder="HR Coordinator"
            />
            {errors.title && <p className="mt-1 text-sm text-rose-400">{errors.title.message}</p>}
          </FormField>
          <FormField label="Level">
            <input
              type="number"
              {...register('level', { required: 'Level is required', min: { value: 1, message: 'Minimum level 1' } })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 hover-gradient-border"
              placeholder="1"
            />
            {errors.level && <p className="mt-1 text-sm text-rose-400">{errors.level.message}</p>}
          </FormField>
          <FormField label="Status">
            <select
              {...register('status', { required: 'Status is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 hover-gradient-border"
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
