import { useState } from 'react';
import { Users, FileText, UserPlus, Briefcase, RotateCw } from 'lucide-react';
import AdmissionDataChart from './AdmissionDataChart.jsx';
import SourceWiseAdmissionChart from './SourceWiseAdmissionChart.jsx';
import AdmissionCourseWiseChart from './AdmissionCourseWiseChart.jsx';

const summaryCards = [
  {
    title: "Today's New Enquiries",
    value: '0',
    bgColor: 'bg-gradient-to-br from-yellow-100 to-amber-100',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700',
    icon: FileText,
  },
  {
    title: 'Total Pending Enquiries',
    value: '2369',
    bgColor: 'bg-gradient-to-br from-blue-100 to-indigo-100',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    icon: FileText,
  },
  {
    title: "Today's New Admission",
    value: '0',
    bgColor: 'bg-gradient-to-br from-emerald-100 to-teal-100',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    icon: UserPlus,
  },
  {
    title: 'Total New Admission',
    value: '0',
    bgColor: 'bg-gradient-to-br from-pink-100 to-rose-100',
    borderColor: 'border-pink-200',
    textColor: 'text-pink-700',
    icon: Users,
  },
];

export default function AdmissionDashboard() {
  const [chartKey, setChartKey] = useState(0);

  const handleRefresh = () => {
    setChartKey(prev => prev + 1);
  };

  const handleCardClick = (card) => {
    alert(`${card.title}\n\nValue: ${card.value}`);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_45%,#f0fdf4_100%)] p-0">
      <div className="m-2.5 overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/90 p-3 shadow-[0_22px_70px_-24px_rgba(2,8,23,0.35)] backdrop-blur sm:p-4 lg:p-6">
        <div className="flex flex-col gap-4">
          {/* Header Section */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 hover-gradient-border">
              <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Admission</h1>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm">
              <div className="font-medium text-slate-900">Admission Session</div>
              <div className="text-xs text-slate-500">2026-27 Odd</div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 xl:grid-cols-4">
            {summaryCards.map((card, index) => (
              <div
                key={index}
                role="button"
                tabIndex={0}
                onClick={() => handleCardClick(card)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(card);
                  }
                }}
                className={`${card.bgColor} rounded-[22px] border ${card.borderColor} p-6 shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer`}
              >
                <div className="relative z-10">
                  <div className="flex items-start justify-between hover-gradient-border">
                    <div>
                      <p className={`text-sm font-semibold ${card.textColor}`}>{card.title}</p>
                      <h2 className="mt-3 text-4xl font-bold text-slate-900">{card.value}</h2>
                    </div>
                    <div className={`rounded-2xl ${card.textColor.replace('text-', 'bg-').replace('700', '100')} p-3`}>
                      <card.icon className={`h-6 w-6 ${card.textColor}`} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Two Column Layout: Admission Data & Source Wise */}
          <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
            {/* Left Card: Admission Data */}
            <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.28)]">
              <div className="mb-4 flex items-center justify-between gap-4 hover-gradient-border">
                <h2 className="text-lg font-semibold text-slate-900">Admission Data</h2>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 hover-gradient-border"
                  title="Refresh chart data"
                >
                  <RotateCw className="h-5 w-5" />
                </button>
              </div>
              <div key={chartKey} className="mt-4">
                <AdmissionDataChart />
              </div>
            </div>

            {/* Right Card: Source Wise Admission Enquiry */}
            <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.28)]">
              <h2 className="mb-6 text-lg font-semibold text-slate-900">Source Wise Admission Enquiry</h2>
              <div className="mt-4">
                <SourceWiseAdmissionChart />
              </div>
            </div>
          </div>

          {/* Full Width: Course Wise Admission */}
          <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.28)]">
            <div className="mb-4 flex items-center justify-between gap-4 hover-gradient-border">
              <h2 className="text-lg font-semibold text-slate-900">Admission Enquiry Course Wise</h2>
            </div>
            <div className="mt-4">
              <AdmissionCourseWiseChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
