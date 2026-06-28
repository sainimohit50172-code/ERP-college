import { useMemo, useState } from 'react';
import { FaFileDownload, FaPlus } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { useERP } from '../services/ERPContext.jsx';
import { useResourceList, useCreateResource } from '../hooks/useResourceHooks';

// teacher semester assignments moved to ERPContext

const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Pending', label: 'Pending' },
];

export default function TeacherSemesterAssignmentPage() {
  const { data } = useResourceList('teacherSemesterAssignments', { page: 1, pageSize: 50 });
  const createTeacherSemesterAssignment = useCreateResource('teacherSemesterAssignments');
  const teacherSemesterAssignments = data?.items || [];
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 5;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { teacher: '', subject: '', semester: '', section: 'A', theoryHours: '48', practicalHours: '24', students: '0', status: 'Active' },
  });

  const filteredAssignments = useMemo(() => {
    return teacherSemesterAssignments.filter((assignment) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = [assignment.teacher, assignment.subject || assignment.subjectName, assignment.semester].some((value) => String(value).toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || assignment.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [teacherSemesterAssignments, search, filter]);

  const pageCount = Math.max(1, Math.ceil(filteredAssignments.length / pageSize));
  const displayedAssignments = filteredAssignments.slice((page - 1) * pageSize, page * pageSize);

  const onSubmit = (data) => {
    const totalHours = parseInt(data.theoryHours) + parseInt(data.practicalHours);
    const payload = { ...data, totalHours: totalHours.toString() };
    createTeacherSemesterAssignment.mutate(payload);
    reset({ teacher: '', subject: '', semester: '', section: 'A', theoryHours: '48', practicalHours: '24', students: '0', status: 'Active' });
    setPage(1);
    setIsModalOpen(false);
  };

  const totalAssignments = teacherSemesterAssignments.length;
  const active = teacherSemesterAssignments.filter((a) => a.status === 'Active').length;
  const totalTeachingHours = teacherSemesterAssignments.reduce((acc, a) => acc + parseInt(a.totalHours || 0), 0);

  return (
    <div className="space-y-8">
      <SectionHeader title="Teacher semester assignment" subtitle="Assign teachers to specific semesters and sections with workload specifications." />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Total assignments</p>
          <p className="mt-4 text-3xl font-semibold text-white">{totalAssignments}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Active</p>
          <p className="mt-4 text-3xl font-semibold text-white">{active}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Total teaching hours</p>
          <p className="mt-4 text-3xl font-semibold text-white">{totalTeachingHours}</p>
        </div>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Semester assignments</h2>
            <p className="text-sm text-slate-400">Manage teacher assignments to semesters with section and workload details.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700"><FaFileDownload /> Export</button>
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"><FaPlus /> New assignment</button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2"><SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} /></div>

        <div className="mt-6">
          <DataTable
            columns={['Teacher', 'Subject', 'Semester', 'Section', 'Theory Hrs', 'Practical Hrs', 'Total Hrs', 'Students', 'Status']}
            rows={displayedAssignments.map((assignment) => [
              <div key={assignment.id} className="font-semibold text-white">{assignment.teacher}</div>,
              assignment.subject,
              assignment.semester,
              assignment.section,
              assignment.theoryHours,
              assignment.practicalHours,
              <div key={`${assignment.id}-total`} className="font-semibold text-sky-300">{assignment.totalHours}</div>,
              assignment.students,
              <StatusBadge key={`${assignment.id}-status`} status={assignment.status} />,
            ])}
          />
        </div>
        <div className="mt-6"><TablePagination page={page} pageCount={pageCount} onPageChange={setPage} /></div>
      </div>

      <Modal title="Create teacher semester assignment" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} footer={<button onClick={handleSubmit(onSubmit)} className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">Assign teacher</button>}>
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Teacher name"><input type="text" {...register('teacher', { required: 'Teacher name is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Dr. Priya Menon" />{errors.teacher && <p className="mt-1 text-sm text-rose-400">{errors.teacher.message}</p>}</FormField>
          <FormField label="Subject"><input type="text" {...register('subject', { required: 'Subject is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Data Structures" />{errors.subject && <p className="mt-1 text-sm text-rose-400">{errors.subject.message}</p>}</FormField>
          <FormField label="Semester"><input type="text" {...register('semester', { required: 'Semester is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="5" />{errors.semester && <p className="mt-1 text-sm text-rose-400">{errors.semester.message}</p>}</FormField>
          <FormField label="Section"><select {...register('section')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"><option value="A">A</option><option value="B">B</option><option value="C">C</option></select></FormField>
          <FormField label="Theory hours"><input type="number" {...register('theoryHours')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="48" /></FormField>
          <FormField label="Practical hours"><input type="number" {...register('practicalHours')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="24" /></FormField>
          <FormField label="Number of students"><input type="number" {...register('students')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="58" /></FormField>
          <FormField label="Status"><select {...register('status')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"><option value="Active">Active</option><option value="Pending">Pending</option><option value="Completed">Completed</option></select></FormField>
        </form>
      </Modal>
    </div>
  );
}
