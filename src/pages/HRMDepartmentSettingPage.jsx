import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft,  Trash2, Plus } from 'lucide-react';
import { useResourceList, useCreateResource, useUpdateResource, useDeleteResource } from '../hooks/useResourceHooks';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';

export default function HRMDepartmentSettingPage() {
  const navigate = useNavigate();
  const { data: departmentsData, isLoading } = useResourceList('departments', { page: 1, pageSize: 100 });
  const departments = departmentsData?.items || [];

  const createDepartment = useCreateResource('departments');
  const updateDepartment = useUpdateResource('departments');
  const deleteDepartment = useDeleteResource('departments');

  // Local state for form and editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Department name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenModal = () => {
    setFormData({ name: '', code: '', description: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', code: '', description: '' });
    setFormErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const handleAddNewDepartment = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await createDepartment({
        name: formData.name.trim(),
        code: formData.code.trim() || '',
        description: formData.description.trim() || '',
      });
      handleCloseModal();
    } catch (error) {
      console.error('Error creating department:', error);
      alert('Failed to create department. Please try again.');
    }
  };

  const handleStartEdit = (department) => {
    setEditingId(department.id);
    setEditValues({ ...editValues, [department.id]: department.name });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleSaveEdit = async (id) => {
    const newName = editValues[id]?.trim();
    if (!newName) {
      alert('Please enter a department name');
      return;
    }

    try {
      await updateDepartment({
        id,
        payload: { name: newName },
      });
      setEditingId(null);
      setEditValues({});
    } catch (error) {
      console.error('Error updating department:', error);
      alert('Failed to update department. Please try again.');
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await deleteDepartment(id);
      } catch (error) {
        console.error('Error deleting department:', error);
        alert('Failed to delete department. Please try again.');
      }
    }
  };

  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        {/* Header */}
        <div className="mb-6 border-b border-slate-200/80 pb-5">
          <div className="mb-4">
            <div className="mb-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Breadcrumb items={[
                { label: 'Dashboard', to: '/' },
                { label: 'HRM Master', to: '/settings/hrm' },
                { label: 'HRM Department' },
              ]} />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Department <span className="text-slate-500">| HRM Master Department Setting</span>
              </h1>
            </div>
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-emerald-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              Add New Details
            </button>
          </div>
        </div>

        {/* Content Card */}
        <div className="flex-1 rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-slate-500">Loading departments...</p>
            </div>
          ) : departments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-slate-500">No departments found</p>
            </div>
          ) : (
            <div className="space-y-0">
              {/* Table Header */}
              <div className="hidden gap-4 border-b border-slate-200 px-5 py-3 md:grid md:grid-cols-[60px_1fr_80px]">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-600">S.No.</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-600">Department Name</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-600">Action</div>
              </div>

              {/* Department Rows */}
              {departments.map((department, index) => (
                <div
                  key={department.id}
                  className="grid gap-4 border-b border-slate-200 px-5 py-4 md:grid-cols-[60px_1fr_80px] md:items-center"
                >
                  {/* Serial Number */}
                  <div className="md:hidden">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">S.No.</span>
                  </div>
                  <div className="text-sm font-medium text-slate-900">{index + 1}</div>

                  {/* Department Name Input */}
                  <div className="md:hidden">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Department Name</span>
                  </div>
                  {editingId === department.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editValues[department.id] || ''}
                        onChange={(e) => setEditValues({ ...editValues, [department.id]: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        autoFocus
                        id={`edit-dept-${department.id}`}
                        name={`edit-dept-${department.id}`}
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => handleStartEdit(department)}
                      className="cursor-pointer rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-sm text-slate-900 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
                      role="button"
                      tabIndex={0}
                      aria-label={`Edit department: ${department.name}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleStartEdit(department);
                        }
                      }}
                    >
                      {department.name}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="md:hidden">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Action</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    {editingId === department.id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(department.id)}
                          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                          title="Save changes"
                          aria-label={`Save changes for ${department.name}`}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          title="Cancel editing"
                          aria-label="Cancel editing"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleDeleteDepartment(department.id)}
                        className="inline-flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                        title="Delete department"
                        aria-label={`Delete ${department.name}`}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Department Modal */}
        <Modal
          title="Add New Department"
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          footer={
            <div className="flex gap-2">
              <button
                onClick={handleCloseModal}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewDepartment}
                disabled={createDepartment.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createDepartment.isPending ? 'Adding...' : 'Add Department'}
              </button>
            </div>
          }
        >
          <form onSubmit={handleAddNewDepartment} className="space-y-6">
            <FormField label="Department Name" htmlFor="dept-name" required error={formErrors.name}>
              <input
                type="text"
                id="dept-name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="e.g., Computer Science"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm placeholder-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              {formErrors.name && <span className="text-xs text-red-600">{formErrors.name}</span>}
            </FormField>

            <FormField label="Department Code" htmlFor="dept-code" error={formErrors.code}>
              <input
                type="text"
                id="dept-code"
                name="code"
                value={formData.code}
                onChange={handleFormChange}
                placeholder="e.g., CS"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm placeholder-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </FormField>

            <FormField label="Description" htmlFor="dept-description" error={formErrors.description}>
              <textarea
                id="dept-description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Optional: Add details about this department"
                rows="3"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm placeholder-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </FormField>
          </form>
        </Modal>
      </div>
    </div>
  );
}
