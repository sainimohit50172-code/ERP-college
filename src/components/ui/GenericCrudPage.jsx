import { useMemo, useState, useRef } from 'react';
import { Edit3, Eye, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useResourceList, useCreateResource, useUpdateResource, useDeleteResource, useBulkImport } from '../../hooks/useResourceHooks';
import DataTable from './DataTable.jsx';
import Modal from './Modal.jsx';
import PageHeader from './PageHeader.jsx';

export default function GenericCrudPage({
  title,
  subtitle,
  description,
  resource,
  itemLabel = 'record',
  initialValues,
  defaultValues,
  fields = [],
  columns = [],
  inlineForm = false,
  createButtonLabel,
}) {
  const defaultFormValues = initialValues || defaultValues || {};
  const [showModal, setShowModal] = useState(false);
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formValues, setFormValues] = useState(defaultFormValues);

  const { data, isLoading } = useResourceList(resource, { page: 1, pageSize: 200 });
  const items = data?.items || [];
  const createMutation = useCreateResource(resource);
  const updateMutation = useUpdateResource(resource);
  const deleteMutation = useDeleteResource(resource);
  const bulkImportMutation = useBulkImport(resource);
  const uploadInputRef = useRef(null);

  const tableColumns = useMemo(() => [...columns.map((column) => column.label), 'Actions'], [columns]);
  const tableRows = useMemo(() => {
    return items.map((item) => [
      ...columns.map((column) => {
        if (column.render) return column.render(item);
        const value = item?.[column.key];
        return value ?? '—';
      }),
      <div key={`${item.id || item.name || 'row'}-actions`} className="flex flex-wrap items-center justify-center gap-1.5">
        <button
          type="button"
          title="View"
          aria-label="View"
          onClick={() => openEdit(item)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-700 transition hover:bg-sky-100 hover-gradient-border"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Edit"
          aria-label="Edit"
          onClick={() => openEdit(item)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 hover-gradient-border"
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Delete"
          aria-label="Delete"
          onClick={() => handleDelete(item)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 hover-gradient-border"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>,
    ]);
  }, [columns, items]);

  const resetForm = () => setFormValues(defaultFormValues);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await bulkImportMutation.mutateAsync(formData);
      toast.success(`Uploaded ${file.name} successfully`);
      event.target.value = null;
    } catch (error) {
      toast.error(error?.message || 'Failed to upload excel file');
    }
  };

  const importableResources = new Set([
    'installments',
    'students',
    'courses',
    'departments',
    'academic-years',
    'semesters',
    'subjects',
    'sections',
  ]);

  const renderUploadButton = () => {
    if (!importableResources.has(resource)) {
      return null;
    }

    return (
      <>
        <input
          ref={uploadInputRef}
          type="file"
          accept=".csv,.xlsx"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => uploadInputRef.current?.click()}
          className="btn btn-secondary inline-flex items-center gap-2"
        >
          Upload Excel
        </button>
      </>
    );
  };

  const openCreate = () => {
    setEditItem(null);
    resetForm();
    if (inlineForm) {
      setShowInlineForm(true);
      setShowModal(false);
    } else {
      setShowModal(true);
    }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setFormValues({ ...defaultFormValues, ...item });
    if (inlineForm) {
      setShowInlineForm(true);
      setShowModal(false);
    } else {
      setShowModal(true);
    }
  };

  const closeForm = () => {
    setShowModal(false);
    setShowInlineForm(false);
    setEditItem(null);
    resetForm();
  };

  const handleChange = (event) => {
    const { name, value, type } = event.target;
    const nextValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;
    setFormValues((current) => ({ ...current, [name]: nextValue }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, payload: formValues });
        toast.success(`${itemLabel} updated`);
      } else {
        await createMutation.mutateAsync(formValues);
        toast.success(`${itemLabel} created`);
      }
      closeForm();
    } catch (error) {
      toast.error(error?.message || `Could not save ${itemLabel}`);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete this ${itemLabel}?`)) return;
    try {
      await deleteMutation.mutateAsync(item.id);
      toast.success(`${itemLabel} deleted`);
    } catch (error) {
      toast.error(error?.message || `Could not delete ${itemLabel}`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        subtitle={subtitle}
        description={description || `Manage ${itemLabel} records, add new entries and keep actions in sync with the shared ERP data layer.`}
        action={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 hover-gradient-border"
          >
            <Plus className="h-4 w-4" /> {createButtonLabel || `Add ${itemLabel}`}
          </button>
        }
      />

      {inlineForm && showInlineForm && (
        <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">{editItem ? `Edit ${itemLabel}` : `New ${itemLabel}`}</h2>
              <p className="text-sm text-slate-500">Fill in the details and save the installment plan.</p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              className="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
          <form id="generic-crud-form" onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <div key={field.name} className={field.fullWidth ? 'md:col-span-2' : ''}>
                <label className="mb-2 block text-sm font-medium text-slate-700">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    name={field.name}
                    value={formValues[field.name] ?? ''}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200/80 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none hover-gradient-border"
                  >
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    name={field.name}
                    value={formValues[field.name] ?? ''}
                    onChange={handleChange}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-200/80 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none hover-gradient-border"
                  />
                ) : (
                  <input
                    name={field.name}
                    type={field.type || 'text'}
                    value={formValues[field.name] ?? ''}
                    onChange={handleChange}
                    placeholder={field.placeholder || ''}
                    className="w-full rounded-2xl border border-slate-200/80 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none hover-gradient-border"
                  />
                )}
              </div>
            ))}
            <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 hover-gradient-border"
              >
                Save {itemLabel}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-sm">
        <DataTable
          columns={tableColumns}
          rows={tableRows}
          loading={isLoading}
          placeholder={`Search ${itemLabel} records...`}
          toolbarActions={renderUploadButton() ? [renderUploadButton()] : []}
        />
      </div>

      {resource === 'admission-categories' && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => window.location.assign('/settings/fee-structure/fee-category')}
            className="inline-flex items-center justify-center rounded-3xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Next
          </button>
        </div>
      )}

      <Modal
        title={editItem ? `Edit ${itemLabel}` : `Add ${itemLabel}`}
        isOpen={showModal}
        onClose={closeForm}
        footer={
          <>
            <button type="button" onClick={closeForm} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
              Cancel
            </button>
            <button type="submit" form="generic-crud-form" className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover-gradient-border">
              Save {itemLabel}
            </button>
          </>
        }
      >
        <form id="generic-crud-form" onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <div key={field.name} className={field.fullWidth ? 'md:col-span-2' : ''}>
              <label className="mb-2 block text-sm font-medium text-slate-700">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  name={field.name}
                  value={formValues[field.name] ?? ''}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200/80 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none hover-gradient-border"
                >
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={formValues[field.name] ?? ''}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200/80 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none hover-gradient-border"
                />
              ) : (
                <input
                  name={field.name}
                  type={field.type || 'text'}
                  value={formValues[field.name] ?? ''}
                  onChange={handleChange}
                  placeholder={field.placeholder || ''}
                  className="w-full rounded-2xl border border-slate-200/80 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none hover-gradient-border"
                />
              )}
            </div>
          ))}
        </form>
      </Modal>
    </div>
  );
}
