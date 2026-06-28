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
import { usePermissions } from '../services/permissionHelpers.js';

// internal marks centralized in ERPContext

const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Under Review', label: 'Under Review' },
];

export default function InternalMarksPage() {
  const { data: internalMarksData } = useResourceList('internalMarks', { page: 1, pageSize: 200 });
  const internalMarks = internalMarksData?.items || [];
  const createInternalMark = useCreateResource('internalMarks');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 5;

  const perms = usePermissions();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { student: '', rollNo: '', subject: '', assignment1: '0', assignment2: '0', midTerm: '0', presentation: '0', status: 'Pending' },
  });

  const filteredMarks = useMemo(() => {
    return internalMarks.filter((mark) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = [mark.student || '', mark.rollNo || '', mark.subject || ''].some((value) => String(value).toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || mark.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [internalMarks, search, filter]);

  const pageCount = Math.max(1, Math.ceil(filteredMarks.length / pageSize));
  const displayedMarks = filteredMarks.slice((page - 1) * pageSize, page * pageSize);

  const onSubmit = (data) => {
    createInternalMark(data);
    reset({ student: '', rollNo: '', subject: '', assignment1: '0', assignment2: '0', midTerm: '0', presentation: '0', status: 'Pending' });
    setPage(1);
    setIsModalOpen(false);
  };

  const totalRecords = internalMarks.length;
  const completed = internalMarks.filter((m) => m.status === 'Completed').length;
  const avgPercentage = Math.round(internalMarks.reduce((acc, m) => acc + parseInt(String(m.percentage || '0').replace('%', '')), 0) / Math.max(1, internalMarks.length));

  return (
    <div className="space-y-8">
      <SectionHeader title="Internal marks" subtitle="Enter and manage internal assessment marks for students." />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Total records</p>
          <p className="mt-4 text-3xl font-semibold text-white">{totalRecords}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Completed</p>
          <p className="mt-4 text-3xl font-semibold text-white">{completed}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Average percentage</p>
          <p className="mt-4 text-3xl font-semibold text-white">{avgPercentage}%</p>
        </div>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Internal marks registry</h2>
            <p className="text-sm text-slate-400">Manage assignments, mid-term, presentations and other internal assessments.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700"><FaDownload /> Export</button>
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"><FaPlus /> Enter marks</button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2"><SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} /></div>

        <div className="mt-6">
          <DataTable
            columns={['Student', 'Roll No', 'Subject', 'Assign 1', 'Assign 2', 'Mid Term', 'Present', 'Total', 'Percent', 'Status']}
            rows={displayedMarks.map((mark) => [
              <div key={mark.id} className="font-semibold text-white">{mark.student}</div>,
              mark.rollNo,
              mark.subject,
              mark.assignment1,
              mark.assignment2,
              mark.midTerm,
              mark.presentation,
              mark.total,
              <div key={`${mark.id}-percent`} className={`font-semibold ${parseInt(mark.percentage) >= 75 ? 'text-emerald-400' : parseInt(mark.percentage) >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>{mark.percentage}</div>,
              <StatusBadge key={`${mark.id}-status`} status={mark.status} />,
            ])}
          />
        </div>
        <div className="mt-6"><TablePagination page={page} pageCount={pageCount} onPageChange={setPage} /></div>
      </div>

      <Modal title="Enter internal marks" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} footer={<button onClick={handleSubmit(onSubmit)} className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">Save marks</button>}>
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Student name"><input type="text" {...register('student', { required: 'Student name is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Raj Kumar" />{errors.student && <p className="mt-1 text-sm text-rose-400">{errors.student.message}</p>}</FormField>
          <FormField label="Roll number"><input type="text" {...register('rollNo', { required: 'Roll number is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="BCA-001" />{errors.rollNo && <p className="mt-1 text-sm text-rose-400">{errors.rollNo.message}</p>}</FormField>
          <FormField label="Subject"><input type="text" {...register('subject', { required: 'Subject is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Data Structures" />{errors.subject && <p className="mt-1 text-sm text-rose-400">{errors.subject.message}</p>}</FormField>
          <FormField label="Assignment 1 (out of 10)"><input type="number" min="0" max="10" {...register('assignment1')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="8" /></FormField>
          <FormField label="Assignment 2 (out of 10)"><input type="number" min="0" max="10" {...register('assignment2')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="7" /></FormField>
          <FormField label="Mid-term (out of 20)"><input type="number" min="0" max="20" {...register('midTerm')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="18" /></FormField>
          <FormField label="Presentation (out of 10)"><input type="number" min="0" max="10" {...register('presentation')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="9" /></FormField>
          <FormField label="Status"><select {...register('status')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"><option value="Pending">Pending</option><option value="Completed">Completed</option><option value="Under Review">Under Review</option></select></FormField>
        </form>
      </Modal>
    </div>
  );
}
