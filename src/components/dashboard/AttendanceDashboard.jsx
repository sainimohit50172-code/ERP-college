import { useMemo, useState } from 'react';
import {
  RefreshCw,
  X,
  CalendarCheck,
  BookOpen,
  User,
  MapPin,
  Clock3,
  Users,
  CheckCircle2,
} from 'lucide-react';

const columns = [
  { time: '09:10-10:05', label: 'Lect 1' },
  { time: '10:05-11:00', label: 'Lect 2' },
  { time: '11:00-11:10', label: 'Break 1' },
  { time: '11:10-12:05', label: 'Lect 3' },
  { time: '12:05-13:00', label: 'Lect 4' },
  { time: '13:00-14:00', label: 'Break 2' },
  { time: '14:00-14:55', label: 'Lect 5' },
  { time: '14:55-15:50', label: 'Lect 6' },
  { time: '15:50-16:45', label: 'Lect 7' },
];

const statusMeta = {
  pending: {
    title: 'Attendance Pending',
    gradient: 'from-[#FFE5E5] to-[#FFD2D2]',
    border: 'border-[#FF8B8B]',
    text: 'text-slate-900',
  },
  completed: {
    title: 'Attendance Completed',
    gradient: 'from-[#E8FFF3] to-[#D5FBE8]',
    border: 'border-[#59C97D]',
    text: 'text-slate-900',
  },
  missed: {
    title: 'Attendance Missed',
    gradient: 'from-[#FFF3DA] to-[#FFE6B5]',
    border: 'border-[#F5A623]',
    text: 'text-slate-900',
  },
  cancelled: {
    title: 'Cancelled Lecture',
    gradient: 'from-[#F3EDFF] to-[#E4D8FF]',
    border: 'border-[#9D7CFF]',
    text: 'text-slate-900',
  },
  holiday: {
    title: 'Holiday',
    gradient: 'from-[#EAF7FF] to-[#D7F0FF]',
    border: 'border-[#56A8FF]',
    text: 'text-slate-900',
  },
  break: {
    title: 'Break',
    gradient: 'from-[#A9AEB8] to-[#8F96A3]',
    border: 'border-[#6B7280]',
    text: 'text-white',
  },
};

const initialRows = [
  {
    id: 'cse-3a',
    college: 'Roorkee College of Smart Computing',
    course: 'B.Tech Hons CSE',
    semester: 'Sem 3',
    section: 'A',
    lectures: [
      { status: 'pending', faculty: 'Ravindra Arya', code: 'HU111', count: '0 / 67', subject: 'Discrete Mathematics', room: 'A-101', duration: '55 mins' },
      { status: 'pending', faculty: 'Narayan Jee', code: 'HU143', count: '0 / 67', subject: 'Operating System', room: 'A-102', duration: '55 mins' },
      { status: 'break' },
      { status: 'pending', faculty: 'Upendra Kumar', code: 'HU148', count: '0 / 67', subject: 'Introduction to Artificial Intelligence', room: 'A-103', duration: '55 mins' },
      { status: 'pending', faculty: 'Upendra Kumar', code: 'HU148', count: '0 / 67', subject: 'Python Programming', room: 'A-104', duration: '55 mins' },
      { status: 'break' },
      { status: 'pending', faculty: 'Bhavesh Kumar', code: 'HU134', count: '0 / 67', subject: 'Object Oriented Programming', room: 'A-105', duration: '55 mins' },
      { status: 'pending', faculty: 'Amit Panday', code: 'HU149', count: '0 / 67', subject: 'Soft Skills and Verbal Communication II', room: 'A-106', duration: '55 mins' },
      { status: 'pending', faculty: 'Vinay Kumar Pant', code: 'HU156', count: '0 / 67', subject: 'Python Programming', room: 'A-107', duration: '55 mins' },
    ],
  },
  {
    id: 'cse-3b',
    college: 'Roorkee College of Smart Computing',
    course: 'B.Tech Hons CSE',
    semester: 'Sem 3',
    section: 'B',
    lectures: [
      { status: 'pending', faculty: 'Vimal Panday', code: 'HU149', count: '0 / 68', subject: 'Soft Skills and Verbal Communication-II', room: 'B-101', duration: '55 mins' },
      { status: 'pending', faculty: 'Sulochna', code: 'HU113', count: '0 / 68', subject: 'Discrete Mathematics', room: 'B-102', duration: '55 mins' },
      { status: 'break' },
      { status: 'pending', faculty: 'Narayan Jee', code: 'HU143', count: '0 / 68', subject: 'Operating System Practical', room: 'B-103', duration: '55 mins' },
      { status: 'completed', faculty: 'Narayan Jee', code: 'HU143', count: '68 / 68', subject: 'Operating System', room: 'B-104', duration: '55 mins' },
      { status: 'break' },
      { status: 'pending', faculty: 'Upendra Kumar', code: 'HU148', count: '0 / 68', subject: 'Introduction to Artificial Intelligence', room: 'B-105', duration: '55 mins' },
      { status: 'completed', faculty: 'Bhavesh Kumar', code: 'HU134', count: '68 / 68', subject: 'Object Oriented Programming using Java', room: 'B-106', duration: '55 mins' },
      { status: 'pending', faculty: 'Narayan Jee', code: 'HU143', count: '0 / 68', subject: 'Operating System', room: 'B-107', duration: '55 mins' },
    ],
  },
  {
    id: 'cse-3c',
    college: 'Roorkee College of Smart Computing',
    course: 'B.Tech Hons CSE',
    semester: 'Sem 3',
    section: 'C',
    lectures: [
      { status: 'pending', faculty: 'Rajiv Rajan Patel', code: 'HU145', count: '0 / 0', subject: 'Python Programming', room: 'C-101', duration: '55 mins' },
      { status: 'pending', faculty: 'Vimal Panday', code: 'HU149', count: '0 / 0', subject: 'Object Oriented Programming using Java Practical', room: 'C-102', duration: '55 mins' },
      { status: 'break' },
      { status: 'pending', faculty: 'Sulochna', code: 'HU113', count: '0 / 0', subject: 'Operating Systems', room: 'C-103', duration: '55 mins' },
      { status: 'pending', faculty: 'Vinay Kumar Pant', code: 'HU156', count: '0 / 0', subject: 'Database Management System', room: 'C-104', duration: '55 mins' },
      { status: 'break' },
      { status: 'pending', faculty: 'Asif Ansari', code: 'HU131', count: '0 / 0', subject: 'Computer Graphics And Multimedia', room: 'C-105', duration: '55 mins' },
      { status: 'pending', faculty: 'Mrinalinee Singh', code: 'HU141', count: '0 / 0', subject: 'Quantitative Aptitude and Logical Reasoning-II', room: 'C-106', duration: '55 mins' },
      { status: 'pending', faculty: 'Mrinalinee Singh', code: 'HU141', count: '0 / 0', subject: 'Summer Internship-II', room: 'C-107', duration: '55 mins' },
    ],
  },
  {
    id: 'bca-3a',
    college: 'Roorkee College of Smart Computing',
    course: 'BCA',
    semester: 'Sem 3',
    section: 'A',
    lectures: [
      { status: 'pending', faculty: 'Vinay Kumar Pant', code: 'HU156', count: '0 / 34', subject: 'Object Oriented Programming using JAVA', room: 'D-101', duration: '55 mins' },
      { status: 'pending', faculty: 'Akanksha Shukla', code: 'HU151', count: '0 / 34', subject: 'Operating Systems', room: 'D-102', duration: '55 mins' },
      { status: 'break' },
      { status: 'completed', faculty: 'Rohit Kumar', code: 'HU154', count: '34 / 34', subject: 'Fundamentals of AI and ML', room: 'D-103', duration: '55 mins' },
      { status: 'completed', faculty: 'Abhishek Parmar', code: 'HU150', count: '34 / 34', subject: 'Computer Networks', room: 'D-104', duration: '55 mins' },
      { status: 'break' },
      { status: 'holiday', faculty: 'Pooja Malhotra', code: 'HU153', count: '0 / 34', subject: 'Database Management System', room: 'D-105', duration: '55 mins' },
      { status: 'holiday', faculty: 'Pooja Malhotra', code: 'HU153', count: '0 / 34', subject: 'Database Management System', room: 'D-106', duration: '55 mins' },
      { status: 'holiday', faculty: 'Pooja Malhotra', code: 'HU153', count: '0 / 34', subject: 'Database Management System', room: 'D-107', duration: '55 mins' },
    ],
  },
  {
    id: 'bca-5a',
    college: 'Roorkee College of Smart Computing',
    course: 'BCA',
    semester: 'Sem 5',
    section: 'A',
    lectures: [
      { status: 'missed', faculty: 'Gorav Kumar', code: 'HU152', count: '0 / 11', subject: 'Data Visualization using PowerBI and Tableau', room: 'E-101', duration: '55 mins' },
      { status: 'missed', faculty: 'Abhishek Parmar', code: 'HU150', count: '0 / 11', subject: 'Business Intelligence', room: 'E-102', duration: '55 mins' },
      { status: 'break' },
      { status: 'missed', faculty: 'Vinay Kumar Pant', code: 'HU156', count: '0 / 11', subject: 'Web Technologies', room: 'E-103', duration: '55 mins' },
      { status: 'missed', faculty: 'Akanksha Shukla', code: 'HU151', count: '0 / 11', subject: 'Software Engineering and Project Management', room: 'E-104', duration: '55 mins' },
      { status: 'break' },
      { status: 'holiday', faculty: 'Akanksha Shukla', code: 'HU151', count: '0 / 11', subject: 'Software Engineering and Project Management', room: 'E-105', duration: '55 mins' },
      { status: 'holiday', faculty: 'Akanksha Shukla', code: 'HU151', count: '0 / 11', subject: 'Software Engineering and Project Management', room: 'E-106', duration: '55 mins' },
      { status: 'holiday', faculty: 'Akanksha Shukla', code: 'HU151', count: '0 / 11', subject: 'Software Engineering and Project Management', room: 'E-107', duration: '55 mins' },
    ],
  },
  {
    id: 'bca-ai-ml-3b',
    college: 'Roorkee College of Smart Computing',
    course: 'BCA AI-ML',
    semester: 'Sem 3',
    section: 'B',
    lectures: [
      { status: 'completed', faculty: 'Vinay Kumar Pant', code: 'HU156', count: '68 / 68', subject: 'Object Oriented Programming using JAVA Practical', room: 'F-101', duration: '55 mins' },
      { status: 'completed', faculty: 'Vinay Kumar Pant', code: 'HU156', count: '68 / 68', subject: 'Object Oriented Programming using JAVA Practical', room: 'F-102', duration: '55 mins' },
      { status: 'break' },
      { status: 'pending', faculty: 'Pooja Malhotra', code: 'HU153', count: '0 / 68', subject: 'Database Management System', room: 'F-103', duration: '55 mins' },
      { status: 'pending', faculty: 'Vinay Kumar Pant', code: 'HU156', count: '0 / 68', subject: 'Object Oriented Programming using JAVA', room: 'F-104', duration: '55 mins' },
      { status: 'break' },
      { status: 'missed', faculty: 'Abhishek Parmar', code: 'HU150', count: '0 / 68', subject: 'Computer Networks', room: 'F-105', duration: '55 mins' },
      { status: 'missed', faculty: 'Tushant Kumar', code: 'HU175', count: '0 / 68', subject: 'Quantitative Aptitude and Logical Reasoning-II', room: 'F-106', duration: '55 mins' },
      { status: 'missed', faculty: 'Abhishek Parmar', code: 'HU150', count: '0 / 68', subject: 'Summer Internship-II', room: 'F-107', duration: '55 mins' },
    ],
  },
  {
    id: 'mca-3a',
    college: 'Roorkee College of Smart Computing',
    course: 'MCA',
    semester: 'Sem 3',
    section: 'A',
    lectures: [
      { status: 'pending', faculty: 'Abhishek Parmar', code: 'HU150', count: '0 / 12', subject: 'Big Data Analytics', room: 'G-101', duration: '55 mins' },
      { status: 'pending', faculty: 'Pooja Malhotra', code: 'HU153', count: '0 / 12', subject: 'Java Programming', room: 'G-102', duration: '55 mins' },
      { status: 'break' },
      { status: 'pending', faculty: 'Gorav Kumar', code: 'HU152', count: '0 / 12', subject: 'Computer Graphics And Multimedia', room: 'G-103', duration: '55 mins' },
      { status: 'pending', faculty: 'Pooja Malhotra', code: 'HU153', count: '0 / 12', subject: 'Cloud Computing', room: 'G-104', duration: '55 mins' },
      { status: 'break' },
      { status: 'pending', faculty: 'Akanksha Shukla', code: 'HU151', count: '0 / 12', subject: 'Compiler Design', room: 'G-105', duration: '55 mins' },
      { status: 'pending', faculty: 'Akanksha Shukla', code: 'HU151', count: '0 / 12', subject: 'Compiler Design', room: 'G-106', duration: '55 mins' },
      { status: 'pending', faculty: 'Akanksha Shukla', code: 'HU151', count: '0 / 12', subject: 'Compiler Design', room: 'G-107', duration: '55 mins' },
    ],
  },
];

const leaveApplications = [
  {
    student: 'Amit Sharma',
    reason: 'Medical leave',
    date: '12 Jul 2026',
    status: 'Pending',
  },
  {
    student: 'Neha Verma',
    reason: 'Family emergency',
    date: '13 Jul 2026',
    status: 'Approved',
  },
  {
    student: 'Sahil Gupta',
    reason: 'Interview attendance',
    date: '14 Jul 2026',
    status: 'Rejected',
  },
];

export default function AttendanceDashboard() {
  const [rows, setRows] = useState(initialRows);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const activeLecture = useMemo(() => selectedLecture, [selectedLecture]);

  const handleCellClick = (rowId, lectureIndex) => {
    const row = rows.find((r) => r.id === rowId);
    if (!row) return;
    const lecture = row.lectures[lectureIndex];
    if (!lecture || lecture.status === 'break') return;
    setSelectedLecture({ ...lecture, rowId, lectureIndex, grade: `${row.course} ${row.semester} ${row.section}` });
  };

  const handleRefresh = () => {
    setLastRefresh(new Date());
  };

  const handleCloseModal = () => setSelectedLecture(null);

  const handleMarkAttendance = () => {
    if (!selectedLecture) return;
    setRows((current) =>
      current.map((row) => {
        if (row.id !== selectedLecture.rowId) return row;
        return {
          ...row,
          lectures: row.lectures.map((lecture, index) => {
            if (index !== selectedLecture.lectureIndex) return lecture;
            return {
              ...lecture,
              status: 'completed',
              count: lecture.count.includes('/') ? `${lecture.count.split('/')[1].trim()} / ${lecture.count.split('/')[1].trim()}` : lecture.count,
            };
          }),
        };
      })
    );
    setSelectedLecture((current) => current && { ...current, status: 'completed' });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_45%,#f0fdf4_100%)] p-0">
      <div className="m-2.5 rounded-[22px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_22px_70px_-24px_rgba(2,8,23,0.35)] backdrop-blur sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Attendance</h1>
          </div>
          <div className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            <CalendarCheck className="mr-2 h-4 w-4 text-emerald-600" />
            Attendance Session 2026-27 Odd
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          <div className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-1 shadow-[0_26px_80px_-28px_rgba(15,23,42,0.35)]">
            <div className="rounded-[20px] bg-white p-5 sm:p-6">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-semibold uppercase tracking-[0.24em] text-slate-500">Lecture Wise Attendance</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Attendance overview</h2>
                </div>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
              <div className="rounded-[18px] border border-slate-200 bg-white shadow-sm">
                <table className="w-full table-fixed border-collapse text-left">
                  <colgroup>
                    <col className="w-[205px]" />
                    <col className="w-[100px]" />
                    <col className="w-[100px]" />
                    <col className="w-[70px]" />
                    <col className="w-[100px]" />
                    <col className="w-[100px]" />
                    <col className="w-[70px]" />
                    <col className="w-[100px]" />
                    <col className="w-[100px]" />
                    <col className="w-[100px]" />
                  </colgroup>
                  <thead className="bg-slate-950 text-white">
                    <tr className="h-[60px]">
                      <th className="sticky left-0 z-20 border-b border-slate-700 bg-slate-950/95 px-2 text-[13px] font-semibold uppercase tracking-[0.12em]">Time/Lecture</th>
                      {columns.map((column) => (
                        <th key={column.label} className="border-b border-slate-700 px-1 text-[13px] uppercase tracking-[0.12em] text-slate-200">
                          <div className="break-words text-[13px] font-semibold">{column.time}</div>
                          <div className="mt-1 text-[11px] font-medium text-slate-300">{column.label}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="group transition duration-300 hover:bg-sky-50">
                        <th className="sticky left-0 z-10 break-words whitespace-normal border-b border-slate-200 bg-white/95 px-2 py-3 align-middle text-left text-[14px] text-slate-900 sm:px-3">
                          <div className="font-semibold leading-snug text-slate-900 break-words whitespace-normal">{row.college}</div>
                          <div className="mt-1 text-[12px] leading-snug text-slate-600 break-words whitespace-normal">{row.course}</div>
                          <div className="mt-1 text-[12px] leading-snug text-slate-500 break-words whitespace-normal">{row.semester} - {row.section}</div>
                        </th>
                        {row.lectures.map((lecture, lectureIndex) => {
                          const status = lecture.status;
                          const meta = statusMeta[status] || statusMeta.pending;
                          const isBreak = status === 'break';
                          return (
                            <td key={`${row.id}-${lectureIndex}`} className="border-b border-slate-200 px-1 py-2 align-top">
                              {isBreak ? (
                                <div className="mx-auto flex h-[110px] w-[70px] items-center justify-center rounded-[14px] bg-gradient-to-br from-[#A9AEB8] to-[#8F96A3] px-2 text-center text-[12px] font-semibold text-white shadow-sm">
                                  Break
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleCellClick(row.id, lectureIndex)}
                                  className={`group relative mx-auto flex min-h-[150px] w-full max-w-[110px] flex-col justify-between rounded-[12px] border px-2 py-2 text-left shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg ${meta.border} bg-gradient-to-br ${meta.gradient} ${meta.text}`}
                                >
                                  <div>
                                    <div className="text-[9px] font-semibold uppercase tracking-[0.14em] leading-tight text-slate-700 break-words whitespace-normal">{meta.title}</div>
                                    <div className="mt-1 text-[16px] font-semibold text-slate-900">{lecture.count}</div>
                                  </div>
                                  <div className="mt-1 space-y-1 break-words whitespace-normal text-[11px] leading-tight text-slate-900">
                                    <div className="font-semibold leading-tight break-words whitespace-normal">{lecture.faculty}</div>
                                    <div className="uppercase tracking-[0.18em] text-[10px] text-slate-600 break-words whitespace-normal">{lecture.code}</div>
                                    <div className="mt-1 font-semibold leading-tight break-words whitespace-normal text-[11px] text-slate-900">{lecture.subject}</div>
                                  </div>
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-slate-600">Last refreshed: {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-slate-500">The timetable fits the dashboard width with compact spacing and consistent alignment.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.28)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Applied Leaves</h2>
                <p className="mt-1 text-sm text-slate-500">Recent student leave applications for review</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {leaveApplications.map((leave) => (
                <div key={leave.student} className="rounded-[18px] border border-slate-200 bg-slate-50 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{leave.student}</p>
                      <p className="mt-1 text-sm text-slate-500">{leave.reason}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : leave.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                      {leave.status}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                    <span>{leave.date}</span>
                    <div className="flex gap-2">
                      <button type="button" className="rounded-2xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">View</button>
                      <button type="button" className="rounded-2xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">Approve</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {activeLecture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Lecture details</h3>
                <p className="mt-1 text-sm text-slate-600">Check attendance status and student summary.</p>
              </div>
              <button type="button" onClick={handleCloseModal} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-6 px-6 py-6 sm:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
                  <div className="flex items-center gap-3 text-slate-700">
                    <BookOpen className="h-5 w-5" />
                    <span className="font-semibold">Subject</span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{activeLecture.subject}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
                    <div className="text-sm text-slate-500">Faculty</div>
                    <div className="mt-2 text-lg font-semibold text-slate-900">{activeLecture.faculty}</div>
                  </div>
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
                    <div className="text-sm text-slate-500">Faculty Code</div>
                    <div className="mt-2 text-lg font-semibold text-slate-900">{activeLecture.code}</div>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
                    <div className="text-sm text-slate-500">Room</div>
                    <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <MapPin className="h-4 w-4 text-slate-600" />
                      {activeLecture.room}
                    </div>
                  </div>
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
                    <div className="text-sm text-slate-500">Duration</div>
                    <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <Clock3 className="h-4 w-4 text-slate-600" />
                      {activeLecture.duration}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Attendance Status</p>
                      <p className="mt-2 text-xl font-semibold text-slate-900">{statusMeta[activeLecture.status]?.title || 'Attendance Pending'}</p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      {activeLecture.count}
                    </div>
                  </div>
                </div>
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Users className="h-5 w-5" />
                    <span className="font-semibold">Class Summary</span>
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <span>Students Present</span>
                      <span>{activeLecture.count.split('/')[0].trim()}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <span>Students Absent</span>
                      <span>{activeLecture.count.includes('/') ? String(parseInt(activeLecture.count.split('/')[1], 10) - parseInt(activeLecture.count.split('/')[0], 10)) : '0'}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <span>Attendance %</span>
                      <span>{activeLecture.count.includes('/') ? `${Math.round((parseInt(activeLecture.count.split('/')[0], 10) / parseInt(activeLecture.count.split('/')[1], 10)) * 100)}%` : '0%'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleMarkAttendance}
                    className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Mark Attendance
                  </button>
                  <button type="button" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    View Students
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
