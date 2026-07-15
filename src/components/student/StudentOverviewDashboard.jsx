import { Activity, CalendarDays, MessageSquareText, Sparkles, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentOverviewCards from './StudentOverviewCards.jsx';
import StudentStatisticsComparison from './StudentStatisticsComparison.jsx';
import StudentStrengthChart from './StudentStrengthChart.jsx';
import SocialCategoryChart from './SocialCategoryChart.jsx';
import ReligionChart from './ReligionChart.jsx';
import BirthdayWidget from './BirthdayWidget.jsx';
import OverviewCards from './OverviewCards.jsx';
import ComparisonChart from './ComparisonChart.jsx';

const summaryCards = [
  {
    title: 'Active Student',
    totalValue: '1406',
    bgColor: 'bg-cyan-100',
    borderColor: 'border-cyan-300',
    textColor: 'text-cyan-700',
    accentColor: 'bg-cyan-400',
    stats: [
      { label: 'Boys', value: '1,015', percentage: '(72.19%)' },
      { label: 'Girls', value: '391', percentage: '(27.81%)' },
      { label: 'Others', value: '0', percentage: '(0%)' },
    ],
  },
  {
    title: 'Inactive Student',
    totalValue: '0',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-700',
    accentColor: 'bg-blue-400',
    stats: [
      { label: 'Boys', value: '0', percentage: '' },
      { label: 'Girls', value: '0', percentage: '' },
      { label: 'Others', value: '0', percentage: '' },
    ],
  },
];

const statsCards = [
  { label: 'Awake Students', value: '1,328', subtitle: 'Signed in today', icon: Sparkles, gradient: 'from-blue-200 via-indigo-200 to-purple-200', isSmall: false },
  { label: 'Dormant Students', value: '78', subtitle: 'No activity in 7 days', icon: Activity, gradient: 'from-emerald-200 via-teal-200 to-cyan-200', isSmall: false },
  { label: "Today's Admission Activations", value: '26', subtitle: 'Admissions activated', icon: Users, gradient: 'from-sky-200 via-cyan-200 to-blue-200', isSmall: true },
  { label: 'Unresolved Queries', value: '14', subtitle: 'Pending student support', icon: MessageSquareText, gradient: 'from-amber-200 via-orange-200 to-rose-200', isSmall: true },
];

const remarks = [];

export default function StudentOverviewDashboard() {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);

  const handleCardClick = (cardLabel, cardValue) => {
    setSelectedCard(cardLabel);
    console.log(`Clicked: ${cardLabel} - Value: ${cardValue}`);
    // Navigate to respective pages based on card clicked
    if (cardLabel === 'Awake Students') navigate('/students/awake');
    else if (cardLabel === 'Dormant Students') navigate('/students/dormant');
    else if (cardLabel === "Today's Admission Activations") navigate('/admissions');
    else if (cardLabel === 'Unresolved Queries') navigate('/support/queries');
  };

  const handleStudentClick = (studentName) => {
    console.log(`Viewing student: ${studentName}`);
    navigate(`/student-profile/${studentName.replace(/\s+/g, '-').toLowerCase()}`);
  };
  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_45%,#f0fdf4_100%)] p-0">
      <div className="m-2.5 overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/90 p-3 shadow-[0_22px_70px_-24px_rgba(2,8,23,0.35)] backdrop-blur sm:p-4 lg:p-6">
        <div className="flex flex-col gap-4">
          <div className="rounded-[22px] border border-slate-200/70 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 px-5 py-4 shadow-[0_24px_60px_-24px_rgba(2,8,23,0.8)] sm:px-6 sm:py-5">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Student overview</h1>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <StudentOverviewCards
              title={summaryCards[0].title}
              totalValue={summaryCards[0].totalValue}
              bgColor={summaryCards[0].bgColor}
              borderColor={summaryCards[0].borderColor}
              textColor={summaryCards[0].textColor}
              accentColor={summaryCards[0].accentColor}
              stats={summaryCards[0].stats}
            />
            <StudentStatisticsComparison />
            <StudentOverviewCards
              title={summaryCards[1].title}
              totalValue={summaryCards[1].totalValue}
              bgColor={summaryCards[1].bgColor}
              borderColor={summaryCards[1].borderColor}
              textColor={summaryCards[1].textColor}
              accentColor={summaryCards[1].accentColor}
              stats={summaryCards[1].stats}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.28)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Inactive Student Remarks</h2>
                  <p className="mt-1 text-sm text-slate-500">Follow-up notes for students needing attention</p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Placeholder
                </div>
              </div>
              <div className="mt-4 min-h-[150px] rounded-[18px] border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm text-slate-500">
                {remarks.length > 0 ? (
                  <ul className="space-y-3">
                    {remarks.map((remark) => (
                      <li key={remark} className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                        {remark}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex h-full items-center justify-center text-center text-sm leading-7">
                    No inactive remarks yet. This section will display student follow-up notes as they are added.
                  </div>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
              {statsCards.map((item) => (
                <div 
                  key={item.label} 
                  onClick={() => handleCardClick(item.label, item.value)}
                  className={`cursor-pointer rounded-[22px] bg-gradient-to-br ${item.gradient} p-[1px] shadow-[0_18px_50px_-26px_rgba(15,23,42,0.32)] transition-all duration-300 hover:shadow-[0_24px_60px_-16px_rgba(15,23,42,0.45)] hover:scale-105 ${item.isSmall ? 'h-32' : ''}`}
                >
                  <div className={`flex ${item.isSmall ? 'h-full items-center' : 'h-full flex-col'} rounded-[21px] bg-white/80 p-5 ${item.isSmall ? 'text-slate-800' : 'text-slate-800'} transition-colors hover:bg-white/95`}>
                    <div className="flex w-full items-center justify-between">
                      <div className={`rounded-2xl ${item.isSmall ? 'bg-slate-200/70' : 'bg-slate-200/70'} p-3 transition-colors hover:bg-slate-300/70`}>
                        <item.icon className={`${item.isSmall ? 'h-4 w-4' : 'h-5 w-5'} text-slate-700`} />
                      </div>
                      <div className={`${item.isSmall ? 'text-2xl' : 'text-3xl'} font-semibold tracking-tight text-slate-900`}>{item.value}</div>
                    </div>
                    {!item.isSmall && (
                      <div className="mt-5">
                        <div className="text-sm font-semibold text-slate-900">{item.label}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-600">{item.subtitle}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.28)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Student Strength Standard Wise</h2>
                <p className="mt-1 text-sm text-slate-500">Distribution across academic standards</p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                2025-26 batch
              </div>
            </div>
            <div className="mt-4">
              <StudentStrengthChart />
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <SocialCategoryChart />
            <ReligionChart />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <BirthdayWidget />
            <OverviewCards />
          </div>

          <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.28)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Student Statistics Comparison With Previous Year</h2>
                <p className="mt-1 text-sm text-slate-500">A side-by-side view of student strength trends</p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Session trend
              </div>
            </div>
            <div className="mt-4">
              <ComparisonChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
