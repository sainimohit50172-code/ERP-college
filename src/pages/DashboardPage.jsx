import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Briefcase,
  UserPlus,
  CalendarCheck,
  Star,
  DownloadCloud,
  IndianRupee,
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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#f0fdf4 0%,#f8fafc 40%,#f0f9ff 100%)', padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', maxWidth: '100%' }}>
        {/* Top greeting bar */}
        <div className="flex items-center justify-between rounded bg-white p-4" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Hello, Admin 👋</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>Nice to have you back, what an exciting day!</div>
          </div>
          <div style={{ fontSize: 13, color: '#475569' }}>{now.toLocaleString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} | {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</div>
        </div>

        {/* Tabs */}
        <div className="sticky top-[64px] z-20 mt-3 bg-white" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <div className="flex overflow-x-auto no-scrollbar" style={{ gap: 8 }}>
            {['Quick Links','Student Overview','Fee','Admission','Attendance','Examination','Human Resource','Library','My Profile'].map((t, i) => (
              <button key={t} className={`whitespace-nowrap px-4 py-3 text-[13px] font-medium ${i===0? 'text-[#059669] border-b-2 border-[#059669] font-semibold':'text-[#64748b]'} hover:text-[#0f172a]`}>
                  {t.replace("'", "\u2019")}
                </button>
            ))}
          </div>
        </div>

        {/* KPI cards */}
        <div className="mt-4 grid gap-3" style={{ gridTemplateColumns: 'repeat(6,1fr)', gap: 14 }}>
          {kpis.map((k) => (
            <div key={k.id} style={{ background: k.bg, borderRadius: 14, padding: '18px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.2s ease', cursor: 'default' }} className="hover:translate-y-[-3px]">
              <div style={{ width: 48, height: 48, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.18)' }}>
                <k.icon style={{ width: 24, height: 24, color: '#fff' }} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{k.value}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Favorites + Reports */}
        <div className="mt-3 grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'stretch' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Favorites</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Quick access to common tasks</div>
            </div>
            <div className="mt-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {quickActions.map((a) => (
                <div key={a.id} onClick={() => navigate(a.to)} style={{ padding: '14px 8px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Star style={{ width: 22, height: 22, color: a.color }} />
                  <div style={{ marginTop: 8, fontSize: 11, fontWeight: 600, color: a.color }}>{a.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Reports</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Team and finance dashboards</div>
            </div>
            <div className="mt-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} onClick={() => navigate('/reports')} style={{ padding: '14px 8px', background: '#0f172a', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 86, color: '#fff', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                  <DownloadCloud style={{ width: 22, height: 22 }} />
                  <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, textAlign: 'center' }}>Report</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
