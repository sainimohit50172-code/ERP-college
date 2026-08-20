import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Download,
  Edit2,
  Eye,
  Plus,
  RefreshCcw,
  Trash2,
  UserRound,
  XCircle,
} from 'lucide-react';
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

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export default function DesignationManagementPage() {
  const { data: designationsData, isLoading: isLoadingDesignations } = useResourceList('designations', {
    page: 1,
    pageSize: 100,
  });

  const createDesignation = useCreateResource('designations');
  const updateDesignation = useUpdateResource('designations');
  const deleteDesignation = useDeleteResource('designations');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
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

  const departmentOptions = useMemo(
    () => [
      'All Departments',
      ...new Set(
        designations.map((item) => item.department || item.departmentName || item.department_name || 'General')
      ),
    ],
    [designations]
  );

  const filteredDesignations = useMemo(() => {
    const results = [...designations].filter((designation) => {
      const searchTerm = search.toLowerCase();
      const departmentName = String(
        designation.department || designation.departmentName || designation.department_name || 'General'
      );
      const statusName = (designation.status || 'Active').toLowerCase();
      const matchesSearch =
        !searchTerm ||
        (designation.title || '').toLowerCase().includes(searchTerm) ||
        (designation.description || '').toLowerCase().includes(searchTerm) ||
        (departmentName || '').toLowerCase().includes(searchTerm) ||
        String(designation.level || '').toLowerCase().includes(searchTerm);

      const matchesStatus =
        statusFilter === 'All Status' || statusName === statusFilter.toLowerCase();

      const matchesDepartment =
        departmentFilter === 'All Departments' || departmentName === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });

    results.sort((a, b) => {
      let aValue = a[sortBy] ?? '';
      let bValue = b[sortBy] ?? '';

      if (sortBy === 'level') {
        aValue = Number(a.level) || 0;
        bValue = Number(b.level) || 0;
      } else {
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return results;
  }, [designations, search, statusFilter, departmentFilter, sortBy, sortOrder]);

  const pageSize = 10;
  const totalPages = Math.ceil(filteredDesignations.length / pageSize);
  const displayedDesignations = filteredDesignations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalCount = designations.length;
  const activeDesignations = designations.filter(
    (item) => String(item.status || 'Active').toLowerCase() === 'active'
  ).length;
  const inactiveDesignations = Math.max(totalCount - activeDesignations, 0);

  const latestUpdated = useMemo(() => {
    const values = designations
      .map((item) => item.updated_at || item.updatedAt || item.created_at || item.createdAt)
      .filter(Boolean)
      .map((value) => new Date(value))
      .filter((date) => !Number.isNaN(date.getTime()));

    if (!values.length) return null;
    return new Date(Math.max(...values.map((date) => date.getTime())));
  }, [designations]);

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
      status: 'Active',
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
    setStatusFilter('All Status');
    setDepartmentFilter('All Departments');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white p-3 sm:p-4">
      <div className="px-[2px]">
        <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-5 border-b border-slate-200 pb-4">
            <Breadcrumb
              items={[
                { label: 'Dashboard', to: '/' },
                { label: 'HRM Master', to: '/settings/hrm' },
                { label: 'Designation' },
              ]}
            />

            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-900">
                  Designation <span className="text-slate-500">| HRM Master Designation Setting</span>
                </h1>
                <p className="mt-1 text-sm text-slate-500">Manage and maintain all designations across the organization.</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(15,118,110,0.25)] transition hover:bg-[#0d665f]"
                >
                  <Plus className="h-4 w-4" />
                  Add New Designation
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <UserRound className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Total Designations</div>
                  <div className="mt-2 text-3xl font-bold text-slate-900">{totalCount}</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-slate-500">All Designations</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Active Designations</div>
                  <div className="mt-2 text-3xl font-bold text-slate-900">{activeDesignations}</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-slate-500">Currently Active</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <XCircle className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Inactive Designations</div>
                  <div className="mt-2 text-3xl font-bold text-slate-900">{inactiveDesignations}</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-slate-500">Currently Inactive</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Last Updated</div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">{formatDate(latestUpdated)}</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-slate-500">Most Recent Update</div>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-[18px] border border-slate-200 bg-[#edf1f1] shadow-sm">
            <div className="grid items-end gap-3 bg-[#edf1f1] p-3 lg:grid-cols-[1.5fr_0.9fr_1.1fr_1.1fr_auto_auto]">
              <div className="relative">
                <label htmlFor="designation-search" className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">Search Designation</label>
                <input
                  id="designation-search"
                  name="search"
                  type="text"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search designation, level or description..."
                  className="h-[42px] w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label htmlFor="designation-status-filter" className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">Status</label>
                <div className="relative">
                  <select
                    id="designation-status-filter"
                    name="statusFilter"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="h-[42px] w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 pr-9 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {['All Status', 'Active', 'Inactive'].map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              <div>
                <label htmlFor="designation-department-filter" className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">Department</label>
                <div className="relative">
                  <select
                    id="designation-department-filter"
                    name="departmentFilter"
                    value={departmentFilter}
                    onChange={(event) => setDepartmentFilter(event.target.value)}
                    className="h-[42px] w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 pr-9 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {departmentOptions.map((department) => (
                      <option key={department} value={department}>{department}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              <div>
                <label htmlFor="designation-sort-by" className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">Sort By</label>
                <div className="relative">
                  <select
                    id="designation-sort-by"
                    name="sortBy"
                    value={sortBy}
                    onChange={(event) => {
                      setSortBy(event.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-[42px] w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 pr-9 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="title">Designation A - Z</option>
                    <option value="level">Level</option>
                    <option value="status">Status</option>
                    <option value="updated_at">Updated Date</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
                  setCurrentPage(1);
                }}
                className="inline-flex h-[42px] items-center justify-center rounded-xl bg-[#0f766e] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d665f]"
              >
                Search
              </button>

              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex h-[42px] items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-[20px] border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-[#0f766e] px-4 py-4 text-white">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-sm">≡</span>
                Designation List
              </div>

              <div className="flex items-center gap-2 text-sm text-white/80">
                <label htmlFor="designation-page-size" className="sr-only">Rows per page</label>
                <span>Show</span>
                <select id="designation-page-size" name="pageSize" className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-sm text-white focus:outline-none" aria-label="Rows per page">
                  <option value={10} className="text-slate-900">10</option>
                  <option value={25} className="text-slate-900">25</option>
                  <option value={50} className="text-slate-900">50</option>
                </select>
                <span>entries</span>
              </div>
            </div>

            {isLoadingDesignations ? (
              <div className="flex min-h-[300px] items-center justify-center text-slate-500">Loading designations...</div>
            ) : filteredDesignations.length === 0 ? (
              <div className="flex min-h-[200px] items-center justify-center text-slate-500">No designations match your filter.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-[#05331e] text-white">
                    <tr>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wide">S.No.</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wide">
                        <button type="button" onClick={() => { setSortBy('title'); setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc')); }} className="inline-flex items-center gap-2">
                          Designation Name
                          <ChevronDown className={`h-4 w-4 transition-transform ${sortBy === 'title' && sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                        </button>
                      </th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wide">Designation Code</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wide">Department</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wide">
                        <button type="button" onClick={() => { setSortBy('level'); setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc')); }} className="inline-flex items-center gap-2">
                          Level
                          <ChevronDown className={`h-4 w-4 transition-transform ${sortBy === 'level' && sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                        </button>
                      </th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wide">Description</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wide">Status</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wide">Created / Updated On</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wide text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedDesignations.map((designation, index) => {
                      const status = String(designation.status || 'Active');
                      const isActive = status.toLowerCase() === 'active';
                      const departmentName = designation.department || designation.departmentName || designation.department_name || 'General';
                      const code = designation.code || designation.designation_code || designation.short_code || designation.title?.slice(0, 4).toUpperCase() || 'GEN';

                      return (
                        <tr key={designation.id} className="border-b border-slate-200 bg-white transition hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-700">{(currentPage - 1) * pageSize + index + 1}</td>
                          <td className="px-4 py-3">
                            <button type="button" onClick={() => openViewModal(designation)} className="font-medium text-slate-900 transition hover:text-emerald-700">
                              {designation.title || 'Untitled'}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-slate-700">{code}</td>
                          <td className="px-4 py-3 text-slate-700">{departmentName}</td>
                          <td className="px-4 py-3 text-slate-700">{designation.level ? `L${designation.level}` : '—'}</td>
                          <td className="px-4 py-3 text-slate-600">{designation.description || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {formatDateTime(designation.updated_at || designation.updatedAt || designation.created_at || designation.createdAt || new Date())}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button type="button" onClick={() => openViewModal(designation)} className="rounded-lg bg-slate-100 p-2 text-slate-600 transition hover:bg-blue-100 hover:text-blue-600" aria-label={`View ${designation.title}`}>
                                <Eye className="h-4 w-4" />
                              </button>
                              <button type="button" onClick={() => openEditModal(designation)} className="rounded-lg bg-slate-100 p-2 text-slate-600 transition hover:bg-emerald-100 hover:text-emerald-600" aria-label={`Edit ${designation.title}`}>
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button type="button" onClick={() => handleDelete(designation)} className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100" aria-label={`Delete ${designation.title}`}>
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row">
                <div className="text-sm text-slate-600">
                  Showing {displayedDesignations.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
                  {Math.min(currentPage * pageSize, filteredDesignations.length)} of {filteredDesignations.length} entries
                </div>

                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50">
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[36px] rounded-lg px-2.5 py-2 text-sm font-semibold ${
                        pageNum === currentPage ? 'bg-[#0f766e] text-white' : 'border border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModals} title={isEditMode ? 'Edit Designation' : 'Add New Designation'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Designation Name" error={errors.title?.message} required id="designation-title">
              <input
                id="designation-title"
                type="text"
                placeholder="e.g., Senior Developer"
                {...register('title', {
                  required: 'Designation name is required',
                  minLength: { value: 2, message: 'Minimum 2 characters' },
                  maxLength: { value: 255, message: 'Maximum 255 characters' },
                })}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </FormField>

            <FormField label="Hierarchy Level" error={errors.level?.message} id="designation-level">
              <select id="designation-level" {...register('level')} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                <option value="">Select level...</option>
                {levelOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Mobile Number" error={errors.mobile_number?.message} id="designation-mobile">
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
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </FormField>
          </div>

          <FormField label="Description" error={errors.description?.message} id="designation-description">
            <textarea
              id="designation-description"
              rows="4"
              placeholder="Enter a description for this designation..."
              {...register('description', {
                maxLength: { value: 1000, message: 'Maximum 1000 characters' },
              })}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </FormField>

          <div className="flex gap-3 border-t border-slate-200 pt-6">
            <button type="button" onClick={closeModals} className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl bg-[#0f766e] px-4 py-2.5 font-medium text-white transition hover:bg-[#0d665f] disabled:opacity-50">
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {selectedDesignation && (
        <Modal isOpen={isViewOpen} onClose={closeModals} title="Designation Details" size="md">
          <div className="space-y-6">
            <div className="rounded-xl bg-slate-50 p-5">
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
              <button type="button" onClick={() => openEditModal(selectedDesignation)} className="flex-1 rounded-xl bg-[#0f766e] px-4 py-2.5 font-medium text-white transition hover:bg-[#0d665f]">
                Edit
              </button>
              <button type="button" onClick={closeModals} className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
