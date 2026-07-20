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
// migrated to API-backed resources
const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];
export default function SectionManagementPage() {
  const { data: sectionsData } = useResourceList('sections', { page: 1, pageSize: 200 });
  const sections = sectionsData?.items || [];
  const createSection = useCreateResource('sections');
  const { data: coursesData } = useResourceList('courses', { page: 1, pageSize: 200 });
  const courses = coursesData?.items || [];
  const { data: semestersData } = useResourceList('semesters', { page: 1, pageSize: 200 });
  const semesters = semestersData?.items || [];
  const { data: teachersData } = useResourceList('teachers', { page: 1, pageSize: 200 });
  const teachers = teachersData?.items || [];
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 5;
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: '', course: 'BCA', semester: '1', capacity: '60', advisor: '', status: 'Active' },
  });
  const filteredSections = useMemo(() => {
    return sections.filter((section) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = [section.name, section.course, section.semester, section.advisor].some((value) => value.toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || section.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [sections, search, filter]);
  const pageCount = Math.max(1, Math.ceil(filteredSections.length / pageSize));
  const displayedSections = filteredSections.slice((page - 1) * pageSize, page * pageSize);
  const onSubmit = (data) => {
    createSection(data);
    reset({ name: '', course: courses[0]?.code || '', semester: semesters[0]?.code?.replace(/^SEM-/, '') || '', capacity: '60', advisor: teachers[0]?.name || '', status: 'Active' });
    setPage(1);
    setIsModalOpen(false);
  };
  const totalStudents = sections.reduce((acc, sec) => acc + parseInt(sec.enrolled), 0);
  const activeCount = sections.filter((s) => s.status === 'Active').length;
  const _avgEnrollment = Math.round(totalStudents / sections.length);
  return (
    <div className="space-y-6">
      <SectionHeader title="Section management" subtitle="Manage academic sections within courses, assign class advisors and track enrollment." />
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total sections</p>
          <p className="mt-3 text-2xl font-semibold text-white">{sections.length}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Active sections</p>
          <p className="mt-3 text-2xl font-semibold text-white">{activeCount}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total enrolled</p>
          <p className="mt-3 text-2xl font-semibold text-white">{totalStudents}</p>
        </div>
      </div>
      <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">All sections</h2>
            <p className="text-sm text-slate-400">Search sections by name, course or advisor and manage section details.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-2xl bg-slate-800/80 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700 hover-gradient-border"><FaDownload /> Export</button>
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-sky-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"><FaPlus /> Add section</button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2"><SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} /></div>
        <div className="mt-4">
          <DataTable
            columns={['Section', 'Course', 'Semester', 'Capacity', 'Enrolled', 'Advisor', 'Status']}
            rows={displayedSections.map((section) => [
              <div key={section.id} className="font-semibold text-white">{section.name}</div>,
              section.course,
              section.semester,
              section.capacity,
              section.enrolled,
              section.advisor,
              <StatusBadge key={`${section.id}-status`} status={section.status} />,
            ])}
          />
        </div>
        <div className="mt-4"><TablePagination page={page} pageCount={pageCount} onPageChange={setPage} /></div>
      </div>
      <Modal title="Add new section" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} footer={<button onClick={handleSubmit(onSubmit)} className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 hover-gradient-border">Create section</button>}>
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Section name"><input type="text" {...register('name', { required: 'Section name is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="BCA-5-A" />{errors.name && <p className="mt-1 text-sm text-rose-400">{errors.name.message}</p>}</FormField>
          <FormField label="Course"><select {...register('course', { required: 'Course is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"><option value="BCA">BCA</option><option value="MBA">MBA</option><option value="BSc Biology">BSc Biology</option><option value="BA English">BA English</option><option value="BCom">BCom</option></select>{errors.course && <p className="mt-1 text-sm text-rose-400">{errors.course.message}</p>}</FormField>
          <FormField label="Semester"><select {...register('semester', { required: 'Semester is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option></select>{errors.semester && <p className="mt-1 text-sm text-rose-400">{errors.semester.message}</p>}</FormField>
          <FormField label="Capacity"><input type="number" {...register('capacity', { required: 'Capacity is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="60" />{errors.capacity && <p className="mt-1 text-sm text-rose-400">{errors.capacity.message}</p>}</FormField>
          <FormField label="Class advisor"><input type="text" {...register('advisor', { required: 'Advisor is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="Dr. Priya Menon" />{errors.advisor && <p className="mt-1 text-sm text-rose-400">{errors.advisor.message}</p>}</FormField>
          <FormField label="Status"><select {...register('status', { required: 'Status is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"><option value="Active">Active</option><option value="Inactive">Inactive</option></select>{errors.status && <p className="mt-1 text-sm text-rose-400">{errors.status.message}</p>}</FormField>
        </form>
      </Modal>
    </div>
  );
}