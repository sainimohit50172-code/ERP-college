import { useState } from 'react';

export default function FeedbackSummaryReportPage() {
  const [session, setSession] = useState('2026-27 Odd');
  const [feedbackForm, setFeedbackForm] = useState('Semester Feedback');
  const [college, setCollege] = useState('College A');
  const [course, setCourse] = useState('B.Sc. Mathematics');
  const [semester, setSemester] = useState('Semester 1');
  const [section, setSection] = useState('A');
  const [faculty, setFaculty] = useState('John Doe');
  const [reportView, setReportView] = useState('Faculty-wise');
  const [showResults, setShowResults] = useState(false);

  const handleGo = () => {
    setShowResults(true);
  };

  const handleExport = () => {
    alert('Report exported');
  };

  const tableData = [
    { faculty: 'John Doe', course: 'B.Sc. Mathematics', section: 'A', responses: 120, rating: '4.6', score: '92%' },
    { faculty: 'Jane Smith', course: 'B.Sc. Physics', section: 'B', responses: 98, rating: '4.3', score: '88%' },
    { faculty: 'Samuel Roy', course: 'B.Com', section: 'C', responses: 84, rating: '4.1', score: '84%' },
    { faculty: 'Anita Verma', course: 'B.A. English', section: 'A', responses: 110, rating: '4.8', score: '95%' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <div className="w-full max-w-none py-8 box-border">
        <div className="space-y-4">
          <div className="text-sm uppercase tracking-[0.28em] text-slate-500">
            Dashboard &gt; Institute Setup &gt; Feedback From Student
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Feedback Summary Report (New)
          </h1>
        </div>

        <div className="mt-8 w-full max-w-none rounded-[1rem] border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-[0.3em] text-slate-500">Select Session</label>
              <select
                value={session}
                onChange={(event) => setSession(event.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-slate-900 outline-none"
              >
                <option>2026-27 Odd</option>
                <option>2026-27 Even</option>
                <option>2025-26 Odd</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-[0.3em] text-slate-500">Select Feedback Form</label>
              <select
                value={feedbackForm}
                onChange={(event) => setFeedbackForm(event.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-slate-900 outline-none"
              >
                <option>Semester Feedback</option>
                <option>Course Feedback</option>
                <option>Session Feedback</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-[0.3em] text-slate-500">Select College</label>
              <select
                value={college}
                onChange={(event) => setCollege(event.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-slate-900 outline-none"
              >
                <option>College A</option>
                <option>College B</option>
                <option>College C</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-[0.3em] text-slate-500">Select Course</label>
              <select
                value={course}
                onChange={(event) => setCourse(event.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-slate-900 outline-none"
              >
                <option>B.Sc. Mathematics</option>
                <option>B.Sc. Physics</option>
                <option>B.Com</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-[0.3em] text-slate-500">Select Semester</label>
              <select
                value={semester}
                onChange={(event) => setSemester(event.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-slate-900 outline-none"
              >
                <option>Semester 1</option>
                <option>Semester 2</option>
                <option>Semester 3</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-[0.3em] text-slate-500">Select Section</label>
              <select
                value={section}
                onChange={(event) => setSection(event.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-slate-900 outline-none"
              >
                <option>A</option>
                <option>B</option>
                <option>C</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-[0.3em] text-slate-500">Select Faculty</label>
              <select
                value={faculty}
                onChange={(event) => setFaculty(event.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-slate-900 outline-none"
              >
                <option>John Doe</option>
                <option>Jane Smith</option>
                <option>Samuel Roy</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-[0.3em] text-slate-500">Select Report View</label>
              <select
                value={reportView}
                onChange={(event) => setReportView(event.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-slate-900 outline-none"
              >
                <option>Faculty-wise</option>
                <option>Course-wise</option>
                <option>Section-wise</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center justify-center rounded-lg border border-[#1E293B] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] transition hover:bg-slate-50"
            >
              Export as Excel
            </button>
            <button
              type="button"
              onClick={handleGo}
              className="inline-flex items-center justify-center rounded-lg bg-[#1E293B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              Go
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-[1rem] border border-[#E2E8F0] bg-white p-10 shadow-sm w-full">
          {showResults ? (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto divide-y divide-slate-200 text-sm">
                <thead className="bg-[#F8FAFC] text-slate-500">
                  <tr>
                    <th className="px-4 py-4 text-left uppercase tracking-[0.24em]">Faculty Name</th>
                    <th className="px-4 py-4 text-left uppercase tracking-[0.24em]">Course</th>
                    <th className="px-4 py-4 text-left uppercase tracking-[0.24em]">Section</th>
                    <th className="px-4 py-4 text-left uppercase tracking-[0.24em]">Total Responses</th>
                    <th className="px-4 py-4 text-left uppercase tracking-[0.24em]">Average Rating</th>
                    <th className="px-4 py-4 text-left uppercase tracking-[0.24em]">Feedback Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {tableData.map((row) => (
                    <tr key={`${row.faculty}-${row.section}`}>
                      <td className="px-4 py-4 font-medium text-slate-900">{row.faculty}</td>
                      <td className="px-4 py-4 text-slate-700">{row.course}</td>
                      <td className="px-4 py-4 text-slate-700">{row.section}</td>
                      <td className="px-4 py-4 text-slate-700">{row.responses}</td>
                      <td className="px-4 py-4 text-slate-700">{row.rating}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {row.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 text-center text-slate-500">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16v16H4z" />
                  <path d="M8 8h8M8 12h8M8 16h5" />
                </svg>
              </div>
              <div className="text-lg font-semibold text-slate-700">No Records found!</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
