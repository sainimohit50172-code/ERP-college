import { useNavigate } from 'react-router-dom';
import { Eye, ArrowRight, Users } from 'lucide-react';
import FeeMonthlyPaymodeChart from './FeeMonthlyPaymodeChart.jsx';
import FeeCollectionChart from './FeeCollectionChart.jsx';
import FeeEstimatedCollectionChart from './FeeEstimatedCollectionChart.jsx';
import RecentTransactions from './RecentTransactions.jsx';
import CourseWiseFeeDue from './CourseWiseFeeDue.jsx';
import TopDefaulters from './TopDefaulters.jsx';

const summaryCards = [
  {
    title: 'Total Active Students',
    value: '1406',
    bgColor: 'bg-gradient-to-br from-yellow-100 to-amber-100',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700',
    route: '/students',
  },
  {
    title: 'Total Awake Students',
    value: '2',
    bgColor: 'bg-gradient-to-br from-blue-100 to-indigo-100',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    route: '/fees',
  },
  {
    title: 'Total Dormant Students',
    value: '1404',
    bgColor: 'bg-gradient-to-br from-green-100 to-emerald-100',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    route: '/fees',
  },
];

const quickFeeActions = [
  { label: 'Fee ledger', description: 'Review payments and balances', path: '/fees' },
  { label: 'Collect fee', description: 'Record new fee payments', path: '/fee-collection' },
  { label: 'Payments', description: 'Check payment transactions', path: '/payments' },
  { label: 'Receipts', description: 'View generated receipts', path: '/receipts' },
];

export default function FeeDashboard() {
  const navigate = useNavigate();

  const goTo = (path) => navigate(path);

  const handleKeyDown = (event, path) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_45%,#f0fdf4_100%)] p-0">
      <div className="m-2.5 overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/90 p-3 shadow-[0_22px_70px_-24px_rgba(2,8,23,0.35)] backdrop-blur sm:p-4 lg:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 hover-gradient-border">
              <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Fee</h1>
              <span className="inline-flex items-center justify-center rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white hover-gradient-border">
                19
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 hover-gradient-border">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm">
                <div className="font-medium text-slate-900">Financial Year</div>
                <div className="text-xs text-slate-500">2026-27 Odd</div>
              </div>
              <button
                type="button"
                onClick={() => goTo('/fees')}
                className="inline-flex items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
              >
                Open fee ledger
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {quickFeeActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => goTo(action.path)}
                className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-50"
              >
                <div className="font-semibold text-slate-900">{action.label}</div>
                <div className="mt-1 text-sm text-slate-500">{action.description}</div>
              </button>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {summaryCards.map((card) => (
              <div
                key={card.title}
                role="button"
                tabIndex={0}
                onClick={() => goTo(card.route)}
                onKeyDown={(event) => handleKeyDown(event, card.route)}
                className={`${card.bgColor} rounded-[22px] border ${card.borderColor} p-6 shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.01] cursor-pointer`}
              >
                <div className="relative z-10">
                  <div className="flex items-start justify-between hover-gradient-border">
                    <div>
                      <p className={`text-sm font-semibold ${card.textColor}`}>{card.title}</p>
                      <h2 className="mt-3 text-4xl font-bold text-slate-900">{card.value}</h2>
                    </div>
                    <div className={`rounded-2xl ${card.textColor.replace('text-', 'bg-').replace('700', '100')} p-3`}>
                      <Users className={`h-6 w-6 ${card.textColor}`} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between hover-gradient-border">
                    <div className="flex items-center gap-2 hover-gradient-border">
                      <Eye className={`h-4 w-4 ${card.textColor}`} />
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">Open</span>
                    </div>
                    <ArrowRight className={`h-4 w-4 ${card.textColor}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.28)]">
              <div className="flex items-center justify-between gap-4 hover-gradient-border">
                <h2 className="text-lg font-semibold text-slate-900">Daily Paymode Summary</h2>
                <button type="button" onClick={() => goTo('/fees')} className="text-sm font-semibold text-sky-700">View ledger</button>
              </div>
              <div className="mt-4 flex min-h-[250px] items-center justify-center rounded-[18px] border border-dashed border-slate-300 bg-slate-50/80 p-5 hover-gradient-border">
                <div className="text-center">
                  <div className="mb-3 text-5xl">📋</div>
                  <p className="font-medium text-slate-600">No Data Found</p>
                  <p className="mt-1 text-sm text-slate-500">We couldn't find your data</p>
                </div>
              </div>
            </div>

            <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.28)]">
              <div className="flex items-center justify-between gap-4 hover-gradient-border">
                <h2 className="text-lg font-semibold text-slate-900">Monthly Paymode Summary</h2>
                <button type="button" onClick={() => goTo('/payments')} className="text-sm font-semibold text-sky-700">Open payments</button>
              </div>
              <div className="mt-4">
                <FeeMonthlyPaymodeChart />
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.28)]">
            <div className="flex items-center justify-between gap-4 hover-gradient-border">
              <h2 className="text-lg font-semibold text-slate-900">Fee Collection</h2>
              <button type="button" onClick={() => goTo('/fee-collection')} className="text-sm font-semibold text-sky-700">Open collection</button>
            </div>
            <div className="mt-4">
              <FeeCollectionChart />
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
            <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.28)]">
              <div className="flex items-start justify-between gap-4 hover-gradient-border">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Estimated Collection</h2>
                  <p className="mt-1 text-sm text-slate-500">(2026-27 Odd)</p>
                </div>
                <button type="button" onClick={() => goTo('/finance-accounting')} className="text-sm font-semibold text-sky-700">Open finance</button>
              </div>
              <div className="mt-3">
                <p className="text-sm text-slate-600">
                  Total: <span className="text-2xl font-bold text-slate-900">₹152341180</span>
                </p>
              </div>
              <div className="mt-4">
                <FeeEstimatedCollectionChart />
              </div>
            </div>

            <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.28)]">
              <div className="flex items-center justify-between gap-4 hover-gradient-border">
                <h2 className="text-lg font-semibold text-slate-900">Recent Transactions</h2>
                <button type="button" onClick={() => goTo('/payments')} className="text-sm font-semibold text-sky-700">Open payments</button>
              </div>
              <RecentTransactions />
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
            <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.28)]">
              <div className="mb-4 flex items-start justify-between gap-4 hover-gradient-border">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Course Wise Fee Due</h2>
                  <p className="mt-1 text-sm text-slate-500">Up To Date: 15/07/2026</p>
                </div>
                <button type="button" onClick={() => goTo('/fees')} className="text-sm font-semibold text-sky-700">Open due report</button>
              </div>
              <div className="mb-4 flex gap-2">
                <select className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover-gradient-border">
                  <option>Select installments</option>
                </select>
                <select className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover-gradient-border">
                  <option>View Section Wise</option>
                </select>
              </div>
              <CourseWiseFeeDue />
            </div>

            <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.28)]">
              <div className="mb-4 flex items-start justify-between gap-4 hover-gradient-border">
                <h2 className="text-lg font-semibold text-slate-900">Top Defaulters</h2>
                <button type="button" onClick={() => goTo('/fees')} className="text-sm font-semibold text-sky-700">Open ledger</button>
              </div>
              <select className="mb-4 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover-gradient-border">
                <option>Select installments</option>
              </select>
              <TopDefaulters />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
