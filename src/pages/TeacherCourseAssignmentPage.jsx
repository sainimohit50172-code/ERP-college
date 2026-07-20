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
import { useResourceList, useCreateResource } from '../hooks/useResourceHooks';

const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'On Leave', label: 'On Leave' },
];

export default function TeacherCourseAssignmentPage() {
  const { data: teachersData } = useResourceList('teachers', { page: 1, pageSize: 200 });
  const teachers = teachersData?.items || [];
  const { data } = useResourceList('teacherCourseAssignments', { page: 1, pageSize: 50 });
  const { data: coursesData } = useResourceList('courses', { page: 1, pageSize: 200 });
  const courses = coursesData?.items || [];
  const createTeacherCourseAssignment = useCreateResource('teacherCourseAssignments');
  const assignments = data?.items || [];
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 5;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { teacher: '', course: '', semester: '', subjects: '2', credits: '8', prerequisite: 'None', yearsTeaching: '0', status: 'Active' },
  });

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = [assignment.teacher, assignment.course, assignment.semester].some((value) => value.toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || assignment.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [assignments, search, filter]);

  const pageCount = Math.max(1, Math.ceil(filteredAssignments.length / pageSize));
  const displayedAssignments = filteredAssignments.slice((page - 1) * pageSize, page * pageSize);

  const onSubmit = (data) => {
    createTeacherCourseAssignment.mutate(data);
    reset({ teacher: '', course: '', semester: '', subjects: '2', credits: '8', prerequisite: 'None', yearsTeaching: '0', status: 'Active' });
    setPage(1);
    setIsModalOpen(false);
  };

  const totalAssignments = assignments.length;
  const active = assignments.filter((a) => a.status === 'Active').length;
  const totalCredits = assignments.reduce((acc, a) => acc + parseInt(a.credits || 0), 0);

  return (
    <div className="space-y-8">
      <SectionHeader title="Teacher course assignment" subtitle="Assign teachers to specific courses with subject and credit specifications." />

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
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Total credits</p>
          <p className="mt-4 text-3xl font-semibold text-white">{totalCredits}</p>
        </div>
      </div>

      <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Course assignments</h2>
            <p className="text-sm text-slate-400">Manage teacher assignments to courses with subject, credit and prerequisite details.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700 hover-gradient-border"><FaFileDownload /> Export</button>
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"><FaPlus /> New assignment</button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2"><SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} /></div>

        <div className="mt-6">
          <DataTable
            columns={['Teacher', 'Course', 'Semester', 'Subjects', 'Credits', 'Prerequisite', 'Exp', 'Status']}
            rows={displayedAssignments.map((assignment) => [
              <div key={assignment.id} className="font-semibold text-white">{assignment.teacher}</div>,
              assignment.course,
              assignment.semester,
              assignment.subjects,
              <div key={`${assignment.id}-credits`} className="font-semibold text-sky-300">{assignment.credits}</div>,
              <div key={`${assignment.id}-prereq`} className="text-xs text-slate-300">{assignment.prerequisite}</div>,
              assignment.yearsTeaching,
              <StatusBadge key={`${assignment.id}-status`} status={assignment.status} />,
            ])}
          />
        </div>
        <div className="mt-6"><TablePagination page={page} pageCount={pageCount} onPageChange={setPage} /></div>
      </div>

      <Modal title="Create teacher course assignment" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} footer={<button onClick={handleSubmit(onSubmit)} className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 hover-gradient-border">Assign teacher</button>}>
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Teacher name"><select {...register('teacher', { required: 'Teacher name is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border">
              <option value="">Select teacher</option>
              {teachers.map((teacher) => (<option key={teacher.id} value={teacher.name}>{teacher.name}</option>))}
            </select>{errors.teacher && <p className="mt-1 text-sm text-rose-400">{errors.teacher.message}</p>}</FormField>
          <FormField label="Course"><select {...register('course', { required: 'Course is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border">
              <option value="">Select course</option>
              {courses.map((course) => (<option key={course.id} value={course.code}>{course.title}</option>))}
            </select>{errors.course && <p className="mt-1 text-sm text-rose-400">{errors.course.message}</p>}</FormField>
          <FormField label="Semester"><input type="text" {...register('semester', { required: 'Semester is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="5" />{errors.semester && <p className="mt-1 text-sm text-rose-400">{errors.semester.message}</p>}</FormField>
          <FormField label="Number of subjects"><input type="number" {...register('subjects')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="2" /></FormField>
          <FormField label="Total credits"><input type="number" {...register('credits')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="8" /></FormField>
          <FormField label="Prerequisite"><input type="text" {...register('prerequisite')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="None" /></FormField>
          <FormField label="Years of teaching experience"><input type="number" {...register('yearsTeaching')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="5" /></FormField>
          <FormField label="Status"><select {...register('status')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"><option value="Active">Active</option><option value="Inactive">Inactive</option><option value="On Leave">On Leave</option></select></FormField>
        </form>
      </Modal>
    </div>
  );
}
