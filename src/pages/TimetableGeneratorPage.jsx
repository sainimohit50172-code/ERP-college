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
  { value: 'Needs Review', label: 'Needs Review' },
  { value: 'Draft', label: 'Draft' },
];
export default function TimetableGeneratorPage() {
  const { data: coursesData } = useResourceList('courses', { page: 1, pageSize: 200 });
  const courses = coursesData?.items || [];
  const { data } = useResourceList('timetables', { page: 1, pageSize: 50 });
  const createTimetable = useCreateResource('timetables');
  const timetables = data?.items || [];
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 5;
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { course: 'BCA', semester: '5', section: 'A', conflictResolution: 'Auto' },
  });
  const filteredTimetables = useMemo(() => {
    return timetables.filter((timetable) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = [timetable.course, timetable.semester, timetable.section].some((value) => value.toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || timetable.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [timetables, search, filter]);
  const pageCount = Math.max(1, Math.ceil(filteredTimetables.length / pageSize));
  const displayedTimetables = filteredTimetables.slice((page - 1) * pageSize, page * pageSize);
  const onSubmit = (data) => {
    createTimetable.mutate({
      ...data,
      totalSlots: Math.floor(Math.random() * 40) + 25,
      conflicts: Math.floor(Math.random() * 3),
      status: 'Draft',
    });
    reset({ course: 'BCA', semester: '5', section: 'A', conflictResolution: 'Auto' });
    setPage(1);
    setIsModalOpen(false);
  };
  const totalGenerated = timetables.length;
  const active = timetables.filter((t) => t.status === 'Active').length;
  const needsReview = timetables.filter((t) => t.status === 'Needs Review').length;
  return (
    <div className="space-y-8">
      <SectionHeader title="Timetable generator" subtitle="Automatically generate class timetables considering constraints and preferences." />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Generated</p>
          <p className="mt-4 text-3xl font-semibold text-white">{totalGenerated}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Active</p>
          <p className="mt-4 text-3xl font-semibold text-white">{active}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Needs review</p>
          <p className="mt-4 text-3xl font-semibold text-white">{needsReview}</p>
        </div>
      </div>
      <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Generated timetables</h2>
            <p className="text-sm text-slate-400">Search generated timetables, review conflicts and activate schedules.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700 hover-gradient-border"><FaDownload /> Export</button>
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"><FaPlus /> Generate new</button>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2"><SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} /></div>
        <div className="mt-6">
          <DataTable
            columns={['Course', 'Semester', 'Section', 'Generated', 'Slots', 'Conflicts', 'Status']}
            rows={displayedTimetables.map((timetable) => [
              <div key={timetable.id} className="font-semibold text-white">{timetable.course}</div>,
              timetable.semester,
              timetable.section,
              timetable.generatedDate,
              timetable.totalSlots,
              <div key={`${timetable.id}-conflicts`} className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${timetable.conflicts > 0 ? 'bg-rose-400/10 text-rose-300' : 'bg-emerald-400/10 text-emerald-300'}`}>{timetable.conflicts} conflicts</div>,
              <StatusBadge key={`${timetable.id}-status`} status={timetable.status} />,
            ])}
          />
        </div>
        <div className="mt-6"><TablePagination page={page} pageCount={pageCount} onPageChange={setPage} /></div>
      </div>
      <Modal title="Generate new timetable" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} footer={<button onClick={handleSubmit(onSubmit)} className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 hover-gradient-border">Generate</button>}>
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Course"><select {...register('course', { required: 'Course is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"><option value="">Select course</option>{courses.map((course) => (<option key={course.id} value={course.code}>{course.title}</option>))}</select>{errors.course && <p className="mt-1 text-sm text-rose-400">{errors.course.message}</p>}</FormField>
          <FormField label="Semester"><select {...register('semester', { required: 'Semester is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option></select>{errors.semester && <p className="mt-1 text-sm text-rose-400">{errors.semester.message}</p>}</FormField>
          <FormField label="Section"><select {...register('section', { required: 'Section is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"><option value="A">A</option><option value="B">B</option><option value="C">C</option></select>{errors.section && <p className="mt-1 text-sm text-rose-400">{errors.section.message}</p>}</FormField>
          <FormField label="Conflict resolution"><select {...register('conflictResolution')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"><option value="Auto">Automatic</option><option value="Manual">Manual Review</option><option value="Strict">Strict (No conflicts)</option></select></FormField>
        </form>
      </Modal>
    </div>
  );
}