import { useMemo } from 'react';
import {
  DollarSign,
  GraduationCap,
  Briefcase,
  Users,
  BookOpen,
  Gauge,
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
import { useResourceList } from '../hooks/useResourceHooks';
import MetricCard from '../components/ui/MetricCard.jsx';
import PanelCard from '../components/ui/PanelCard.jsx';
import { buildDashboardSummary } from '../utils/dashboardStats.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export default function DashboardPage() {
  const { data: studentsData } = useResourceList('students', { page: 1, pageSize: 200 });
  const students = studentsData?.items || [];
  const { data: teachersData } = useResourceList('teachers', { page: 1, pageSize: 200 });
  const teachers = teachersData?.items || [];
  const { data: employeesData } = useResourceList('employees', { page: 1, pageSize: 200 });
  const employees = employeesData?.items || [];
  const { data: leadsData } = useResourceList('leads', { page: 1, pageSize: 200 });
  const leads = leadsData?.items || [];
  const { data: paymentsData } = useResourceList('feePayments', { page: 1, pageSize: 200 });
  const feePayments = paymentsData?.items || [];
  const { data: attendanceData } = useResourceList('studentAttendance', { page: 1, pageSize: 200 });
  const studentAttendance = attendanceData?.items || [];
  const { data: leaveRequestsData } = useResourceList('leaveRequests', { page: 1, pageSize: 200 });
  const leaveRequests = leaveRequestsData?.items || [];
  const { data: holidaysData } = useResourceList('holidays', { page: 1, pageSize: 200 });
  const holidays = holidaysData?.items || [];
  const { data: payrollRunsData } = useResourceList('payrollRuns', { page: 1, pageSize: 200 });
  const payrollRuns = payrollRunsData?.items || [];
  const { data: financeEntriesData } = useResourceList('journalEntries', { page: 1, pageSize: 200 });
  const financeEntries = financeEntriesData?.items || [];

  const summary = useMemo(() => buildDashboardSummary({
    students,
    teachers,
    employees,
    leads,
    feePayments,
    attendance: studentAttendance,
    leaveRequests,
    holidays,
    payrollRuns,
    financeEntries,
  }), [students, teachers, employees, leads, feePayments, studentAttendance, leaveRequests, holidays, payrollRuns, financeEntries]);

  const kpis = summary.kpis.map((item) => ({ ...item, icon: {
    Users,
    BookOpen,
    Briefcase,
    GraduationCap,
    DollarSign,
    Gauge,
  }[item.icon] || Users }));

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Enrollment',
        data: [students.length - 3, students.length - 1, students.length + 2, students.length + 4, students.length + 6, students.length],
        borderColor: '#16a34a',
        backgroundColor: 'rgba(16, 163, 74, 0.18)',
        tension: 0.35,
        fill: true,
        pointRadius: 0,
      },
    ],
  };

  const kpiHighlights = summary.kpiHighlights;
  const leaveSummary = summary.leave;
  const payrollSummary = summary.payroll;
  const financeSummary = summary.finance;

  return (
    <div className="space-y-4">
      <div className="rounded-[18px] border border-slate-200/70 bg-white/95 p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-600">Super Admin Dashboard</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950">Executive overview</h1>
            <p className="max-w-2xl text-sm text-slate-500">Monitor admissions, operations, finance, attendance, and student success from one premium experience.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {kpiHighlights.map((item) => (
              <div key={item.title} className={`rounded-2xl px-3 py-3 shadow-sm ${item.accent}`}>
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">{item.title}</p>
                <p className="mt-1 text-lg font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((item) => (
            <MetricCard key={item.label} {...item} />
          ))}
        </div>

        <section className="rounded-[18px] border border-slate-200/70 bg-white/95 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Admissions performance</h2>
              <p className="text-sm text-slate-500">Weekly funnel metrics and campaign performance.</p>
            </div>
            <button className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">Export</button>
          </div>
          <div className="mt-4 h-[220px]">
            <Line
              data={lineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, ticks: { color: '#64748b', maxRotation: 0 } },
                  y: { grid: { color: 'rgba(148, 163, 184, 0.16)' }, ticks: { color: '#64748b' } },
                },
              }}
            />
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.95fr]">
        <PanelCard title="Today's classes" items={['Advanced Data Structures', 'English Communication', 'Digital Marketing Lab', 'Financial Accounting']} />
        <div className="rounded-[18px] border border-slate-200/70 bg-white/95 p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">HR operations</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl bg-slate-50 p-3">Leave pending approvals: {leaveSummary.pendingApprovals}</div>
            <div className="rounded-2xl bg-slate-50 p-3">Payroll due: {payrollSummary.due}</div>
            <div className="rounded-2xl bg-slate-50 p-3">Payroll pending approvals: {payrollSummary.pendingApprovals}</div>
            <div className="rounded-2xl bg-slate-50 p-3">Finance pending entries: {financeSummary.pendingEntries}</div>
            <div className="rounded-2xl bg-slate-50 p-3">Finance debit/credit: ₹{financeSummary.totalDebit.toLocaleString()} / ₹{financeSummary.totalCredit.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
