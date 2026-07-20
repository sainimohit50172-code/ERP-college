import { useState } from 'react';
import { ArrowRight, Download } from 'lucide-react';

export default function IndividualFacultyReportPage() {
  const [session, setSession] = useState('2026-27 Odd');
  const [college, setCollege] = useState('College A');
  const [employee, setEmployee] = useState('John Doe');
  const [subject, setSubject] = useState('Mathematics');
  const [feedbackForm, setFeedbackForm] = useState('Semester Feedback');
  const [reportType, setReportType] = useState('Summary Report');
  const [showResult, setShowResult] = useState(false);

  const handleGo = () => {
    setShowResult(true);
  };

  const handleExport = () => {
    alert('Report exported');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <div className="mx-auto max-w-[1240px] py-8">
        <div className="space-y-4">
          <div className="text-sm uppercase tracking-[0.28em] text-slate-500">Dashboard &gt; Individual Faculty Report</div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">Individual Faculty Report</h1>
              <span className="inline-flex h-10 w-px bg-slate-300" />
              <span className="text-3xl font-semibold tracking-tight text-slate-600">Individual Faculty Report</span>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[1rem] border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="grid gap-4 xl:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_minmax(220px,1fr)]">
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
              <label className="block text-xs uppercase tracking-[0.3em] text-slate-500">Select Employee</label>
              <select
                value={employee}
                onChange={(event) => setEmployee(event.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-slate-900 outline-none"
              >
                <option>John Doe</option>
                <option>Jane Smith</option>
                <option>Samuel Roy</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-[0.3em] text-slate-500">Select Subject</label>
              <select
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-slate-900 outline-none"
              >
                <option>Mathematics</option>
                <option>Physics</option>
                <option>History</option>
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
              <label className="block text-xs uppercase tracking-[0.3em] text-slate-500">Select Report Type</label>
              <select
                value={reportType}
                onChange={(event) => setReportType(event.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-slate-900 outline-none"
              >
                <option>Summary Report</option>
                <option>Detailed Report</option>
                <option>Comparative Report</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center justify-center rounded-lg border border-[#1E293B] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] transition hover:bg-slate-50 hover-gradient-border"
            >
              <Download className="mr-2 h-4 w-4" />
              Export as PDF
            </button>
            <button
              type="button"
              onClick={handleGo}
              className="inline-flex items-center justify-center rounded-lg bg-[#1E293B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 hover-gradient-border"
            >
              Go
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-[1rem] border border-[#E2E8F0] bg-white p-10 shadow-sm">
          {showResult ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
                  <div className="text-sm uppercase tracking-[0.28em] text-slate-500">Faculty</div>
                  <div className="mt-3 text-xl font-semibold text-slate-950">{employee}</div>
                  <div className="mt-1 text-sm text-slate-600">{college}</div>
                </div>
                <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
                  <div className="text-sm uppercase tracking-[0.28em] text-slate-500">Subject</div>
                  <div className="mt-3 text-xl font-semibold text-slate-950">{subject}</div>
                  <div className="mt-1 text-sm text-slate-600">{reportType}</div>
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-[#E2E8F0]">
                <div className="grid bg-[#F8FAFC] px-6 py-4 text-sm uppercase tracking-[0.24em] text-slate-500 md:grid-cols-4">
                  <div>Total Feedback Responses</div>
                  <div>Average Rating</div>
                  <div>Performance Summary</div>
                  <div>Report Type</div>
                </div>
                <div className="grid gap-4 px-6 py-6 text-slate-700 md:grid-cols-4 md:gap-0">
                  <div className="text-lg font-semibold">128</div>
                  <div className="text-lg font-semibold">4.7 / 5</div>
                  <div className="text-lg font-semibold">Strong performance with positive engagement.</div>
                  <div className="text-lg font-semibold">{reportType}</div>
                </div>
              </div>
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
              <div className="text-lg font-semibold text-slate-700">No Records Found</div>
              <div className="max-w-xl text-sm text-slate-500">
                Use the filters above and click Go to generate an individual faculty report.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
