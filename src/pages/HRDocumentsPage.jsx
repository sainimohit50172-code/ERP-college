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
import { FaFileAlt, FaDownload, FaEdit, FaFileImport, FaPlus, FaTrash } from 'react-icons/fa';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';

const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
];

const defaultValues = {
  title: '',
  documentType: 'Policy',
  relatedDepartment: 'HR',
  status: 'Pending',
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

export default function HRDocumentsPage() {
  const importInputRef = useRef(null);
  const { data: hrDocumentsData } = useResourceList('hrDocuments', { page: 1, pageSize: 200 });
  const hrDocuments = hrDocumentsData?.items || [];
  const createDocument = useCreateResource('hrDocuments');
  const updateDocument = useUpdateResource('hrDocuments');
  const deleteDocument = useDeleteResource('hrDocuments');
  const importDocument = useBulkImport('hrDocuments');
  const exportDocument = useBulkExport('hrDocuments');

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [importStatus, setImportStatus] = useState('');
  const [_isExporting, setIsExporting] = useState(false);
  const pageSize = 6;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });

  const filteredDocuments = useMemo(() => {
    return hrDocuments.filter((document) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = [document.title, document.documentType, document.relatedDepartment, document.updatedAt]
        .filter(Boolean)
        .some((field) => field.toString().toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || document.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [hrDocuments, search, filter]);

  const pageCount = Math.max(1, Math.ceil(filteredDocuments.length / pageSize));
  const displayedDocuments = filteredDocuments.slice((page - 1) * pageSize, page * pageSize);
  const pendingCount = hrDocuments.filter((document) => document.status === 'Pending').length;
  const approvedCount = hrDocuments.filter((document) => document.status === 'Approved').length;

  const resetForm = () => {
    reset(defaultValues);
    setSelectedDocument(null);
    setIsEditMode(false);
  };

  const openNewDocumentModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditDocumentModal = (document) => {
    setSelectedDocument(document);
    setIsEditMode(true);
    reset({
      title: document.title || '',
      documentType: document.documentType || 'Policy',
      relatedDepartment: document.relatedDepartment || 'HR',
      status: document.status || 'Pending',
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data) => {
    const payload = {
      ...data,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    if (isEditMode && selectedDocument) {
      updateDocument.mutate({ id: selectedDocument.id, payload }, { onSuccess: () => { resetForm(); setPage(1); setIsModalOpen(false); } });
    } else {
      createDocument.mutate(payload, { onSuccess: () => { resetForm(); setPage(1); setIsModalOpen(false); } });
    }
  };

  const handleDelete = (document) => {
    if (!window.confirm(`Remove document ${document.title}?`)) return;
    deleteDocument.mutate(document.id);
  };

  const handleImport = (file) => {
    if (!file) return;
    setImportStatus('Importing HR documents…');
    const formData = new FormData();
    formData.append('file', file);
    importDocument.mutate(formData, {
      onSuccess: () => setImportStatus('HR documents imported successfully.'),
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
      const blob = await exportDocument.mutateAsync();
      downloadBlob(blob, 'hr-documents-export.xlsx');
    } catch (error) {
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="HR document management"
        subtitle="Manage HR policies, personnel forms, agreements, and compliance documents."
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
              onClick={openNewDocumentModal}
              className="inline-flex items-center gap-2 rounded-3xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 hover-gradient-border"
            >
              <FaPlus /> Add document
            </button>
          </div>
        }
      />
      <input ref={importInputRef} type="file" accept=".csv" className="hidden hover-gradient-border" onChange={handleFileChange} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.3fr)]">
        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">HR documents</p>
              <p className="mt-3 text-2xl font-semibold text-white">{hrDocuments.length}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Approved items</p>
              <p className="mt-3 text-2xl font-semibold text-white">{approvedCount}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Pending review</p>
              <p className="mt-3 text-2xl font-semibold text-white">{pendingCount}</p>
            </div>
          </div>
          <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Document library</h2>
                <p className="text-sm text-slate-400">Track HR forms, policy updates, and compliance approvals.</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} />
            </div>
            <div className="mt-4">
              <DataTable
                columns={['Title', 'Type', 'Department', 'Updated', 'Status', 'Actions']}
                rows={displayedDocuments.map((document) => [
                  document.title,
                  document.documentType,
                  document.relatedDepartment,
                  document.updatedAt || 'N/A',
                  <StatusBadge key={`${document.id}-status`} status={document.status} />,
                  <div key={`${document.id}-actions`} className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openEditDocumentModal(document)}
                      className="rounded-full border border-white/10 bg-slate-800/80 px-3 py-2 text-xs text-slate-200 transition hover:bg-slate-700"
                    >
                      <FaEdit className="inline-block" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(document)}
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
              <FaFileAlt className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Policy lifecycle</p>
              <h3 className="text-lg font-semibold text-white">Document governance</h3>
            </div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-[22px] border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Most recent update</p>
              <p className="mt-2 text-2xl font-semibold text-white">{hrDocuments[0]?.updatedAt || 'N/A'}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Common type</p>
              <p className="mt-2 text-2xl font-semibold text-white">{hrDocuments[0]?.documentType || 'Policy'}</p>
            </div>
          </div>
        </div>
      </div>
      {importStatus && (
        <div className="rounded-[28px] border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-200">{importStatus}</div>
      )}
      <Modal
        title={isEditMode ? 'Update HR document' : 'Add HR document'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        footer={
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60 hover-gradient-border"
          >
            {isEditMode ? 'Update document' : 'Save document'}
          </button>
        }
      >
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Document title">
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 hover-gradient-border"
              placeholder="Employee handbook"
            />
            {errors.title && <p className="mt-1 text-sm text-rose-400">{errors.title.message}</p>}
          </FormField>
          <FormField label="Document type">
            <select
              {...register('documentType', { required: 'Type is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 hover-gradient-border"
            >
              <option value="Policy">Policy</option>
              <option value="Form">Form</option>
              <option value="Agreement">Agreement</option>
              <option value="Guideline">Guideline</option>
            </select>
            {errors.documentType && <p className="mt-1 text-sm text-rose-400">{errors.documentType.message}</p>}
          </FormField>
          <FormField label="Related department">
            <input
              type="text"
              {...register('relatedDepartment', { required: 'Department is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 hover-gradient-border"
              placeholder="HR"
            />
            {errors.relatedDepartment && <p className="mt-1 text-sm text-rose-400">{errors.relatedDepartment.message}</p>}
          </FormField>
          <FormField label="Status">
            <select
              {...register('status', { required: 'Status is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400 hover-gradient-border"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            {errors.status && <p className="mt-1 text-sm text-rose-400">{errors.status.message}</p>}
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
