import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';

function emptyFormState(formFields) {
  return formFields.reduce((accumulator, field) => {
    accumulator[field.key] = field.initialValue ?? '';
    return accumulator;
  }, {});
}

export default function HostelModulePage({
  title,
  subtitle,
  breadcrumbLabel,
  breadcrumbItems = [],
  addLabel,
  initialItems,
  columns,
  formFields,
  initialFormState,
  filterConfig,
  buildItem,
  summaryText,
}) {
  const navigate = useNavigate();
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState('');
  const [filterValue, setFilterValue] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});

  const resetForm = () => {
    setForm(initialFormState);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    formFields.forEach((field) => {
      if (field.required && !`${form[field.key] ?? ''}`.trim()) {
        errors[field.key] = `${field.label} is required`;
      }
    });
    return errors;
  };

  const filteredItems = useMemo(() => {
    const term = search.toLowerCase();
    return items.filter((item) => {
      const matchesText = Object.values(item).some((value) => `${value}`.toLowerCase().includes(term));
      const matchesFilter = !filterConfig || filterValue === 'All' || item[filterConfig.key] === filterValue;
      return matchesText && matchesFilter;
    });
  }, [items, search, filterValue, filterConfig]);

  const handleAddSubmit = (event) => {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    const nextItem = buildItem(form);
    setItems((current) => [{ id: Date.now(), ...nextItem }, ...current]);
    setIsAddOpen(false);
    resetForm();
  };

  const handleEditSubmit = (event) => {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setItems((current) => current.map((item) => (item.id === selectedItem.id ? { ...item, ...buildItem(form) } : item)));
    setIsEditOpen(false);
    setSelectedItem(null);
    resetForm();
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    const prefilled = {};
    formFields.forEach((field) => {
      prefilled[field.key] = item[field.key] ?? '';
    });
    setForm(prefilled);
    setFormErrors({});
    setIsEditOpen(true);
  };

  const confirmDelete = (item) => {
    setDeleteTarget(item);
    setIsDeleteOpen(true);
  };

  const removeItem = () => {
    if (!deleteTarget) return;
    setItems((current) => current.filter((item) => item.id !== deleteTarget.id));
    setIsDeleteOpen(false);
    setDeleteTarget(null);
  };

  const refreshFilters = () => {
    setSearch('');
    setFilterValue('All');
  };

  const renderInput = (field) => {
    if (field.type === 'select') {
      return (
        <label key={field.key} className="text-sm font-medium text-slate-700">
          {field.label}
          <select
            value={form[field.key] ?? ''}
            onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
            className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none"
          >
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {formErrors[field.key] ? <p className="mt-1 text-xs text-rose-500">{formErrors[field.key]}</p> : null}
        </label>
      );
    }

    if (field.type === 'textarea') {
      return (
        <label key={field.key} className="text-sm font-medium text-slate-700 md:col-span-2">
          {field.label}
          <textarea
            value={form[field.key] ?? ''}
            onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
            rows="3"
            className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none"
          />
          {formErrors[field.key] ? <p className="mt-1 text-xs text-rose-500">{formErrors[field.key]}</p> : null}
        </label>
      );
    }

    return (
      <label key={field.key} className="text-sm font-medium text-slate-700">
        {field.label}
        <input
          value={form[field.key] ?? ''}
          onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
          className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none"
        />
        {formErrors[field.key] ? <p className="mt-1 text-xs text-rose-500">{formErrors[field.key]}</p> : null}
      </label>
    );
  };

  return (
    <div className="mx-[10px] space-y-6">
      <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mt-3">
              <Breadcrumb items={breadcrumbItems} />
            </div>
            <div className="mt-4">
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-600">Institute setup</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">{subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Hostel dashboard</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{summaryText}</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsAddOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" /> {addLabel}
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 xl:flex-row xl:items-center xl:justify-between">
          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${breadcrumbLabel.toLowerCase()}`}
              className="w-full bg-transparent outline-none sm:w-56"
            />
          </label>
          {filterConfig ? (
            <select
              value={filterValue}
              onChange={(event) => setFilterValue(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none"
            >
              <option value="All">{filterConfig.allLabel}</option>
              {filterConfig.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={refreshFilters} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <RefreshCw className="h-4 w-4" /> Reset
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <Sparkles className="h-4 w-4" /> Export
          </button>
        </div>

        <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
            <thead>
              <tr className="bg-emerald-600 text-left uppercase tracking-[0.12em] text-white">
                <th className="px-4 py-4">#</th>
                {columns.map((column) => (
                  <th key={column.key} className="px-4 py-4">
                    {column.label}
                  </th>
                ))}
                <th className="px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-sm">
              {filteredItems.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-900">{index + 1}</td>
                  {columns.map((column) => (
                    <td key={`${item.id}-${column.key}`} className="whitespace-nowrap px-4 py-4">
                      {item[column.key]}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-4 py-4">
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      <button type="button" title="View" aria-label="View" onClick={() => { setSelectedItem(item); setIsViewOpen(true); }} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-700 transition hover:bg-sky-100 hover-gradient-border">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button type="button" title="Edit" aria-label="Edit" onClick={() => openEditModal(item)} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 hover-gradient-border">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" title="Delete" aria-label="Delete" onClick={() => confirmDelete(item)} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 hover-gradient-border">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Hostel management</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">{addLabel}</h3>
              </div>
              <button type="button" onClick={() => { setIsAddOpen(false); resetForm(); }} className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleAddSubmit}>
              {formFields.map((field) => renderInput(field))}
              <div className="flex flex-wrap gap-3 md:col-span-2">
                <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500">
                  <Plus className="h-4 w-4" /> Save
                </button>
                <button type="button" onClick={() => { setIsAddOpen(false); resetForm(); }} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Hostel management</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">Edit {breadcrumbLabel}</h3>
              </div>
              <button type="button" onClick={() => { setIsEditOpen(false); setSelectedItem(null); resetForm(); }} className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleEditSubmit}>
              {formFields.map((field) => renderInput(field))}
              <div className="flex flex-wrap gap-3 md:col-span-2">
                <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500">
                  Save changes
                </button>
                <button type="button" onClick={() => { setIsEditOpen(false); setSelectedItem(null); resetForm(); }} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isViewOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Hostel details</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">{selectedItem[columns[0].key] ?? title}</h3>
              </div>
              <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {formFields.map((field) => (
                <div key={field.key} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{field.label}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{selectedItem[field.key]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isDeleteOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Delete confirmation</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">Remove {deleteTarget[columns[0].key] ?? 'record'}?</h3>
            <p className="mt-3 text-sm text-slate-600">This action removes the record from the current management list.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={removeItem} className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500">Delete</button>
              <button type="button" onClick={() => { setIsDeleteOpen(false); setDeleteTarget(null); }} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
