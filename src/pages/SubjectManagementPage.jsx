import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaChalkboardTeacher, FaDownload, FaPlus } from 'react-icons/fa';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';
import { useResourceList, useCreateResource } from '../hooks/useResourceHooks';

const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Retired', label: 'Retired' },
];

export default function SubjectManagementPage() {
  const { data: departmentsData } = useResourceList('departments', { page: 1, pageSize: 200 });
  const departments = departmentsData?.items || [];
  const { data: coursesData } = useResourceList('courses', { page: 1, pageSize: 200 });
  const _courses = coursesData?.items || [];
  const { data: semestersData } = useResourceList('semesters', { page: 1, pageSize: 200 });
  const semesters = semestersData?.items || [];
  const { data, _isLoading } = useResourceList('subjects', { page: 1, pageSize: 50 });
  const createSubject = useCreateResource('subjects');
  const subjects = data?.items || [];
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 5;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { code: '', title: '', department: 'Computer Science', semester: 'Semester 1', credits: '3', status: 'Active' } });

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = [subject.code, subject.title, subject.department].some((field) => field.toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || subject.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [subjects, search, filter]);

  const pageCount = Math.max(1, Math.ceil(filteredSubjects.length / pageSize));
  const displayedSubjects = filteredSubjects.slice((page - 1) * pageSize, page * pageSize);

  const onSubmit = (data) => {
    createSubject.mutate({ ...data, credits: Number(data.credits) });
    reset({ code: '', title: '', department: departments[0]?.name || '', semester: semesters[0]?.title || '', credits: '3', status: 'Active' });
    setPage(1);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Subject management" subtitle="Manage course subjects, credits, semester assignment and department mappings." />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.3fr)]">
        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Active subjects</p>
              <p className="mt-3 text-2xl font-semibold text-white">{subjects.length}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total credits</p>
              <p className="mt-3 text-2xl font-semibold text-white">{subjects.reduce((sum, subject) => sum + subject.credits, 0)}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Departments covered</p>
              <p className="mt-3 text-2xl font-semibold text-white">{new Set(subjects.map((subject) => subject.department)).size}</p>
            </div>
          </div>

          <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Subject catalog</h2>
                <p className="text-sm text-slate-400">Review subjects, semester distribution, departmental assignment and credit load.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button className="inline-flex items-center gap-2 rounded-2xl bg-slate-800/80 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700 hover-gradient-border">
                  <FaDownload /> Export
                </button>
                <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-sky-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
                  <FaPlus /> Add subject
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} />
            </div>

            <div className="mt-4">
              <DataTable
                columns={['Code', 'Subject', 'Department', 'Semester', 'Credits', 'Status']}
                rows={displayedSubjects.map((subject) => [subject.code, subject.title, subject.department, subject.semester, subject.credits, <StatusBadge key={subject.code} status={subject.status} />])}
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
              <FaChalkboardTeacher className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Program insights</p>
              <h3 className="text-lg font-semibold text-white">Subject distribution</h3>
            </div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-[22px] border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Most credits per semester</p>
              <p className="mt-2 text-2xl font-semibold text-white">4 credits</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Frequently assigned department</p>
              <p className="mt-2 text-2xl font-semibold text-white">Computer Science</p>
            </div>
          </div>
        </div>
      </div>

      <Modal title="Add subject" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} footer={<button onClick={handleSubmit(onSubmit)} className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 hover-gradient-border">Save subject</button>}>
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Subject code">
            <input type="text" {...register('code', { required: 'Code is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="CS201" />
            {errors.code && <p className="mt-1 text-sm text-rose-400">{errors.code.message}</p>}
          </FormField>
          <FormField label="Subject title">
            <input type="text" {...register('title', { required: 'Title is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="Data Structures" />
            {errors.title && <p className="mt-1 text-sm text-rose-400">{errors.title.message}</p>}
          </FormField>
          <FormField label="Department">
            <select {...register('department', { required: 'Department is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border">
              <option value="Computer Science">Computer Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="English">English</option>
              <option value="Business Administration">Business Administration</option>
              <option value="Biology">Biology</option>
            </select>
            {errors.department && <p className="mt-1 text-sm text-rose-400">{errors.department.message}</p>}
          </FormField>
          <FormField label="Semester">
            <select {...register('semester', { required: 'Semester is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border">
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
              <option value="Semester 3">Semester 3</option>
              <option value="Semester 4">Semester 4</option>
            </select>
            {errors.semester && <p className="mt-1 text-sm text-rose-400">{errors.semester.message}</p>}
          </FormField>
          <FormField label="Credit load">
            <input type="number" {...register('credits', { required: 'Credits are required', min: { value: 1, message: 'Must be at least 1' } })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="3" />
            {errors.credits && <p className="mt-1 text-sm text-rose-400">{errors.credits.message}</p>}
          </FormField>
          <FormField label="Status">
            <select {...register('status', { required: 'Status is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border">
              <option value="Active">Active</option>
              <option value="Retired">Retired</option>
            </select>
            {errors.status && <p className="mt-1 text-sm text-rose-400">{errors.status.message}</p>}
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
