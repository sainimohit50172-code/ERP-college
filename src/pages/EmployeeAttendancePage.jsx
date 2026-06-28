import { useMemo, useState } from 'react';
import { FaCalendarCheck, FaDownload, FaSearch, FaUserTie } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { useResourceList, useCreateResource } from '../hooks/useResourceHooks';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import FormField from '../components/forms/FormField.jsx';
import { useERP } from '../services/ERPContext.jsx';

// attendance moved to ERPContext

const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Present', label: 'Present' },
  { value: 'Absent', label: 'Absent' },
  { value: 'Late', label: 'Late' },
];

export default function EmployeeAttendancePage() {
  const { data: employeeAttendanceData } = useResourceList('employeeAttendance', { page: 1, pageSize: 200 });
  const employeeAttendance = employeeAttendanceData?.items || [];
  const createEmployeeAttendance = useCreateResource('employeeAttendance');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const { register, handleSubmit } = useForm({ defaultValues: { date: '2025-05-22', employee: '', department: 'Admissions', shift: 'Day', status: 'Present' } });

  const filteredAttendance = useMemo(() => employeeAttendance.filter((entry) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch = [entry.employee, entry.department, entry.shift, entry.date].some((field) => field.toLowerCase().includes(searchTerm));
    const matchesFilter = filter === 'All' || entry.status === filter;
    return matchesSearch && matchesFilter;
  }), [employeeAttendance, search, filter]);

  const pageCount = Math.max(1, Math.ceil(filteredAttendance.length / pageSize));
  const displayedAttendance = filteredAttendance.slice((page - 1) * pageSize, page * pageSize);

  const onSubmit = (data) => {
    createEmployeeAttendance(data);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      <SectionHeader title="Employee attendance" subtitle="Monitor HR workforce check-ins, shift attendance and tardiness." />
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm"><p className="text-sm uppercase tracking-[0.24em] text-slate-400">Present</p><p className="mt-4 text-3xl font-semibold text-white">4</p></div>
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm"><p className="text-sm uppercase tracking-[0.24em] text-slate-400">Shift coverage</p><p className="mt-4 text-3xl font-semibold text-white">98%</p></div>
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm"><p className="text-sm uppercase tracking-[0.24em] text-slate-400">Late entries</p><p className="mt-4 text-3xl font-semibold text-white">1</p></div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><h2 className="text-xl font-semibold text-white">Attendance ledger</h2><p className="text-sm text-slate-400">Search employee attendance and compare departmental coverage.</p></div><div className="flex flex-wrap items-center gap-3"><button className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 hover:bg-slate-700"><FaDownload /> Export</button></div></div>
            <div className="mt-6 grid gap-4 md:grid-cols-2"><SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} /></div>
            <div className="mt-6"><DataTable columns={['Employee', 'Department', 'Shift', 'Date', 'Status']} rows={displayedAttendance.map((entry) => [<div className="space-y-1" key={entry.id}><p className="font-semibold text-white">{entry.employee}</p><p className="text-sm text-slate-400">{entry.department}</p></div>, entry.department, entry.shift, entry.date, <StatusBadge key={`${entry.id}-status`} status={entry.status} />])} /></div>
            <div className="mt-6"><TablePagination page={page} pageCount={pageCount} onPageChange={setPage} /></div>
          </div>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft"><div className="mb-5 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-700/80 text-slate-200"><FaCalendarCheck className="h-5 w-5" /></div><div><p className="text-sm uppercase tracking-[0.24em] text-slate-400">Manual log</p><h3 className="text-xl font-semibold text-white">Add attendance</h3></div></div>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <FormField label="Date"><input type="date" {...register('date', { required: true })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" /></FormField>
            <FormField label="Employee"><input type="text" {...register('employee', { required: true })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Naveen R." /></FormField>
            <FormField label="Department"><select {...register('department', { required: true })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"><option value="Admissions">Admissions</option><option value="Finance">Finance</option><option value="HR">HR</option><option value="Library">Library</option><option value="Security">Security</option></select></FormField>
            <FormField label="Shift"><select {...register('shift', { required: true })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"><option value="Day">Day</option><option value="Afternoon">Afternoon</option><option value="Night">Night</option></select></FormField>
            <FormField label="Status"><select {...register('status', { required: true })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"><option value="Present">Present</option><option value="Absent">Absent</option><option value="Late">Late</option></select></FormField>
            <button type="submit" className="mt-3 inline-flex w-full items-center justify-center rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">Record attendance</button>
          </form>
        </div>
      </div>
    </div>
  );
}
