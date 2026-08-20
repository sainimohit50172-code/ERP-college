import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Eye,
  FileText,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import { useResourceList, useCreateResource, useUpdateResource, useDeleteResource } from '../hooks/useResourceHooks';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Modal from '../components/ui/Modal.jsx';

const emptyForm = { name: '', code: '', description: '' };

const formatDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function HRMDepartmentSettingPage() {
  const navigate = useNavigate();
  const { data: departmentsData, isLoading, refetch } = useResourceList('departments', { page: 1, pageSize: 100 });
  const departments = useMemo(() => departmentsData?.items || [], [departmentsData]);

  const createDepartment = useCreateResource('departments');
  const updateDepartment = useUpdateResource('departments');
  const deleteDepartment = useDeleteResource('departments');

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('az');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  const summaryStats = useMemo(() => {
    const total = departments.length;
    const withCode = departments.filter((department) => department.code && String(department.code).trim()).length;
    const withDescription = departments.filter((department) => department.description && String(department.description).trim()).length;
    return { total, withCode, withDescription };
  }, [departments]);

  const filteredDepartments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const nextDepartments = departments.filter((department) => {
      if (!normalizedSearch) return true;

      const values = [department.name, department.code, department.description].filter(Boolean).join(' ').toLowerCase();
      return values.includes(normalizedSearch);
    });

    return [...nextDepartments].sort((a, b) => {
      const nameA = String(a.name || '').toLowerCase();
      const nameB = String(b.name || '').toLowerCase();
      return sortOrder === 'za' ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
    });
  }, [departments, searchTerm, sortOrder]);

  const validateForm = () => {
    const errors = {};

    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Department name is required';
    }

    if (!formData.code || !formData.code.trim()) {
      errors.code = 'Department code is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setFormErrors({});
    setFormMode('create');
    setSelectedDepartment(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditModal = (department) => {
    setSelectedDepartment(department);
    setFormMode('edit');
    setFormData({
      name: department.name || '',
      code: department.code || '',
      description: department.description || '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openViewModal = (department) => {
    setSelectedDepartment(department);
    setIsViewOpen(true);
  };

  const closeModal = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentState) => ({ ...currentState, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((currentErrors) => ({ ...currentErrors, [name]: '' }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim(),
      };

      if (formMode === 'edit' && selectedDepartment?.id) {
        await updateDepartment.mutateAsync({ id: selectedDepartment.id, payload });
      } else {
        await createDepartment.mutateAsync(payload);
      }

      closeModal();
    } catch (error) {
      console.error('Department save failed:', error);
      alert('Unable to save department. Please try again.');
    }
  };

  const handleDelete = async (department) => {
    if (!department?.id) return;

    const confirmed = window.confirm(`Delete department "${department.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteDepartment.mutateAsync(department.id);
    } catch (error) {
      console.error('Department delete failed:', error);
      alert('Unable to delete department. Please try again.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-5 border-b border-slate-200 pb-4">
          <div className="mb-3 flex items-center gap-3">
            <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Institute Setup', to: '/settings/institute' }, { label: 'HRM Master', to: '/settings/hrm' }, { label: 'Department' }]} />
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-600">HRM Master</p>
              <h1 className="mt-1 text-[16px] font-medium tracking-tight text-slate-900">Department | HRM Master Department Setting</h1>
              <p className="mt-1 text-xs font-normal text-slate-400">Manage and maintain departments used throughout the HRM and employee management system.</p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f5132] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(15,118,110,0.18)] transition hover:bg-[#0d432b] focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <Plus className="h-4 w-4" />
              Add New Department
            </button>
          </div>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Total Departments</span>
              <Building2 className="h-4 w-4 text-[#0f5132]" />
            </div>
            <div className="mt-3 text-2xl font-semibold text-slate-900">{summaryStats.total}</div>
          </div>
          <div className="rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">With Code</span>
              <FileText className="h-4 w-4 text-[#0f5132]" />
            </div>
            <div className="mt-3 text-2xl font-semibold text-slate-900">{summaryStats.withCode}</div>
          </div>
          <div className="rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">With Description</span>
              <FileText className="h-4 w-4 text-[#0f5132]" />
            </div>
            <div className="mt-3 text-2xl font-semibold text-slate-900">{summaryStats.withDescription}</div>
          </div>
        </div>

        <div className="mb-5 rounded-[16px] border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <label htmlFor="department-search" className="relative block flex-1 min-w-[180px]">
                <span className="sr-only">Search department</span>
                <input
                  id="department-search"
                  name="search"
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search Department"
                  className="h-8 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              <label htmlFor="department-sort" className="flex items-center gap-2 text-xs text-slate-600">
                <span className="whitespace-nowrap">Sort</span>
                <select
                  id="department-sort"
                  name="sortOrder"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  className="h-8 min-w-[155px] rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="az">Department Name A-Z</option>
                  <option value="za">Department Name Z-A</option>
                </select>
              </label>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSortOrder('az');
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-normal text-slate-700 transition hover:bg-slate-100"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-normal text-slate-700 transition hover:bg-slate-100"
              >
                <RefreshCw className="h-3 w-3" />
                Refresh
              </button>
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0f5132] px-2 py-1.5 text-xs font-medium text-white transition hover:bg-[#0d432b]"
              >
                <Plus className="h-3 w-3" />
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="flex min-h-[260px] items-center justify-center text-sm text-slate-500">Loading departments...</div>
          ) : filteredDepartments.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Building2 className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No departments found</h3>
              <p className="mt-1 max-w-md text-sm text-slate-500">Add your first department to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left">
                <thead>
                  <tr className="bg-[#0f5132] text-white">
                    <th className="border-r border-[#195f46] px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em]">S.No</th>
                    <th className="border-r border-[#195f46] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em]">Department Name</th>
                    <th className="border-r border-[#195f46] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em]">Department Code</th>
                    <th className="border-r border-[#195f46] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em]">Description</th>
                    <th className="border-r border-[#195f46] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em]">Created/Updated</th>
                    <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepartments.map((department, index) => (
                    <tr key={department.id} className="border-b border-slate-200 bg-white text-sm text-slate-700 transition hover:bg-slate-50 odd:bg-slate-50/60">
                      <td className="border-r border-slate-200 px-3 py-3 text-center font-medium text-slate-700">{index + 1}</td>
                      <td className="border-r border-slate-200 px-4 py-3 text-left font-medium text-slate-900">{department.name || '—'}</td>
                      <td className="border-r border-slate-200 px-4 py-3 text-left">{department.code || '—'}</td>
                      <td className="border-r border-slate-200 px-4 py-3 text-left text-slate-600">{department.description || '—'}</td>
                      <td className="border-r border-slate-200 px-4 py-3 text-left text-slate-600">{formatDate(department.created_at || department.updated_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openViewModal(department)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                            title="View department"
                            aria-label={`View ${department.name}`}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(department)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                            title="Edit department"
                            aria-label={`Edit ${department.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(department)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                            title="Delete department"
                            aria-label={`Delete ${department.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <label htmlFor="department-page-size" className="text-sm text-slate-600">Rows per page</label>
            <select id="department-page-size" name="pageSize" value={10} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">Previous</button>
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">1</span>
            <button type="button" className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">Next</button>
            <span className="text-sm text-slate-500">Total {filteredDepartments.length} records</span>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={closeModal}
        title={formMode === 'edit' ? 'Edit Department' : 'Add New Department'}
        footer={
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-normal text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="department-form"
              className="rounded-lg bg-[#0f5132] px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-[#0d432b]"
            >
              {formMode === 'edit' ? 'Save Changes' : 'Add Department'}
            </button>
          </div>
        }
      >
        <form id="department-form" onSubmit={handleSubmit} className="space-y-2.5">
          <div className="grid gap-2.5 md:grid-cols-2">
            <div>
              <label htmlFor="department-form-name" className="mb-1 block text-[10px] font-normal uppercase tracking-[0.1em] text-slate-600">Department Name</label>
              <input
                id="department-form-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
                className="h-[20px] w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-100"
              />
              {formErrors.name && <p className="mt-0.5 text-[9px] text-red-600">{formErrors.name}</p>}
            </div>

            <div>
              <label htmlFor="department-form-code" className="mb-1 block text-[10px] font-normal uppercase tracking-[0.1em] text-slate-600">Department Code</label>
              <input
                id="department-form-code"
                name="code"
                type="text"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g. CS"
                className="h-[20px] w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-100"
              />
              {formErrors.code && <p className="mt-0.5 text-[9px] text-red-600">{formErrors.code}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="department-form-description" className="mb-1 block text-[10px] font-normal uppercase tracking-[0.1em] text-slate-600">Description</label>
            <textarea
              id="department-form-description"
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional department description"
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-100"
            />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Department Details"
        footer={
          <button
            type="button"
            onClick={() => setIsViewOpen(false)}
            className="rounded-xl bg-[#0f5132] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0d432b]"
          >
            Close
          </button>
        }
      >
        {selectedDepartment ? (
          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="grid gap-2 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                <div className="text-[9px] font-normal uppercase tracking-[0.1em] text-slate-500">Department Name</div>
                <div className="mt-1.5 text-sm font-medium text-slate-900">{selectedDepartment.name || '—'}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                <div className="text-[9px] font-normal uppercase tracking-[0.1em] text-slate-500">Department Code</div>
                <div className="mt-1.5 text-sm font-medium text-slate-900">{selectedDepartment.code || '—'}</div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
              <div className="text-[9px] font-normal uppercase tracking-[0.1em] text-slate-500">Description</div>
              <div className="mt-1.5 whitespace-pre-wrap text-xs text-slate-700">{selectedDepartment.description || 'No description provided.'}</div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
              <div className="text-[9px] font-normal uppercase tracking-[0.1em] text-slate-500">Created / Updated</div>
              <div className="mt-1.5 text-xs text-slate-700">{formatDate(selectedDepartment.created_at || selectedDepartment.updated_at)}</div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
