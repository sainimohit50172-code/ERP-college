import { useMemo, useState } from 'react';
import { FaClock, FaDownload, FaPlus, FaSearch, FaTable } from 'react-icons/fa';
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
  { value: 'Confirmed', label: 'Confirmed' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export default function TimetableManagementPage() {
  const { data: timetablesData } = useResourceList('timetables', { page: 1, pageSize: 200 });
  const timetables = timetablesData?.items || [];
  const createTimetable = useCreateResource('timetables');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 5;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { course: 'BCA Semester 5', day: 'Friday', time: '11:00 AM - 12:30 PM', subject: 'Operating Systems', teacher: 'Dr. Priya Menon', room: 'A-102', status: 'Confirmed' } });

  const filteredTimetables = useMemo(() => {
    return timetables.filter((entry) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = [entry.course, entry.day, entry.subject, entry.teacher, entry.room].some((value) => value.toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || entry.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [timetables, search, filter]);

  const pageCount = Math.max(1, Math.ceil(filteredTimetables.length / pageSize));
  const displayedTimetables = filteredTimetables.slice((page - 1) * pageSize, page * pageSize);

  const onSubmit = (formValues) => {
    createTimetable.mutate(formValues, { onSuccess: () => { reset({ course: 'BCA Semester 5', day: 'Friday', time: '11:00 AM - 12:30 PM', subject: 'Operating Systems', teacher: 'Dr. Priya Menon', room: 'A-102', status: 'Confirmed' }); setPage(1); setIsModalOpen(false); } });
  };

  return (
    <div className="space-y-8">
      <SectionHeader title="Timetable management" subtitle="Class scheduling, lecture assignments and room coordination for academic sessions." />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Scheduled slots</p>
              <p className="mt-4 text-3xl font-semibold text-white">{timetables.length}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Confirmed lectures</p>
              <p className="mt-4 text-3xl font-semibold text-white">{timetables.filter((entry) => entry.status === 'Confirmed').length}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Rooms in use</p>
              <p className="mt-4 text-3xl font-semibold text-white">{new Set(timetables.map((entry) => entry.room)).size}</p>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Schedule overview</h2>
                <p className="text-sm text-slate-400">Search timetable entries, filter by status, and update lecture schedules.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700"><FaDownload /> Export</button>
                <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"><FaPlus /> Add slot</button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2"><SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} /></div>

            <div className="mt-6">
              <DataTable columns={['Course', 'Day', 'Time', 'Subject', 'Teacher', 'Room', 'Status']} rows={displayedTimetables.map((entry) => [entry.course, entry.day, entry.time, entry.subject, entry.teacher, entry.room, <StatusBadge key={entry.id} status={entry.status} />])} />
            </div>
            <div className="mt-6"><TablePagination page={page} pageCount={pageCount} onPageChange={setPage} /></div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft">
          <div className="mb-5 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-700/80 text-slate-200"><FaTable className="h-5 w-5" /></div><div><p className="text-sm uppercase tracking-[0.24em] text-slate-400">Coordination</p><h3 className="text-xl font-semibold text-white">Room occupancy</h3></div></div>
          <div className="grid gap-4">
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5"><p className="text-sm text-slate-400">Peak day</p><p className="mt-3 text-3xl font-semibold text-white">Monday</p></div>
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5"><p className="text-sm text-slate-400">Last updated</p><p className="mt-3 text-3xl font-semibold text-white">Today, 08:20 AM</p></div>
          </div>
        </div>
      </div>

      <Modal title="Add timetable slot" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} footer={<button onClick={handleSubmit(onSubmit)} className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">Save slot</button>}>
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Course"><input type="text" {...register('course', { required: 'Course is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="BCA Semester 5" />{errors.course && <p className="mt-1 text-sm text-rose-400">{errors.course.message}</p>}</FormField>
          <FormField label="Day"><select {...register('day', { required: 'Day is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"><option value="Monday">Monday</option><option value="Tuesday">Tuesday</option><option value="Wednesday">Wednesday</option><option value="Thursday">Thursday</option><option value="Friday">Friday</option></select>{errors.day && <p className="mt-1 text-sm text-rose-400">{errors.day.message}</p>}</FormField>
          <FormField label="Time"><input type="text" {...register('time', { required: 'Time is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="11:00 AM - 12:30 PM" />{errors.time && <p className="mt-1 text-sm text-rose-400">{errors.time.message}</p>}</FormField>
          <FormField label="Subject"><input type="text" {...register('subject', { required: 'Subject is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Operating Systems" />{errors.subject && <p className="mt-1 text-sm text-rose-400">{errors.subject.message}</p>}</FormField>
          <FormField label="Teacher"><input type="text" {...register('teacher', { required: 'Teacher is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Dr. Priya Menon" />{errors.teacher && <p className="mt-1 text-sm text-rose-400">{errors.teacher.message}</p>}</FormField>
          <FormField label="Room"><input type="text" {...register('room', { required: 'Room is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="A-102" />{errors.room && <p className="mt-1 text-sm text-rose-400">{errors.room.message}</p>}</FormField>
          <FormField label="Status"><select {...register('status', { required: 'Status is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"><option value="Confirmed">Confirmed</option><option value="Pending">Pending</option><option value="Cancelled">Cancelled</option></select>{errors.status && <p className="mt-1 text-sm text-rose-400">{errors.status.message}</p>}</FormField>
        </form>
      </Modal>
    </div>
  );
}
