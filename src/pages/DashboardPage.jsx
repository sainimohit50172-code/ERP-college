import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Briefcase,
  UserPlus,
  CalendarCheck,
  Star,
  IndianRupee,
  Users,
  FileWarning,
  Building2,
} from 'lucide-react';
import { useResourceList } from '../hooks/useResourceHooks';

export default function DashboardPage() {
  const navigate = useNavigate();

  // Live clock
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Data hooks
  const { data: studentsData } = useResourceList('students', { page: 1, pageSize: 1 });
  const studentsCount = studentsData?.meta?.total || studentsData?.items?.length || 0;
  const { data: teachersData } = useResourceList('teachers', { page: 1, pageSize: 1 });
  const teachersCount = teachersData?.meta?.total || teachersData?.items?.length || 0;
  const { data: employeesData } = useResourceList('employees', { page: 1, pageSize: 1 });
  const employeesCount = employeesData?.meta?.total || employeesData?.items?.length || 0;
  const { data: leadsData } = useResourceList('leads', { page: 1, pageSize: 1 });
  const leadsCount = leadsData?.meta?.total || leadsData?.items?.length || 0;
  const { data: paymentsData } = useResourceList('feePayments', { page: 1, pageSize: 100 });
  const payments = paymentsData?.items || [];
  const feeCollected = useMemo(() => payments.reduce((s, p) => s + (p.amount || 0), 0), [payments]);
  const { data: attendanceData } = useResourceList('studentAttendance', { page: 1, pageSize: 100 });
  const attendance = attendanceData?.items || [];
  const avgAttendance = attendance.length ? `${(attendance.reduce((s, a) => s + (a.percentage || 0), 0) / attendance.length).toFixed(1)}%` : '0.0%';

  // KPI cards
  const kpis = [
    { id: 'k-students', label: 'Total Students', value: studentsCount, icon: GraduationCap, bg: 'linear-gradient(135deg,#1e40af,#3b82f6)' },
    { id: 'k-teachers', label: 'Total Teachers', value: teachersCount, icon: BookOpen, bg: 'linear-gradient(135deg,#065f46,#10b981)' },
    { id: 'k-employees', label: 'Total Employees', value: employeesCount, icon: Briefcase, bg: 'linear-gradient(135deg,#7c3aed,#a78bfa)' },
    { id: 'k-admissions', label: 'Admissions', value: leadsCount, icon: UserPlus, bg: 'linear-gradient(135deg,#b45309,#f59e0b)' },
    { id: 'k-fee', label: 'Fee Collected', value: `₹${feeCollected.toLocaleString()}`, icon: IndianRupee, bg: 'linear-gradient(135deg,#0e7490,#06b6d4)' },
    { id: 'k-attendance', label: 'Avg Attendance', value: avgAttendance, icon: CalendarCheck, bg: 'linear-gradient(135deg,#be123c,#f43f5e)' },
  ];

  const quickActions = [
    { id: 'qa-students', label: 'Student List', to: '/students', color: '#3b82f6' },
    { id: 'qa-collect', label: 'Collect Fee', to: '/fees/collection', color: '#10b981' },
    { id: 'qa-summary', label: 'Fee Summary', to: '/finance', color: '#ec4899' },
    { id: 'qa-notice', label: 'Notice', to: '/notifications', color: '#f59e0b' },
    { id: 'qa-attendance', label: 'Student Attendance', to: '/attendance/students', color: '#10b981' },
    { id: 'qa-college', label: 'College Summary', to: '/reports', color: '#3b82f6' },
    { id: 'qa-employee', label: 'Employee', to: '/employees', color: '#10b981' },
    { id: 'qa-books', label: 'Books', to: '/library', color: '#ec4899' },
  ];

  const reportCards = [
    { id: 'report-strength', label: 'Strength Report', icon: Users },
    { id: 'report-collection', label: 'Daily Collection', icon: IndianRupee },
    { id: 'report-due-fee', label: 'Due Fee Report', icon: FileWarning },
    { id: 'report-due-fee-college', label: 'Due Fee College Wise', icon: Building2 },
    { id: 'report-employee', label: 'Employee Report', icon: Briefcase },
    { id: 'report-subject', label: 'Subject Report', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[linear-gradient(135deg,#f0fdf4_0%,#f8fafc_40%,#f0f9ff_100%)] p-0">
      <div className="w-full p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <div className="text-xl font-bold text-slate-900 sm:text-2xl">Hello, Admin 👋</div>
            <div className="mt-1 text-sm text-slate-600">Nice to have you back, what an exciting day!</div>
          </div>
          <div className="text-sm text-slate-600">
            {now.toLocaleString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} | {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </div>
        </div>

        <div className="sticky top-16 z-20 mt-3 rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <div className="flex gap-2 overflow-x-auto px-2 py-2 sm:px-3">
            {['Quick Links','Student Overview','Fee','Admission','Attendance','Examination','Human Resource','Library','My Profile'].map((t, i) => (
              <button key={t} className={`whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-medium ${i===0 ? 'border border-emerald-500 bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                {t.replace("'", '’')}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {kpis.map((k) => (
            <div key={k.id} className="flex items-center gap-3 rounded-2xl p-4 text-white shadow-lg" style={{ background: k.bg }}>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
                <k.icon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xl font-bold">{k.value}</div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/90">{k.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <div className="flex min-h-0 flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm sm:p-5">
            <div>
              <div className="text-lg font-semibold text-slate-900">Favorites</div>
              <div className="mt-1 text-sm text-slate-500">Quick access to common tasks</div>
            </div>
            <div className="mt-4 grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((a) => (
                <button key={a.id} type="button" onClick={() => navigate(a.to)} className="flex min-h-[92px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center transition hover:-translate-y-0.5 hover:shadow-sm">
                  <Star className="h-5 w-5" style={{ color: a.color }} />
                  <div className="mt-2 text-[11px] font-semibold" style={{ color: a.color }}>{a.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex min-h-0 flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm sm:p-5">
            <div>
              <div className="text-lg font-semibold text-slate-900">Reports</div>
              <div className="mt-1 text-sm text-slate-500">Team and finance dashboards</div>
            </div>
            <div className="mt-4 grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {reportCards.map((card) => (
                <button key={card.id} type="button" onClick={() => navigate('/reports')} className="flex min-h-[92px] flex-col items-center justify-center rounded-2xl bg-slate-900 px-3 py-3 text-center text-white transition hover:-translate-y-0.5 hover:bg-slate-800">
                  <card.icon className="h-5 w-5" />
                  <div className="mt-2 text-[12px] font-semibold">{card.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
