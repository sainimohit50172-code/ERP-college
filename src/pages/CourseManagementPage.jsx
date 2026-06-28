import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useResourceList, useCreateResource } from '../hooks/useResourceHooks';
import { usePermissions } from '../services/permissionHelpers.js';
import { FaBookOpen, FaDownload, FaPlus } from 'react-icons/fa';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import WithPermission from '../components/auth/WithPermission.jsx';
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

export default function CourseManagementPage() {
  const { data: coursesData } = useResourceList('courses', { page: 1, pageSize: 200 });
  const courses = coursesData?.items || [];
  const createCourse = useCreateResource('courses');
  const { data: departmentsData } = useResourceList('departments', { page: 1, pageSize: 200 });
  const departments = departmentsData?.items || [];
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 5;
  const perms = usePermissions();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { code: '', title: '', department: departments[0]?.name || '', duration: '3 years', intake: '30', status: 'Active' } });

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const searchTerm = search.toLowerCase();
      const departmentName = departments.find((dept) => dept.id === course.departmentId)?.name || '';
      const matchesSearch = [course.code, course.title, departmentName].some((field) => field.toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || course.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [courses, search, filter, departments]);

  const pageCount = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  const displayedCourses = filteredCourses.slice((page - 1) * pageSize, page * pageSize);

  const onSubmit = (data) => {
    createCourse({ ...data, intake: Number(data.intake) });
    reset({ code: '', title: '', department: departments[0]?.name || '', duration: '3 years', intake: '30', status: 'Active' });
    setPage(1);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <SectionHeader title="Course management" subtitle="Create and manage course catalog, intake, department allocation and program status." />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Total courses</p>
              <p className="mt-4 text-3xl font-semibold text-white">{courses.length}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Annual intake</p>
              <p className="mt-4 text-3xl font-semibold text-white">{courses.reduce((sum, course) => sum + course.intake, 0)}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Programs active</p>
              <p className="mt-4 text-3xl font-semibold text-white">{courses.filter((course) => course.status === 'Active').length}</p>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Course catalog</h2>
                <p className="text-sm text-slate-400">Maintain academic programs, duration, department mappings and intakes.</p>
              </div>
                <div className="flex flex-wrap items-center gap-3">
                  <WithPermission moduleKey="courses" action="export">
                    <button className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700">
                      <FaDownload /> Export
                    </button>
                  </WithPermission>
                  <WithPermission moduleKey="courses" action="create">
                    <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
                      <FaPlus /> Add course
                    </button>
                  </WithPermission>
                </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} />
            </div>

            <div className="mt-6">
              <DataTable
                columns={['Code', 'Course title', 'Department', 'Duration', 'Intake', 'Status']}
                rows={displayedCourses.map((course) => [course.code, course.title, departments.find((dept) => dept.id === course.departmentId)?.name || course.department, course.duration, course.intake, <StatusBadge key={course.id} status={course.status} />])}
              />
            </div>
            <div className="mt-6">
              <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-300">
              <FaBookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Course analytics</p>
              <h3 className="text-xl font-semibold text-white">Program performance</h3>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
              <p className="text-sm text-slate-400">Average duration</p>
              <p className="mt-3 text-3xl font-semibold text-white">2.8 years</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
              <p className="text-sm text-slate-400">Top enrolling department</p>
              <p className="mt-3 text-3xl font-semibold text-white">Computer Science</p>
            </div>
          </div>
        </div>
      </div>

      <Modal title="Add course" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} footer={<button onClick={handleSubmit(onSubmit)} className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">Save course</button>}>
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Course code">
            <input type="text" {...register('code', { required: 'Code is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="BCA-01" />
            {errors.code && <p className="mt-1 text-sm text-rose-400">{errors.code.message}</p>}
          </FormField>
          <FormField label="Course title">
            <input type="text" {...register('title', { required: 'Title is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Bachelor of Computer Applications" />
            {errors.title && <p className="mt-1 text-sm text-rose-400">{errors.title.message}</p>}
          </FormField>
          <FormField label="Department">
            <select {...register('department', { required: 'Department is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400">
              {departments.map((department) => (
                <option key={department.id} value={department.name}>{department.name}</option>
              ))}
            </select>
            {errors.department && <p className="mt-1 text-sm text-rose-400">{errors.department.message}</p>}
          </FormField>
          <FormField label="Duration">
            <input type="text" {...register('duration', { required: 'Duration is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="3 years" />
            {errors.duration && <p className="mt-1 text-sm text-rose-400">{errors.duration.message}</p>}
          </FormField>
          <FormField label="Annual intake">
            <input type="number" {...register('intake', { required: 'Intake is required', min: { value: 1, message: 'Must be at least 1' } })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="60" />
            {errors.intake && <p className="mt-1 text-sm text-rose-400">{errors.intake.message}</p>}
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
