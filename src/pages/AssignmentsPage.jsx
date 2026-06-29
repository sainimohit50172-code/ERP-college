import { useMemo, useState } from 'react';
import { FaFileUpload, FaPlus } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { useResourceList, useCreateResource } from '../hooks/useResourceHooks';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import WithPermission from '../components/auth/WithPermission.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Button from '../components/ui/Button.jsx';
const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Open', label: 'Open' },
  { value: 'Closed', label: 'Closed' },
  { value: 'Review', label: 'In Review' },
];
export default function AssignmentsPage() {
  const { data: assignmentsData } = useResourceList('assignments', { page: 1, pageSize: 200 });
  const assignments = assignmentsData?.items || [];
  const createAssignment = useCreateResource('assignments');
  const { data: coursesData } = useResourceList('courses', { page: 1, pageSize: 200 });
  const courses = coursesData?.items || [];
  const { data: semestersData } = useResourceList('semesters', { page: 1, pageSize: 200 });
  const semesters = semestersData?.items || [];
  const { data: sectionsData } = useResourceList('sections', { page: 1, pageSize: 200 });
  const sections = sectionsData?.items || [];
  const { data: teachersData } = useResourceList('teachers', { page: 1, pageSize: 200 });
  const teachers = teachersData?.items || [];
  const { data: subjectsData } = useResourceList('subjects', { page: 1, pageSize: 200 });
  const subjects = subjectsData?.items || [];
  const subjectMap = new Map((subjects || []).map((s) => [s.id, s]));
  const courseMap = new Map((courses || []).map((c) => [c.id, c]));
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 5;
  const initialValues = {
    title: '',
    subject: '',
    course: courses[0]?.title || '',
    semester: semesters[0]?.title || '',
    section: sections[0]?.name || 'A',
    setBy: teachers[0]?.name || '',
    dueDate: '',
    maxScore: '10',
    status: 'Open',
  };
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: initialValues });
  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const searchTerm = search.toLowerCase();
      const subjectName = subjectMap.get(assignment.subjectId)?.title || '';
      const courseName = courseMap.get(assignment.courseId)?.title || '';
      const matchesSearch = [assignment.title, subjectName, courseName].some((value) => value.toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || assignment.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [assignments, search, filter, subjectMap, courseMap]);
  const pageCount = Math.max(1, Math.ceil(filteredAssignments.length / pageSize));
  const displayedAssignments = filteredAssignments.slice((page - 1) * pageSize, page * pageSize);
  const resetForm = () => reset({ title: '', subject: '', course: courses[0]?.title || '', semester: semesters[0]?.title || '', section: sections[0]?.name || 'A', setBy: teachers[0]?.name || '', dueDate: '', maxScore: '10', status: 'Open' });
  const onSubmit = (data) => {
    createAssignment({ ...data, status: data.status || 'Open', maxScore: Number(data.maxScore) || 0 });
    resetForm();
    setPage(1);
    setIsModalOpen(false);
  };
  const totalAssignments = assignments.length;
  const openAssignments = assignments.filter((a) => a.status === 'Open').length;
  const closedAssignments = assignments.filter((a) => a.status === 'Closed').length;
  return (
    <div className="space-y-6">
      <SectionHeader title="Assignments" subtitle="Create and manage course assignments, track submissions and grade work." />
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total assignments</p>
          <p className="mt-3 text-2xl font-semibold text-white">{totalAssignments}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Open</p>
          <p className="mt-3 text-2xl font-semibold text-white">{openAssignments}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Closed</p>
          <p className="mt-3 text-2xl font-semibold text-white">{closedAssignments}</p>
        </div>
      </div>
      <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Assignment library</h2>
            <p className="text-sm text-slate-400">Create, manage and grade assignments across all courses.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <WithPermission moduleKey="assignments" action="import">
              <Button variant="secondary" className="inline-flex items-center gap-2 px-3 py-2 text-sm"><FaFileUpload /> Import</Button>
            </WithPermission>
            <WithPermission moduleKey="assignments" action="create">
              <Button onClick={() => setIsModalOpen(true)} variant="primary" className="inline-flex items-center gap-2 px-3 py-2 text-sm"><FaPlus /> New assignment</Button>
            </WithPermission>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2"><SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} /></div>
        <div className="mt-4">
          <DataTable
            columns={['Title', 'Subject', 'Course', 'Due Date', 'Submitted', 'Max Score', 'Status']}
            rows={displayedAssignments.map((assignment) => {
              const subject = subjectMap.get(assignment.subjectId);
              const course = courseMap.get(assignment.courseId);
              return [
                <div key={assignment.id} className="font-semibold text-white">{assignment.title}</div>,
                subject?.title || 'Unknown',
                course?.title || 'Unknown',
                assignment.dueDate,
                assignment.submissionCount ?? 0,
                assignment.maxScore,
                <StatusBadge key={`${assignment.id}-status`} status={assignment.status} />,
              ];
            })}
          />
        </div>
        <div className="mt-4"><TablePagination page={page} pageCount={pageCount} onPageChange={setPage} /></div>
      </div>
      <Modal title="Create new assignment" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} footer={<Button onClick={handleSubmit(onSubmit)} variant="primary">Create assignment</Button>}>
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Title"><input type="text" {...register('title', { required: 'Title is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Implement Stack using Arrays" />{errors.title && <p className="mt-1 text-sm text-rose-400">{errors.title.message}</p>}</FormField>
          <FormField label="Subject"><input type="text" {...register('subject', { required: 'Subject is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Data Structures" />{errors.subject && <p className="mt-1 text-sm text-rose-400">{errors.subject.message}</p>}</FormField>
          <FormField label="Course"><input type="text" {...register('course')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="BCA" /></FormField>
          <FormField label="Semester"><input type="text" {...register('semester')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="5" /></FormField>
          <FormField label="Section"><select {...register('section')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"><option value="A">A</option><option value="B">B</option><option value="C">C</option></select></FormField>
          <FormField label="Set by"><input type="text" {...register('setBy', { required: 'Setter is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Dr. Priya Menon" />{errors.setBy && <p className="mt-1 text-sm text-rose-400">{errors.setBy.message}</p>}</FormField>
          <FormField label="Due date"><input type="date" {...register('dueDate', { required: 'Due date is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />{errors.dueDate && <p className="mt-1 text-sm text-rose-400">{errors.dueDate.message}</p>}</FormField>
          <FormField label="Max score"><input type="number" {...register('maxScore', { required: 'Max score is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="10" />{errors.maxScore && <p className="mt-1 text-sm text-rose-400">{errors.maxScore.message}</p>}</FormField>
          <FormField label="Status"><select {...register('status')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"><option value="Open">Open</option><option value="Closed">Closed</option><option value="Review">In Review</option></select></FormField>
        </form>
      </Modal>
    </div>
  );
}