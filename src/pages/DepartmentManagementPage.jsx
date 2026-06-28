import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useResourceList, useCreateResource } from '../hooks/useResourceHooks';
import { FaBuilding, FaDownload, FaPlus } from 'react-icons/fa';
import { usePermissions } from '../services/permissionHelpers.js';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';
import { useERP } from '../services/ERPContext.jsx';

const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

export default function DepartmentManagementPage() {
  const { data: departmentsData } = useResourceList('departments', { page: 1, pageSize: 200 });
  const departments = departmentsData?.items || [];
  const createDepartment = useCreateResource('departments');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 5;
  const perms = usePermissions();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ defaultValues: { code: '', name: '', head: '', facultyCount: '0', activePrograms: '0', status: 'Active' } });

  const filteredDepartments = useMemo(() => {
    return departments.filter((department) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = [department.code, department.name, department.head].some((field) => field.toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || department.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [departments, search, filter]);

  const pageCount = Math.max(1, Math.ceil(filteredDepartments.length / pageSize));
  const displayedDepartments = filteredDepartments.slice((page - 1) * pageSize, page * pageSize);

  const onSubmit = (data) => {
    createDepartment({
      ...data,
      facultyCount: Number(data.facultyCount),
      activePrograms: Number(data.activePrograms),
    });
    reset({ code: '', name: '', head: '', facultyCount: '0', activePrograms: '0', status: 'Active' });
    setPage(1);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <SectionHeader title="Department management" subtitle="Academic department operations, heads, active programs, and faculty coverage." />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Active departments</p>
              <p className="mt-4 text-3xl font-semibold text-white">{departments.length}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Faculty coverage</p>
              <p className="mt-4 text-3xl font-semibold text-white">{departments.reduce((sum, dept) => sum + dept.facultyCount, 0)}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Program count</p>
              <p className="mt-4 text-3xl font-semibold text-white">{departments.reduce((sum, dept) => sum + dept.activePrograms, 0)}</p>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Department directory</h2>
                <p className="text-sm text-slate-400">Manage departments, leadership, and academic program support.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700">
                  <FaDownload /> Export
                </button>
                <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
                  <FaPlus /> Add department
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} />
            </div>

            <div className="mt-6">
              <DataTable
                columns={['Code', 'Department', 'Head', 'Faculty', 'Programs', 'Status']}
                rows={displayedDepartments.map((department) => [department.code, department.name, department.head, department.facultyCount, department.activePrograms, <StatusBadge key={department.code} status={department.status} />])}
              />
            </div>
            <div className="mt-6">
              <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-400/10 text-sky-300">
              <FaBuilding className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Operational insights</p>
              <h3 className="text-xl font-semibold text-white">Department performance</h3>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
              <p className="text-sm text-slate-400">Largest department</p>
              <p className="mt-3 text-3xl font-semibold text-white">Computer Science</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
              <p className="text-sm text-slate-400">Most active programs</p>
              <p className="mt-3 text-3xl font-semibold text-white">Computer Science</p>
            </div>
          </div>
        </div>
      </div>

      <Modal title="Add department" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} footer={<button onClick={handleSubmit(onSubmit)} className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">Save department</button>}>
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Department code">
            <input type="text" {...register('code', { required: 'Code is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="CS" />
            {errors.code && <p className="mt-1 text-sm text-rose-400">{errors.code.message}</p>}
          </FormField>
          <FormField label="Department name">
            <input type="text" {...register('name', { required: 'Name is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Computer Science" />
            {errors.name && <p className="mt-1 text-sm text-rose-400">{errors.name.message}</p>}
          </FormField>
          <FormField label="Department head">
            <input type="text" {...register('head', { required: 'Head is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Dr. Priya Menon" />
            {errors.head && <p className="mt-1 text-sm text-rose-400">{errors.head.message}</p>}
          </FormField>
          <FormField label="Faculty count">
            <input type="number" {...register('facultyCount', { required: 'Faculty count is required', min: { value: 1, message: 'Must be at least 1' } })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="18" />
            {errors.facultyCount && <p className="mt-1 text-sm text-rose-400">{errors.facultyCount.message}</p>}
          </FormField>
          <FormField label="Active programs">
            <input type="number" {...register('activePrograms', { required: 'Program count is required', min: { value: 1, message: 'Must be at least 1' } })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="4" />
            {errors.activePrograms && <p className="mt-1 text-sm text-rose-400">{errors.activePrograms.message}</p>}
          </FormField>
          <FormField label="Status">
            <select {...register('status', { required: 'Status is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400">
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
