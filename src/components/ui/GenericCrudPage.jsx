import { useMemo, useState } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useResourceList, useCreateResource, useUpdateResource, useDeleteResource } from '../../hooks/useResourceHooks';
import DataTable from './DataTable.jsx';
import Modal from './Modal.jsx';
import PageHeader from './PageHeader.jsx';

export default function GenericCrudPage({
  title,
  subtitle,
  resource,
  itemLabel = 'record',
  initialValues,
  fields = [],
  columns = [],
}) {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formValues, setFormValues] = useState(initialValues || {});

  const { data, isLoading } = useResourceList(resource, { page: 1, pageSize: 200 });
  const items = data?.items || [];
  const createMutation = useCreateResource(resource);
  const updateMutation = useUpdateResource(resource);
  const deleteMutation = useDeleteResource(resource);

  const tableColumns = useMemo(() => [...columns.map((column) => column.label), 'Actions'], [columns]);
  const tableRows = useMemo(() => {
    return items.map((item) => [
      ...columns.map((column) => {
        if (column.render) return column.render(item);
        const value = item?.[column.key];
        return value ?? '—';
      }),
      <div key={`${item.id || item.name || 'row'}-actions`} className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => openEdit(item)}
          className="rounded-2xl bg-sky-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-400"
        >
          <span className="inline-flex items-center gap-2"><Edit2 className="h-3.5 w-3.5" /> Edit</span>
        </button>
        <button
          type="button"
          onClick={() => handleDelete(item)}
          className="rounded-2xl bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-400"
        >
          <span className="inline-flex items-center gap-2"><Trash2 className="h-3.5 w-3.5" /> Delete</span>
        </button>
      </div>,
    ]);
  }, [columns, items]);

  const resetForm = () => setFormValues(initialValues || {});

  const openCreate = () => {
    setEditItem(null);
    resetForm();
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setFormValues({ ...(initialValues || {}), ...item });
    setShowModal(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
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
      setShowModal(false);
      resetForm();
      setEditItem(null);
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
        description={`Manage ${itemLabel} records, add new entries and keep actions in sync with the shared ERP data layer.`}
        action={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 hover-gradient-border"
          >
            <Plus className="h-4 w-4" /> Add {itemLabel}
          </button>
        }
      />

      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-sm">
        <DataTable columns={tableColumns} rows={tableRows} loading={isLoading} placeholder={`Search ${itemLabel} records...`} />
      </div>

      <Modal
        title={editItem ? `Edit ${itemLabel}` : `Add ${itemLabel}`}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditItem(null);
          resetForm();
        }}
        footer={
          <>
            <button type="button" onClick={() => { setShowModal(false); setEditItem(null); resetForm(); }} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
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
