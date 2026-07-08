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
  const [showExaminationDropdown, setShowExaminationDropdown] = useState(false);
  const [showCOEDropdown, setShowCOEDropdown] = useState(false);
  const [showFeedbackDropdown, setShowFeedbackDropdown] = useState(false);
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false);
  const [showLessonDropdown, setShowLessonDropdown] = useState(false);
  const [showHRMDropdown, setShowHRMDropdown] = useState(false);
  const [showLibraryDropdown, setShowLibraryDropdown] = useState(false);
  const [showFrontDeskDropdown, setShowFrontDeskDropdown] = useState(false);
  const [showCommunicationDropdown, setShowCommunicationDropdown] = useState(false);
  const [showTransportDropdown, setShowTransportDropdown] = useState(false);
  const [showHostelDropdown, setShowHostelDropdown] = useState(false);
  const [showAdvancedDropdown, setShowAdvancedDropdown] = useState(false);
  const employeePortalRef = useRef(null);
  const advancedRef = useRef(null);
  const admissionRef = useRef(null);
  const studentRef = useRef(null);
  const feeRef = useRef(null);
  const attendanceRef = useRef(null);
  const examinationRef = useRef(null);
  const coeRef = useRef(null);
  const feedbackRef = useRef(null);
  const universityRef = useRef(null);
  const lessonRef = useRef(null);
  const hrmRef = useRef(null);
  const libraryRef = useRef(null);
  const frontDeskRef = useRef(null);
  const communicationRef = useRef(null);
  const transportRef = useRef(null);
  const hostelRef = useRef(null);
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

  const EXAMINATION_ITEMS = {
    left: {
      marksEntry: [
        { id: 'assessment-wise-marks-entry', label: 'Assessment Wise Marks Entry', to: '/examination/assessment-marks' },
        { id: 'subject-wise-marks-entry', label: 'Subject Wise Marks Entry', to: '/examination/subject-marks' },
      ],
    },
    right: {
      report: [
        { id: 'assessment-wise-report', label: 'Assessment Wise Report', to: '/examination/reports/assessment' },
        { id: 'green-sheet', label: 'Green Sheet', to: '/examination/reports/green-sheet' },
        { id: 'university-green-sheet', label: 'University Green Sheet', to: '/examination/reports/university-green' },
        { id: 'report-card', label: 'Report Card', to: '/examination/reports/report-card' },
        { id: 'pending-assessment-marks', label: 'Pending Assessment Marks', to: '/examination/reports/pending-marks' },
        { id: 'exam-analysis-report', label: 'Exam Analysis Report', to: '/examination/reports/analysis' },
        { id: 'detailed-marks-certificate-report', label: 'Detailed Marks Certificate Report', to: '/examination/reports/certificate' },
      ],
    },
  };

  const COE_ITEMS = {
    left: {
      examMaster: [
        { id: 'exam-master', label: 'Exam Master', to: '/coe/exam-master' },
        { id: 'datesheet', label: 'Datesheet', to: '/coe/datesheet' },
        { id: 'exam-configuration', label: 'Exam Configuration', to: '/coe/configuration' },
      ],
      examRegistration: [
        { id: 'exam-registration', label: 'Exam Registration', to: '/coe/registration' },
        { id: 'approve-exam-registration', label: 'Approve Exam Registration', to: '/coe/approve-registration' },
        { id: 'pending-registration-report', label: 'Pending Registration Report', to: '/coe/pending-registration' },
        { id: 'transactions-list', label: 'Transactions List', to: '/coe/transactions' },
        { id: 'issue-admit-card', label: 'Issue Admit Card', to: '/coe/admit-card' },
      ],
      examDayOperation: [
        { id: 'daily-exam-dashboard', label: 'Daily Exam Dashboard', to: '/coe/daily-dashboard' },
        { id: 'exam-attendance', label: 'Exam Attendance', to: '/coe/exam-attendance' },
        { id: 'exam-attendance-report', label: 'Exam Attendance Report', to: '/coe/attendance-report' },
        { id: 'attendance-sheet', label: 'Attendance Sheet', to: '/coe/attendance-sheet' },
        { id: 'question-co-mapping', label: 'Question CO Mapping', to: '/coe/question-mapping' },
      ],
    },
    right: {
      marksEntry: [
        { id: 'admin-marks-entry', label: 'Admin Marks Entry', to: '/coe/admin-marks' },
        { id: 'theory-marks-entry', label: 'Theory Marks Entry', to: '/coe/theory-marks' },
        { id: 'practical-marks-entry', label: 'Practical Marks Entry', to: '/coe/practical-marks' },
        { id: 'internal-marks-entry', label: 'Internal Marks Entry', to: '/coe/internal-marks' },
        { id: 'pending-marks-entry-report', label: 'Pending Marks Entry Report', to: '/coe/pending-marks' },
      ],
      result: [
        { id: 'subject-wise-marks-report', label: 'Subject Wise Marks Report', to: '/coe/reports/subject-wise' },
        { id: 'type-wise-marks-report', label: 'Type Wise Marks Report', to: '/coe/reports/type-wise' },
        { id: 'result-analysis-report', label: 'Result Analysis Report', to: '/coe/reports/analysis' },
        { id: 'result-declare', label: 'Result Declare', to: '/coe/result-declare' },
        { id: 'result-sheet', label: 'Result Sheet', to: '/coe/result-sheet' },
        { id: 'digi-locker-report', label: 'Digi Locker Report', to: '/coe/digi-locker' },
        { id: 'student-dmc', label: 'Student DMC', to: '/coe/student-dmc' },
      ],
    },
  };

  const HRM_ITEMS = {
    left: {
      hrm: [
        { id: 'employee', label: 'Employee', to: '/employees', favorite: true },
        { id: 'manage-employee', label: 'Manage Employee', to: '/employees/manage' },
        { id: 'employee-entitled-leaves', label: 'Employee Entitled Leaves', to: '/employees/entitled-leaves' },
        { id: 'attendance-calendar', label: 'Attendance Calendar', to: '/employees/attendance-calendar' },
        { id: 'assign-salary-template', label: 'Assign Salary Template', to: '/employees/assign-salary-template' },
        { id: 'manage-salary-templates', label: 'Manage Salary Templates', to: '/employees/manage-salary-templates' },
      ],
      employeeReports: [
        { id: 'employee-report', label: 'Employee Report', to: '/employees/reports/employee', favorite: true },
        { id: 'leave-type-report', label: 'Leave Type Report', to: '/employees/reports/leave-type' },
        { id: 'attendance-time-report', label: 'Attendance Time Report', to: '/employees/reports/attendance-time' },
        { id: 'attendance-report', label: 'Attendance Report', to: '/employees/reports/attendance' },
        { id: 'daily-attendance-report-department-wise', label: 'Daily Attendance Report Department Wise', to: '/employees/reports/daily-attendance-department' },
        { id: 'absentees-late-arrival-report', label: 'Absentees & Late Arrival Report', to: '/employees/reports/absentees-late-arrival' },
        { id: 'leave-approval-report', label: 'Leave Approval Report', to: '/employees/reports/leave-approval' },
        { id: 'attendance-logs', label: 'Attendance Logs', to: '/employees/reports/attendance-logs' },
        { id: 'working-hour-report', label: 'Working Hour Report', to: '/employees/reports/working-hour' },
      ],
    },
    right: {
      employeeAttendance: [
        { id: 'mark-attendance-day-wise', label: 'Mark Attendance Day Wise', to: '/employees/attendance/day-wise' },
        { id: 'mark-attendance-month-wise', label: 'Mark Attendance Month Wise', to: '/employees/attendance/month-wise' },
        { id: 'biometric-attendance', label: 'Biometric Attendance', to: '/employees/attendance/biometric' },
        { id: 'attendance-regularization', label: 'Attendance Regularization', to: '/employees/attendance/regularization' },
      ],
      processSalaryReport: [
        { id: 'compute-attendance', label: 'Compute Attendance', to: '/employees/reports/compute-attendance' },
        { id: 'salary-summary-month-wise', label: 'Salary Summary Month Wise', to: '/employees/reports/salary-summary-month-wise' },
      ],
      salaryReports: [
        { id: 'salary-slip', label: 'Salary Slip', to: '/employees/reports/salary-slip' },
        { id: 'employee-salary-report', label: 'Employee Salary Report', to: '/employees/reports/salary' },
        { id: 'employee-salary-register', label: 'Employee Salary Register', to: '/employees/reports/salary-register' },
        { id: 'employee-salary-report-multiple-months', label: 'Employee Salary Report - Multiple Months', to: '/employees/reports/salary-multiple-months' },
        { id: 'assign-salary-template-report', label: 'Assign Salary Template', to: '/employees/assign-salary-template' },
        { id: 'arrear-salary-report', label: 'Arrear Salary Report', to: '/employees/reports/arrear-salary' },
        { id: 'earning-deduction-register', label: 'Earning & Deduction Register', to: '/employees/reports/earning-deduction-register' },
        { id: 'pf-challan-report', label: 'PF Challan Report', to: '/employees/reports/pf-challan' },
      ],
    },
  };

  const LIBRARY_ITEMS = {
    left: {
      library: [
        { id: 'books', label: 'Books', to: '/library/books', favorite: true },
        { id: 'issue-book', label: 'Issue Book', to: '/library/issue-book' },
        { id: 'issue-book-college-wise', label: 'Issue Book College Wise', to: '/library/issue-book-college-wise' },
        { id: 'issued-books', label: 'Issued Books', to: '/library/issued-books' },
        { id: 'stock-verify', label: 'Stock Verify', to: '/library/stock-verify' },
        { id: 'library-visitor', label: 'Library Visitor', to: '/library/visitor' },
        { id: 'digital-library', label: 'Digital Library', to: '/library/digital' },
      ],
      serialManagement: [
        { id: 'serial-subscription', label: 'Serial Subscription', to: '/library/serial-subscription' },
        { id: 'serial-collection', label: 'Serial Collection', to: '/library/serial-collection' },
        { id: 'serial-collection-report', label: 'Serial Collection Report', to: '/library/serial-collection-report' },
      ],
    },
    right: {
      libraryReports: [
        { id: 'library-reports', label: 'Library Reports', to: '/library/reports/library-reports' },
        { id: 'library-issued-books-report', label: 'Library Issued Books Report', to: '/library/reports/issued-books' },
        { id: 'library-collection-report', label: 'Library Collection Report', to: '/library/reports/collection' },
        { id: 'quick-report', label: 'Quick Report', to: '/library/reports/quick' },
        { id: 'date-wise-issue-return', label: 'Date Wise Issue/Return Report', to: '/library/reports/date-wise-issue-return' },
        { id: 'member-type-issued-count', label: 'Member Type Wise Issued Count', to: '/library/reports/member-type-issued-count' },
        { id: 'title-subtitle-summary', label: 'Title & Subtitle Category Summary Report', to: '/library/reports/title-subtitle-summary' },
        { id: 'webopac-report', label: 'WebOPAC Report', to: '/library/reports/webopac' },
      ],
      webopac: [
        { id: 'webopac', label: 'WebOPAC', to: '/library/webopac' },
      ],
    },
  };

  const FRONT_DESK_ITEMS = [
    { id: 'visitor', label: 'Visitor', to: '/front-desk/visitor' },
    { id: 'gate-pass', label: 'Gate Pass', to: '/front-desk/gate-pass' },
    { id: 'hostel-gate-pass-qr', label: 'Hostel Gate Pass QR', to: '/front-desk/hostel-gate-pass-qr' },
    { id: 'gate-pass-qr', label: 'Gate Pass QR', to: '/front-desk/gate-pass-qr' },
  ];

  const COMMUNICATION_ITEMS = [
    { id: 'send-text-sms', label: 'Send Text SMS', to: '/communication/send-text-sms' },
    { id: 'send-whatsapp-message', label: 'Send Whatsapp Message', to: '/communication/send-whatsapp-message' },
    { id: 'report', label: 'Report', to: '/communication/report' },
    { id: 'employee-announcement', label: 'Employee Announcement', to: '/communication/employee-announcement' },
  ];

  const TRANSPORT_ITEMS = [
    { id: 'vehicles', label: 'Vehicles', to: '/transport/vehicles' },
    { id: 'drivers', label: 'Drivers', to: '/transport/drivers' },
    { id: 'conductors', label: 'Conductors', to: '/transport/conductors' },
    { id: 'routes', label: 'Routes', to: '/transport/routes' },
    { id: 'stops', label: 'Stops', to: '/transport/stops' },
    { id: 'student-assignments', label: 'Student Assignments', to: '/transport/student-assignments' },
    { id: 'employee-assignments', label: 'Employee Assignments', to: '/transport/employee-assignments' },
    { id: 'fuel', label: 'Fuel', to: '/transport/fuel' },
    { id: 'maintenance', label: 'Maintenance', to: '/transport/maintenance' },
  ];

  const HOSTEL_ITEMS = {
    left: [
      { id: 'hostel-report', label: 'Hostel Report', to: '/hostel/report' },
      { id: 'occupancy-report', label: 'Occupancy Report', to: '/hostel/occupancy-report' },
      { id: 'hostel-attendance', label: 'Hostel Attendance', to: '/hostel/attendance' },
      { id: 'hostel-qr-generator', label: 'Hostel QR Generator', to: '/hostel/qr-generator' },
      { id: 'live-hostel-attendance', label: 'Live Hostel Attendance', to: '/hostel/live-attendance' },
      { id: 'hostel-attendance-report', label: 'Hostel Attendance Report', to: '/hostel/attendance-report' },
      { id: 'hostel-unmarked-report', label: 'Hostel UnMarked Report', to: '/hostel/unmarked-report' },
      { id: 'hostel-gate-pass', label: 'Hostel Gate Pass', to: '/hostel/gate-pass' },
    ],
    right: [
      { id: 'mess-attendance', label: 'Mess Attendance', to: '/hostel/mess-attendance' },
      { id: 'summary-report', label: 'Summary Report', to: '/hostel/mess-summary-report' },
      { id: 'detailed-report', label: 'Detailed Report', to: '/hostel/mess-detailed-report' },
      { id: 'meal-feedback-report', label: 'Meal Feedback Report', to: '/hostel/meal-feedback-report' },
    ],
  };

  const ADVANCED_ITEMS = [
    { id: 'seminar', label: 'Seminar', to: '/advanced/seminar' },
    { id: 'events', label: 'Events', to: '/advanced/events' },
    { id: 'research-publication', label: 'Research Publication', to: '/advanced/research' },
    { id: 'book-chapter', label: 'Book/Chapter/Proceeding', to: '/advanced/book-chapter' },
    { id: 'resource-person', label: 'Resource Person', to: '/advanced/resource-person' },
    { id: 'incentive-report', label: 'Incentive Report', to: '/advanced/incentive-report' },
  ];

  const FEEDBACK_ITEMS = {
    left: [
      { id: 'student-feedback-form', label: 'Student Feedback Form', to: '/feedback/form' },
      { id: 'feedback-submissions', label: 'Feedback Submissions', to: '/feedback/submissions' },
      { id: 'feedback-dashboard', label: 'Feedback Dashboard', to: '/feedback/dashboard' },
      { id: 'response-management', label: 'Response Management', to: '/feedback/response-management' },
    ],
    right: [
      { id: 'feedback-summary-report', label: 'Feedback Summary Report', to: '/feedback/reports/summary' },
      { id: 'feedback-analysis-report', label: 'Feedback Analysis Report', to: '/feedback/reports/analysis' },
      { id: 'feedback-trend-report', label: 'Feedback Trend Report', to: '/feedback/reports/trends' },
      { id: 'student-feedback-report', label: 'Student Feedback Report', to: '/feedback/reports/student' },
    ],
  };

  const UNIVERSITY_COMMUNICATION_ITEMS = [
    { id: 'assignment', label: 'Assignment', to: '/notifications/assignment' },
    { id: 'notes', label: 'Notes', to: '/notifications/notes' },
    { id: 'notes-new', label: 'Notes New', to: '/notifications/notes-new' },
    { id: 'circular', label: 'Circular', to: '/notifications/circular' },
    { id: 'notice', label: 'Notice', to: '/notifications/notice', favorite: true },
    { id: 'syllabus', label: 'Syllabus', to: '/notifications/syllabus' },
    { id: 'date-sheet', label: 'Date Sheet', to: '/notifications/date-sheet' },
    { id: 'e-learning', label: 'E-Learning', to: '/notifications/e-learning' },
    { id: 'time-table', label: 'Time Table', to: '/notifications/time-table' },
  ];

  const LESSON_ITEMS = [
    { id: 'lesson-management', label: 'Lesson Management', to: '/lesson/management' },
    { id: 'subject-wise-report', label: 'Subject Wise Report', to: '/lesson/subject-wise-report' },
  ];

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
    setShowExaminationDropdown(false);
    setShowAttendanceDropdown((prev) => !prev);
  };

  const handleExaminationClick = () => {
    if (examinationRef.current) {
      const rect = examinationRef.current.getBoundingClientRect();
      const topPosition = Math.max(rect.top, 56);
      setDropdownTop(topPosition);
    }
    setShowEmployeePortal(false);
    setShowAdmissionDropdown(false);
    setShowStudentDropdown(false);
    setShowFeeDropdown(false);
    setShowAttendanceDropdown(false);
    setShowCOEDropdown(false);
    setShowExaminationDropdown((prev) => !prev);
  };

  const handleCOEClick = () => {
    if (coeRef.current) {
      const rect = coeRef.current.getBoundingClientRect();
      const topPosition = Math.max(rect.top, 56);
      setDropdownTop(topPosition);
    }
    setShowEmployeePortal(false);
    setShowAdmissionDropdown(false);
    setShowStudentDropdown(false);
    setShowFeeDropdown(false);
    setShowAttendanceDropdown(false);
    setShowExaminationDropdown(false);
    setShowFeedbackDropdown(false);
    setShowUniversityDropdown(false);
    setShowLessonDropdown(false);
    setShowHRMDropdown(false);
    setShowCOEDropdown((prev) => !prev);
  };

  const handleAdvancedClick = () => {
    if (advancedRef.current) {
      const rect = advancedRef.current.getBoundingClientRect();
      const topPosition = Math.max(rect.top, 56);
      setDropdownTop(topPosition);
    }
    setShowEmployeePortal(false);
    setShowAdmissionDropdown(false);
    setShowStudentDropdown(false);
    setShowFeeDropdown(false);
    setShowAttendanceDropdown(false);
    setShowExaminationDropdown(false);
    setShowCOEDropdown(false);
    setShowFeedbackDropdown(false);
    setShowUniversityDropdown(false);
    setShowLessonDropdown(false);
    setShowHRMDropdown(false);
    setShowLibraryDropdown(false);
    setShowFrontDeskDropdown(false);
    setShowCommunicationDropdown(false);
    setShowHostelDropdown(false);
    setShowTransportDropdown(false);
    setShowAdvancedDropdown((prev) => !prev);
  };

  const handleHRMClick = () => {
    if (hrmRef.current) {
      const rect = hrmRef.current.getBoundingClientRect();
      const topPosition = Math.max(rect.top, 56);
      setDropdownTop(topPosition);
    }
    setShowEmployeePortal(false);
    setShowAdmissionDropdown(false);
    setShowStudentDropdown(false);
    setShowFeeDropdown(false);
    setShowAttendanceDropdown(false);
    setShowExaminationDropdown(false);
    setShowCOEDropdown(false);
    setShowFeedbackDropdown(false);
    setShowUniversityDropdown(false);
    setShowLessonDropdown(false);
    setShowHRMDropdown((prev) => !prev);
  };

  const handleLibraryClick = () => {
    if (libraryRef.current) {
      const rect = libraryRef.current.getBoundingClientRect();
      const topPosition = Math.max(rect.top, 56);
      setDropdownTop(topPosition);
    }
    setShowEmployeePortal(false);
    setShowAdmissionDropdown(false);
    setShowStudentDropdown(false);
    setShowFeeDropdown(false);
    setShowAttendanceDropdown(false);
    setShowExaminationDropdown(false);
    setShowCOEDropdown(false);
    setShowFeedbackDropdown(false);
    setShowUniversityDropdown(false);
    setShowLessonDropdown(false);
    setShowHRMDropdown(false);
    setShowLibraryDropdown((prev) => !prev);
  };

  const handleFeedbackClick = () => {
    if (feedbackRef.current) {
      const rect = feedbackRef.current.getBoundingClientRect();
      const topPosition = Math.max(rect.top, 56);
      setDropdownTop(topPosition);
    }
    setShowEmployeePortal(false);
    setShowAdmissionDropdown(false);
    setShowStudentDropdown(false);
    setShowFeeDropdown(false);
    setShowAttendanceDropdown(false);
    setShowExaminationDropdown(false);
    setShowCOEDropdown(false);
    setShowUniversityDropdown(false);
    setShowFeedbackDropdown((prev) => !prev);
  };

  const handleUniversityClick = () => {
    if (universityRef.current) {
      const rect = universityRef.current.getBoundingClientRect();
      const topPosition = Math.max(rect.top, 56);
      setDropdownTop(topPosition);
    }
    setShowEmployeePortal(false);
    setShowAdmissionDropdown(false);
    setShowStudentDropdown(false);
    setShowFeeDropdown(false);
    setShowAttendanceDropdown(false);
    setShowExaminationDropdown(false);
    setShowCOEDropdown(false);
    setShowFeedbackDropdown(false);
    setShowUniversityDropdown((prev) => !prev);
  };

  const handleLessonClick = () => {
    if (lessonRef.current) {
      const rect = lessonRef.current.getBoundingClientRect();
      const topPosition = Math.max(rect.top, 56);
      setDropdownTop(topPosition);
    }
    setShowEmployeePortal(false);
    setShowAdmissionDropdown(false);
    setShowStudentDropdown(false);
    setShowFeeDropdown(false);
    setShowAttendanceDropdown(false);
    setShowExaminationDropdown(false);
    setShowCOEDropdown(false);
    setShowFeedbackDropdown(false);
    setShowUniversityDropdown(false);
    setShowLessonDropdown((prev) => !prev);
  };

  const handleFrontDeskClick = () => {
    if (frontDeskRef.current) {
      const rect = frontDeskRef.current.getBoundingClientRect();
      const topPosition = Math.max(rect.top, 56);
      setDropdownTop(topPosition);
    }
    setShowEmployeePortal(false);
    setShowAdmissionDropdown(false);
    setShowStudentDropdown(false);
    setShowFeeDropdown(false);
    setShowAttendanceDropdown(false);
    setShowExaminationDropdown(false);
    setShowCOEDropdown(false);
    setShowFeedbackDropdown(false);
    setShowUniversityDropdown(false);
    setShowLessonDropdown(false);
    setShowHRMDropdown(false);
    setShowLibraryDropdown(false);
    setShowCommunicationDropdown(false);
    setShowTransportDropdown(false);
    setShowHostelDropdown(false);
    setShowFrontDeskDropdown((prev) => !prev);
  };

  const handleCommunicationClick = () => {
    if (communicationRef.current) {
      const rect = communicationRef.current.getBoundingClientRect();
      const topPosition = Math.max(rect.top, 56);
      setDropdownTop(topPosition);
    }
    setShowEmployeePortal(false);
    setShowAdmissionDropdown(false);
    setShowStudentDropdown(false);
    setShowFeeDropdown(false);
    setShowAttendanceDropdown(false);
    setShowExaminationDropdown(false);
    setShowCOEDropdown(false);
    setShowFeedbackDropdown(false);
    setShowUniversityDropdown(false);
    setShowLessonDropdown(false);
    setShowHRMDropdown(false);
    setShowLibraryDropdown(false);
    setShowFrontDeskDropdown(false);
    setShowHostelDropdown(false);
    setShowCommunicationDropdown((prev) => !prev);
  };

  const handleTransportClick = () => {
    if (transportRef.current) {
      const rect = transportRef.current.getBoundingClientRect();
      const topPosition = Math.max(rect.top, 56);
      setDropdownTop(topPosition);
    }
    setShowEmployeePortal(false);
    setShowAdmissionDropdown(false);
    setShowStudentDropdown(false);
    setShowFeeDropdown(false);
    setShowAttendanceDropdown(false);
    setShowExaminationDropdown(false);
    setShowCOEDropdown(false);
    setShowFeedbackDropdown(false);
    setShowUniversityDropdown(false);
    setShowLessonDropdown(false);
    setShowHRMDropdown(false);
    setShowLibraryDropdown(false);
    setShowFrontDeskDropdown(false);
    setShowCommunicationDropdown(false);
    setShowHostelDropdown(false);
    setShowTransportDropdown((prev) => !prev);
  };

  const handleHostelClick = () => {
    if (hostelRef.current) {
      const rect = hostelRef.current.getBoundingClientRect();
      const topPosition = Math.max(rect.top, 56);
      setDropdownTop(topPosition);
    }
    setShowEmployeePortal(false);
    setShowAdmissionDropdown(false);
    setShowStudentDropdown(false);
    setShowFeeDropdown(false);
    setShowAttendanceDropdown(false);
    setShowExaminationDropdown(false);
    setShowCOEDropdown(false);
    setShowFeedbackDropdown(false);
    setShowUniversityDropdown(false);
    setShowLessonDropdown(false);
    setShowHRMDropdown(false);
    setShowLibraryDropdown(false);
    setShowFrontDeskDropdown(false);
    setShowCommunicationDropdown(false);
    setShowTransportDropdown(false);
    setShowHostelDropdown((prev) => !prev);
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
        !e.target.closest('.attendance-trigger') &&
        !e.target.closest('.examination-dropdown') &&
        !e.target.closest('.examination-trigger') &&
        !e.target.closest('.coe-dropdown') &&
        !e.target.closest('.coe-trigger') &&
        !e.target.closest('.feedback-dropdown') &&
        !e.target.closest('.feedback-trigger') &&
        !e.target.closest('.university-communication-dropdown') &&
        !e.target.closest('.university-communication-trigger') &&
        !e.target.closest('.lesson-dropdown') &&
        !e.target.closest('.lesson-trigger') &&
        !e.target.closest('.hrm-dropdown') &&
        !e.target.closest('.hrm-trigger') &&
        !e.target.closest('.library-dropdown') &&
        !e.target.closest('.library-trigger') &&
        !e.target.closest('.front-desk-dropdown') &&
        !e.target.closest('.front-desk-trigger') &&
        !e.target.closest('.communication-dropdown') &&
        !e.target.closest('.communication-trigger') &&
        !e.target.closest('.advanced-dropdown') &&
        !e.target.closest('.advanced-trigger') &&
        !e.target.closest('.hostel-dropdown') &&
        !e.target.closest('.hostel-trigger') &&
        !e.target.closest('.transport-dropdown') &&
        !e.target.closest('.transport-trigger')
      ) {
        setShowEmployeePortal(false);
        setShowAdmissionDropdown(false);
        setShowStudentDropdown(false);
        setShowFeeDropdown(false);
        setShowAttendanceDropdown(false);
        setShowExaminationDropdown(false);
        setShowCOEDropdown(false);
        setShowFeedbackDropdown(false);
        setShowUniversityDropdown(false);
        setShowLessonDropdown(false);
        setShowHRMDropdown(false);
        setShowLibraryDropdown(false);
        setShowFrontDeskDropdown(false);
        setShowCommunicationDropdown(false);
        setShowHostelDropdown(false);
        setShowTransportDropdown(false);
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
    if (item.id === 'examination') {
      return (
        <div
          key={item.id}
          ref={examinationRef}
          className="examination-trigger flex items-center px-3"
          onClick={handleExaminationClick}
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
            <ChevronDown style={{ width: 16, height: 16, color: isActive ? '#ffffff' : '#86efac', transform: showExaminationDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </div>
        </div>
      );
    }

    if (item.id === 'coe') {
      return (
        <div
          key={item.id}
          ref={coeRef}
          className="coe-trigger flex items-center px-3"
          onClick={handleCOEClick}
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
            <ChevronDown style={{ width: 16, height: 16, color: isActive ? '#ffffff' : '#86efac', transform: showCOEDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </div>
        </div>
      );
    }

    if (item.id === 'hrm') {
      return (
        <div
          key={item.id}
          ref={hrmRef}
          className="hrm-trigger flex items-center px-3"
          onClick={handleHRMClick}
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
            <ChevronDown style={{ width: 16, height: 16, color: isActive ? '#ffffff' : '#86efac', transform: showHRMDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </div>
        </div>
      );
    }

    if (item.id === 'library') {
      return (
        <div
          key={item.id}
          ref={libraryRef}
          className="library-trigger flex items-center px-3"
          onClick={handleLibraryClick}
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
            <ChevronDown style={{ width: 16, height: 16, color: isActive ? '#ffffff' : '#86efac', transform: showLibraryDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </div>
        </div>
      );
    }

    if (item.id === 'front-desk') {
      return (
        <div
          key={item.id}
          ref={frontDeskRef}
          className="front-desk-trigger flex items-center px-3"
          onClick={handleFrontDeskClick}
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
            <ChevronDown style={{ width: 16, height: 16, color: isActive ? '#ffffff' : '#86efac', transform: showFrontDeskDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </div>
        </div>
      );
    }

    if (item.id === 'communication') {
      return (
        <div
          key={item.id}
          ref={communicationRef}
          className="communication-trigger flex items-center px-3"
          onClick={handleCommunicationClick}
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
            <ChevronDown style={{ width: 16, height: 16, color: isActive ? '#ffffff' : '#86efac', transform: showCommunicationDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </div>
        </div>
      );
    }

    if (item.id === 'hostel') {
      return (
        <div
          key={item.id}
          ref={hostelRef}
          className="hostel-trigger flex items-center px-3"
          onClick={handleHostelClick}
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
            <ChevronDown style={{ width: 16, height: 16, color: isActive ? '#ffffff' : '#86efac', transform: (typeof showHostelDropdown !== 'undefined' && showHostelDropdown) ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </div>
        </div>
      );
    }

    if (item.id === 'transport') {
      return (
        <div
          key={item.id}
          ref={transportRef}
          className="transport-trigger flex items-center px-3"
          onClick={handleTransportClick}
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
            <ChevronDown style={{ width: 16, height: 16, color: isActive ? '#ffffff' : '#86efac', transform: showTransportDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </div>
        </div>
      );
    }

    if (item.id === 'feedback') {
      return (
        <div
          key={item.id}
          ref={feedbackRef}
          className="feedback-trigger flex items-center px-3"
          onClick={handleFeedbackClick}
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
            <ChevronDown style={{ width: 16, height: 16, color: isActive ? '#ffffff' : '#86efac', transform: showFeedbackDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </div>
        </div>
      );
    }

    if (item.id === 'university-communication') {
      return (
        <div
          key={item.id}
          ref={universityRef}
          className="university-communication-trigger flex items-center px-3"
          onClick={handleUniversityClick}
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
            <ChevronDown style={{ width: 16, height: 16, color: isActive ? '#ffffff' : '#86efac', transform: showUniversityDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </div>
        </div>
      );
    }

    if (item.id === 'lesson') {
      return (
        <div
          key={item.id}
          ref={lessonRef}
          className="lesson-trigger flex items-center px-3"
          onClick={handleLessonClick}
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
            <ChevronDown style={{ width: 16, height: 16, color: isActive ? '#ffffff' : '#86efac', transform: showLessonDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </div>
        </div>
      );
    }

    if (item.id === 'advanced') {
      return (
        <div
          key={item.id}
          ref={advancedRef}
          className="advanced-trigger flex items-center px-3"
          onClick={handleAdvancedClick}
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
            <ChevronDown style={{ width: 16, height: 16, color: isActive ? '#ffffff' : '#86efac', transform: showAdvancedDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
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
              top: '56px',
              width: 280,
              height: 'calc(100vh - 56px)',
              zIndex: 200,
              background: 'white',
              borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              padding: 8,
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
        {showLibraryDropdown && ReactDOM.createPortal(
          <div
            className="library-dropdown"
            style={{
              position: 'fixed',
              left: 200,
              top: '56px',
              width: 520,
              height: 'calc(100vh - 56px)',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
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
            <style>{`.library-dropdown::-webkit-scrollbar { width: 0; }
.library-dropdown::-webkit-scrollbar-thumb { background: transparent; }`}</style>
            <div style={{ borderRight: '1px solid #f1f5f9' }}>
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
                LIBRARY
              </div>
              {LIBRARY_ITEMS.left.library.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowLibraryDropdown(false)}
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
                  <Star className="group-hover:text-amber-500" style={{ width: 14, height: 14, color: portalItem.favorite ? '#f59e0b' : '#cbd5e1' }} />
                </Link>
              ))}
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
                SERIAL MANAGEMENT
              </div>
              {LIBRARY_ITEMS.left.serialManagement.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowLibraryDropdown(false)}
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
            <div style={{ borderLeft: '1px solid #f1f5f9' }}>
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
                LIBRARY REPORTS
              </div>
              {LIBRARY_ITEMS.right.libraryReports.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowLibraryDropdown(false)}
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
                WEBOPAC
              </div>
              {LIBRARY_ITEMS.right.webopac.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowLibraryDropdown(false)}
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
        {showFrontDeskDropdown && ReactDOM.createPortal(
          <div
            className="front-desk-dropdown"
            style={{
              position: 'fixed',
              left: 200,
              top: '56px',
              width: 420,
              height: 'calc(100vh - 56px)',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              zIndex: 200,
              background: 'white',
              borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              padding: 12,
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 0,
            }}
          >
            <style>{`.front-desk-dropdown::-webkit-scrollbar { width: 0; }
.front-desk-dropdown::-webkit-scrollbar-thumb { background: transparent; }`}</style>
            <div>
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
                FRONT DESK
              </div>
              {FRONT_DESK_ITEMS.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowFrontDeskDropdown(false)}
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

        {showCommunicationDropdown && ReactDOM.createPortal(
          <div
            className="communication-dropdown"
            style={{
              position: 'fixed',
              left: 200,
              top: '56px',
              width: 420,
              height: 'calc(100vh - 56px)',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              zIndex: 200,
              background: 'white',
              borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              padding: 12,
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 0,
            }}
          >
            <style>{`.communication-dropdown::-webkit-scrollbar { width: 0; }
.communication-dropdown::-webkit-scrollbar-thumb { background: transparent; }`}</style>
            <div>
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
                COMMUNICATION
              </div>
              {COMMUNICATION_ITEMS.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowCommunicationDropdown(false)}
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

        {(typeof showHostelDropdown !== 'undefined' && showHostelDropdown) && ReactDOM.createPortal(
          <div
            className="hostel-dropdown"
            style={{
              position: 'fixed',
              left: 200,
              top: '56px',
              width: 520,
              height: 'calc(100vh - 56px)',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
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
            <style>{`.hostel-dropdown::-webkit-scrollbar { width: 0; }
.hostel-dropdown::-webkit-scrollbar-thumb { background: transparent; }`}</style>
            <div style={{ borderRight: '1px solid #f1f5f9' }}>
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
                HOSTEL
              </div>
              {HOSTEL_ITEMS.left.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowHostelDropdown(false)}
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
                MESS MANAGEMENT
              </div>
              {HOSTEL_ITEMS.right.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowHostelDropdown(false)}
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

        {showTransportDropdown && ReactDOM.createPortal(
          <div
            className="transport-dropdown"
            style={{
              position: 'fixed',
              left: 200,
              top: '56px',
              width: 420,
              height: 'calc(100vh - 56px)',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              zIndex: 200,
              background: 'white',
              borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              padding: 12,
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 0,
            }}
          >
            <style>{`.transport-dropdown::-webkit-scrollbar { width: 0; }
.transport-dropdown::-webkit-scrollbar-thumb { background: transparent; }`}</style>
            <div>
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
                TRANSPORT
              </div>
              {TRANSPORT_ITEMS.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowTransportDropdown(false)}
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

        {showAdvancedDropdown && ReactDOM.createPortal(
          <div
            className="advanced-dropdown"
            style={{
              position: 'fixed',
              left: 200,
              top: '56px',
              width: 280,
              height: 'calc(100vh - 56px)',
              overflowY: 'auto',
              zIndex: 200,
              background: 'white',
              borderRadius: '0 10px 10px 0',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              padding: 12,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 12px 8px' }}>
              ADVANCED
            </div>
            {ADVANCED_ITEMS.map((portalItem) => (
              <Link
                key={portalItem.id}
                to={portalItem.to}
                onClick={() => setShowAdvancedDropdown(false)}
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
                  margin: '4px 0',
                }}
              >
                <span>{portalItem.label}</span>
                <Star className="group-hover:text-amber-500" style={{ width: 14, height: 14, color: '#cbd5e1' }} />
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
              top: '56px',
              width: 520,
              height: 'calc(100vh - 56px)',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
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
            <style>{`.admission-dropdown::-webkit-scrollbar { width: 0; }
.admission-dropdown::-webkit-scrollbar-thumb { background: transparent; }`}</style>
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
              top: '56px',
              width: 560,
              height: 'calc(100vh - 56px)',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
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
            <style>{`.student-dropdown::-webkit-scrollbar { width: 0; }
.student-dropdown::-webkit-scrollbar-thumb { background: transparent; }`}</style>
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
              top: '56px',
              width: 580,
              height: 'calc(100vh - 56px)',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
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
            <style>{`.fee-dropdown::-webkit-scrollbar { width: 0; }
.fee-dropdown::-webkit-scrollbar-thumb { background: transparent; }`}</style>
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
              top: '56px',
              width: 520,
              height: 'calc(100vh - 56px)',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
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
            <style>{`.attendance-dropdown::-webkit-scrollbar { width: 0; }
.attendance-dropdown::-webkit-scrollbar-thumb { background: transparent; }`}</style>
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
        {showExaminationDropdown && ReactDOM.createPortal(
          <div
            className="examination-dropdown"
            style={{
              position: 'fixed',
              left: 200,
              top: '56px',
              width: 520,
              height: 'calc(100vh - 56px)',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
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
            <style>{`.examination-dropdown::-webkit-scrollbar { width: 0; }
.examination-dropdown::-webkit-scrollbar-thumb { background: transparent; }`}</style>
            <div style={{ borderRight: '1px solid #f1f5f9' }}>
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
                MARKS ENTRY
              </div>
              {EXAMINATION_ITEMS.left.marksEntry.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowExaminationDropdown(false)}
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
                REPORT
              </div>
              {EXAMINATION_ITEMS.right.report.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowExaminationDropdown(false)}
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
        {showCoeDropdown && ReactDOM.createPortal(
          <div
            className="coe-dropdown"
            style={{
              position: 'fixed',
              left: 200,
              top: '56px',
              width: 420,
              height: 'calc(100vh - 56px)',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
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
            <style>{`.coe-dropdown::-webkit-scrollbar { width: 0; }
.coe-dropdown::-webkit-scrollbar-thumb { background: transparent; }`}</style>
            <div style={{ borderRight: '1px solid #f1f5f9' }}>
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
                EXAM MASTER
              </div>
              {COE_ITEMS.left.examMaster.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowCOEDropdown(false)}
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
                EXAM REGISTRATION
              </div>
              {COE_ITEMS.left.examRegistration.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowCOEDropdown(false)}
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
                EXAM DAY OPERATION
              </div>
              {COE_ITEMS.left.examDayOperation.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowCOEDropdown(false)}
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
                MARKS ENTRY
              </div>
              {COE_ITEMS.right.marksEntry.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowCOEDropdown(false)}
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
                RESULT
              </div>
              {COE_ITEMS.right.result.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowCOEDropdown(false)}
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
        {showFeedbackDropdown && ReactDOM.createPortal(
          <div
            className="feedback-dropdown"
            style={{
              position: 'fixed',
              left: 200,
              top: '56px',
              width: 520,
              height: 'calc(100vh - 56px)',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
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
            <style>{`.feedback-dropdown::-webkit-scrollbar { width: 0; }
.feedback-dropdown::-webkit-scrollbar-thumb { background: transparent; }`}</style>
            <div style={{ borderRight: '1px solid #f1f5f9' }}>
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
                FEEDBACK FROM STUDENT
              </div>
              {FEEDBACK_ITEMS.left.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowFeedbackDropdown(false)}
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
                FEEDBACK FROM STUDENT REPORTS
              </div>
              {FEEDBACK_ITEMS.right.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowFeedbackDropdown(false)}
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
        {showUniversityDropdown && ReactDOM.createPortal(
          <div
            className="university-communication-dropdown"
            style={{
              position: 'fixed',
              left: 200,
              top: '56px',
              width: 420,
              height: 'calc(100vh - 56px)',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              zIndex: 200,
              background: 'white',
              borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              padding: 12,
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 0,
            }}
          >
            <style>{`.university-communication-dropdown::-webkit-scrollbar { width: 0; }
.university-communication-dropdown::-webkit-scrollbar-thumb { background: transparent; }`}</style>
            <div>
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
                UNIVERSITY COMMUNICATION
              </div>
              {UNIVERSITY_COMMUNICATION_ITEMS.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowUniversityDropdown(false)}
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
                  <Star className="group-hover:text-amber-500" style={{ width: 14, height: 14, color: portalItem.favorite ? '#f59e0b' : '#cbd5e1' }} />
                </Link>
              ))}
            </div>
          </div>,
          document.body
        )}
        {showLessonDropdown && ReactDOM.createPortal(
          <div
            className="lesson-dropdown"
            style={{
              position: 'fixed',
              left: 200,
              top: '56px',
              width: 420,
              height: 'calc(100vh - 56px)',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              zIndex: 200,
              background: 'white',
              borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              padding: 12,
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 0,
            }}
          >
            <style>{`.lesson-dropdown::-webkit-scrollbar { width: 0; }
.lesson-dropdown::-webkit-scrollbar-thumb { background: transparent; }`}</style>
            <div>
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
                LESSON
              </div>
              {LESSON_ITEMS.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowLessonDropdown(false)}
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
        {showHRMDropdown && ReactDOM.createPortal(
          <div
            className="hrm-dropdown"
            style={{
              position: 'fixed',
              left: 200,
              top: '56px',
              width: 520,
              height: 'calc(100vh - 56px)',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
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
            <style>{`.hrm-dropdown::-webkit-scrollbar { width: 0; }
.hrm-dropdown::-webkit-scrollbar-thumb { background: transparent; }`}</style>
            <div style={{ borderRight: '1px solid #f1f5f9' }}>
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
                HRM
              </div>
              {HRM_ITEMS.left.hrm.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowHRMDropdown(false)}
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
                  <Star className="group-hover:text-amber-500" style={{ width: 14, height: 14, color: portalItem.favorite ? '#f59e0b' : '#cbd5e1' }} />
                </Link>
              ))}
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
                EMPLOYEE REPORTS
              </div>
              {HRM_ITEMS.left.employeeReports.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowHRMDropdown(false)}
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
                  <Star className="group-hover:text-amber-500" style={{ width: 14, height: 14, color: portalItem.favorite ? '#f59e0b' : '#cbd5e1' }} />
                </Link>
              ))}
            </div>
            <div style={{ borderLeft: '1px solid #f1f5f9' }}>
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
                EMPLOYEE ATTENDANCE
              </div>
              {HRM_ITEMS.right.employeeAttendance.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowHRMDropdown(false)}
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
                PROCESS SALARY REPORT
              </div>
              {HRM_ITEMS.right.processSalaryReport.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowHRMDropdown(false)}
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
                SALARY REPORTS
              </div>
              {HRM_ITEMS.right.salaryReports.map((portalItem) => (
                <Link
                  key={portalItem.id}
                  to={portalItem.to}
                  onClick={() => setShowHRMDropdown(false)}
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

