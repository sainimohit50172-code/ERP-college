import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft,  Download, PencilLine, Plus, Printer, RefreshCw, Search, Trash2 } from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';
import { useCreateResource, useDeleteResource, useResourceList, useUpdateResource } from '../hooks/useResourceHooks';
import { toast } from '../utils/toast.js';

const defaultFormState = {
  categoryName: '',
  status: 'Active',
  description: '',
};

const getValue = (record, keys) => {
  for (const key of keys) {
    const value = record?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }
  return undefined;
};

const normalizeSocialCategoryItems = (payload) => {
  if (!payload) return [];

  const wrapper = payload?.data ?? payload;
  const rawItems = Array.isArray(wrapper?.items)
    ? wrapper.items
    : Array.isArray(wrapper?.records)
      ? wrapper.records
      : Array.isArray(wrapper)
        ? wrapper
        : [];

  return rawItems.map((item) => ({
    id: item?.id,
    name: getValue(item, ['category_name', 'categoryName', 'name']) || 'Unnamed',
    description: getValue(item, ['description', 'category_description', 'categoryDescription']) || 'No notes added',
    status: String(getValue(item, ['status']) || 'Active').trim() || 'Active',
    raw: item,
  }));
};

export default function HRMSocialCategoryPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(defaultFormState);
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: socialCategoriesData, isLoading, error, refetch } = useResourceList('socialCategories', {
    page: currentPage,
    pageSize,
  });

  const createSocialCategory = useCreateResource('socialCategories');
  const updateSocialCategory = useUpdateResource('socialCategories');
  const deleteSocialCategory = useDeleteResource('socialCategories');

  const socialCategories = useMemo(() => normalizeSocialCategoryItems(socialCategoriesData), [socialCategoriesData]);
  const totalRecords = Number(socialCategoriesData?.total || socialCategories.length || 0);
  const totalPages = Number(socialCategoriesData?.pages || Math.ceil(totalRecords / pageSize) || 1);

  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return socialCategories.filter((category) => {
      const matchesStatus = statusFilter === 'all' || String(category.status).toLowerCase() === statusFilter;
      if (!matchesStatus) return false;
      if (!query) return true;

      const haystack = [category.name, category.description, category.status].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [searchTerm, socialCategories, statusFilter]);

  const pageStats = useMemo(() => {
    const active = filteredCategories.filter((item) => String(item.status).toLowerCase() === 'active').length;
    const inactive = filteredCategories.filter((item) => String(item.status).toLowerCase() === 'inactive').length;
    return { total: filteredCategories.length, active, inactive };
  }, [filteredCategories]);

  const statusOptions = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  const validateForm = () => {
    const errors = {};
    if (!formData.categoryName.trim()) {
      errors.categoryName = 'Social category name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenModal = () => {
    setFormData(defaultFormState);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(defaultFormState);
    setFormErrors({});
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((current) => ({ ...current, [name]: '' }));
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      await createSocialCategory.mutateAsync({
        category_name: formData.categoryName.trim(),
        description: formData.description.trim(),
        status: formData.status || 'Active',
      });
      toast.success('Social category created successfully.');
      handleCloseModal();
    } catch (createError) {
      console.error('Error creating social category:', createError);
      toast.error(createError?.response?.data?.detail || 'Failed to create social category. Please try again.');
    }
  };

  const handleStartEdit = (category) => {
    setEditingId(category.id);
    setEditValues({
      [category.id]: {
        categoryName: category.name,
        description: category.description === '—' ? '' : category.description,
        status: category.status || 'Active',
      },
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleSaveEdit = async (id) => {
    const currentValue = editValues[id] || {};
    const nextName = (currentValue.categoryName || '').trim();

    if (!nextName) {
      toast.error('Please enter a social category name.');
      return;
    }

    try {
      await updateSocialCategory.mutateAsync({
        id,
        payload: {
          category_name: nextName,
          description: (currentValue.description || '').trim(),
          status: currentValue.status || 'Active',
        },
      });
      toast.success('Social category updated successfully.');
      setEditingId(null);
      setEditValues({});
    } catch (updateError) {
      console.error('Error updating social category:', updateError);
      toast.error(updateError?.response?.data?.detail || 'Failed to update social category. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this social category?')) return;

    try {
      await deleteSocialCategory.mutateAsync(id);
      toast.success('Social category deleted successfully.');
    } catch (deleteError) {
      console.error('Error deleting social category:', deleteError);
      toast.error(deleteError?.response?.data?.detail || 'Failed to delete social category. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const csvRows = [
      ['S.No.', 'Name', 'Status', 'Description'],
      ...filteredCategories.map((category, index) => [
        index + 1,
        category.name,
        category.status,
        category.description === '—' ? '' : category.description,
      ]),
    ];

    const csvContent = csvRows
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'social-category-master.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-table, .print-table * { visibility: visible; }
          .print-table { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
        <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
          <div className="no-print mb-6 border-b border-slate-200/80 pb-5">
            <div className="mb-4">
              <div className="mb-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'HRM Master', to: '/settings/hrm' }, { label: 'Social Category' }]} />
              </div>
            </div>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                  Social Category <span className="text-slate-500">| HRM Master Setup</span>
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <input
                    id="social-category-search"
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search categories..."
                    aria-label="Search social categories"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm text-slate-900 outline-none shadow-sm transition-all duration-150 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    aria-label="Filter social categories by status"
                    className="appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-8 text-sm font-medium text-slate-700 outline-none shadow-sm transition-all duration-150 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleExport}
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-50 hover:border-slate-400"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>

                <button
                  onClick={handleOpenModal}
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-150 hover:bg-emerald-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                >
                  <Plus className="h-4 w-4" />
                  New Social Category
                </button>

                <button
                  onClick={handlePrint}
                  type="button"
                  aria-label="Print social category table"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-50 hover:border-slate-400"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </button>

                <button
                  onClick={() => refetch()}
                  type="button"
                  aria-label="Refresh social category records"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-50 hover:border-slate-400"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="no-print mb-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Total</div>
              <div className="mt-3 text-3xl font-bold text-slate-900">{pageStats.total}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50 to-sky-100 p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">Active</div>
              <div className="mt-3 text-3xl font-bold text-slate-900">{pageStats.active}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-rose-50 to-rose-100 p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-rose-700">Inactive</div>
              <div className="mt-3 text-3xl font-bold text-slate-900">{pageStats.inactive}</div>
            </div>
          </div>

          <div className="print-table flex-1 rounded-[18px] border border-slate-200 bg-white shadow-sm">
            {isLoading ? (
              <div className="flex min-h-[220px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
                  <p className="text-sm text-slate-500">Loading social categories...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-6 text-center">
                <p className="text-base font-semibold text-slate-800">Unable to load social categories.</p>
                <p className="max-w-md text-sm text-slate-600">{error?.message || 'The Social Category API is not responding.'}</p>
                <button
                  onClick={() => refetch()}
                  type="button"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-150 hover:bg-emerald-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                >
                  Retry
                </button>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-6 text-center">
                <p className="text-base font-semibold text-slate-800">No social categories found.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[16px] border border-white">
                <div className="hidden border-b-2 border-white bg-[#0d3f39] text-xs font-bold uppercase tracking-[0.12em] text-white md:grid md:grid-cols-[70px_minmax(200px,1.7fr)_minmax(150px,1.2fr)_minmax(220px,2.5fr)_180px]">
                  <div className="border-r-2 border-white px-3 py-3 text-center">S.No.</div>
                  <div className="border-r-2 border-white px-3 py-3 text-center">Name</div>
                  <div className="border-r-2 border-white px-3 py-3 text-center">Status</div>
                  <div className="border-r-2 border-white px-3 py-3 text-center">Description</div>
                  <div className="px-3 py-3 text-center">Actions</div>
                </div>

                {filteredCategories.map((category, index) => {
                  const isEditing = editingId === category.id;
                  const statusTone = category.status === 'Inactive' ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';

                  return (
                    <div
                      key={category.id}
                      className="hidden border-b-2 border-white bg-white text-sm text-slate-700 transition-all duration-150 hover:bg-slate-50 md:grid md:grid-cols-[70px_minmax(200px,1.7fr)_minmax(150px,1.2fr)_minmax(220px,2.5fr)_180px] md:items-center"
                    >
                      <div className="border-r-2 border-white px-3 py-3 text-center font-medium text-slate-900">{index + 1}</div>

                      <div className="border-r-2 border-white px-3 py-3 text-center">
                        {isEditing ? (
                          <input
                            id={`edit-social-category-name-${category.id}`}
                            name={`edit-social-category-name-${category.id}`}
                            type="text"
                            value={editValues[category.id]?.categoryName || ''}
                            onChange={(event) => setEditValues((current) => ({
                              ...current,
                              [category.id]: {
                                ...(current[category.id] || {}),
                                categoryName: event.target.value,
                              },
                            }))}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-sm text-slate-900 text-center focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            autoFocus
                          />
                        ) : (
                          <span className="font-medium text-slate-900">{category.name}</span>
                        )}
                      </div>

                      <div className="border-r-2 border-white px-3 py-3 text-center">
                        {isEditing ? (
                          <select
                            id={`edit-social-category-status-${category.id}`}
                            name={`edit-social-category-status-${category.id}`}
                            value={editValues[category.id]?.status || 'Active'}
                            onChange={(event) => setEditValues((current) => ({
                              ...current,
                              [category.id]: {
                                ...(current[category.id] || {}),
                                status: event.target.value,
                              },
                            }))}
                            className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 text-center focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        ) : (
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone}`}>
                            {category.status}
                          </span>
                        )}
                      </div>

                      <div className="border-r-2 border-white px-3 py-3 text-center">
                        {isEditing ? (
                          <textarea
                            id={`edit-social-category-description-${category.id}`}
                            name={`edit-social-category-description-${category.id}`}
                            value={editValues[category.id]?.description || ''}
                            onChange={(event) => setEditValues((current) => ({
                              ...current,
                              [category.id]: {
                                ...(current[category.id] || {}),
                                description: event.target.value,
                              },
                            }))}
                            rows={1}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-sm text-slate-900 text-center focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        ) : (
                          <span className="block text-slate-700 text-sm">{category.description || 'No notes added'}</span>
                        )}
                      </div>

                      <div className="px-3 py-3">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(category.id)}
                                type="button"
                                className="w-full rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-150 hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                                aria-label={`Save changes to ${category.name}`}
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                type="button"
                                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/50"
                                aria-label="Cancel edit"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleStartEdit(category)}
                                type="button"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-50"
                                title="Edit social category"
                                aria-label={`Edit ${category.name}`}
                              >
                                <PencilLine className="h-3.5 w-3.5" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(category.id)}
                                type="button"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#f75a5a] px-2.5 py-1.5 text-[11px] font-medium text-white shadow-sm transition-all duration-150 hover:bg-[#e54848]"
                                title="Delete social category"
                                aria-label={`Delete ${category.name}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="flex flex-col items-center justify-end gap-3 border-t-2 border-white bg-white px-4 py-3 text-sm text-slate-600 sm:flex-row">
                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-sm text-slate-600">Rows per page</span>
                    <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 shadow-sm">
                      <span className="text-sm font-medium text-slate-700">10</span>
                    </div>
                    <span className="text-sm text-slate-600">Total: {totalRecords}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      type="button"
                      disabled={currentPage === 1}
                      className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-50 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:hover:border-slate-300"
                    >
                      Previous
                    </button>
                    <span className="px-2 text-sm font-medium text-slate-700">Page {currentPage} of {totalPages}</span>
                    <button
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      type="button"
                      disabled={currentPage >= totalPages}
                      className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-50 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:hover:border-slate-300"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        title="Add New Social Category"
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="social-category-form"
              disabled={createSocialCategory.isPending}
              className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-150 hover:bg-emerald-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:shadow-md"
            >
              {createSocialCategory.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        }
      >
        <form id="social-category-form" className="space-y-5" onSubmit={handleCreate}>
          <FormField label="Social Category Name" htmlFor="social-category-name" required error={formErrors.categoryName}>
            <input
              id="social-category-name"
              name="categoryName"
              type="text"
              value={formData.categoryName}
              onChange={handleFormChange}
              placeholder="e.g., General / SC / ST"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none shadow-sm transition-all duration-150 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </FormField>

          <FormField label="Status" htmlFor="social-category-status">
            <select
              id="social-category-status"
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none shadow-sm transition-all duration-150 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </FormField>

          <FormField label="Description" htmlFor="social-category-description">
            <textarea
              id="social-category-description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              rows={3}
              placeholder="Add category details or notes (optional)"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none shadow-sm transition-all duration-150 resize-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </FormField>
        </form>
      </Modal>
    </>
  );
}
