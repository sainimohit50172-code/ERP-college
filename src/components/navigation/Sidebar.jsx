import { useLocation, Link } from 'react-router-dom';
import ReactDOM from 'react-dom';
import {
  Home,
  Briefcase,
  Link2,
  UserCircle,
  FileText,
  CalendarCheck,
  ClipboardList,
  Building,
  MessageSquare,
  Globe,
  BookOpen,
  Users,
  UserCog,
  Monitor,
  Phone,
  Bus,
  Hotel,
  Settings2,
  BarChart3,
  CheckSquare2,
  Share2,
  HelpCircle,
  Star,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', to: '/', icon: Home },
  { id: 'employee-portal', label: 'Employee Portal', to: '/employees', icon: Briefcase },
  { id: 'admission', label: 'Admission', to: '/admissions', icon: Link2 },
  { id: 'student', label: 'Student', to: '/students', icon: UserCircle },
  { id: 'fee', label: 'Fee', to: '/fees', icon: FileText },
  { id: 'attendance', label: 'Attendance', to: '/attendance/students', icon: CalendarCheck },
  { id: 'examination', label: 'Examination', to: '/examination', icon: ClipboardList },
  { id: 'coe', label: 'COE', to: '/settings/coe', icon: Building },
  { id: 'feedback', label: 'Feedback From Student', to: '/feedback', icon: MessageSquare },
  { id: 'university-communication', label: 'University Communication', to: '/notifications', icon: Globe },
  { id: 'lesson', label: 'Lesson', to: '/lms', icon: BookOpen },
  { id: 'hrm', label: 'HRM', to: '/employees', icon: Users },
  { id: 'users', label: 'Users', to: '/settings/users', icon: UserCog },
  { id: 'library', label: 'Library', to: '/library', icon: BookOpen },
  { id: 'front-desk', label: 'Front Desk', to: '/security', icon: Monitor },
  { id: 'communication', label: 'Communication', to: '/notifications', icon: Phone },
  { id: 'transport', label: 'Transport', to: '/transport', icon: Bus },
  { id: 'hostel', label: 'Hostel', to: '/hostel', icon: Hotel },
  { id: 'advanced', label: 'Advanced', to: '/settings', icon: Settings2 },
  { id: 'analytics', label: 'Analytics', to: '/reports', icon: BarChart3 },
  { id: 'bulk-operations', label: 'Bulk Operations', to: '/bulk-operations', icon: CheckSquare2 },
  { id: 'share-point', label: 'Share Point', to: '/documents', icon: Share2 },
  { id: 'student-queries', label: 'Student Queries', to: '/student-queries', icon: HelpCircle },
];

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const location = useLocation();
  const [showEmployeePortal, setShowEmployeePortal] = useState(false);
  const employeePortalRef = useRef(null);
  const [dropdownTop, setDropdownTop] = useState(0);

  const EMPLOYEE_PORTAL_ITEMS = [
    { id: 'profile', label: 'Profile', to: '/employees/profile' },
    { id: 'my-leaves', label: 'My Leaves', to: '/employees/leaves' },
    { id: 'salary-slip', label: 'Salary Slip', to: '/employees/salary-slip' },
    { id: 'attendance-regularization', label: 'Attendance Regularization', to: '/employees/attendance-regularization' },
    { id: 'issued-books', label: 'Issued Books', to: '/employees/issued-books' },
    { id: 'user-preference', label: 'User Preference', to: '/employees/user-preference' },
    { id: 'employee-announcement', label: 'Employee Announcement', to: '/employees/announcements' },
    { id: 'webopac', label: 'WebOPAC', to: '/employees/webopac' },
    { id: 'individual-faculty-report', label: 'Individual Faculty Report', to: '/employees/faculty-report' },
    { id: 'feedback-summary-report', label: 'Feedback Summary Report (New)', to: '/employees/feedback-summary' },
  ];

  const handleEmployeePortalClick = () => {
    if (employeePortalRef.current) {
      const rect = employeePortalRef.current.getBoundingClientRect();
      const topPosition = Math.max(rect.top, 56);
      setDropdownTop(topPosition);
    }
    setShowEmployeePortal((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest('.employee-portal-dropdown') &&
        !e.target.closest('.employee-portal-trigger')
      ) {
        setShowEmployeePortal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape for mobile
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const items = useMemo(() => MENU_ITEMS, []);

  const renderLink = (item) => {
    const Icon = item.icon;
    const isActive = item.to && (location.pathname === item.to || location.pathname.startsWith(`${item.to}/`));
    if (item.id === 'employee-portal') {
      return (
        <div
          key={item.id}
          ref={employeePortalRef}
          className="employee-portal-trigger flex items-center px-3"
          onClick={handleEmployeePortalClick}
          style={{ height: 44, color: isActive ? '#ffffff' : '#86efac', cursor: 'pointer' }}
        >
          <div style={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icon ? <Icon style={{ width: 18, height: 18, color: isActive ? '#ffffff' : '#86efac' }} /> : null}
          </div>
          <div style={{ marginLeft: 12, fontSize: 13, color: isActive ? '#ffffff' : '#86efac' }}>{item.label}</div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            <span style={{ color: isActive ? '#ffffff' : '#86efac' }}>▾</span>
          </div>
          {isActive ? <div style={{ marginLeft: 8, borderLeft: '3px solid #4ade80', height: 36, marginRight: 8 }} /> : null}
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        to={item.to}
        onClick={() => {
          setShowEmployeePortal(false);
          if (window.innerWidth < 768) onClose();
        }}
        className="flex items-center px-3"
        style={{ height: 44, color: isActive ? '#ffffff' : '#86efac' }}
      >
        <div style={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icon ? <Icon style={{ width: 18, height: 18, color: isActive ? '#ffffff' : '#86efac' }} /> : null}
        </div>
        <div style={{ marginLeft: 12, fontSize: 13, color: isActive ? '#ffffff' : '#86efac' }}>{item.label}</div>
        {isActive ? <div style={{ marginLeft: 'auto', borderLeft: '3px solid #4ade80', height: 36, marginRight: 8 }} /> : null}
      </Link>
    );
  };

  return (
    <>
      {/* Desktop static sidebar */}
      <aside
        className="hidden md:fixed md:left-0 md:top-0 md:z-50 md:flex md:flex-col md:overflow-y-auto md:py-4"
        style={{ width: 200, height: '100vh', background: '#0a2e1a' }}
      >
        <div style={{ height: 64 }} className="flex items-center px-3">
          <div className="flex w-full items-center">
            <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Home style={{ width: 22, height: 22, color: '#86efac' }} />
            </div>
            <div style={{ marginLeft: 10 }}>
              <p className="text-[11px] uppercase tracking-[0.28em]" style={{ color: '#94a3b8' }}>ENTERPRISE</p>
              <h2 className="text-[15px] font-semibold" style={{ color: '#ffffff' }}>College ERP</h2>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-1" style={{ paddingBottom: 80 }}>
          {items.map(renderLink)}
        </nav>

        {showEmployeePortal && ReactDOM.createPortal(
          <div
            className="employee-portal-dropdown"
            style={{
              position: 'fixed',
              left: 200,
              top: Math.max(dropdownTop, 56) + 'px',
              width: 280,
              zIndex: 200,
              background: 'white',
              borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              padding: 8,
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            {EMPLOYEE_PORTAL_ITEMS.map((portalItem) => (
              <Link
                key={portalItem.id}
                to={portalItem.to}
                onClick={() => setShowEmployeePortal(false)}
                className="flex items-center rounded p-2 hover:bg-slate-50"
                style={{
                  color: '#0f172a',
                  textDecoration: 'none',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{portalItem.label}</span>
                <Star style={{ width: 14, height: 14, color: '#94a3b8' }} />
              </Link>
            ))}
          </div>,
          document.body
        )}

        <div className="absolute bottom-4 left-0 right-0 px-3">
          <div className="flex items-center gap-3 rounded p-2" style={{ color: '#fff' }}>
            <div style={{ width: 32, height: 32, borderRadius: 999, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#012' }}>
              <span className="font-semibold text-sm">AD</span>
            </div>
            <div>
              <div className="text-sm font-semibold">Admin Demo</div>
              <div className="text-xs text-slate-300">Super Admin</div>
            </div>
            <button className="ml-auto rounded p-2 text-slate-200 hover:text-white">Logout</button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay sidebar */}
      <div className={`fixed inset-0 z-50 md:hidden ${isOpen ? 'block' : 'hidden'}`} role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-black/40" onClick={onClose} />
        <aside className={`fixed left-0 top-0 flex h-full w-[86vw] max-w-[320px] flex-col bg-[#05331e] p-3 shadow-[0_35px_80px_rgba(7,43,22,0.18)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/20">
                <Home className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-emerald-200/80">Enterprise</p>
                <h2 className="text-lg font-semibold text-slate-50">College ERP</h2>
              </div>
            </div>
            <button onClick={onClose} className="rounded-2xl border border-white/10 px-3 py-2 text-sm text-slate-200">Close</button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="rounded p-1">
                {renderLink(item)}
              </div>
            ))}
          </nav>
        </aside>
      </div>
    </>
  );
}

