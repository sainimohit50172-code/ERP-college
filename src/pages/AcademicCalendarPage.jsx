import { useMemo, useState } from 'react';
import { FaDownload, FaPlus } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { useResourceList, useCreateResource } from '../hooks/useResourceHooks';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Button from '../components/ui/Button.jsx';
const eventTypeOptions = [
  { value: 'All', label: 'All event types' },
  { value: 'Session Start', label: 'Session Start' },
  { value: 'Holiday', label: 'Holiday' },
  { value: 'Examination', label: 'Examination' },
  { value: 'Assessment', label: 'Assessment' },
];
export default function AcademicCalendarPage() {
  const { data: calendarData } = useResourceList('calendarEvents', { page: 1, pageSize: 200 });
  const calendarEvents = calendarData?.items || [];
  const createCalendarEvent = useCreateResource('calendarEvents');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 5;
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { event: '', startDate: '', endDate: '', eventType: 'Session Start', status: 'Scheduled' },
  });
  const filteredCalendar = useMemo(() => {
    return calendarEvents.filter((item) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = [item.event, item.eventType, item.startDate].some((value) => value.toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || item.eventType === filter;
      return matchesSearch && matchesFilter;
    });
  }, [calendarEvents, search, filter]);
  const pageCount = Math.max(1, Math.ceil(filteredCalendar.length / pageSize));
  const displayedCalendar = filteredCalendar.slice((page - 1) * pageSize, page * pageSize);
  const onSubmit = (data) => {
    createCalendarEvent(data);
    reset({ event: '', startDate: '', endDate: '', eventType: 'Session Start', status: 'Scheduled' });
    setPage(1);
    setIsModalOpen(false);
  };
  const totalEvents = calendarEvents.length;
  const examinations = calendarEvents.filter((c) => c.eventType === 'Examination').length;
  const holidays = calendarEvents.filter((c) => c.eventType === 'Holiday').length;
  return (
    <div className="space-y-6">
      <SectionHeader title="Academic calendar" subtitle="Manage academic year events, holidays, exams and important dates." />
      <div className="grid gap-3 md:grid-cols-3">
        <div className="hover-gradient-border rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total events</p>
          <p className="mt-3 text-2xl font-semibold text-white">{totalEvents}</p>
        </div>
        <div className="hover-gradient-border rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Examinations</p>
          <p className="mt-3 text-2xl font-semibold text-white">{examinations}</p>
        </div>
        <div className="hover-gradient-border rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Holidays</p>
          <p className="mt-3 text-2xl font-semibold text-white">{holidays}</p>
        </div>
      </div>
      <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Calendar events</h2>
            <p className="text-sm text-slate-400">View and manage academic calendar events including sessions, exams and holidays.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
              <Button className="inline-flex items-center gap-2 px-3 py-2 text-sm hover-gradient-border" variant="secondary"><FaDownload /> Export</Button>
              <Button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 px-3 py-2 text-sm" variant="primary"><FaPlus /> Add event</Button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2"><SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={eventTypeOptions} placeholder="Search events..." /></div>
        <div className="mt-4">
          <DataTable
            columns={['Event', 'Start Date', 'End Date', 'Type', 'Status']}
            rows={displayedCalendar.map((item) => [
              <div key={item.id} className="font-semibold text-white">{item.event}</div>,
              item.startDate,
              item.endDate,
              <div key={`${item.id}-type`} className="inline-block rounded-full bg-indigo-400/10 px-3 py-1 text-xs font-semibold text-indigo-300">{item.eventType}</div>,
              <StatusBadge key={`${item.id}-status`} status={item.status} />,
            ])}
          />
        </div>
        <div className="mt-4"><TablePagination page={page} pageCount={pageCount} onPageChange={setPage} /></div>
      </div>
      <Modal title="Add calendar event" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} footer={<Button onClick={handleSubmit(onSubmit)} variant="primary" >Save event</Button>}>
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Event name"><input type="text" {...register('event', { required: 'Event name is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="Semester 5 Classes Begin" />{errors.event && <p className="mt-1 text-sm text-rose-400">{errors.event.message}</p>}</FormField>
          <FormField label="Event type"><select {...register('eventType', { required: 'Event type is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"><option value="Session Start">Session Start</option><option value="Holiday">Holiday</option><option value="Examination">Examination</option><option value="Assessment">Assessment</option></select>{errors.eventType && <p className="mt-1 text-sm text-rose-400">{errors.eventType.message}</p>}</FormField>
          <FormField label="Start date"><input type="date" {...register('startDate', { required: 'Start date is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" />{errors.startDate && <p className="mt-1 text-sm text-rose-400">{errors.startDate.message}</p>}</FormField>
          <FormField label="End date"><input type="date" {...register('endDate', { required: 'End date is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" />{errors.endDate && <p className="mt-1 text-sm text-rose-400">{errors.endDate.message}</p>}</FormField>
          <FormField label="Status"><select {...register('status', { required: 'Status is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"><option value="Scheduled">Scheduled</option><option value="Ongoing">Ongoing</option><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option></select>{errors.status && <p className="mt-1 text-sm text-rose-400">{errors.status.message}</p>}</FormField>
        </form>
      </Modal>
    </div>
  );
}