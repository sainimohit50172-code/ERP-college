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
  ChevronRight,
  ChevronDown,
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
  const [showAdmissionDropdown, setShowAdmissionDropdown] = useState(false);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showFeeDropdown, setShowFeeDropdown] = useState(false);
  const [showAttendanceDropdown, setShowAttendanceDropdown] = useState(false);
  const employeePortalRef = useRef(null);
  const admissionRef = useRef(null);
  const studentRef = useRef(null);
  const feeRef = useRef(null);
  const attendanceRef = useRef(null);
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
    setShowAdmissionDropdown(false);
    setShowStudentDropdown(false);
    setShowEmployeePortal((prev) => !prev);
  };

  const ADMISSION_ITEMS = {
    left: [
      { id: 'applications', label: 'Application Data', to: '/admissions/applications' },
      { id: 'leads', label: 'Admission Leads', to: '/admissions/leads' },
      { id: 'follow-ups', label: 'Follow Ups', to: '/admissions/follow-ups' },
      { id: 'follow-up-remarks', label: 'Follow Up Remark Report', to: '/admissions/follow-up-remarks' },
      { id: 'transactions', label: 'Admission Transactions', to: '/admissions/transactions' },
    ],
    right: [
      { id: 'daily-collection', label: 'Daily Collection Report', to: '/admissions/reports/daily-collection' },
      { id: 'summary', label: 'Admission Summary Report', to: '/admissions/reports/summary' },
      { id: 'subject-combination', label: 'Subject Combination Report', to: '/admissions/reports/subject-combination' },
      { id: 'follow-up-remark', label: 'Follow Up Remark Report', to: '/admissions/reports/follow-up-remark' },
    ],
  };

  const FEE_ITEMS = {
    left: {
      collectFee: [
        { id: 'collect-fee', label: 'Collect Fee', to: '/fees/collect' },
        { id: 'collect-fee-online', label: 'Collect Fee Online', to: '/fees/collect-online' },
        { id: 'collect-miscellaneous-fee', label: 'Collect Miscellaneous Fee', to: '/fees/miscellaneous' },
        { id: 'fee-update', label: 'Fee Update', to: '/fees/update' },
      ],
      otherIncome: [
        { id: 'collect-other-income', label: 'Collect Other Income', to: '/fees/other-income' },
        { id: 'other-income-transactions', label: 'Other Income Transaction List', to: '/fees/other-income-transactions' },
      ],
      transaction: [
        { id: 'transaction-list', label: 'Transaction List', to: '/fees/transactions' },
        { id: 'fee-adjustment', label: 'Fee Adjustment', to: '/fees/adjustment' },
        { id: 'online-transaction-list', label: 'Online Transaction List', to: '/fees/online-transactions' },
      ],
      concession: [
        { id: 'concession-report', label: 'Concession Report', to: '/fees/concession' },
      ],
      refund: [
        { id: 'refund', label: 'Refund', to: '/fees/refund' },
        { id: 'refund-transaction-list', label: 'Refund Transaction List', to: '/fees/refund-transactions' },
        { id: 'refund-report', label: 'Refund Report', to: '/fees/refund-report' },
      ],
    },
    right: {
      feeReports: [
        { id: 'combined-daily-collection-report', label: 'Combined Daily Collection Report', to: '/fees/reports/combined-daily' },
        { id: 'daily-fee-report', label: 'Daily Fee Report', to: '/fees/reports/daily' },
        { id: 'fee-head-collection-report', label: 'Fee Head Collection Report', to: '/fees/reports/fee-head' },
        { id: 'payment-mode-collection-report', label: 'Daily PaymentMode Collection Report', to: '/fees/reports/payment-mode' },
        { id: 'due-fee-report', label: 'Due Fee Report', to: '/fees/reports/due-fee' },
        { id: 'due-fee-report-college-wise', label: 'Due Fee Report College Wise', to: '/fees/reports/due-fee-college' },
        { id: 'transport-due-fee-report', label: 'Transport Due Fee Report', to: '/fees/reports/transport-due' },
        { id: 'due-fee-report-sibling-wise', label: 'Due Fee Report Sibling Wise', to: '/fees/reports/sibling-wise' },
      ],
      feeSummary: [
        { id: 'fee-summary-college-wise', label: 'Fee Summary - College Wise', to: '/fees/reports/summary-college' },
        { id: 'fee-summary-category-wise', label: 'Fee Summary - Category Wise', to: '/fees/reports/summary-category' },
        { id: 'fee-summary-head-wise', label: 'Fee Summary - Head Wise', to: '/fees/reports/summary-head' },
        { id: 'fee-summary-combined-head-wise', label: 'Fee Summary - Combined Head Wise', to: '/fees/reports/summary-combined' },
        { id: 'student-payment-summary', label: 'Student Payment Summary', to: '/fees/reports/student-payment' },
      ],
    },
  };

  const ATTENDANCE_ITEMS = {
    left: {
      markAttendance: [
        { id: 'student-attendance', label: 'Student Attendance', to: '/attendance/students' },
      ],
      timetable: [
        { id: 'daily-schedule-for-employees', label: 'Daily Schedule For Employees', to: '/attendance/employee-schedule' },
        { id: 'employee-schedule', label: 'Employee Schedule', to: '/attendance/schedule' },
        { id: 'college-wise-schedule', label: 'College Wise Schedule', to: '/attendance/college-schedule' },
        { id: 'time-table-status', label: 'Time Table Status', to: '/attendance/timetable-status' },
      ],
    },
    right: {
      attendanceReports: [
        { id: 'daily-report', label: 'Daily Report', to: '/attendance/reports/daily' },
        { id: 'college-wise-summary', label: 'College Wise Summary', to: '/attendance/reports/college-wise' },
        { id: 'college-wise-summary-all-subjects', label: 'College Wise Summary- All Subject', to: '/attendance/reports/all-subjects' },
        { id: 'not-marked-report', label: 'Not Marked Report', to: '/attendance/reports/not-marked' },
        { id: 'lecture-wise-not-marked-report', label: 'Lecture Wise Not Marked Report', to: '/attendance/reports/lecture-wise' },
        { id: 'executive-daily-report', label: 'Executive Daily Report', to: '/attendance/reports/executive-daily' },
        { id: 'faculty-load-report', label: 'Faculty Load Report', to: '/attendance/reports/faculty-load' },
      ],
      leaveAttendanceMarks: [
        { id: 'applied-leave', label: 'Applied Leave', to: '/attendance/applied-leave' },
        { id: 'attendance-marks', label: 'Attendance Marks', to: '/attendance/marks' },
      ],
    },
  };

  const STUDENT_ITEMS = {
    left: [
      { id: 'student-list', label: 'Student List', to: '/students' },
      { id: 'student-list-college-wise', label: 'Student List College Wise', to: '/students/college-wise' },
      { id: 'student-certificates', label: 'Student Certificates', to: '/students/certificates' },
      { id: 'student-feedback', label: 'Student Feedback', to: '/students/feedback' },
    ],
    utilities: [
      { id: 'update-roll-number', label: 'Update Roll Number', to: '/students/update-roll' },
      { id: 'assign-university-roll', label: 'Assign University Roll No.', to: '/students/assign-roll' },
      { id: 'allocate-subjects', label: 'Allocate Subjects', to: '/students/allocate-subjects' },
      { id: 'student-session-management', label: 'Student Session Management', to: '/students/session' },
    ],
    reports: [
      { id: 'allocated-subject-report', label: 'Allocated Subject Report', to: '/students/reports/allocated-subjects' },
      { id: 'subject-wise-count-report', label: 'Subject Wise Count Report', to: '/students/reports/subject-wise' },
      { id: 'subject-combination-report', label: 'Subject Combination Wise Count Report', to: '/students/reports/subject-combination' },
    ],
    reportsSecondary: [
      { id: 'export-data', label: 'Export Data', to: '/students/reports/export' },
      { id: 'university-data', label: 'University Data', to: '/students/reports/university' },
      { id: 'strength-report', label: 'Strength Report', to: '/students/reports/strength' },
      { id: 'gender-wise-category-report', label: 'Gender Wise Category Report', to: '/students/reports/gender-wise' },
      { id: 'feedback-report', label: 'Feedback Report', to: '/students/reports/feedback' },
    ],
  };

  const handleAdmissionClick = () => {
    if (admissionRef.current) {
      const rect = admissionRef.current.getBoundingClientRect();
      const topPosition = Math.max(rect.top, 56);
      setDropdownTop(topPosition);
    }
    setShowEmployeePortal(false);
    setShowStudentDropdown(false);
    setShowFeeDropdown(false);
    setShowAdmissionDropdown((prev) => !prev);
  };

  const handleStudentClick = () => {
    if (studentRef.current) {
      const rect = studentRef.current.getBoundingClientRect();
      const topPosition = Math.max(rect.top, 56);
      setDropdownTop(topPosition);
    }
    setShowEmployeePortal(false);
    setShowAdmissionDropdown(false);
    setShowFeeDropdown(false);
    setShowStudentDropdown((prev) => !prev);
  };

  const handleFeeClick = () => {
    if (feeRef.current) {
      const rect = feeRef.current.getBoundingClientRect();
      const topPosition = Math.max(rect.top, 56);
      setDropdownTop(topPosition);
    }
    setShowEmployeePortal(false);
    setShowAdmissionDropdown(false);
    setShowStudentDropdown(false);
    setShowAttendanceDropdown(false);
    setShowFeeDropdown((prev) => !prev);
  };

  const handleAttendanceClick = () => {
    if (attendanceRef.current) {
      const rect = attendanceRef.current.getBoundingClientRect();
      const topPosition = Math.max(rect.top, 56);
      setDropdownTop(topPosition);
    }
    setShowEmployeePortal(false);
    setShowAdmissionDropdown(false);
    setShowStudentDropdown(false);
    setShowFeeDropdown(false);
    setShowAttendanceDropdown((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest('.employee-portal-dropdown') &&
        !e.target.closest('.employee-portal-trigger') &&
        !e.target.closest('.admission-dropdown') &&
        !e.target.closest('.admission-trigger') &&
        !e.target.closest('.student-dropdown') &&
        !e.target.closest('.student-trigger') &&
        !e.target.closest('.fee-dropdown') &&
        !e.target.closest('.fee-trigger') &&
        !e.target.closest('.attendance-dropdown') &&
        !e.target.closest('.attendance-trigger')
      ) {
        setShowEmployeePortal(false);
        setShowAdmissionDropdown(false);
        setShowStudentDropdown(false);
        setShowFeeDropdown(false);
        setShowAttendanceDropdown(false);
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

  const handleNavItemMouseEnter = (e) => {
    if (e.currentTarget.dataset.active === 'true') return;
    e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
    e.currentTarget.style.color = '#ffffff';
    e.currentTarget.style.borderLeft = '3px solid #4ade80';
  };

  const handleNavItemMouseLeave = (e) => {
    if (e.currentTarget.dataset.active === 'true') return;
    e.currentTarget.style.background = 'transparent';
    e.currentTarget.style.color = '#86efac';
    e.currentTarget.style.borderLeft = '3px solid transparent';
  };

  const handleDropdownItemMouseEnter = (e) => {
    const el = e.currentTarget;
    el.style.background = '#f0fdf4';
    el.style.color = '#059669';
    el.style.borderLeft = '3px solid #059669';
    el.style.fontWeight = '600';
    el.style.paddingLeft = '9px';
  };

  const handleDropdownItemMouseLeave = (e) => {
    const el = e.currentTarget;
    el.style.background = 'white';
    el.style.color = '#334155';
    el.style.borderLeft = '3px solid transparent';
    el.style.fontWeight = '500';
    el.style.paddingLeft = '12px';
  };

  const renderLink = (item) => {
    const Icon = item.icon;
    const isActive = item.to && (location.pathname === item.to || location.pathname.startsWith(`${item.to}/`));
    const navItemStyle = {
      height: 44,
      color: isActive ? '#ffffff' : '#86efac',
      background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
      borderLeft: isActive ? '3px solid #4ade80' : '3px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      fontWeight: isActive ? 600 : 500,
    };

    if (item.id === 'employee-portal') {
      return (
        <div
          key={item.id}
          ref={employeePortalRef}
          className="employee-portal-trigger flex items-center px-3"
          onClick={handleEmployeePortalClick}
          onMouseEnter={handleNavItemMouseEnter}
          onMouseLeave={handleNavItemMouseLeave}
          data-active={isActive ? 'true' : 'false'}
          style={navItemStyle}
        >
          <div style={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icon ? <Icon style={{ width: 18, height: 18, color: isActive ? '#ffffff' : '#86efac' }} /> : null}
          </div>
          <div style={{ marginLeft: 12, fontSize: 13, color: isActive ? '#ffffff' : '#86efac' }}>{item.label}</div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            <span style={{ color: isActive ? '#ffffff' : '#86efac' }}>▾</span>
          </div>
        </div>
      );
    }

    if (item.id === 'admission') {
      return (
        <div
          key={item.id}
          ref={admissionRef}
          className="admission-trigger flex items-center px-3"
          onClick={handleAdmissionClick}
          onMouseEnter={handleNavItemMouseEnter}
          onMouseLeave={handleNavItemMouseLeave}
          data-active={isActive ? 'true' : 'false'}
          style={navItemStyle}
        >
          <div style={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icon ? <Icon style={{ width: 18, height: 18, color: isActive ? '#ffffff' : '#86efac' }} /> : null}
          </div>
          <div style={{ marginLeft: 12, fontSize: 13, color: isActive ? '#ffffff' : '#86efac' }}>{item.label}</div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}>
            <ChevronRight style={{ width: 16, height: 16, color: isActive ? '#ffffff' : '#86efac', transform: showAdmissionDropdown ? 'rotate(90deg)' : 'rotate(0deg)' }} />
          </div>
        </div>
      );
    }
    if (item.id === 'student') {
      return (
        <div
          key={item.id}
          ref={studentRef}
          className="student-trigger flex items-center px-3"
          onClick={handleStudentClick}
          onMouseEnter={handleNavItemMouseEnter}
          onMouseLeave={handleNavItemMouseLeave}
          data-active={isActive ? 'true' : 'false'}
          style={navItemStyle}
        >
          <div style={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icon ? <Icon style={{ width: 18, height: 18, color: isActive ? '#ffffff' : '#86efac' }} /> : null}
          </div>
          <div style={{ marginLeft: 12, fontSize: 13, color: isActive ? '#ffffff' : '#86efac' }}>{item.label}</div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}>
            <ChevronDown style={{ width: 16, height: 16, color: isActive ? '#ffffff' : '#86efac', transform: showStudentDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </div>
        </div>
      );
    }
    if (item.id === 'fee') {
      return (
        <div
          key={item.id}
          ref={feeRef}
          className="fee-trigger flex items-center px-3"
          onClick={handleFeeClick}
          onMouseEnter={handleNavItemMouseEnter}
          onMouseLeave={handleNavItemMouseLeave}
          data-active={isActive ? 'true' : 'false'}
          style={navItemStyle}
        >
          <div style={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icon ? <Icon style={{ width: 18, height: 18, color: isActive ? '#ffffff' : '#86efac' }} /> : null}
          </div>
          <div style={{ marginLeft: 12, fontSize: 13, color: isActive ? '#ffffff' : '#86efac' }}>{item.label}</div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}>
            <ChevronDown style={{ width: 16, height: 16, color: isActive ? '#ffffff' : '#86efac', transform: showFeeDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </div>
        </div>
      );
    }

    if (item.id === 'attendance') {
      return (
        <div
          key={item.id}
          ref={attendanceRef}
          className="attendance-trigger flex items-center px-3"
          onClick={handleAttendanceClick}
          onMouseEnter={handleNavItemMouseEnter}
          onMouseLeave={handleNavItemMouseLeave}
          data-active={isActive ? 'true' : 'false'}
          style={navItemStyle}
        >
          <div style={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icon ? <Icon style={{ width: 18, height: 18, color: isActive ? '#ffffff' : '#86efac' }} /> : null}
          </div>
          <div style={{ marginLeft: 12, fontSize: 13, color: isActive ? '#ffffff' : '#86efac' }}>{item.label}</div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}>
            <ChevronDown style={{ width: 16, height: 16, color: isActive ? '#ffffff' : '#86efac', transform: showAttendanceDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </div>
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
        onMouseEnter={handleNavItemMouseEnter}
        onMouseLeave={handleNavItemMouseLeave}
        data-active={isActive ? 'true' : 'false'}
        style={navItemStyle}
      >
        <div style={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icon ? <Icon style={{ width: 18, height: 18, color: isActive ? '#ffffff' : '#86efac' }} /> : null}
        </div>
        <div style={{ marginLeft: 12, fontSize: 13, color: isActive ? '#ffffff' : '#86efac' }}>{item.label}</div>
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
                onMouseEnter={handleDropdownItemMouseEnter}
                onMouseLeave={handleDropdownItemMouseLeave}
                className="group flex items-center rounded"
                style={{
                  padding: '9px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#334155',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderLeft: '3px solid transparent',
                  transition: 'all 0.15s ease',
                  textDecoration: 'none',
                }}
              >
                <span>{portalItem.label}</span>
                <Star className="group-hover:text-amber-500" style={{ width: 14, height: 14, color: '#94a3b8' }} />
              </Link>
            ))}
          </div>,
          document.body
        )}

        {showAdmissionDropdown && ReactDOM.createPortal(
          <div
            className="admission-dropdown"
            style={{
              position: 'fixed',
              left: 200,
              top: Math.max(dropdownTop, 56) + 'px',
              width: 520,
              zIndex: 200,
              background: 'white',
              borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              padding: 12,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 0,
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ borderRight: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 12px 8px' }}>
                STUDENT REGISTRATION
              </div>
              {ADMISSION_ITEMS.left.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowAdmissionDropdown(false)}
                  onMouseEnter={handleDropdownItemMouseEnter}
                  onMouseLeave={handleDropdownItemMouseLeave}
                  className="group flex items-center rounded-[8px]"
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderLeft: '3px solid transparent',
                    transition: 'all 0.15s ease',
                    textDecoration: 'none',
                    margin: '4px 12px 4px 12px',
                  }}
                >
                  <span>{portalItem.label}</span>
                  <Star className="group-hover:text-amber-500" style={{ width: 14, height: 14, color: '#cbd5e1' }} />
                </Link>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 12px 8px' }}>
                ADMISSION REPORTS
              </div>
              {ADMISSION_ITEMS.right.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowAdmissionDropdown(false)}
                  onMouseEnter={handleDropdownItemMouseEnter}
                  onMouseLeave={handleDropdownItemMouseLeave}
                  className="group flex items-center rounded-[8px]"
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderLeft: '3px solid transparent',
                    transition: 'all 0.15s ease',
                    textDecoration: 'none',
                    margin: '4px 12px 4px 12px',
                  }}
                >
                  <span>{portalItem.label}</span>
                  <Star className="group-hover:text-amber-500" style={{ width: 14, height: 14, color: '#cbd5e1' }} />
                </Link>
              ))}
            </div>
          </div>,
          document.body
        )}
        {showStudentDropdown && ReactDOM.createPortal(
          <div
            className="student-dropdown"
            style={{
              position: 'fixed',
              left: 200,
              top: Math.max(dropdownTop, 56) + 'px',
              width: 560,
              zIndex: 200,
              background: 'white',
              borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              padding: 12,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 0,
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ borderRight: '1px solid #f1f5f9' }}>
              <div style={{ marginTop: 12, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 12px 4px' }}>
                STUDENT
              </div>
              {STUDENT_ITEMS.left.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowStudentDropdown(false)}
                  onMouseEnter={handleDropdownItemMouseEnter}
                  onMouseLeave={handleDropdownItemMouseLeave}
                  className="group flex items-center rounded-[8px]"
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderLeft: '3px solid transparent',
                    transition: 'all 0.15s ease',
                    textDecoration: 'none',
                    margin: '4px 12px 4px 12px',
                  }}
                >
                  <span>{portalItem.label}</span>
                  <Star className="group-hover:text-amber-500" style={{ width: 14, height: 14, color: '#cbd5e1' }} />
                </Link>
              ))}
              <div style={{ marginTop: 12, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 12px 4px' }}>
                STUDENT UTILITIES
              </div>
              {STUDENT_ITEMS.utilities.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowStudentDropdown(false)}
                  onMouseEnter={handleDropdownItemMouseEnter}
                  onMouseLeave={handleDropdownItemMouseLeave}
                  className="group flex items-center rounded-[8px]"
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderLeft: '3px solid transparent',
                    transition: 'all 0.15s ease',
                    textDecoration: 'none',
                    margin: '4px 12px 4px 12px',
                  }}
                >
                  <span>{portalItem.label}</span>
                  <Star className="group-hover:text-amber-500" style={{ width: 14, height: 14, color: '#cbd5e1' }} />
                </Link>
              ))}
            </div>
            <div>
              <div style={{ marginTop: 12, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 12px 4px' }}>
                STUDENT ACADEMIC REPORTS
              </div>
              {STUDENT_ITEMS.reports.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowStudentDropdown(false)}
                  onMouseEnter={handleDropdownItemMouseEnter}
                  onMouseLeave={handleDropdownItemMouseLeave}
                  className="group flex items-center rounded-[8px]"
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderLeft: '3px solid transparent',
                    transition: 'all 0.15s ease',
                    textDecoration: 'none',
                    margin: '4px 12px 4px 12px',
                  }}
                >
                  <span>{portalItem.label}</span>
                  <Star className="group-hover:text-amber-500" style={{ width: 14, height: 14, color: '#cbd5e1' }} />
                </Link>
              ))}
              <div style={{ marginTop: 12, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 12px 4px' }}>
                STUDENT REPORTS
              </div>
              {STUDENT_ITEMS.reportsSecondary.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowStudentDropdown(false)}
                  onMouseEnter={handleDropdownItemMouseEnter}
                  onMouseLeave={handleDropdownItemMouseLeave}
                  className="group flex items-center rounded-[8px]"
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderLeft: '3px solid transparent',
                    transition: 'all 0.15s ease',
                    textDecoration: 'none',
                    margin: '4px 12px 4px 12px',
                  }}
                >
                  <span>{portalItem.label}</span>
                  <Star className="group-hover:text-amber-500" style={{ width: 14, height: 14, color: '#cbd5e1' }} />
                </Link>
              ))}
            </div>
          </div>,
          document.body
        )}
        {showFeeDropdown && ReactDOM.createPortal(
          <div
            className="fee-dropdown"
            style={{
              position: 'fixed',
              left: 200,
              top: Math.max(dropdownTop, 56) + 'px',
              width: 580,
              maxHeight: 'calc(100vh - 70px)',
              overflowY: 'auto',
              zIndex: 200,
              background: 'white',
              borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              padding: 12,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 0,
            }}
          >
            <style>{`.fee-dropdown::-webkit-scrollbar { width: 4px; }
.fee-dropdown::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }`}</style>
            <div style={{ borderRight: '1px solid #f1f5f9' }}>
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
                COLLECT FEE
              </div>
              {FEE_ITEMS.left.collectFee.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowFeeDropdown(false)}
                  onMouseEnter={handleDropdownItemMouseEnter}
                  onMouseLeave={handleDropdownItemMouseLeave}
                  className="group flex items-center rounded-[8px]"
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderLeft: '3px solid transparent',
                    transition: 'all 0.15s ease',
                    textDecoration: 'none',
                    margin: '4px 12px 4px 12px',
                  }}
                >
                  <span>{portalItem.label}</span>
                  <Star className="group-hover:text-amber-500" style={{ width: 14, height: 14, color: '#cbd5e1' }} />
                </Link>
              ))}
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
                OTHER INCOME
              </div>
              {FEE_ITEMS.left.otherIncome.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowFeeDropdown(false)}
                  onMouseEnter={handleDropdownItemMouseEnter}
                  onMouseLeave={handleDropdownItemMouseLeave}
                  className="group flex items-center rounded-[8px]"
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderLeft: '3px solid transparent',
                    transition: 'all 0.15s ease',
                    textDecoration: 'none',
                    margin: '4px 12px 4px 12px',
                  }}
                >
                  <span>{portalItem.label}</span>
                  <Star className="group-hover:text-amber-500" style={{ width: 14, height: 14, color: '#cbd5e1' }} />
                </Link>
              ))}
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
                TRANSACTION
              </div>
              {FEE_ITEMS.left.transaction.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowFeeDropdown(false)}
                  onMouseEnter={handleDropdownItemMouseEnter}
                  onMouseLeave={handleDropdownItemMouseLeave}
                  className="group flex items-center rounded-[8px]"
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderLeft: '3px solid transparent',
                    transition: 'all 0.15s ease',
                    textDecoration: 'none',
                    margin: '4px 12px 4px 12px',
                  }}
                >
                  <span>{portalItem.label}</span>
                  <Star className="group-hover:text-amber-500" style={{ width: 14, height: 14, color: '#cbd5e1' }} />
                </Link>
              ))}
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
                CONCESSION
              </div>
              {FEE_ITEMS.left.concession.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowFeeDropdown(false)}
                  onMouseEnter={handleDropdownItemMouseEnter}
                  onMouseLeave={handleDropdownItemMouseLeave}
                  className="group flex items-center rounded-[8px]"
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderLeft: '3px solid transparent',
                    transition: 'all 0.15s ease',
                    textDecoration: 'none',
                    margin: '4px 12px 4px 12px',
                  }}
                >
                  <span>{portalItem.label}</span>
                  <Star className="group-hover:text-amber-500" style={{ width: 14, height: 14, color: '#cbd5e1' }} />
                </Link>
              ))}
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
                REFUND
              </div>
              {FEE_ITEMS.left.refund.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowFeeDropdown(false)}
                  onMouseEnter={handleDropdownItemMouseEnter}
                  onMouseLeave={handleDropdownItemMouseLeave}
                  className="group flex items-center rounded-[8px]"
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderLeft: '3px solid transparent',
                    transition: 'all 0.15s ease',
                    textDecoration: 'none',
                    margin: '4px 12px 4px 12px',
                  }}
                >
                  <span>{portalItem.label}</span>
                  <Star className="group-hover:text-amber-500" style={{ width: 14, height: 14, color: '#cbd5e1' }} />
                </Link>
              ))}
            </div>
            <div>
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
                FEE REPORTS
              </div>
              {FEE_ITEMS.right.feeReports.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowFeeDropdown(false)}
                  onMouseEnter={handleDropdownItemMouseEnter}
                  onMouseLeave={handleDropdownItemMouseLeave}
                  className="group flex items-center rounded-[8px]"
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderLeft: '3px solid transparent',
                    transition: 'all 0.15s ease',
                    textDecoration: 'none',
                    margin: '4px 12px 4px 12px',
                  }}
                >
                  <span>{portalItem.label}</span>
                  <Star className="group-hover:text-amber-500" style={{ width: 14, height: 14, color: '#cbd5e1' }} />
                </Link>
              ))}
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
                FEE SUMMARY
              </div>
              {FEE_ITEMS.right.feeSummary.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowFeeDropdown(false)}
                  onMouseEnter={handleDropdownItemMouseEnter}
                  onMouseLeave={handleDropdownItemMouseLeave}
                  className="group flex items-center rounded-[8px]"
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderLeft: '3px solid transparent',
                    transition: 'all 0.15s ease',
                    textDecoration: 'none',
                    margin: '4px 12px 4px 12px',
                  }}
                >
                  <span>{portalItem.label}</span>
                  <Star className="group-hover:text-amber-500" style={{ width: 14, height: 14, color: '#cbd5e1' }} />
                </Link>
              ))}
            </div>
          </div>,
          document.body
        )}
        {showAttendanceDropdown && ReactDOM.createPortal(
          <div
            className="attendance-dropdown"
            style={{
              position: 'fixed',
              left: 200,
              top: Math.max(dropdownTop, 56) + 'px',
              width: 560,
              maxHeight: 'calc(100vh - 70px)',
              overflowY: 'auto',
              zIndex: 200,
              background: 'white',
              borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              padding: 12,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 0,
            }}
          >
            <div style={{ borderRight: '1px solid #f1f5f9' }}>
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
                MARK ATTENDANCE
              </div>
              {ATTENDANCE_ITEMS.left.markAttendance.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowAttendanceDropdown(false)}
                  onMouseEnter={handleDropdownItemMouseEnter}
                  onMouseLeave={handleDropdownItemMouseLeave}
                  className="group flex items-center rounded-[8px]"
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderLeft: '3px solid transparent',
                    transition: 'all 0.15s ease',
                    textDecoration: 'none',
                    margin: '4px 12px 4px 12px',
                  }}
                >
                  <span>{portalItem.label}</span>
                  <Star className="group-hover:text-amber-500" style={{ width: 14, height: 14, color: '#cbd5e1' }} />
                </Link>
              ))}
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
                TIME TABLE
              </div>
              {ATTENDANCE_ITEMS.left.timetable.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowAttendanceDropdown(false)}
                  onMouseEnter={handleDropdownItemMouseEnter}
                  onMouseLeave={handleDropdownItemMouseLeave}
                  className="group flex items-center rounded-[8px]"
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderLeft: '3px solid transparent',
                    transition: 'all 0.15s ease',
                    textDecoration: 'none',
                    margin: '4px 12px 4px 12px',
                  }}
                >
                  <span>{portalItem.label}</span>
                  <Star className="group-hover:text-amber-500" style={{ width: 14, height: 14, color: '#cbd5e1' }} />
                </Link>
              ))}
            </div>
            <div>
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
                ATTENDANCE REPORTS
              </div>
              {ATTENDANCE_ITEMS.right.attendanceReports.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowAttendanceDropdown(false)}
                  onMouseEnter={handleDropdownItemMouseEnter}
                  onMouseLeave={handleDropdownItemMouseLeave}
                  className="group flex items-center rounded-[8px]"
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderLeft: '3px solid transparent',
                    transition: 'all 0.15s ease',
                    textDecoration: 'none',
                    margin: '4px 12px 4px 12px',
                  }}
                >
                  <span>{portalItem.label}</span>
                  <Star className="group-hover:text-amber-500" style={{ width: 14, height: 14, color: '#cbd5e1' }} />
                </Link>
              ))}
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
                LEAVE & ATTENDANCE MARKS
              </div>
              {ATTENDANCE_ITEMS.right.leaveAttendanceMarks.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowAttendanceDropdown(false)}
                  onMouseEnter={handleDropdownItemMouseEnter}
                  onMouseLeave={handleDropdownItemMouseLeave}
                  className="group flex items-center rounded-[8px]"
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderLeft: '3px solid transparent',
                    transition: 'all 0.15s ease',
                    textDecoration: 'none',
                    margin: '4px 12px 4px 12px',
                  }}
                >
                  <span>{portalItem.label}</span>
                  <Star className="group-hover:text-amber-500" style={{ width: 14, height: 14, color: '#cbd5e1' }} />
                </Link>
              ))}
            </div>
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

