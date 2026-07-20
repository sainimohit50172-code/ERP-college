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
import ExaminationModule from '../components/examination/ExaminationModule.jsx';
import { useExaminations } from '../hooks/useExaminations';
import { useResourceList } from '../hooks/useResourceHooks';
import { useERP } from '../services/ERPContext.jsx';
// sample data removed — using API
const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Scheduled', label: 'Scheduled' },
  { value: 'Ongoing', label: 'Ongoing' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Results Published', label: 'Results Published' },
];
const examTypeOptions = [
  { value: 'All', label: 'All exam types' },
  { value: 'Midterm', label: 'Midterm' },
  { value: 'Final', label: 'Final' },
  { value: 'Reassessment', label: 'Reassessment' },
  { value: 'Practical', label: 'Practical' },
];
export default function ExaminationPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [examType, setExamType] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [isHallTicketOpen, setIsHallTicketOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isGeneratingHallTickets, setIsGeneratingHallTickets] = useState(false);
  const pageSize = 5;
  const { students = [], setNotifications } = useERP();
  const { data, _isLoading, _error, createExamination, publishExaminationResults, generateHallTickets } = useExaminations({ page, pageSize, search, filter, examType: examType === 'All' ? '' : examType });
  const { data: studentAttendanceData } = useResourceList('studentAttendance', { page: 1, pageSize: 1000 });
  const attendanceRecords = studentAttendanceData?.items || [];
  const [studentFilter, setStudentFilter] = useState('All');
  const studentEligibility = useMemo(() => {
    return students.map((student) => {
      const attendance = attendanceRecords.filter((record) => record.studentId === student.id);
      const totalAttendance = attendance.length;
      const presentCount = attendance.filter((record) => record.status === 'Present').length;
      const attendancePercent = totalAttendance ? Math.round((presentCount / totalAttendance) * 100) : 0;
      const feeStatus = student.feeStatus || 'Pending';
      const isActive = student.status === 'Active';
      const attendanceOk = totalAttendance > 0 ? attendancePercent >= 75 : false;
      const feeOk = feeStatus === 'Paid';
      const isEligible = isActive && attendanceOk && feeOk;
      const reasons = [];
      if (!isActive) reasons.push('Inactive registration');
      if (!feeOk) reasons.push(`Fee ${feeStatus}`);
      if (!totalAttendance) reasons.push('No attendance record');
      else if (!attendanceOk) reasons.push(`Attendance ${attendancePercent}%`);
      return {
        ...student,
        attendancePercent,
        feeStatus,
        isEligible,
        eligibilityLabel: isEligible ? 'Eligible' : 'Not eligible',
        eligibilityDetail: reasons.join(' • '),
      };
    });
  }, [students, attendanceRecords]);
  const activeStudents = useMemo(() => studentEligibility.filter((student) => student.status === 'Active'), [studentEligibility]);
  const eligibleStudents = useMemo(() => activeStudents.filter((student) => student.isEligible), [activeStudents]);
  const _ineligibleStudents = useMemo(() => activeStudents.filter((student) => !student.isEligible), [activeStudents]);
  const filteredHallTicketStudents = useMemo(() => activeStudents.filter((student) => studentFilter === 'All' || student.eligibilityLabel === studentFilter), [activeStudents, studentFilter]);
  const exams = data?.items || [];
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { examName: '', subject: '', course: '', semester: '', examDate: '', totalMarks: '100', duration: '3 hrs', examCenter: '', invigilators: '2', status: 'Scheduled' },
  });
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = [exam.examName, exam.subject, exam.course].some((value) => (value || '').toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || exam.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [exams, search, filter]);
  const pageCount = Math.max(1, Math.ceil(filteredExams.length / pageSize));
  const displayedExams = filteredExams.slice((page - 1) * pageSize, page * pageSize);
  const onPublishExam = async (examId) => {
    try {
      setIsPublishing(true);
      await publishExaminationResults.mutateAsync(examId);
      setNotifications((prev) => [{ id: `NOTIF-${Date.now()}`, title: 'Exam published', date: new Date().toISOString().split('T')[0], details: 'Exam results are now published', type: 'success' }, ...prev]);
    } catch (err) {
      console.error('Publish exam results failed', err);
      setNotifications((prev) => [{ id: `NOTIF-${Date.now()}`, title: 'Publish failed', date: new Date().toISOString().split('T')[0], details: 'Could not publish exam results', type: 'error' }, ...prev]);
    } finally {
      setIsPublishing(false);
    }
  };
  const onGenerateHallTickets = (exam) => {
    const defaultStudentIds = eligibleStudents.length ? eligibleStudents.map((student) => student.id) : activeStudents.map((student) => student.id);
    setSelectedExam(exam);
    setSelectedStudentIds(defaultStudentIds);
    setStudentFilter(eligibleStudents.length ? 'Eligible' : 'All');
    setIsHallTicketOpen(true);
  };
  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds((prev) => (prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]));
  };
  const selectVisibleStudents = () => {
    setSelectedStudentIds(filteredHallTicketStudents.map((student) => student.id));
  };
  const clearSelectedStudents = () => {
    setSelectedStudentIds([]);
  };
  const confirmHallTickets = async () => {
    if (!selectedExam) return;
    try {
      setIsGeneratingHallTickets(true);
      const studentIdsToSend = selectedStudentIds.length ? selectedStudentIds : students.map((student) => student.id);
      await generateHallTickets.mutateAsync({ examId: selectedExam.id, studentIds: studentIdsToSend });
      setNotifications((prev) => [{ id: `NOTIF-${Date.now()}`, title: 'Hall tickets generated', date: new Date().toISOString().split('T')[0], details: `${studentIdsToSend.length} student tickets generated`, type: 'success' }, ...prev]);
      setIsHallTicketOpen(false);
    } catch (err) {
      console.error('Failed to generate hall tickets', err);
      setNotifications((prev) => [{ id: `NOTIF-${Date.now()}`, title: 'Hall ticket generation failed', date: new Date().toISOString().split('T')[0], details: 'Could not generate hall tickets for this exam', type: 'error' }, ...prev]);
    } finally {
      setIsGeneratingHallTickets(false);
    }
  };
  const onSubmit = async (payload) => {
    try {
      await createExamination.mutateAsync(payload);
      console.log('Examination created');
      reset({ examName: '', subject: '', course: '', semester: '', examDate: '', totalMarks: '100', duration: '3 hrs', examCenter: '', invigilators: '2', status: 'Scheduled' });
      setPage(1);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create examination', err);
    }
  };
  const totalExams = exams.length;
  const scheduled = exams.filter((e) => e.status === 'Scheduled').length;
  const completed = exams.filter((e) => e.status === 'Completed' || e.status === 'Results Published').length;
  return (
    <div className="space-y-6">
      <SectionHeader title="Examinations" subtitle="Create and manage exams, schedule exam centers, and assign invigilators." />
      <ExaminationModule />
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total exams</p>
          <p className="mt-3 text-2xl font-semibold text-white">{totalExams}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Scheduled</p>
          <p className="mt-3 text-2xl font-semibold text-white">{scheduled}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Completed</p>
          <p className="mt-3 text-2xl font-semibold text-white">{completed}</p>
        </div>
      </div>
      <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Examination management</h2>
            <p className="text-sm text-slate-400">Schedule exams, set exam centers, manage invigilators and track exam progress.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-2xl bg-slate-800/80 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700 hover-gradient-border"><FaDownload /> Export</button>
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-sky-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"><FaPlus /> New exam</button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-[1.6fr_1fr] xl:grid-cols-[2fr_1fr]">
          <SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} />
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 shadow-sm">
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Exam type</label>
            <select value={examType} onChange={(e) => setExamType(e.target.value)} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none">
              {examTypeOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-900 text-slate-100">{option.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <DataTable
            columns={['Exam Name', 'Type', 'Subject', 'Course', 'Date', 'Center', 'Invigil', 'Status', 'Actions']}
            rows={displayedExams.map((exam) => [
              <div key={exam.id} className="font-semibold text-white">{exam.examName}</div>,
              exam.examType || 'Standard',
              exam.subject,
              exam.course,
              exam.examDate,
              exam.examCenter,
              exam.invigilators,
              <StatusBadge key={`${exam.id}-status`} status={exam.status} />,
              <div key={`${exam.id}-actions`} className="flex flex-wrap gap-2">
                <button
                  onClick={() => onPublishExam(exam.id)}
                  disabled={isPublishing || exam.status === 'Results Published'}
                  className="rounded-3xl bg-emerald-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700"
                >
                  {exam.status === 'Results Published' ? 'Published' : 'Publish'}
                </button>
                <button onClick={() => onGenerateHallTickets(exam)} className="rounded-3xl bg-sky-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-sky-300">
                  Hall tickets
                </button>
              </div>,
            ])}
          />
        </div>
        <div className="mt-4"><TablePagination page={page} pageCount={pageCount} onPageChange={setPage} /></div>
      </div>
      <Modal title="Create new examination" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} footer={<Button onClick={handleSubmit(onSubmit)} variant="primary" >Create exam</Button>}>
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Exam name"><input type="text" {...register('examName', { required: 'Exam name is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="Mid-Semester 2025 S5" />{errors.examName && <p className="mt-1 text-sm text-rose-400">{errors.examName.message}</p>}</FormField>
          <FormField label="Exam type"><select {...register('examType')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"><option value="Midterm">Midterm</option><option value="Final">Final</option><option value="Reassessment">Reassessment</option><option value="Practical">Practical</option></select></FormField>
          <FormField label="Subject"><input type="text" {...register('subject', { required: 'Subject is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="Data Structures" />{errors.subject && <p className="mt-1 text-sm text-rose-400">{errors.subject.message}</p>}</FormField>
          <FormField label="Course"><input type="text" {...register('course', { required: 'Course is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="BCA" />{errors.course && <p className="mt-1 text-sm text-rose-400">{errors.course.message}</p>}</FormField>
          <FormField label="Semester"><input type="text" {...register('semester', { required: 'Semester is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="5" />{errors.semester && <p className="mt-1 text-sm text-rose-400">{errors.semester.message}</p>}</FormField>
          <FormField label="Academic session"><input type="text" {...register('academicSession')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="2025-2026" /></FormField>
          <FormField label="Exam date"><input type="date" {...register('examDate', { required: 'Exam date is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" />{errors.examDate && <p className="mt-1 text-sm text-rose-400">{errors.examDate.message}</p>}</FormField>
          <FormField label="Total marks"><input type="number" {...register('totalMarks')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="100" /></FormField>
          <FormField label="Duration"><input type="text" {...register('duration')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="3 hrs" /></FormField>
          <FormField label="Exam center"><input type="text" {...register('examCenter', { required: 'Exam center is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="Lab-A" />{errors.examCenter && <p className="mt-1 text-sm text-rose-400">{errors.examCenter.message}</p>}</FormField>
          <FormField label="Number of invigilators"><input type="number" {...register('invigilators')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="2" /></FormField>
          <FormField label="Status"><select {...register('status')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"><option value="Scheduled">Scheduled</option><option value="Ongoing">Ongoing</option><option value="Completed">Completed</option><option value="Results Published">Results Published</option></select></FormField>
        </form>
      </Modal>
      <Modal
        title="Generate hall tickets"
        isOpen={isHallTicketOpen}
        onClose={() => setIsHallTicketOpen(false)}
        footer={(
          <button onClick={confirmHallTickets} disabled={isGeneratingHallTickets} className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-700 hover-gradient-border">
            {isGeneratingHallTickets ? 'Generating...' : 'Generate hall tickets'}
          </button>
        )}
      >
        <div className="space-y-4">
          <p className="text-slate-400">Generate hall tickets for registered exam takers. Review eligibility before sending tickets to students.</p>
          {selectedExam ? (
            <>
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                <p className="text-sm text-slate-400">Exam</p>
                <p className="mt-2 text-white font-semibold">{selectedExam.examName}</p>
                <p className="text-slate-400">{selectedExam.subject} • {selectedExam.course} • {selectedExam.examDate}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                  <p className="text-sm text-slate-400">Total active students</p>
                  <p className="mt-2 text-white font-semibold">{activeStudents.length}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                  <p className="text-sm text-slate-400">Eligible students</p>
                  <p className="mt-2 text-white font-semibold">{eligibleStudents.length}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                  <p className="text-sm text-slate-400">Selected for tickets</p>
                  <p className="mt-2 text-white font-semibold">{selectedStudentIds.length}</p>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  {['All', 'Eligible', 'Not eligible'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setStudentFilter(option)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${studentFilter === option ? 'bg-sky-400 text-slate-950' : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button type="button" onClick={selectVisibleStudents} className="rounded-3xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 hover-gradient-border">Select visible</button>
                  <button type="button" onClick={clearSelectedStudents} className="rounded-3xl bg-rose-400/15 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-400/20 hover-gradient-border">Clear selection</button>
                </div>
                <div className="mt-5 space-y-2 max-h-80 overflow-y-auto rounded-3xl border border-white/10 bg-slate-900/80 p-2">
                  {filteredHallTicketStudents.length ? filteredHallTicketStudents.map((student) => (
                    <label key={student.id} className="grid gap-3 rounded-3xl border border-white/10 bg-slate-950/90 p-4 shadow-sm transition hover:border-sky-400">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                          className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-sky-400 focus:ring-sky-400"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-white">{student.name || student.rollNo}</p>
                              <p className="text-sm text-slate-400">{student.rollNo} • Fee {student.feeStatus} • {student.attendancePercent}% attendance</p>
                            </div>
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${student.isEligible ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'}`}>
                              {student.eligibilityLabel}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-slate-500">{student.eligibilityDetail || 'Ready for registration check'}</p>
                        </div>
                      </div>
                    </label>
                  )) : (
                    <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/80 p-6 text-center text-slate-400">No students match the selected filter.</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="text-slate-400">No exam selected.</p>
          )}
        </div>
      </Modal>
    </div>
  );
}