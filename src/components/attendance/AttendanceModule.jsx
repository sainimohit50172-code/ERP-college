import { useEffect, useMemo, useState } from 'react';
import { FaDownload, FaPrint, FaSave, FaSyncAlt, FaUserGraduate } from 'react-icons/fa';
import SectionHeader from '../ui/SectionHeader.jsx';
import SearchFilter from '../forms/SearchFilter.jsx';
import FormField from '../forms/FormField.jsx';
import InfoCard from '../ui/InfoCard.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import { ATTENDANCE_STATUSES, bulkCreateAttendance, deleteAttendance, getAttendanceHistory, getAttendanceSummary, getDefaultAttendanceValues, listAttendance } from '../../services/attendanceService.js';
import { createLeave, listLeaves } from '../../services/leaveService.js';
import { buildAttendanceCsv, getAttendanceReport } from '../../services/attendanceReportService.js';

const statusOptions = [
  { value: 'All', label: 'All statuses' },
  ...ATTENDANCE_STATUSES.map((status) => ({ value: status, label: status })),
];

const reportModes = ['Daily', 'Monthly', 'Subject-wise', 'Student Summary', 'Faculty Summary', 'Low Attendance Report'];

function formatCurrency(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

function getStatusClass(status) {
  switch (status) {
    case 'Present':
      return 'bg-emerald-500/15 text-emerald-700';
    case 'Absent':
      return 'bg-rose-500/15 text-rose-700';
    case 'Late':
      return 'bg-amber-500/15 text-amber-700';
    case 'Half Day':
      return 'bg-sky-500/15 text-sky-700';
    case 'Leave':
      return 'bg-indigo-500/15 text-indigo-700';
    case 'Medical Leave':
      return 'bg-purple-500/15 text-purple-700';
    case 'Holiday':
      return 'bg-slate-500/15 text-slate-700';
    case 'Online':
      return 'bg-cyan-500/15 text-cyan-700';
    default:
      return 'bg-slate-200/80 text-slate-700';
  }
}

export default function AttendanceModule({
  scope = 'student',
  title = 'Attendance management',
  subtitle = 'Capture attendance efficiently and keep records audit-ready.',
  entityLabel = 'student',
  entityPlaceholder = 'Aarav Sharma',
}) {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({
    todaysEntries: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    attendancePercentage: 0,
    lowAttendanceAlerts: 0,
    facultyAttendance: 0,
  });
  const [history, setHistory] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [draftEntries, setDraftEntries] = useState([]);
  const [sessionValues, setSessionValues] = useState(getDefaultAttendanceValues(scope));
  const [filters, setFilters] = useState({ query: '', status: 'All', department: 'All', course: 'All', semester: 'All', subject: 'All', faculty: 'All', dateFrom: '', dateTo: '' });
  const [reportMode, setReportMode] = useState('Daily');
  const [statusMessage, setStatusMessage] = useState('Auto-save enabled');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const draftKey = `${scope}-attendance-draft`;

  const loadAttendanceData = async () => {
    setIsLoading(true);
    const [attendanceResponse, leaveResponse, summaryResponse, historyResponse] = await Promise.all([
      listAttendance(scope, filters),
      listLeaves(),
      getAttendanceSummary(scope),
      getAttendanceHistory(scope, filters.query || ''),
    ]);
    setRecords(attendanceResponse.items || []);
    setLeaves(leaveResponse.items || []);
    setSummary(summaryResponse);
    setHistory(historyResponse.items || []);
    const savedDraft = typeof window !== 'undefined' ? window.localStorage.getItem(draftKey) : null;
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        if (Array.isArray(parsedDraft)) {
          setDraftEntries(parsedDraft);
        }
      } catch {
        setDraftEntries([]);
      }
    } else if (!draftEntries.length && (attendanceResponse.items || []).length) {
      setDraftEntries((attendanceResponse.items || []).slice(0, 8).map((entry) => ({
        id: entry.id,
        name: entry.studentName || entry.teacherName || entry.employeeName || entry.guardName || '',
        status: entry.status || 'Present',
        remarks: entry.remarks || '',
        subject: entry.subject || '',
        date: entry.date || sessionValues.date,
      })));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadAttendanceData();
  }, [scope]);

  useEffect(() => {
    if (typeof window !== 'undefined' && draftEntries.length) {
      window.localStorage.setItem(draftKey, JSON.stringify(draftEntries));
      setStatusMessage('Draft auto-saved');
    }
  }, [draftEntries, draftKey]);

  const filteredRecords = useMemo(() => {
    return records.filter((entry) => {
      const query = filters.query.trim().toLowerCase();
      const searchable = [
        entry.studentId,
        entry.studentName,
        entry.teacherName,
        entry.employeeName,
        entry.guardName,
        entry.department,
        entry.course,
        entry.semester,
        entry.subject,
        entry.faculty,
        entry.date,
        entry.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesQuery = !query || searchable.includes(query);
      const matchesStatus = filters.status === 'All' || entry.status === filters.status;
      const matchesDepartment = filters.department === 'All' || entry.department === filters.department;
      const matchesCourse = filters.course === 'All' || entry.course === filters.course;
      const matchesSemester = filters.semester === 'All' || entry.semester === filters.semester;
      const matchesSubject = filters.subject === 'All' || entry.subject === filters.subject;
      const matchesFaculty = filters.faculty === 'All' || entry.faculty === filters.faculty;
      const matchesDateFrom = !filters.dateFrom || entry.date >= filters.dateFrom;
      const matchesDateTo = !filters.dateTo || entry.date <= filters.dateTo;
      return matchesQuery && matchesStatus && matchesDepartment && matchesCourse && matchesSemester && matchesSubject && matchesFaculty && matchesDateFrom && matchesDateTo;
    });
  }, [records, filters]);

  const subjectBreakdown = useMemo(() => {
    return records.reduce((accumulator, entry) => {
      const subject = entry.subject || 'Unassigned';
      if (!accumulator[subject]) {
        accumulator[subject] = { present: 0, absent: 0, total: 0 };
      }
      accumulator[subject].total += 1;
      if (entry.status === 'Present') accumulator[subject].present += 1;
      if (entry.status === 'Absent') accumulator[subject].absent += 1;
      return accumulator;
    }, {});
  }, [records]);

  const reportRows = useMemo(() => {
    const items = filteredRecords.length ? filteredRecords : records;
    switch (reportMode) {
      case 'Monthly':
        return items.filter((entry) => entry.date >= new Date().toISOString().slice(0, 7));
      case 'Subject-wise':
        return items.filter((entry) => entry.subject);
      case 'Student Summary':
        return items.filter((entry) => entry.studentName || entry.studentId);
      case 'Faculty Summary':
        return items.filter((entry) => entry.faculty || entry.teacherName);
      case 'Low Attendance Report':
        return items.filter((entry) => entry.status === 'Absent' || entry.status === 'Leave' || entry.status === 'Medical Leave');
      default:
        return items.filter((entry) => entry.date === sessionValues.date);
    }
  }, [filteredRecords, records, reportMode, sessionValues.date]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setSessionValues((current) => ({ ...current, [name]: value }));
  };

  const updateDraftStatus = (id, status) => {
    setDraftEntries((current) => current.map((entry) => (entry.id === id ? { ...entry, status } : entry)));
  };

  const handleMarkAllPresent = () => {
    setDraftEntries((current) => current.map((entry) => ({ ...entry, status: 'Present' })));
  };

  const handleQuickToggle = () => {
    setDraftEntries((current) => current.map((entry) => ({ ...entry, status: entry.status === 'Present' ? 'Absent' : 'Present' })));
  };

  const handleBulkAttendance = () => {
    setDraftEntries((current) => current.map((entry) => ({ ...entry, status: 'Present' })));
    setStatusMessage('Bulk attendance prepared for review');
  };

  const handleSubmitAttendance = async () => {
    setIsSubmitting(true);
    try {
      const payloads = draftEntries.map((entry) => ({ ...sessionValues, ...entry, status: entry.status || 'Present', date: entry.date || sessionValues.date }));
      await bulkCreateAttendance(scope, payloads);
      setDraftEntries([]);
      window.localStorage.removeItem(draftKey);
      await loadAttendanceData();
      setStatusMessage('Attendance submitted and audit logged');
    } catch {
      setStatusMessage('Unable to submit attendance right now');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    await deleteAttendance(scope, id);
    await loadAttendanceData();
  };

  const handleCreateLeave = async (event) => {
    event.preventDefault();
    const leavePayload = {
      studentId: sessionValues.studentId || '',
      studentName: sessionValues.studentName || '',
      department: sessionValues.department || '',
      subject: sessionValues.subject || '',
      status: 'Pending',
      reason: 'Requested via attendance workspace',
      dateFrom: sessionValues.date,
      dateTo: sessionValues.date,
    };
    await createLeave(leavePayload);
    await loadAttendanceData();
  };

  const handleExport = async (type) => {
    const report = await getAttendanceReport(scope, { ...filters, status: filters.status === 'All' ? '' : filters.status });
    const blob = type === 'excel' ? buildAttendanceCsv(report.exportRows) : buildAttendanceCsv(report.exportRows);
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${scope}-attendance.${type === 'excel' ? 'xlsx' : 'csv'}`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  const summaryCards = [
    { title: 'Today attendance', value: `${summary.todaysEntries} entries` },
    { title: 'Absent students', value: summary.absentCount },
    { title: 'Late students', value: summary.lateCount },
    { title: 'Attendance %', value: `${summary.attendancePercentage}%` },
    { title: 'Low attendance alerts', value: summary.lowAttendanceAlerts },
    { title: 'Faculty attendance', value: summary.facultyAttendance },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader title={title} subtitle={subtitle} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <InfoCard key={card.title} title={card.title} value={card.value} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Attendance session</h2>
                <p className="text-sm text-slate-400">Configure the academic session and capture daily attendance in one screen.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={handleMarkAllPresent} className="rounded-3xl bg-slate-800/80 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700">Mark all present</button>
                <button type="button" onClick={handleQuickToggle} className="rounded-3xl bg-slate-800/80 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700">Quick toggle</button>
                <button type="button" onClick={handleBulkAttendance} className="rounded-3xl bg-slate-800/80 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700">Bulk attendance</button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <FormField label="Academic year">
                <input name="academicYear" value={sessionValues.academicYear || ''} onChange={handleFieldChange} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
              </FormField>
              <FormField label="Campus">
                <input name="campus" value={sessionValues.campus || ''} onChange={handleFieldChange} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
              </FormField>
              <FormField label="Department">
                <input name="department" value={sessionValues.department || ''} onChange={handleFieldChange} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
              </FormField>
              {scope === 'student' && (
                <>
                  <FormField label="Course">
                    <input name="course" value={sessionValues.course || ''} onChange={handleFieldChange} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
                  </FormField>
                  <FormField label="Semester">
                    <input name="semester" value={sessionValues.semester || ''} onChange={handleFieldChange} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
                  </FormField>
                  <FormField label="Section">
                    <input name="section" value={sessionValues.section || ''} onChange={handleFieldChange} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
                  </FormField>
                </>
              )}
              <FormField label={scope === 'student' ? 'Subject' : scope === 'teacher' ? 'Subject' : scope === 'employee' ? 'Shift' : 'Post'}>
                <input name={scope === 'student' ? 'subject' : scope === 'teacher' ? 'subject' : scope === 'employee' ? 'shift' : 'post'} value={scope === 'student' ? sessionValues.subject || '' : scope === 'teacher' ? sessionValues.subject || '' : scope === 'employee' ? sessionValues.shift || '' : sessionValues.post || ''} onChange={handleFieldChange} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
              </FormField>
              <FormField label={scope === 'student' ? 'Faculty' : scope === 'teacher' ? 'Faculty' : scope === 'employee' ? 'Employee' : 'Guard'}>
                <input name={scope === 'student' ? 'faculty' : scope === 'teacher' ? 'faculty' : scope === 'employee' ? 'employeeName' : 'guardName'} value={scope === 'student' ? sessionValues.faculty || '' : scope === 'teacher' ? sessionValues.faculty || '' : scope === 'employee' ? sessionValues.employeeName || '' : sessionValues.guardName || ''} onChange={handleFieldChange} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
              </FormField>
              <FormField label="Date">
                <input type="date" name="date" value={sessionValues.date || ''} onChange={handleFieldChange} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
              </FormField>
              <FormField label="Time slot">
                <input name="timeSlot" value={sessionValues.timeSlot || ''} onChange={handleFieldChange} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
              </FormField>
            </div>

            <div className="mt-5 overflow-x-auto rounded-[20px] border border-slate-700/60 bg-slate-950/90">
              <table className="min-w-full text-sm text-slate-300">
                <thead className="bg-slate-800/70 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 text-left">{entityLabel}</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {draftEntries.length ? draftEntries.map((entry) => (
                    <tr key={entry.id} className="border-t border-slate-800/70">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{entry.name}</div>
                        <div className="text-xs text-slate-500">{entry.subject || sessionValues.subject || '—'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2" tabIndex={0} onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            updateDraftStatus(entry.id, entry.status === 'Present' ? 'Absent' : 'Present');
                          }
                        }}>
                          {ATTENDANCE_STATUSES.map((status) => (
                            <button key={`${entry.id}-${status}`} type="button" onClick={() => updateDraftStatus(entry.id, status)} className={`rounded-full px-2.5 py-1.5 text-xs font-semibold ${entry.status === status ? getStatusClass(status) : 'bg-slate-700/70 text-slate-200'}`}>
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input value={entry.remarks || ''} onChange={(event) => setDraftEntries((current) => current.map((item) => (item.id === entry.id ? { ...item, remarks: event.target.value } : item)))} className="w-full rounded-2xl border border-slate-700/70 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none" placeholder="Notes" />
                      </td>
                    </tr>
                  )) : <tr><td colSpan="3" className="px-4 py-6 text-center text-slate-500">No draft entries yet. Use bulk attendance to prefill the register.</td></tr>}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-slate-800/80 bg-slate-950/80 p-3 text-sm text-slate-300">
              <span>{statusMessage}</span>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={handleSubmitAttendance} disabled={isSubmitting || !draftEntries.length} className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60">
                  <FaSave /> {isSubmitting ? 'Submitting...' : 'Submit attendance'}
                </button>
                <button type="button" onClick={() => loadAttendanceData()} className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-2 text-slate-200 hover:bg-slate-700">
                  <FaSyncAlt /> Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Attendance history</h2>
                <p className="text-sm text-slate-400">Review monthly trends, leave requests, and subject-wise attendance percentage.</p>
              </div>
              <div className="rounded-3xl border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-300">Attendance trend {summary.attendancePercentage}%</div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-[20px] border border-slate-700/60 bg-slate-950/90 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Present percentage</p>
                <p className="mt-3 text-2xl font-semibold text-white">{summary.attendancePercentage}%</p>
              </div>
              <div className="rounded-[20px] border border-slate-700/60 bg-slate-950/90 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Leave history</p>
                <p className="mt-3 text-2xl font-semibold text-white">{leaves.length}</p>
              </div>
              <div className="rounded-[20px] border border-slate-700/60 bg-slate-950/90 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Subject breakdown</p>
                <p className="mt-3 text-lg font-semibold text-white">{Object.keys(subjectBreakdown).length} subjects</p>
              </div>
            </div>
            <div className="mt-5 overflow-x-auto rounded-[20px] border border-slate-700/60 bg-slate-950/90">
              <table className="min-w-full text-sm text-slate-300">
                <thead className="bg-slate-800/70 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Subject</th>
                    <th className="px-4 py-3 text-left">Remarks</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length ? history.map((entry) => (
                    <tr key={entry.id} className="border-t border-slate-800/70">
                      <td className="px-4 py-3">{entry.date}</td>
                      <td className="px-4 py-3"><StatusBadge status={entry.status} /></td>
                      <td className="px-4 py-3">{entry.subject || '—'}</td>
                      <td className="px-4 py-3">{entry.remarks || '—'}</td>
                      <td className="px-4 py-3"><button type="button" onClick={() => handleDeleteRecord(entry.id)} className="rounded-full bg-rose-600/80 px-3 py-2 text-xs font-semibold text-white">Delete</button></td>
                    </tr>
                  )) : <tr><td colSpan="5" className="px-4 py-6 text-center text-slate-500">No attendance history yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-700/80 text-slate-200"><FaUserGraduate className="h-5 w-5" /></div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Search & filters</p>
                <h3 className="text-xl font-semibold text-white">Find attendance quickly</h3>
              </div>
            </div>
            <div className="grid gap-3">
              <input value={filters.query} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} placeholder={`${entityPlaceholder} or student ID, status, subject...`} className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
              <SearchFilter search={filters.query} onSearch={(value) => setFilters((current) => ({ ...current, query: value }))} filter={filters.status} onFilter={(value) => setFilters((current) => ({ ...current, status: value }))} options={statusOptions} />
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Course">
                  <input value={filters.course} onChange={(event) => setFilters((current) => ({ ...current, course: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
                </FormField>
                <FormField label="Department">
                  <input value={filters.department} onChange={(event) => setFilters((current) => ({ ...current, department: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
                </FormField>
                <FormField label="Semester">
                  <input value={filters.semester} onChange={(event) => setFilters((current) => ({ ...current, semester: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
                </FormField>
                <FormField label="Faculty">
                  <input value={filters.faculty} onChange={(event) => setFilters((current) => ({ ...current, faculty: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
                </FormField>
                <FormField label="Subject">
                  <input value={filters.subject} onChange={(event) => setFilters((current) => ({ ...current, subject: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
                </FormField>
                <FormField label="Status">
                  <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400">
                    {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </FormField>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Date from">
                  <input type="date" value={filters.dateFrom} onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
                </FormField>
                <FormField label="Date to">
                  <input type="date" value={filters.dateTo} onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
                </FormField>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-white">Reports</h3>
                <p className="text-sm text-slate-400">Export, print and review attendance summaries for operations teams.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setReportMode('Daily')} className="rounded-3xl bg-slate-800/80 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700">Daily</button>
                <button type="button" onClick={() => setReportMode('Monthly')} className="rounded-3xl bg-slate-800/80 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700">Monthly</button>
                <button type="button" onClick={() => setReportMode('Low Attendance Report')} className="rounded-3xl bg-slate-800/80 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700">Low attendance</button>
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              {reportModes.map((mode) => (
                <button key={mode} type="button" onClick={() => setReportMode(mode)} className={`rounded-[18px] border px-4 py-3 text-left text-sm ${reportMode === mode ? 'border-sky-400 bg-sky-500/10 text-sky-300' : 'border-slate-700/70 bg-slate-950/70 text-slate-300'}`}>
                  {mode}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => handleExport('csv')} className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"><FaDownload /> CSV</button>
              <button type="button" onClick={() => handleExport('excel')} className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"><FaDownload /> Excel</button>
              <button type="button" onClick={handlePrint} className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"><FaPrint /> Print</button>
            </div>
            <div className="mt-4 rounded-[18px] border border-slate-700/70 bg-slate-950/70 p-4 text-sm text-slate-300">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Current report</p>
              <p className="mt-2 font-semibold text-white">{reportMode}</p>
              <p className="mt-2">{reportRows.length} matching records • {formatCurrency(summary.attendancePercentage)} attendance rate</p>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-white">Leave requests</h3>
                <p className="text-sm text-slate-400">Capture late, absent and medical leave details for review.</p>
              </div>
            </div>
            <form onSubmit={handleCreateLeave} className="space-y-3">
              <input value={sessionValues.studentName || ''} onChange={handleFieldChange} name="studentName" placeholder="Student / staff name" className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
              <textarea name="remarks" value={sessionValues.remarks || ''} onChange={handleFieldChange} rows="3" placeholder="Leave reason" className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
              <button type="submit" className="rounded-3xl bg-slate-800/80 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700">Create leave request</button>
            </form>
            {isLoading ? (
              <div className="mt-4 rounded-[16px] border border-slate-700/70 bg-slate-950/70 p-3 text-sm text-slate-300">
                Loading attendance data...
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {leaves.slice(0, 4).map((leave) => (
                  <div key={leave.id} className="rounded-[16px] border border-slate-700/70 bg-slate-950/70 p-3 text-sm text-slate-300">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-white">{leave.studentName || leave.employeeName || leave.guardName || 'Leave request'}</span>
                      <StatusBadge status={leave.status || 'Pending'} />
                    </div>
                    <p className="mt-1">{leave.reason || 'Reason pending'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
