import { useMemo, useState } from 'react';
import { FaDownload, FaPlus } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import Button from '../components/ui/Button.jsx';
import FormField from '../components/forms/FormField.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { useLectureAttendance } from '../hooks/useLectureAttendance';

// Data loaded via API / React Query

const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export default function LectureAttendancePage() {
  // currentUser removed; audit createdBy at backend if required
  const { data: attendance = [], _isLoading, _isError, _error, _refetch, createLectureAttendance } = useLectureAttendance();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 5;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { date: '', time: '', subject: '', section: 'A', teacher: '', totalStudents: '58', present: '0', absent: '0', late: '0', status: 'Completed' },
  });

  const attendanceItems = useMemo(() => {
    if (Array.isArray(attendance)) return attendance;
    if (attendance && Array.isArray(attendance.items)) return attendance.items;
    if (attendance && Array.isArray(attendance.data)) return attendance.data;
    return [];
  }, [attendance]);

  const filteredAttendance = useMemo(() => {
    return attendanceItems.filter((record) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = [record.subject || '', record.teacher || '', record.section || ''].some((value) => String(value).toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || record.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [attendanceItems, search, filter]);

  const pageCount = Math.max(1, Math.ceil(filteredAttendance.length / pageSize));
  const displayedAttendance = filteredAttendance.slice((page - 1) * pageSize, page * pageSize);

  const onSubmit = (data) => {
    const percentage = ((parseInt(data.present) / parseInt(data.totalStudents)) * 100).toFixed(1);
    const payload = { ...data, percentage: `${percentage}%` };
    createLectureAttendance.mutate(payload);
    reset({ date: '', time: '', subject: '', section: 'A', teacher: '', totalStudents: '58', present: '0', absent: '0', late: '0', status: 'Completed' });
    setPage(1);
    setIsModalOpen(false);
  };

  const totalLectures = attendanceItems.length;
  const completed = attendanceItems.filter((a) => a.status === 'Completed').length;
  const avgAttendancePercentage = (attendanceItems.reduce((acc, a) => acc + parseFloat(a.percentage || '0'), 0) / Math.max(1, attendanceItems.length)).toFixed(1);

  return (
    <div className="space-y-8">
      <SectionHeader title="Lecture attendance" subtitle="Record and track per-lecture attendance for granular attendance analytics." />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Total lectures</p>
          <p className="mt-4 text-3xl font-semibold text-white">{totalLectures}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Completed</p>
          <p className="mt-4 text-3xl font-semibold text-white">{completed}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Average attendance</p>
          <p className="mt-4 text-3xl font-semibold text-white">{avgAttendancePercentage}%</p>
        </div>
      </div>

      <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Lecture attendance records</h2>
            <p className="text-sm text-slate-400">Record per-lecture attendance for each class session and track attendance trends.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700 hover-gradient-border"><FaDownload /> Export</button>
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"><FaPlus /> Record attendance</button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2"><SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} /></div>

        <div className="mt-6">
          <DataTable
            columns={['Date', 'Time', 'Subject', 'Section', 'Teacher', 'Total', 'Present', 'Absent', 'Late', 'Percent', 'Status']}
            rows={displayedAttendance.map((record) => [
              record.date,
              record.time,
              <div key={record.id} className="font-semibold text-white">{record.subject}</div>,
              record.section,
              <div key={`${record.id}-teacher`} className="text-sm text-slate-300">{record.teacher.split(' ')[1]}</div>,
              record.totalStudents,
              <div key={`${record.id}-present`} className="font-semibold text-emerald-400">{record.present}</div>,
              <div key={`${record.id}-absent`} className="font-semibold text-rose-400">{record.absent}</div>,
              <div key={`${record.id}-late`} className="font-semibold text-amber-400">{record.late}</div>,
              <div key={`${record.id}-percent`} className={`font-semibold ${parseFloat(record.percentage) >= 85 ? 'text-emerald-400' : parseFloat(record.percentage) >= 75 ? 'text-amber-400' : 'text-rose-400'}`}>{record.percentage}</div>,
              <StatusBadge key={`${record.id}-status`} status={record.status} />,
            ])}
          />
        </div>
        <div className="mt-6"><TablePagination page={page} pageCount={pageCount} onPageChange={setPage} /></div>
      </div>

      <Modal title="Record lecture attendance" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} footer={<Button onClick={handleSubmit(onSubmit)} variant="primary" >Save attendance</Button>}>
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Date"><input type="date" {...register('date', { required: 'Date is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" />{errors.date && <p className="mt-1 text-sm text-rose-400">{errors.date.message}</p>}</FormField>
          <FormField label="Time slot"><input type="text" {...register('time', { required: 'Time is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="09:00-10:00" />{errors.time && <p className="mt-1 text-sm text-rose-400">{errors.time.message}</p>}</FormField>
          <FormField label="Subject"><input type="text" {...register('subject', { required: 'Subject is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="Data Structures" />{errors.subject && <p className="mt-1 text-sm text-rose-400">{errors.subject.message}</p>}</FormField>
          <FormField label="Section"><select {...register('section')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"><option value="A">A</option><option value="B">B</option><option value="C">C</option></select></FormField>
          <FormField label="Teacher name"><input type="text" {...register('teacher', { required: 'Teacher is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="Dr. Priya Menon" />{errors.teacher && <p className="mt-1 text-sm text-rose-400">{errors.teacher.message}</p>}</FormField>
          <FormField label="Total students"><input type="number" {...register('totalStudents')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="58" /></FormField>
          <FormField label="Present"><input type="number" min="0" {...register('present', { required: 'Present count is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="55" />{errors.present && <p className="mt-1 text-sm text-rose-400">{errors.present.message}</p>}</FormField>
          <FormField label="Absent"><input type="number" min="0" {...register('absent')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="2" /></FormField>
          <FormField label="Late arrivals"><input type="number" min="0" {...register('late')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="1" /></FormField>
          <FormField label="Status"><select {...register('status')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"><option value="Completed">Completed</option><option value="Pending">Pending</option><option value="Cancelled">Cancelled</option></select></FormField>
        </form>
      </Modal>
    </div>
  );
}
