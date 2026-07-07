import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Briefcase,
  UserPlus,
  CalendarCheck,
  Star,
  FileBarChart,
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
      <div style={{ padding: '16px 20px', maxWidth: '100%' }}>
        {/* Top greeting bar */}
        <div className="flex items-center justify-between rounded bg-white p-4" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>Hello, Admin 👋</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Nice to have you back, what an exciting day!</div>
          </div>
          <div style={{ fontSize: 12, color: '#475569' }}>{now.toLocaleString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} | {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</div>
        </div>

        {/* Tabs */}
        <div className="sticky top-[64px] z-20 mt-3 bg-white" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <div className="flex overflow-x-auto no-scrollbar" style={{ gap: 8 }}>
            {['Quick Links','Student Overview','Fee','Admission','Attendance','Examination','Human Resource','Library','My Profile'].map((t, i) => (
              <button key={t} className={`whitespace-nowrap px-4 py-3 text-[12px] font-medium ${i===0? 'text-[#059669] border-b-2 border-[#059669] font-semibold':'text-[#64748b]'} hover:text-[#0f172a]`}>
                {t.replace("'", "\u2019")}
              </button>
            ))}
          </div>
        </div>

        {/* KPI cards */}
        <div className="mt-3 grid" style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 12 }}>
          {kpis.map((k) => (
            <div key={k.id} style={{ background: k.bg, borderRadius: 14, padding: '14px 16px', boxShadow: '0 4px 18px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s ease', cursor: 'default' }} className="hover:translate-y-[-2px]">
              <div style={{ width: 44, height: 44, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.18)' }}>
                <k.icon style={{ width: 22, height: 22, color: '#fff' }} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{k.value}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Favorites + Reports */}
        <div className="mt-3 grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'stretch' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', minHeight: 320 }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Favorites</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Quick access to common tasks</div>
            </div>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {quickActions.map((a) => (
                <button key={a.id} onClick={() => navigate(a.to)} className="rounded" style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '14px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 84, transition: 'all 0.2s ease' }}>
                  <Star style={{ width: 22, height: 22, color: a.color }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: a.color }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', minHeight: 320 }}>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Reports</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>Run commonly used reports</div>
              </div>
              <button style={{ border: '1px solid #e2e8f0', padding: '8px 10px', borderRadius: 10 }}><DownloadCloud style={{ width: 16, height: 16 }} /></button>
            </div>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <button key={idx} onClick={() => navigate('/reports')} className="rounded" style={{ background: 'linear-gradient(135deg,#1e3a5f,#2d5a8e)', border: 'none', color: '#fff', padding: 14, minHeight: 84, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                  <FileBarChart style={{ width: 22, height: 22 }} />
                  <span style={{ fontSize: 11, fontWeight: 600 }}>Report</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
