import { useMemo, useState } from 'react';
import { FaDownload, FaPlus, FaPrint } from 'react-icons/fa';
import { Edit3, Send } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader.jsx';
import SearchFilter from '../forms/SearchFilter.jsx';
// DataTable not used in this module — removed to satisfy lint
import FormField from '../forms/FormField.jsx';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import IconActionButton from '../ui/IconActionButton.jsx';
import { createExamMaster, createExamSchedule, listExamMasters, listExamSchedules } from '../../services/examService.js';
import { createMarkEntry, listMarkEntries, publishMarkEntries } from '../../services/markEntryService.js';
import { createResult, listResults, publishResult, updateResult } from '../../services/resultService.js';
import { calculateResultMetrics } from '../../services/gradeService.js';

const masterTypes = [
  { value: 'academicYear', label: 'Academic Year' },
  { value: 'examType', label: 'Examination Type' },
];

const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Scheduled', label: 'Scheduled' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Published', label: 'Published' },
];

export default function ExaminationModule() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [masterModalOpen, setMasterModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [markModalOpen, setMarkModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [masters, setMasters] = useState(listExamMasters().items);
  const [schedules, setSchedules] = useState(listExamSchedules().items);
  const [markEntries, setMarkEntries] = useState(listMarkEntries().items);
  const [results, setResults] = useState(listResults().items);
  const [masterForm, setMasterForm] = useState({ kind: 'examType', name: '', description: '' });
  const [scheduleForm, setScheduleForm] = useState({ examName: '', course: '', department: '', semester: '', subject: '', date: '', startTime: '', endTime: '', room: '', invigilator: '', duration: '' });
  const [markForm, setMarkForm] = useState({ studentName: '', studentId: '', course: '', semester: '', subject: '', internalMarks: '0', externalMarks: '0', practicalMarks: '0', assignmentMarks: '0', attendanceMarks: '0', graceMarks: '0' });
  const [resultForm, setResultForm] = useState({ studentName: '', studentId: '', semester: '', course: '', total: '0', percentage: '0', cgpa: '0', sgpa: '0', grade: '', status: 'Pass' });

  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      const query = search.toLowerCase();
      const matchesSearch = [schedule.examName, schedule.course, schedule.department, schedule.subject, schedule.room, schedule.invigilator].some((value) => (value || '').toLowerCase().includes(query));
      const matchesFilter = filter === 'All' || schedule.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [schedules, search, filter]);

  const filteredMarks = useMemo(() => {
    return markEntries.filter((entry) => {
      const query = search.toLowerCase();
      const matchesSearch = [entry.studentName, entry.studentId, entry.subject, entry.course].some((value) => (value || '').toLowerCase().includes(query));
      const matchesFilter = filter === 'All' || entry.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [markEntries, search, filter]);

  const filteredResults = useMemo(() => {
    return results.filter((entry) => {
      const query = search.toLowerCase();
      const matchesSearch = [entry.studentName, entry.studentId, entry.course].some((value) => (value || '').toLowerCase().includes(query));
      const matchesFilter = filter === 'All' || entry.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [results, search, filter]);

  const handleCreateMaster = (event) => {
    event.preventDefault();
    const response = createExamMaster(masterForm);
    setMasters((current) => [response.item, ...current]);
    setMasterForm({ kind: 'examType', name: '', description: '' });
    setMasterModalOpen(false);
  };

  const handleCreateSchedule = (event) => {
    event.preventDefault();
    const response = createExamSchedule(scheduleForm);
    setSchedules((current) => [response.item, ...current]);
    setScheduleForm({ examName: '', course: '', department: '', semester: '', subject: '', date: '', startTime: '', endTime: '', room: '', invigilator: '', duration: '' });
    setScheduleModalOpen(false);
  };

  const handleCreateMark = (event) => {
    event.preventDefault();
    const metrics = calculateResultMetrics({
      internal: markForm.internalMarks,
      external: markForm.externalMarks,
      practical: markForm.practicalMarks,
      assignment: markForm.assignmentMarks,
      attendance: markForm.attendanceMarks,
      grace: markForm.graceMarks,
    });
    const payload = {
      ...markForm,
      internalMarks: Number(markForm.internalMarks),
      externalMarks: Number(markForm.externalMarks),
      practicalMarks: Number(markForm.practicalMarks),
      assignmentMarks: Number(markForm.assignmentMarks),
      attendanceMarks: Number(markForm.attendanceMarks),
      graceMarks: Number(markForm.graceMarks),
      ...metrics,
      status: 'Draft',
    };
    const response = createMarkEntry(payload);
    setMarkEntries((current) => [response.item, ...current]);
    setMarkForm({ studentName: '', studentId: '', course: '', semester: '', subject: '', internalMarks: '0', externalMarks: '0', practicalMarks: '0', assignmentMarks: '0', attendanceMarks: '0', graceMarks: '0' });
    setMarkModalOpen(false);
  };

  const handlePublishMarks = () => {
    const ids = markEntries.filter((entry) => entry.status === 'Draft').map((entry) => entry.id);
    const response = publishMarkEntries(ids);
    setMarkEntries(response.items);
  };

  const handleCreateResult = (event) => {
    event.preventDefault();
    const response = createResult({
      ...resultForm,
      total: Number(resultForm.total),
      percentage: Number(resultForm.percentage),
      cgpa: Number(resultForm.cgpa),
      sgpa: Number(resultForm.sgpa),
      status: resultForm.status || 'Pass',
    });
    setResults((current) => [response.item, ...current]);
    setResultForm({ studentName: '', studentId: '', semester: '', course: '', total: '0', percentage: '0', cgpa: '0', sgpa: '0', grade: '', status: 'Pass' });
    setResultModalOpen(false);
  };

  const handlePublishResult = (id) => {
    const response = publishResult(id);
    setResults(response.items);
  };

  const handleEditResult = (entry) => {
    const response = updateResult(entry.id, { status: 'Edited' });
    setResults(response.items);
  };

  return (
    <div className="space-y-8">
      <SectionHeader title="Examination & result management" subtitle="Manage exam masters, scheduling, mark entry, result processing and reports from a single enterprise view." />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Exam masters</p>
          <p className="mt-3 text-2xl font-semibold text-white">{masters.length}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Scheduled exams</p>
          <p className="mt-3 text-2xl font-semibold text-white">{schedules.length}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Published results</p>
          <p className="mt-3 text-2xl font-semibold text-white">{results.filter((result) => result.published).length}</p>
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Exam master & scheduling</h2>
            <p className="text-sm text-slate-400">Create academic years, exam types, and exam schedules that stay ready for backend integration.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setMasterModalOpen(true)} className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"><FaPlus /> Add master</button>
            <button type="button" onClick={() => setScheduleModalOpen(true)} className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-300"><FaPlus /> Schedule exam</button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[20px] border border-slate-700/60 bg-slate-950/90 p-4">
            <h3 className="text-lg font-semibold text-white">Exam masters</h3>
            <div className="mt-4 space-y-2">
              {masters.map((master) => (
                <div key={master.id} className="rounded-[16px] border border-slate-700/70 bg-slate-900/80 p-3">
                  <div className="flex items-center justify-between gap-3 hover-gradient-border">
                    <div>
                      <p className="font-semibold text-white">{master.name}</p>
                      <p className="text-sm text-slate-400">{master.description || master.kind}</p>
                    </div>
                    <StatusBadge status={master.kind === 'academicYear' ? 'Scheduled' : 'Published'} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[20px] border border-slate-700/60 bg-slate-950/90 p-4">
            <h3 className="text-lg font-semibold text-white">Exam schedules</h3>
            <div className="mt-4 space-y-2">
              {filteredSchedules.map((schedule) => (
                <div key={schedule.id} className="rounded-[16px] border border-slate-700/70 bg-slate-900/80 p-3">
                  <div className="flex items-center justify-between gap-3 hover-gradient-border">
                    <div>
                      <p className="font-semibold text-white">{schedule.examName}</p>
                      <p className="text-sm text-slate-400">{schedule.course} • {schedule.department} • {schedule.date}</p>
                    </div>
                    <StatusBadge status={schedule.status || 'Scheduled'} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Mark entry</h2>
            <p className="text-sm text-slate-400">Capture internal, external, practical, assignment, attendance and grace marks with draft and publish controls.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setMarkModalOpen(true)} className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"><FaPlus /> New mark entry</button>
            <button type="button" onClick={handlePublishMarks} className="inline-flex items-center gap-2 rounded-3xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300 hover-gradient-border">Publish drafts</button>
          </div>
        </div>

        <div className="mt-4"><SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} /></div>
        <div className="mt-4 overflow-x-auto rounded-[20px] border border-slate-700/60 bg-slate-950/90">
          <table className="min-w-full text-sm text-slate-300">
            <thead className="bg-slate-800/70 text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-left">Subject</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Grade</th>
                <th className="px-4 py-3 text-left">Result</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMarks.map((entry) => (
                <tr key={entry.id} className="border-t border-slate-800/70">
                  <td className="px-4 py-3"><div className="font-semibold text-white">{entry.studentName}</div><div className="text-xs text-slate-500">{entry.studentId}</div></td>
                  <td className="px-4 py-3">{entry.subject}</td>
                  <td className="px-4 py-3">{entry.total}</td>
                  <td className="px-4 py-3">{entry.grade}</td>
                  <td className="px-4 py-3">{entry.result}</td>
                  <td className="px-4 py-3"><StatusBadge status={entry.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Result processing & student results</h2>
            <p className="text-sm text-slate-400">Process marks into results, calculate performance metrics, and publish results for student access.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setResultModalOpen(true)} className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"><FaPlus /> Add result</button>
            <button type="button" className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 hover-gradient-border"><FaDownload /> Export</button>
            <button type="button" className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 hover-gradient-border"><FaPrint /> Print</button>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto rounded-[20px] border border-slate-700/60 bg-slate-950/90">
          <table className="min-w-full text-sm text-slate-300">
            <thead className="bg-slate-800/70 text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-left">Semester</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">SGPA</th>
                <th className="px-4 py-3 text-left">CGPA</th>
                <th className="px-4 py-3 text-left">Result</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((entry) => (
                <tr key={entry.id} className="border-t border-slate-800/70">
                  <td className="px-4 py-3"><div className="font-semibold text-white">{entry.studentName}</div><div className="text-xs text-slate-500">{entry.studentId}</div></td>
                  <td className="px-4 py-3">{entry.semester}</td>
                  <td className="px-4 py-3">{entry.total}</td>
                  <td className="px-4 py-3">{entry.sgpa}</td>
                  <td className="px-4 py-3">{entry.cgpa}</td>
                  <td className="px-4 py-3"><StatusBadge status={entry.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <IconActionButton icon={Send} title="Publish result" ariaLabel="Publish result" variant="success" onClick={() => handlePublishResult(entry.id)} className="h-8 w-8" />
                      <IconActionButton icon={Edit3} title="Edit result" ariaLabel="Edit result" onClick={() => handleEditResult(entry)} className="h-8 w-8" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal title="Create exam master" isOpen={masterModalOpen} onClose={() => setMasterModalOpen(false)} footer={<button onClick={handleCreateMaster} variant="primary" className="hover-gradient-border">Save master</button>}>
        <form className="space-y-4" onSubmit={handleCreateMaster}>
          <FormField label="Type">
            <select value={masterForm.kind} onChange={(event) => setMasterForm((current) => ({ ...current, kind: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none">
              {masterTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </FormField>
          <FormField label="Name"><input value={masterForm.name} onChange={(event) => setMasterForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" placeholder="Academic year or exam type" /></FormField>
          <FormField label="Description"><textarea value={masterForm.description} onChange={(event) => setMasterForm((current) => ({ ...current, description: event.target.value }))} rows="3" className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
        </form>
      </Modal>

      <Modal title="Schedule exam" isOpen={scheduleModalOpen} onClose={() => setScheduleModalOpen(false)} footer={<button onClick={handleCreateSchedule} variant="primary" className="hover-gradient-border">Save schedule</button>}>
        <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleCreateSchedule}>
          <FormField label="Exam name"><input value={scheduleForm.examName} onChange={(event) => setScheduleForm((current) => ({ ...current, examName: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="Course"><input value={scheduleForm.course} onChange={(event) => setScheduleForm((current) => ({ ...current, course: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="Department"><input value={scheduleForm.department} onChange={(event) => setScheduleForm((current) => ({ ...current, department: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="Semester"><input value={scheduleForm.semester} onChange={(event) => setScheduleForm((current) => ({ ...current, semester: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="Subject"><input value={scheduleForm.subject} onChange={(event) => setScheduleForm((current) => ({ ...current, subject: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="Date"><input type="date" value={scheduleForm.date} onChange={(event) => setScheduleForm((current) => ({ ...current, date: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="Start time"><input value={scheduleForm.startTime} onChange={(event) => setScheduleForm((current) => ({ ...current, startTime: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="End time"><input value={scheduleForm.endTime} onChange={(event) => setScheduleForm((current) => ({ ...current, endTime: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="Room"><input value={scheduleForm.room} onChange={(event) => setScheduleForm((current) => ({ ...current, room: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="Invigilator"><input value={scheduleForm.invigilator} onChange={(event) => setScheduleForm((current) => ({ ...current, invigilator: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="Duration"><input value={scheduleForm.duration} onChange={(event) => setScheduleForm((current) => ({ ...current, duration: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
        </form>
      </Modal>

      <Modal title="Add mark entry" isOpen={markModalOpen} onClose={() => setMarkModalOpen(false)} footer={<button onClick={handleCreateMark} variant="primary" className="hover-gradient-border">Save marks</button>}>
        <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleCreateMark}>
          <FormField label="Student name"><input value={markForm.studentName} onChange={(event) => setMarkForm((current) => ({ ...current, studentName: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="Student ID"><input value={markForm.studentId} onChange={(event) => setMarkForm((current) => ({ ...current, studentId: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="Course"><input value={markForm.course} onChange={(event) => setMarkForm((current) => ({ ...current, course: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="Semester"><input value={markForm.semester} onChange={(event) => setMarkForm((current) => ({ ...current, semester: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="Subject"><input value={markForm.subject} onChange={(event) => setMarkForm((current) => ({ ...current, subject: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="Internal marks"><input type="number" value={markForm.internalMarks} onChange={(event) => setMarkForm((current) => ({ ...current, internalMarks: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="External marks"><input type="number" value={markForm.externalMarks} onChange={(event) => setMarkForm((current) => ({ ...current, externalMarks: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="Practical marks"><input type="number" value={markForm.practicalMarks} onChange={(event) => setMarkForm((current) => ({ ...current, practicalMarks: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="Assignment marks"><input type="number" value={markForm.assignmentMarks} onChange={(event) => setMarkForm((current) => ({ ...current, assignmentMarks: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="Attendance marks"><input type="number" value={markForm.attendanceMarks} onChange={(event) => setMarkForm((current) => ({ ...current, attendanceMarks: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="Grace marks"><input type="number" value={markForm.graceMarks} onChange={(event) => setMarkForm((current) => ({ ...current, graceMarks: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
        </form>
      </Modal>

      <Modal title="Create result" isOpen={resultModalOpen} onClose={() => setResultModalOpen(false)} footer={<button onClick={handleCreateResult} variant="primary" className="hover-gradient-border">Save result</button>}>
        <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleCreateResult}>
          <FormField label="Student name"><input value={resultForm.studentName} onChange={(event) => setResultForm((current) => ({ ...current, studentName: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="Student ID"><input value={resultForm.studentId} onChange={(event) => setResultForm((current) => ({ ...current, studentId: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="Course"><input value={resultForm.course} onChange={(event) => setResultForm((current) => ({ ...current, course: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="Semester"><input value={resultForm.semester} onChange={(event) => setResultForm((current) => ({ ...current, semester: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="Total"><input type="number" value={resultForm.total} onChange={(event) => setResultForm((current) => ({ ...current, total: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="Percentage"><input type="number" value={resultForm.percentage} onChange={(event) => setResultForm((current) => ({ ...current, percentage: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="CGPA"><input type="number" value={resultForm.cgpa} onChange={(event) => setResultForm((current) => ({ ...current, cgpa: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="SGPA"><input type="number" value={resultForm.sgpa} onChange={(event) => setResultForm((current) => ({ ...current, sgpa: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="Grade"><input value={resultForm.grade} onChange={(event) => setResultForm((current) => ({ ...current, grade: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none" /></FormField>
          <FormField label="Status"><select value={resultForm.status} onChange={(event) => setResultForm((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none"><option value="Pass">Pass</option><option value="Fail">Fail</option></select></FormField>
        </form>
      </Modal>
    </div>
  );
}
