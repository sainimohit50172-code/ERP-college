import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaCalendarAlt, FaDownload, FaPlus } from 'react-icons/fa';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';
import { useResourceList, useCreateResource } from '../hooks/useResourceHooks';

const statusOptions = [
const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Open', label: 'Open' },
  { value: 'Planned', label: 'Planned' },
  { value: 'Closed', label: 'Closed' },
];

export default function SemesterManagementPage() {
  const { data: coursesData } = useResourceList('courses', { page: 1, pageSize: 200 });
  const courses = coursesData?.items || [];
  const { data } = useResourceList('semesters', { page: 1, pageSize: 50 });
  const createSemester = useCreateResource('semesters');
  const semesters = data?.items || [];
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 5;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { code: '', title: '', course: 'BCA', duration: '', status: 'Open' } });

  const filteredSemesters = useMemo(() => {
    return semesters.filter((semester) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = [semester.code, semester.title, semester.course].some((field) => field.toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || semester.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [semesters, search, filter]);

  const pageCount = Math.max(1, Math.ceil(filteredSemesters.length / pageSize));
  const displayedSemesters = filteredSemesters.slice((page - 1) * pageSize, page * pageSize);

  const onSubmit = (formValues) => {
    createSemester.mutate(formValues, { onSuccess: () => { reset({ code: '', title: '', course: courses[0]?.code || '', duration: '', status: 'Open' }); setPage(1); setIsModalOpen(false); } });
  };

  return (
    <div className="space-y-8">
      <SectionHeader title="Semester management" subtitle="Manage academic semesters, course cycles and session planning." />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Current semesters</p>
              <p className="mt-4 text-3xl font-semibold text-white">{semesters.length}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Open sessions</p>
              <p className="mt-4 text-3xl font-semibold text-white">{semesters.filter((semester) => semester.status === 'Open').length}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Planned launches</p>
              <p className="mt-4 text-3xl font-semibold text-white">{semesters.filter((semester) => semester.status === 'Planned').length}</p>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Semester catalogue</h2>
                <p className="text-sm text-slate-400">Configure academic sessions, course mappings and semester timelines.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700">
                  <FaDownload /> Export
                </button>
                <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
                  <FaPlus /> Add semester
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} />
            </div>

            <div className="mt-6">
              <DataTable
                columns={['Code', 'Semester', 'Course', 'Duration', 'Status']}
                rows={displayedSemesters.map((semester) => [semester.code, semester.title, semester.course, semester.duration, <StatusBadge key={semester.code} status={semester.status} />])}
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
              <FaCalendarAlt className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Timeline insight</p>
              <h3 className="text-xl font-semibold text-white">Semester planning</h3>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
              <p className="text-sm text-slate-400">Upcoming course cycle</p>
              <p className="mt-3 text-3xl font-semibold text-white">MBA Semester 2</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
              <p className="text-sm text-slate-400">Next registration deadline</p>
              <p className="mt-3 text-3xl font-semibold text-white">June 1, 2025</p>
            </div>
          </div>
        </div>
      </div>

      <Modal title="Add semester" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} footer={<button onClick={handleSubmit(onSubmit)} className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">Save semester</button>}>
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Semester code">
            <input type="text" {...register('code', { required: 'Code is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="SEM-101" />
            {errors.code && <p className="mt-1 text-sm text-rose-400">{errors.code.message}</p>}
          </FormField>
          <FormField label="Semester title">
            <input type="text" {...register('title', { required: 'Title is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Semester 1" />
            {errors.title && <p className="mt-1 text-sm text-rose-400">{errors.title.message}</p>}
          </FormField>
          <FormField label="Course">
            <select {...register('course', { required: 'Course is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400">
              <option value="BCA">BCA</option>
              <option value="MBA">MBA</option>
              <option value="BTech CSE">BTech CSE</option>
            </select>
            {errors.course && <p className="mt-1 text-sm text-rose-400">{errors.course.message}</p>}
          </FormField>
          <FormField label="Duration">
            <input type="text" {...register('duration', { required: 'Duration is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Jun - Nov 2025" />
            {errors.duration && <p className="mt-1 text-sm text-rose-400">{errors.duration.message}</p>}
          </FormField>
          <FormField label="Status">
            <select {...register('status', { required: 'Status is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400">
              <option value="Open">Open</option>
              <option value="Planned">Planned</option>
              <option value="Closed">Closed</option>
            </select>
            {errors.status && <p className="mt-1 text-sm text-rose-400">{errors.status.message}</p>}
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
