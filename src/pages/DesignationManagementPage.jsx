import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ChevronDown, Edit2, Eye, Plus, Search, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';

import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import FormField from '../components/forms/FormField.jsx';
import Modal from '../components/ui/Modal.jsx';
import {
  useCreateResource,
  useDeleteResource,
  useResourceList,
  useUpdateResource,
} from '../hooks/useResourceHooks';

const defaultFormValues = {
  title: '',
  level: '',
  description: '',
  mobile_number: '',
};

const levelOptions = [
  { value: 1, label: 'Level 1 - Entry' },
  { value: 2, label: 'Level 2 - Junior' },
  { value: 3, label: 'Level 3 - Mid' },
  { value: 4, label: 'Level 4 - Senior' },
  { value: 5, label: 'Level 5 - Lead' },
  { value: 6, label: 'Level 6 - Manager' },
  { value: 7, label: 'Level 7 - Head' },
  { value: 8, label: 'Level 8 - Director' },
  { value: 9, label: 'Level 9 - Executive' },
  { value: 10, label: 'Level 10 - C-Suite' },
];

export default function DesignationManagementPage() {
  const { data: designationsData, isLoading: isLoadingDesignations } = useResourceList('designations', {
    page: 1,
    pageSize: 100,
  });

  const createDesignation = useCreateResource('designations');
  const updateDesignation = useUpdateResource('designations');
  const deleteDesignation = useDeleteResource('designations');

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: defaultFormValues });

  const designations = useMemo(() => designationsData?.items || [], [designationsData]);

  const filteredDesignations = useMemo(() => {
    const results = [...designations].filter((designation) => {
      const searchTerm = search.toLowerCase();
      return (
        (designation.title || '').toLowerCase().includes(searchTerm) ||
        (designation.description || '').toLowerCase().includes(searchTerm) ||
        String(designation.level || '').toLowerCase().includes(searchTerm)
      );
    });

    results.sort((a, b) => {
      let aValue = a[sortBy] ?? '';
      let bValue = b[sortBy] ?? '';

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return results;
  }, [designations, search, sortBy, sortOrder]);

  const pageSize = 10;
  const totalPages = Math.ceil(filteredDesignations.length / pageSize);
  const displayedDesignations = filteredDesignations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalCount = designations.length;
  const avgLevel = designations.length
    ? (designations.reduce((sum, item) => sum + (item.level || 0), 0) / designations.length).toFixed(1)
    : '0.0';

  const openAddModal = () => {
    reset(defaultFormValues);
    setIsEditMode(false);
    setSelectedDesignation(null);
    setIsModalOpen(true);
  };

  const openEditModal = (designation) => {
    setSelectedDesignation(designation);
    setIsEditMode(true);
    reset({
      title: designation.title || '',
      level: designation.level ? String(designation.level) : '',
      description: designation.description || '',
      mobile_number: designation.mobile_number || '',
    });
    setIsModalOpen(true);
  };

  const openViewModal = (designation) => {
    setSelectedDesignation(designation);
    setIsViewOpen(true);
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setIsViewOpen(false);
    setSelectedDesignation(null);
    reset(defaultFormValues);
  };

  const onSubmit = async (data) => {
    const payload = {
      title: data.title.trim(),
      level: data.level ? Number(data.level) : null,
      description: data.description ? data.description.trim() : null,
      mobile_number: data.mobile_number ? data.mobile_number.trim() : null,
    };

    try {
      if (isEditMode && selectedDesignation) {
        await updateDesignation.mutateAsync({ id: selectedDesignation.id, payload });
        toast.success('Designation updated successfully');
      } else {
        await createDesignation.mutateAsync(payload);
        toast.success('Designation created successfully');
      }
      closeModals();
      setCurrentPage(1);
    } catch (error) {
      toast.error(error?.message || 'Failed to save designation');
    }
  };

  const handleDelete = (designation) => {
    if (!window.confirm(`Are you sure you want to delete "${designation.title}"?`)) {
      return;
    }

    deleteDesignation.mutate(designation.id, {
      onSuccess: () => toast.success('Designation deleted successfully'),
      onError: (error) => toast.error(error?.message || 'Failed to delete designation'),
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setCurrentPage(1);
  };

  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-6 border-b border-slate-200/80 pb-5">
          <div className="mb-4">
            <Breadcrumb
              items={[
                { label: 'Dashboard', to: '/' },
                { label: 'HRM Master', to: '/settings/hrm' },
                { label: 'Designation' },
              ]}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Designation <span className="text-slate-500">| HRM Master Designation Setting</span>
              </h1>
            </div>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-emerald-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              Add New Details
            </button>
          </div>
        </div>

        <div className="flex-1 rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full max-w-md">
              <input
                id="designation-search"
                name="designationSearch"
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search designation, level or description..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            {search && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                Reset
              </button>
            )}
          </div>

          {designations.length > 0 && (
            <div className="mb-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-[16px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Total designations</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{totalCount}</p>
              </div>
              <div className="rounded-[16px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Average level</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{avgLevel}</p>
              </div>
              <div className="rounded-[16px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">With description</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{designations.filter((item) => item.description).length}</p>
              </div>
            </div>
          )}

          {isLoadingDesignations ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-slate-500">Loading designations...</p>
            </div>
          ) : designations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-slate-500">No designations found</p>
            </div>
          ) : filteredDesignations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-slate-500">No designations match your search</p>
            </div>
          ) : (
            <div className="space-y-0 rounded-[5px] overflow-hidden border border-slate-200">
              <div className="hidden gap-0 border-b border-slate-200 px-5 py-3 md:grid md:grid-cols-[60px_1.6fr_0.8fr_1.2fr_1.2fr_120px]" style={{ backgroundColor: '#0a2e1a' }}>
                <div className="text-xs font-semibold uppercase tracking-wider text-white text-center border-r border-white">
                  S.No
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-white text-center border-r border-white">
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy('title');
                      setSortOrder(sortBy === 'title' && sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                    className="flex items-center justify-center gap-2 font-semibold text-white transition hover:text-white/80 w-full"
                  >
                    Designation name
                    {sortBy === 'title' && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-white text-center border-r border-white">
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy('level');
                      setSortOrder(sortBy === 'level' && sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                    className="flex items-center justify-center gap-2 font-semibold text-white transition hover:text-white/80 w-full"
                  >
                    Level
                    {sortBy === 'level' && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-white text-center border-r border-white">Mobile Number</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-white text-center border-r border-white">Description</div>
                <div className="text-center text-xs font-semibold uppercase tracking-wider text-white">Action</div>
              </div>

              {displayedDesignations.map((designation, index) => (
                <div key={designation.id} className="grid gap-0 border-b border-slate-200 px-5 py-4 md:grid-cols-[60px_1.6fr_0.8fr_1.2fr_1.2fr_120px] md:items-center">
                  <div className="md:hidden">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">S.No</span>
                  </div>
                  <div className="text-sm font-medium text-slate-900 text-center border-r border-slate-200">{(currentPage - 1) * pageSize + index + 1}</div>

                  <div className="md:hidden">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Designation</span>
                  </div>
                  <div className="border-r border-slate-200 text-center">
                    <div
                      className="cursor-pointer rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-sm text-slate-900 transition-colors hover:border-emerald-300 hover:bg-emerald-50 inline-block"
                      role="button"
                      tabIndex={0}
                      aria-label={`View designation ${designation.title}`}
                      onClick={() => openViewModal(designation)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          openViewModal(designation);
                        }
                      }}
                    >
                      {designation.title}
                    </div>
                  </div>

                  <div className="md:hidden">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Level</span>
                  </div>
                  <div className="text-sm text-slate-700 text-center border-r border-slate-200">{designation.level ? `Level ${designation.level}` : '-'}</div>

                  <div className="md:hidden">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Mobile Number</span>
                  </div>
                  <div className="text-sm text-slate-700 text-center border-r border-slate-200">{designation.mobile_number || '-'}</div>

                  <div className="md:hidden">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Description</span>
                  </div>
                  <div className="text-sm text-slate-600 text-center border-r border-slate-200">{designation.description || '-'}</div>

                  <div className="md:hidden">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Action</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button type="button" onClick={() => openViewModal(designation)} className="inline-flex items-center justify-center rounded-lg bg-slate-100 p-2 text-slate-600 transition hover:bg-blue-100 hover:text-blue-600" aria-label={`View ${designation.title}`}>
                      <Eye className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => openEditModal(designation)} className="inline-flex items-center justify-center rounded-lg bg-slate-100 p-2 text-slate-600 transition hover:bg-emerald-100 hover:text-emerald-600" aria-label={`Edit ${designation.title}`}>
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => handleDelete(designation)} className="inline-flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100" aria-label={`Delete ${designation.title}`}>
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-5 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-4 sm:flex-row">
              <div className="text-sm text-slate-600">
                Showing {displayedDesignations.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
                {Math.min(currentPage * pageSize, filteredDesignations.length)} of {filteredDesignations.length} results
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-10 rounded-lg px-3 py-2 text-sm font-medium transition ${
                        page === currentPage ? 'bg-emerald-600 text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModals} title={isEditMode ? 'Edit Designation' : 'Add New Designation'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Designation Name" error={errors.title?.message} required>
              <input
                id="designation-title"
                type="text"
                placeholder="e.g., Senior Developer"
                {...register('title', {
                  required: 'Designation name is required',
                  minLength: { value: 2, message: 'Minimum 2 characters' },
                  maxLength: { value: 255, message: 'Maximum 255 characters' },
                })}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </FormField>

            <FormField label="Hierarchy Level" error={errors.level?.message}>
              <select id="designation-level" {...register('level')} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                <option value="">Select level...</option>
                {levelOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Mobile Number" error={errors.mobile_number?.message}>
              <input
                id="designation-mobile"
                type="tel"
                placeholder="e.g., +91-9876543210"
                {...register('mobile_number', {
                  pattern: {
                    value: /^[0-9+\-\s()]*$/,
                    message: 'Please enter a valid phone number',
                  },
                  maxLength: { value: 20, message: 'Maximum 20 characters' },
                })}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </FormField>
          </div>

          <FormField label="Description" error={errors.description?.message}>
            <textarea
              id="designation-description"
              rows="4"
              placeholder="Enter a description for this designation..."
              {...register('description', {
                maxLength: { value: 1000, message: 'Maximum 1000 characters' },
              })}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </FormField>

          <div className="flex gap-3 border-t border-slate-200 pt-6">
            <button type="button" onClick={closeModals} className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {selectedDesignation && (
        <Modal isOpen={isViewOpen} onClose={closeModals} title="Designation Details" size="md">
          <div className="space-y-6">
            <div className="rounded-lg bg-slate-50 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-slate-600">Designation Name</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{selectedDesignation.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Hierarchy Level</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {selectedDesignation.level ? `Level ${selectedDesignation.level}` : 'Not assigned'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Mobile Number</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{selectedDesignation.mobile_number || '-'}</p>
                </div>
              </div>
            </div>

            {selectedDesignation.description && (
              <div>
                <p className="text-sm font-medium text-slate-600">Description</p>
                <p className="mt-2 text-slate-700">{selectedDesignation.description}</p>
              </div>
            )}

            {selectedDesignation.created_at && (
              <div className="border-t border-slate-200 pt-6">
                <p className="text-xs text-slate-500">
                  Created on{' '}
                  {new Date(selectedDesignation.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}

            <div className="flex gap-3 border-t border-slate-200 pt-6">
              <button type="button" onClick={() => openEditModal(selectedDesignation)} className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-700">
                Edit
              </button>
              <button type="button" onClick={closeModals} className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
