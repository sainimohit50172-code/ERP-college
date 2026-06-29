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
// subject assignments migrated to API-backed resource
const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];
export default function SubjectAssignmentPage() {
  const { data: assignmentsData } = useResourceList('subjectAssignments', { page: 1, pageSize: 200 });
  const subjectAssignments = assignmentsData?.items || [];
  const createSubjectAssignment = useCreateResource('subjectAssignments');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 5;
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { subjectCode: '', subjectName: '', course: 'BCA', semester: '1', credits: '3', practicalHours: '0', isCore: true, status: 'Active' },
  });
  const filteredAssignments = useMemo(() => {
    return subjectAssignments.filter((assignment) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = [assignment.subjectCode || assignment.subject?.code || '', assignment.subjectName || assignment.subject?.title || '', assignment.course, assignment.semester].some((value) => String(value).toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || assignment.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [subjectAssignments, search, filter]);
  const pageCount = Math.max(1, Math.ceil(filteredAssignments.length / pageSize));
  const displayedAssignments = filteredAssignments.slice((page - 1) * pageSize, page * pageSize);
  const onSubmit = (formValues) => {
    createSubjectAssignment.mutate(formValues, { onSuccess: () => { reset({ subjectCode: '', subjectName: '', course: 'BCA', semester: '1', credits: '3', practicalHours: '0', isCore: true, status: 'Active' }); setPage(1); setIsModalOpen(false); } });
  };
  const totalSubjects = subjectAssignments.length;
  const coreSubjects = subjectAssignments.filter((s) => s.isCore).length;
  const totalCredits = subjectAssignments.reduce((acc, s) => acc + parseInt(s.credits || 0), 0);
  return (
    <div className="space-y-8">
      <SectionHeader title="Subject assignment" subtitle="Assign subjects to courses and semesters, define credits and learning outcomes." />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Total subjects</p>
          <p className="mt-4 text-3xl font-semibold text-white">{totalSubjects}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Core subjects</p>
          <p className="mt-4 text-3xl font-semibold text-white">{coreSubjects}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Total credits</p>
          <p className="mt-4 text-3xl font-semibold text-white">{totalCredits}</p>
        </div>
      </div>
      <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Subject assignments</h2>
            <p className="text-sm text-slate-400">Search and manage subject assignments across courses and semesters.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700"><FaDownload /> Export</button>
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"><FaPlus /> Add assignment</button>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2"><SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} /></div>
        <div className="mt-6">
          <DataTable
            columns={['Code', 'Subject', 'Course', 'Semester', 'Credits', 'Practical', 'Core', 'Status']}
            rows={displayedAssignments.map((assignment) => [
              <div key={assignment.id} className="font-semibold text-white">{assignment.subjectCode}</div>,
              assignment.subjectName,
              assignment.course,
              assignment.semester,
              assignment.credits,
              `${assignment.practicalHours}h`,
              assignment.isCore ? 'Yes' : 'No',
              <StatusBadge key={`${assignment.id}-status`} status={assignment.status} />,
            ])}
          />
        </div>
        <div className="mt-6"><TablePagination page={page} pageCount={pageCount} onPageChange={setPage} /></div>
      </div>
      <Modal title="Add subject assignment" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} footer={<button onClick={handleSubmit(onSubmit)} className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">Save assignment</button>}>
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Subject code"><input type="text" {...register('subjectCode', { required: 'Subject code is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="CS501" />{errors.subjectCode && <p className="mt-1 text-sm text-rose-400">{errors.subjectCode.message}</p>}</FormField>
          <FormField label="Subject name"><input type="text" {...register('subjectName', { required: 'Subject name is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Data Structures" />{errors.subjectName && <p className="mt-1 text-sm text-rose-400">{errors.subjectName.message}</p>}</FormField>
          <FormField label="Course"><select {...register('course', { required: 'Course is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"><option value="BCA">BCA</option><option value="MBA">MBA</option><option value="BSc Biology">BSc Biology</option></select>{errors.course && <p className="mt-1 text-sm text-rose-400">{errors.course.message}</p>}</FormField>
          <FormField label="Semester"><select {...register('semester', { required: 'Semester is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option></select>{errors.semester && <p className="mt-1 text-sm text-rose-400">{errors.semester.message}</p>}</FormField>
          <FormField label="Credits"><input type="number" {...register('credits', { required: 'Credits is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="3" />{errors.credits && <p className="mt-1 text-sm text-rose-400">{errors.credits.message}</p>}</FormField>
          <FormField label="Practical hours/week"><input type="number" {...register('practicalHours', { required: 'Practical hours is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="2" />{errors.practicalHours && <p className="mt-1 text-sm text-rose-400">{errors.practicalHours.message}</p>}</FormField>
          <FormField label="Subject type"><select {...register('isCore')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"><option value={true}>Core</option><option value={false}>Elective</option></select></FormField>
          <FormField label="Status"><select {...register('status', { required: 'Status is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"><option value="Active">Active</option><option value="Inactive">Inactive</option></select>{errors.status && <p className="mt-1 text-sm text-rose-400">{errors.status.message}</p>}</FormField>
        </form>
      </Modal>
    </div>
  );
}