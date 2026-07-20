import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useResourceList, useCreateResource } from '../hooks/useResourceHooks';
import { FaBuilding, FaDownload, FaPlus } from 'react-icons/fa';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import Button from '../components/ui/Button.jsx';
import FormField from '../components/forms/FormField.jsx';
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
  const { register, handleSubmit, reset, formState: { errors, _isSubmitting } } = useForm({ defaultValues: { code: '', name: '', head: '', facultyCount: '0', activePrograms: '0', status: 'Active' } });
  const filteredDepartments = useMemo(() => {
    const searchTerm = search.toLowerCase();
    return departments.filter((department) => {
      const matchesSearch = [department.code, department.name, department.head].some((field) => String(field ?? '').toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || String(department.status ?? '') === filter;
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
    <div className="space-y-6">
      <SectionHeader title="Department management" subtitle="Academic department operations, heads, active programs, and faculty coverage." />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.3fr)]">
        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Active departments</p>
              <p className="mt-3 text-2xl font-semibold text-white">{departments.length}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Faculty coverage</p>
              <p className="mt-3 text-2xl font-semibold text-white">{departments.reduce((sum, dept) => sum + Number(dept.facultyCount || 0), 0)}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Program count</p>
              <p className="mt-3 text-2xl font-semibold text-white">{departments.reduce((sum, dept) => sum + Number(dept.activePrograms || 0), 0)}</p>
            </div>
          </div>
          <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Department directory</h2>
                <p className="text-sm text-slate-400">Manage departments, leadership, and academic program support.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button className="inline-flex items-center gap-2 rounded-2xl bg-slate-800/80 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700 hover-gradient-border">
                  <FaDownload /> Export
                </button>
                <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-sky-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
                  <FaPlus /> Add department
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} />
            </div>
            <div className="mt-6">
              <DataTable
                columns={['Code', 'Department', 'Head', 'Faculty', 'Programs', 'Status']}
                rows={displayedDepartments.map((department) => [department.code, department.name, department.head, department.facultyCount, department.activePrograms, <StatusBadge key={department.code} status={department.status} />])}
              />
            </div>
            <div className="mt-4">
              <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
            </div>
          </div>
        </div>
        <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300">
              <FaBuilding className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Operational insights</p>
              <h3 className="text-lg font-semibold text-white">Department performance</h3>
            </div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-[22px] border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Largest department</p>
              <p className="mt-2 text-2xl font-semibold text-white">Computer Science</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Most active programs</p>
              <p className="mt-2 text-2xl font-semibold text-white">Computer Science</p>
            </div>
          </div>
        </div>
      </div>
      <Modal title="Add department" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} footer={<Button onClick={handleSubmit(onSubmit)} variant="primary" >Save department</Button>}>
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Department code">
            <input type="text" {...register('code', { required: 'Code is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="CS" />
            {errors.code && <p className="mt-1 text-sm text-rose-400">{errors.code.message}</p>}
          </FormField>
          <FormField label="Department name">
            <input type="text" {...register('name', { required: 'Name is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="Computer Science" />
            {errors.name && <p className="mt-1 text-sm text-rose-400">{errors.name.message}</p>}
          </FormField>
          <FormField label="Department head">
            <input type="text" {...register('head', { required: 'Head is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="Dr. Priya Menon" />
            {errors.head && <p className="mt-1 text-sm text-rose-400">{errors.head.message}</p>}
          </FormField>
          <FormField label="Faculty count">
            <input type="number" {...register('facultyCount', { required: 'Faculty count is required', min: { value: 1, message: 'Must be at least 1' } })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="18" />
            {errors.facultyCount && <p className="mt-1 text-sm text-rose-400">{errors.facultyCount.message}</p>}
          </FormField>
          <FormField label="Active programs">
            <input type="number" {...register('activePrograms', { required: 'Program count is required', min: { value: 1, message: 'Must be at least 1' } })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="4" />
            {errors.activePrograms && <p className="mt-1 text-sm text-rose-400">{errors.activePrograms.message}</p>}
          </FormField>
          <FormField label="Status">
            <select {...register('status', { required: 'Status is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border">
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