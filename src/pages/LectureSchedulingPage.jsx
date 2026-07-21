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
// replaced useERP with resource hooks
const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Scheduled', label: 'Scheduled' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
];
export default function LectureSchedulingPage() {
  const { data: schedulesData } = useResourceList('lectureSchedules', { page: 1, pageSize: 200 });
  const lectureSchedules = schedulesData?.items || [];
  const createLectureSchedule = useCreateResource('lectureSchedules');
  const { data: coursesData } = useResourceList('courses', { page: 1, pageSize: 200 });
  const courses = coursesData?.items || [];
  const { data: sectionsData } = useResourceList('sections', { page: 1, pageSize: 200 });
  const sections = sectionsData?.items || [];
  const { data: teachersData } = useResourceList('teachers', { page: 1, pageSize: 200 });
  const teachers = teachersData?.items || [];
  const { data: subjectsData } = useResourceList('subjects', { page: 1, pageSize: 200 });
  const subjects = subjectsData?.items || [];
  const subjectMap = new Map((subjects || []).map((s) => [s.id, s]));
  const teacherMap = new Map((teachers || []).map((t) => [t.id, t]));
  const courseMap = new Map((courses || []).map((c) => [c.id, c]));
  const sectionMap = new Map((sections || []).map((s) => [s.id, s]));
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 5;
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { subject: '', teacher: '', course: 'BCA', section: 'A', date: '', time: '', room: '', type: 'Theory', status: 'Scheduled' },
  });
  const filteredLectures = useMemo(() => {
    return lectureSchedules.filter((lecture) => {
      const searchTerm = search.toLowerCase();
      const subject = subjectMap.get(lecture.subjectId)?.title || '';
      const teacher = teacherMap.get(lecture.teacherId)?.name || '';
      const course = courseMap.get(lecture.courseId)?.code || '';
      const room = lecture.room || '';
      const matchesSearch = [subject, teacher, course, room].some((value) => value.toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || lecture.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [lectureSchedules, search, filter, subjectMap, teacherMap, courseMap]);
  const pageCount = Math.max(1, Math.ceil(filteredLectures.length / pageSize));
  const displayedLectures = filteredLectures.slice((page - 1) * pageSize, page * pageSize);
  const onSubmit = (data) => {
    createLectureSchedule(data);
    reset({ subject: '', teacher: '', course: courses[0]?.code || '', section: sections[0]?.name || '', date: '', time: '', room: '', type: 'Theory', status: 'Scheduled' });
    setPage(1);
    setIsModalOpen(false);
  };
  const totalLectures = lectureSchedules.length;
  const theoryLectures = lectureSchedules.filter((l) => l.type === 'Theory').length;
  const practicalLectures = lectureSchedules.filter((l) => l.type === 'Practical').length;
  return (
    <div className="space-y-6">
      <SectionHeader title="Lecture scheduling" subtitle="Schedule individual lectures, assign instructors and manage classroom resources." />
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total lectures</p>
          <p className="mt-3 text-2xl font-semibold text-white">{totalLectures}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Theory lectures</p>
          <p className="mt-3 text-2xl font-semibold text-white">{theoryLectures}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Practical sessions</p>
          <p className="mt-3 text-2xl font-semibold text-white">{practicalLectures}</p>
        </div>
      </div>
      <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Lecture schedule</h2>
            <p className="text-sm text-slate-400">Search lectures, manage schedules and track attendance across sections.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-2xl bg-slate-800/80 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700 hover-gradient-border"><FaDownload /> Export</button>
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-sky-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"><FaPlus /> Add lecture</button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2"><SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} /></div>
        <div className="mt-4">
          <DataTable
            columns={['Subject', 'Teacher', 'Course', 'Section', 'Day', 'Time', 'Room', 'Type', 'Status']}
            rows={displayedLectures.map((lecture) => {
              const subject = subjectMap.get(lecture.subjectId)?.title || 'Unknown subject';
              const teacher = teacherMap.get(lecture.teacherId)?.name || 'Unknown teacher';
              const course = courseMap.get(lecture.courseId)?.code || 'Unknown course';
              const section = sectionMap.get(lecture.sectionId)?.name || 'Unknown section';
              return [
                <div key={`${lecture.id}-subject`} className="font-semibold text-white">{subject}</div>,
                teacher,
                course,
                section,
                lecture.day,
                lecture.time,
                lecture.room,
                <div key={`${lecture.id}-type`} className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${lecture.type === 'Theory' ? 'bg-cyan-400/10 text-cyan-300' : 'bg-green-400/10 text-green-300'}`}>{lecture.type}</div>,
                <StatusBadge key={`${lecture.id}-status`} status={lecture.status} />,
              ];
            })}
          />
        </div>
        <div className="mt-4"><TablePagination page={page} pageCount={pageCount} onPageChange={setPage} /></div>
      </div>
      <Modal title="Schedule new lecture" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} footer={<button onClick={handleSubmit(onSubmit)} className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 hover-gradient-border">Schedule lecture</button>}>
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Subject"><select {...register('subject', { required: 'Subject is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border">
              <option value="">Select subject</option>
              {subjects.map((subject) => (<option key={subject.id} value={subject.code}>{subject.title}</option>))}
            </select>{errors.subject && <p className="mt-1 text-sm text-rose-400">{errors.subject.message}</p>}</FormField>
          <FormField label="Teacher"><select {...register('teacher', { required: 'Teacher is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border">
              <option value="">Select teacher</option>
              {teachers.map((teacher) => (<option key={teacher.id} value={teacher.name}>{teacher.name}</option>))}
            </select>{errors.teacher && <p className="mt-1 text-sm text-rose-400">{errors.teacher.message}</p>}</FormField>
          <FormField label="Course"><select {...register('course', { required: 'Course is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border">
              <option value="">Select course</option>
              {courses.map((course) => (<option key={course.id} value={course.code}>{course.code}</option>))}
            </select>{errors.course && <p className="mt-1 text-sm text-rose-400">{errors.course.message}</p>}</FormField>
          <FormField label="Section"><select {...register('section', { required: 'Section is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border">
              <option value="">Select section</option>
              {sections.map((section) => (<option key={section.id} value={section.name}>{section.name}</option>))}
            </select>{errors.section && <p className="mt-1 text-sm text-rose-400">{errors.section.message}</p>}</FormField>
          <FormField label="Date"><input type="date" {...register('date', { required: 'Date is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" />{errors.date && <p className="mt-1 text-sm text-rose-400">{errors.date.message}</p>}</FormField>
          <FormField label="Time"><input type="text" {...register('time', { required: 'Time is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="9:00 AM - 10:30 AM" />{errors.time && <p className="mt-1 text-sm text-rose-400">{errors.time.message}</p>}</FormField>
          <FormField label="Classroom"><input type="text" {...register('room', { required: 'Classroom is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="A-101" />{errors.room && <p className="mt-1 text-sm text-rose-400">{errors.room.message}</p>}</FormField>
          <FormField label="Type"><select {...register('type', { required: 'Type is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"><option value="Theory">Theory</option><option value="Practical">Practical</option><option value="Seminar">Seminar</option></select>{errors.type && <p className="mt-1 text-sm text-rose-400">{errors.type.message}</p>}</FormField>
          <FormField label="Status"><select {...register('status', { required: 'Status is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"><option value="Scheduled">Scheduled</option><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option></select>{errors.status && <p className="mt-1 text-sm text-rose-400">{errors.status.message}</p>}</FormField>
        </form>
      </Modal>
    </div>
  );
}