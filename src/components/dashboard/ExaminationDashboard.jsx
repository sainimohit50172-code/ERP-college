import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw, BarChart3, CircleDashed, Clock3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const rangeGroups = [
  { id: 'range-1', label: '0 - 40%', color: '#ec4899', title: 'Below threshold' },
  { id: 'range-2', label: '41 - 60%', color: '#3b82f6', title: 'Developing' },
  { id: 'range-3', label: '61 - 80%', color: '#10b981', title: 'Growing' },
  { id: 'range-4', label: '81 - 100%', color: '#f59e0b', title: 'Top performance' },
  { id: 'range-5', label: '0 - 40%', color: '#ec4899', title: 'Below threshold' },
  { id: 'range-6', label: '41 - 60%', color: '#3b82f6', title: 'Developing' },
  { id: 'range-7', label: '61 - 70%', color: '#10b981', title: 'Improving' },
  { id: 'range-8', label: '71 - 80%', color: '#f59e0b', title: 'Strong' },
  { id: 'range-9', label: '91 - 100%', color: '#7c3aed', title: 'Excellent' },
];

const subjectData = [
  { subject: 'Mathematics', average: 84, highest: 98, lowest: 65, students: 120 },
  { subject: 'Physics', average: 77, highest: 92, lowest: 58, students: 105 },
  { subject: 'Chemistry', average: 73, highest: 90, lowest: 55, students: 110 },
  { subject: 'English', average: 82, highest: 96, lowest: 70, students: 115 },
  { subject: 'Computer', average: 88, highest: 99, lowest: 72, students: 100 },
  { subject: 'Python', average: 79, highest: 95, lowest: 60, students: 98 },
  { subject: 'AI', average: 76, highest: 91, lowest: 62, students: 86 },
];

const standardComparisonData = [
  { standard: 'Sem 1', Highest: 92, Average: 79, Lowest: 58 },
  { standard: 'Sem 2', Highest: 94, Average: 81, Lowest: 60 },
  { standard: 'Sem 3', Highest: 90, Average: 77, Lowest: 55 },
  { standard: 'Sem 4', Highest: 95, Average: 84, Lowest: 62 },
  { standard: 'Sem 5', Highest: 96, Average: 86, Lowest: 68 },
  { standard: 'Sem 6', Highest: 93, Average: 82, Lowest: 61 },
];

const detailModalContent = {
  range: {
    title: 'Range details',
    fields: ['Number of Students', 'Average Marks', 'Highest Marks', 'Lowest Marks', 'Pass %', 'Fail %'],
  },
  semester: {
    title: 'Semester details',
    fields: ['Semester', 'Students', 'Highest', 'Average', 'Lowest', 'Pass %', 'Topper'],
  },
};

export default function ExaminationDashboard() {
  const [activeRangeId, setActiveRangeId] = useState(rangeGroups[0].id);
  const [showSubjectDemo, setShowSubjectDemo] = useState(true);
  const [selectedRange, setSelectedRange] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [section1Page, setSection1Page] = useState(0);

  const activeRange = useMemo(() => rangeGroups.find((item) => item.id === activeRangeId), [activeRangeId]);

  const handleRangeClick = (item) => {
    setSelectedRange(item);
  };

  const handleSemesterClick = (standard) => {
    setSelectedSemester(standard);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 450);
  };

  const section1Pages = useMemo(() => [rangeGroups.slice(0, 4), rangeGroups.slice(4, 9)], []);
  const displayedRanges = section1Pages[section1Page] || section1Pages[0];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_45%,#f0fdf4_100%)] p-0">
      <div className="m-2.5 overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/90 p-3 shadow-[0_22px_70px_-24px_rgba(2,8,23,0.35)] backdrop-blur sm:p-4 lg:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Examination</h1>
          <div className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover-gradient-border">
            Session 2026-27 Odd
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.28)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Overall Range-Wise Percentage In Standard</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Exam range distribution</h2>
              </div>
              <div className="flex items-center gap-2 hover-gradient-border">
                <button
                  type="button"
                  onClick={() => setSection1Page((prev) => Math.max(prev - 1, 0))}
                  disabled={section1Page === 0}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSection1Page((prev) => Math.min(prev + 1, section1Pages.length - 1))}
                  disabled={section1Page === section1Pages.length - 1}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {displayedRanges.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleRangeClick(item)}
                  className="group rounded-[18px] border border-slate-200 bg-slate-50 p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                >
                  <div className="flex items-center gap-3 hover-gradient-border">
                    <span className="inline-flex h-4 w-4 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">{item.title}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-[18px] border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">Selected range</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{activeRange?.label}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRange(activeRange)}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:shadow-sm"
              >
                View details
              </button>
            </div>
          </div>

          <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.28)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Range Wise Percentage In Subject Of Standard</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Subject performance chart</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 hover-gradient-border">
                <button
                  type="button"
                  onClick={() => setShowSubjectDemo((prev) => !prev)}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:bg-white"
                >
                  {showSubjectDemo ? 'Hide Demo Data' : 'Show Demo Data'}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover-gradient-border"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover-gradient-border"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 min-h-[320px]">
              {showSubjectDemo ? (
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectData} margin={{ top: 20, right: 20, left: 0, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} interval={0} height={50} />
                      <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 18, border: '1px solid #e2e8f0' }} formatter={(value) => [`${value}%`, 'Percentage']} />
                      <Legend wrapperStyle={{ paddingBottom: 10 }} />
                      <Bar dataKey="average" name="Average" fill="#3b82f6" radius={[12, 12, 0, 0]} />
                      <Bar dataKey="highest" name="Highest" fill="#10b981" radius={[12, 12, 0, 0]} />
                      <Bar dataKey="lowest" name="Lowest" fill="#fb923c" radius={[12, 12, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="grid min-h-[320px] place-items-center rounded-[18px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 hover-gradient-border">
                    <CircleDashed className="h-6 w-6" />
                  </div>
                  <div className="mt-4 text-sm font-semibold text-slate-900">No data available</div>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Enable demo data to visualize the subject percentage distribution. The chart loads instantly when data is present.</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.28)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Standard - Wise Marks ( In % ) Comparison</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Semester performance comparison</h2>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover-gradient-border"
              >
                <RefreshCw className={`h-4 w-4 transition-transform ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            <div className="mt-6 h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={standardComparisonData} margin={{ top: 20, right: 20, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="standard" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 18, border: '1px solid #e2e8f0' }} />
                  <Legend wrapperStyle={{ paddingBottom: 10 }} />
                  <Bar dataKey="Highest" fill="#3b82f6" radius={[12, 12, 0, 0]} onClick={(data) => handleSemesterClick(data.payload)} />
                  <Bar dataKey="Average" fill="#22c55e" radius={[12, 12, 0, 0]} onClick={(data) => handleSemesterClick(data.payload)} />
                  <Bar dataKey="Lowest" fill="#f97316" radius={[12, 12, 0, 0]} onClick={(data) => handleSemesterClick(data.payload)} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {(selectedRange || selectedSemester) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 hover-gradient-border">
          <div className="w-full max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{selectedRange ? 'Range details' : 'Semester details'}</h3>
                <p className="mt-1 text-sm text-slate-600">Detailed breakdown of the selected item.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedRange(null);
                  setSelectedSemester(null);
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
              >
                <span className="text-lg">×</span>
              </button>
            </div>
            <div className="grid gap-6 px-6 py-6 sm:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <div className="flex items-center gap-3 text-slate-700 hover-gradient-border">
                    <BarChart3 className="h-5 w-5" />
                    <span className="font-semibold">{selectedRange ? selectedRange.label : selectedSemester.standard}</span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {(selectedRange ? detailModalContent.range.fields : detailModalContent.semester.fields).map((field) => (
                      <div key={field} className="rounded-[18px] border border-slate-200 bg-white p-4">
                        <p className="text-sm text-slate-500">{field}</p>
                        <p className="mt-2 text-xl font-semibold text-slate-900">
                          {selectedRange ? (field === 'Number of Students' ? '248' : field === 'Average Marks' ? '68%' : field === 'Highest Marks' ? '99%' : field === 'Lowest Marks' ? '42%' : field === 'Pass %' ? '78%' : '22%') : (field === 'Semester' ? selectedSemester.standard : field === 'Students' ? '128' : field === 'Highest' ? `${selectedSemester.Highest}%` : field === 'Average' ? `${selectedSemester.Average}%` : field === 'Lowest' ? `${selectedSemester.Lowest}%` : field === 'Pass %' ? '83%' : 'Amit Sharma')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3 hover-gradient-border">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Performance summary</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{selectedRange ? selectedRange.title : `${selectedSemester.standard} overview`}</p>
                    </div>
                    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">Live</span>
                  </div>
                  <div className="mt-5 space-y-3 text-sm text-slate-600">
                    <div className="rounded-2xl bg-slate-50 p-4">{selectedRange ? 'This range indicates the student percentage distribution for the selected exam standard.' : 'Click any bar in the comparison chart to see semester-level metrics, topper and pass rate.'}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRange(null);
                    setSelectedSemester(null);
                  }}
                  className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Close details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
