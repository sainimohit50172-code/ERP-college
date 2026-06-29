import { useMemo, useState } from 'react';
import { FaCalendarDay, FaDownload } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { useResourceList, useCreateResource } from '../hooks/useResourceHooks';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import FormField from '../components/forms/FormField.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';

// migrated to API-backed teacher attendance

const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Present', label: 'Present' },
  { value: 'Absent', label: 'Absent' },
  { value: 'Late', label: 'Late' },
];

export default function TeacherAttendancePage() {
  const { data, _isLoading } = useResourceList('teacherAttendance', { page: 1, pageSize: 200 });
  const attendance = data?.items || [];
  const createAttendance = useCreateResource('teacherAttendance');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const { register, handleSubmit } = useForm({ defaultValues: { date: '2025-05-22', teacher: '', department: 'Computer Science', status: 'Present', remarks: '' } });

  const filteredAttendance = useMemo(() => {
    return attendance.filter((entry) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = [entry.teacher, entry.department, entry.date].some((field) => field.toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || entry.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [attendance, search, filter]);

  const pageCount = Math.max(1, Math.ceil(filteredAttendance.length / pageSize));
  const displayedAttendance = filteredAttendance.slice((page - 1) * pageSize, page * pageSize);

  const onSubmit = (formValues) => {
    createAttendance.mutate(formValues, { onSuccess: () => setPage(1) });
  };

  return (
    <div className="space-y-8">
      <SectionHeader title="Teacher attendance" subtitle="Monitor faculty presence, late arrivals and absence records." />
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm"><p className="text-sm uppercase tracking-[0.24em] text-slate-400">Today present</p><p className="mt-4 text-3xl font-semibold text-white">3</p></div>
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm"><p className="text-sm uppercase tracking-[0.24em] text-slate-400">On leave</p><p className="mt-4 text-3xl font-semibold text-white">1</p></div>
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm"><p className="text-sm uppercase tracking-[0.24em] text-slate-400">Late arrivals</p><p className="mt-4 text-3xl font-semibold text-white">1</p></div>
          </div>

          <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><h2 className="text-xl font-semibold text-white">Attendance register</h2><p className="text-sm text-slate-400">Track daily attendance, filter by status and view remarks.</p></div><div className="flex flex-wrap items-center gap-3"><button className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 hover:bg-slate-700"><FaDownload /> Export</button></div></div>
            <div className="mt-6 grid gap-4 md:grid-cols-2"><SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} /></div>
            <div className="mt-6"><DataTable columns={['Teacher', 'Department', 'Date', 'Status', 'Remarks']} rows={displayedAttendance.map((entry) => [<div className="space-y-1" key={entry.id}><p className="font-semibold text-white">{entry.teacher}</p><p className="text-sm text-slate-400">{entry.department}</p></div>, entry.date, entry.status, <StatusBadge key={`${entry.id}-status`} status={entry.status} />, entry.remarks])} /></div>
            <div className="mt-6"><TablePagination page={page} pageCount={pageCount} onPageChange={setPage} /></div>
          </div>
        </div>
        <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm"><div className="mb-5 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-700/80 text-slate-200"><FaCalendarDay className="h-5 w-5" /></div><div><p className="text-sm uppercase tracking-[0.24em] text-slate-400">Attendance entry</p><h3 className="text-xl font-semibold text-white">Log faculty attendance</h3></div></div>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <FormField label="Date"><input type="date" {...register('date', { required: true })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" /></FormField>
            <FormField label="Teacher"><input type="text" {...register('teacher', { required: true })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Dr. Priya Menon" /></FormField>
            <FormField label="Department"><select {...register('department', { required: true })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"><option value="Computer Science">Computer Science</option><option value="Mathematics">Mathematics</option><option value="English">English</option><option value="Business Administration">Business Administration</option></select></FormField>
            <FormField label="Status"><select {...register('status', { required: true })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"><option value="Present">Present</option><option value="Absent">Absent</option><option value="Late">Late</option></select></FormField>
            <FormField label="Remarks"><textarea {...register('remarks')} rows="3" className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Optional remarks"></textarea></FormField>
            <button type="submit" className="mt-3 inline-flex w-full items-center justify-center rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">Record attendance</button>
          </form>
        </div>
      </div>
    </div>
  );
}
