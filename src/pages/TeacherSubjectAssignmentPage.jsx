import { useMemo, useState } from 'react';
import { FaDownload, FaPlus } from 'react-icons/fa';
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
];

export default function TeacherSubjectAssignmentPage() {
  const { data: teachersData } = useResourceList('teachers', { page: 1, pageSize: 200 });
  const teachers = teachersData?.items || [];
  const { data: coursesData } = useResourceList('courses', { page: 1, pageSize: 200 });
  const courses = coursesData?.items || [];
  const { data: subjectsData } = useResourceList('subjects', { page: 1, pageSize: 200 });
  const subjects = subjectsData?.items || [];
  const { data } = useResourceList('teacherSubjectAssignments', { page: 1, pageSize: 50 });
  const createTeacherSubjectAssignment = useCreateResource('teacherSubjectAssignments');
  const assignments = data?.items || [];
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 5;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { teacher: '', subjectCode: '', subjectName: '', course: 'BCA', semester: '1', theoryHours: '3', practicalHours: '0', isLead: true, status: 'Active' },
  });

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = [assignment.teacher, assignment.subjectCode, assignment.subjectName, assignment.course].some((value) => value.toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || assignment.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [assignments, search, filter]);

  const pageCount = Math.max(1, Math.ceil(filteredAssignments.length / pageSize));
  const displayedAssignments = filteredAssignments.slice((page - 1) * pageSize, page * pageSize);

  const onSubmit = (data) => {
    createTeacherSubjectAssignment.mutate(data);
    reset({ teacher: '', subjectCode: '', subjectName: '', course: 'BCA', semester: '1', theoryHours: '3', practicalHours: '0', isLead: true, status: 'Active' });
    setPage(1);
    setIsModalOpen(false);
  };

  const totalAssignments = assignments.length;
  const leadAssignments = assignments.filter((a) => a.isLead).length;
  const totalTeachers = new Set(assignments.map((a) => a.teacher)).size;

  return (
    <div className="space-y-8">
      <SectionHeader title="Teacher-subject assignment" subtitle="Assign teachers to subjects, manage teaching responsibilities and workload." />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Total assignments</p>
          <p className="mt-4 text-3xl font-semibold text-white">{totalAssignments}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Lead teachers</p>
          <p className="mt-4 text-3xl font-semibold text-white">{leadAssignments}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Teachers assigned</p>
          <p className="mt-4 text-3xl font-semibold text-white">{totalTeachers}</p>
        </div>
      </div>

      <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Teacher assignments</h2>
            <p className="text-sm text-slate-400">Search and manage teacher-subject assignments across courses.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700 hover-gradient-border"><FaDownload /> Export</button>
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"><FaPlus /> Add assignment</button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2"><SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} /></div>

        <div className="mt-6">
          <DataTable
            columns={['Teacher', 'Subject', 'Code', 'Course', 'Sem', 'Theory Hrs', 'Practical Hrs', 'Lead', 'Status']}
            rows={displayedAssignments.map((assignment) => [
              <div key={assignment.id} className="font-semibold text-white">{assignment.teacher}</div>,
              assignment.subjectName,
              assignment.subjectCode,
              assignment.course,
              assignment.semester,
              assignment.theoryHours,
              assignment.practicalHours,
              assignment.isLead ? 'Yes' : 'No',
              <StatusBadge key={`${assignment.id}-status`} status={assignment.status} />,
            ])}
          />
        </div>
        <div className="mt-6"><TablePagination page={page} pageCount={pageCount} onPageChange={setPage} /></div>
      </div>

      <Modal title="Assign teacher to subject" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} footer={<button onClick={handleSubmit(onSubmit)} className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 hover-gradient-border">Save assignment</button>}>
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Teacher"><select {...register('teacher', { required: 'Teacher is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border">
              <option value="">Select teacher</option>
              {teachers.map((teacher) => (<option key={teacher.id} value={teacher.name}>{teacher.name}</option>))}
            </select>{errors.teacher && <p className="mt-1 text-sm text-rose-400">{errors.teacher.message}</p>}</FormField>
          <FormField label="Subject"><select {...register('subjectCode', { required: 'Subject code is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border">
              <option value="">Select subject</option>
              {subjects.map((subject) => (<option key={subject.id} value={subject.code}>{subject.code} - {subject.title}</option>))}
            </select>{errors.subjectCode && <p className="mt-1 text-sm text-rose-400">{errors.subjectCode.message}</p>}</FormField>
          <FormField label="Subject name"><input type="text" {...register('subjectName', { required: 'Subject name is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="Data Structures" />{errors.subjectName && <p className="mt-1 text-sm text-rose-400">{errors.subjectName.message}</p>}</FormField>
          <FormField label="Course"><select {...register('course', { required: 'Course is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border">
              <option value="">Select course</option>
              {courses.map((course) => (<option key={course.id} value={course.code}>{course.title}</option>))}
            </select>{errors.course && <p className="mt-1 text-sm text-rose-400">{errors.course.message}</p>}</FormField>
          <FormField label="Semester"><select {...register('semester', { required: 'Semester is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option></select>{errors.semester && <p className="mt-1 text-sm text-rose-400">{errors.semester.message}</p>}</FormField>
          <FormField label="Theory hours/week"><input type="number" {...register('theoryHours', { required: 'Theory hours is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="3" />{errors.theoryHours && <p className="mt-1 text-sm text-rose-400">{errors.theoryHours.message}</p>}</FormField>
          <FormField label="Practical hours/week"><input type="number" {...register('practicalHours', { required: 'Practical hours is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="2" />{errors.practicalHours && <p className="mt-1 text-sm text-rose-400">{errors.practicalHours.message}</p>}</FormField>
          <FormField label="Lead teacher"><select {...register('isLead')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"><option value={true}>Yes</option><option value={false}>No</option></select></FormField>
          <FormField label="Status"><select {...register('status', { required: 'Status is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"><option value="Active">Active</option><option value="Inactive">Inactive</option></select>{errors.status && <p className="mt-1 text-sm text-rose-400">{errors.status.message}</p>}</FormField>
        </form>
      </Modal>
    </div>
  );
}
