import { AnimatePresence, motion } from 'framer-motion';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import RootLayout from './layouts/RootLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import AdmissionsPage from './pages/AdmissionsPage.jsx';
import AttendancePage from './pages/AttendancePage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import EmployeeManagementPage from './pages/EmployeeManagementPage.jsx';
import StudentAttendancePage from './pages/StudentAttendancePage.jsx';
import TeacherAttendancePage from './pages/TeacherAttendancePage.jsx';
import EmployeeAttendancePage from './pages/EmployeeAttendancePage.jsx';
import SecurityGuardAttendancePage from './pages/SecurityGuardAttendancePage.jsx';
import TimetableManagementPage from './pages/TimetableManagementPage.jsx';
import LMSPage from './pages/LMSPage.jsx';
import LeadsPage from './pages/LeadsPage.jsx';
import FollowUpsPage from './pages/FollowUpsPage.jsx';
import FollowUpRemarkReportPage from './pages/FollowUpRemarkReportPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import StudentListPage from './pages/StudentListPage.jsx';
import StudentCollegeWisePage from './pages/StudentCollegeWisePage.jsx';
import StudentCertificatesPage from './pages/StudentCertificatesPage.jsx';
import UpdateRollNumberPage from './pages/UpdateRollNumberPage.jsx';
import AssignUniversityRollPage from './pages/AssignUniversityRollPage.jsx';
import StudentProfilePage from './pages/StudentProfilePage.jsx';
import StudentSessionManagementPage from './pages/StudentSessionManagementPage.jsx';
import FeeManagementPage from './pages/FeeManagementPage.jsx';
import TeacherManagementPage from './pages/TeacherManagementPage.jsx';
import TeacherProfilePage from './pages/TeacherProfilePage.jsx';
import CourseManagementPage from './pages/CourseManagementPage.jsx';
import DepartmentManagementPage from './pages/DepartmentManagementPage.jsx';
import DesignationManagementPage from './pages/DesignationManagementPage.jsx';
import OrganizationManagementPage from './pages/OrganizationManagementPage.jsx';
import HRDocumentsPage from './pages/HRDocumentsPage.jsx';
import EmployeeProfilePage from './pages/EmployeeProfilePage.jsx';
import ProfilePage from './pages/employees/ProfilePage.jsx';
import LeaveManagementPage from './pages/LeaveManagementPage.jsx';
import MyLeavesPage from './pages/MyLeavesPage.jsx';
import PayrollManagementPage from './pages/PayrollManagementPage.jsx';
import SalarySlipPage from './pages/SalarySlipPage.jsx';
import EmployeeAttendanceRegularizationPage from './pages/EmployeeAttendanceRegularizationPage.jsx';
import FinanceAccountingPage from './pages/FinanceAccountingPage.jsx';
import SemesterManagementPage from './pages/SemesterManagementPage.jsx';
import SectionManagementPage from './pages/SectionManagementPage.jsx';
import SubjectAssignmentPage from './pages/SubjectAssignmentPage.jsx';
import TeacherSubjectAssignmentPage from './pages/TeacherSubjectAssignmentPage.jsx';
import ClassroomManagementPage from './pages/ClassroomManagementPage.jsx';
import AcademicCalendarPage from './pages/AcademicCalendarPage.jsx';
import TimetableGeneratorPage from './pages/TimetableGeneratorPage.jsx';
import LectureSchedulingPage from './pages/LectureSchedulingPage.jsx';
import LectureNotesPage from './pages/LectureNotesPage.jsx';
import SyllabusUploadPage from './pages/SyllabusUploadPage.jsx';
import AssignmentsPage from './pages/AssignmentsPage.jsx';
import QuestionBankPage from './pages/QuestionBankPage.jsx';
import InternalMarksPage from './pages/InternalMarksPage.jsx';
import PracticalMarksPage from './pages/PracticalMarksPage.jsx';
import ExaminationPage from './pages/ExaminationPage.jsx';
import ExaminationAttendancePage from './pages/ExaminationAttendancePage.jsx';
import SeatingPlanPage from './pages/SeatingPlanPage.jsx';
import InvigilatorAssignmentPage from './pages/InvigilatorAssignmentPage.jsx';
import ExaminationDashboardPage from './pages/ExaminationDashboardPage.jsx';
import ExaminationReportsPage from './pages/ExaminationReportsPage.jsx';
import ResultProcessingPage from './pages/ResultProcessingPage.jsx';
import GradeCardPage from './pages/GradeCardPage.jsx';
import TranscriptPage from './pages/TranscriptPage.jsx';
import StudentPromotionPage from './pages/StudentPromotionPage.jsx';
import TeacherSemesterAssignmentPage from './pages/TeacherSemesterAssignmentPage.jsx';
import TeacherCourseAssignmentPage from './pages/TeacherCourseAssignmentPage.jsx';
import TeacherWorkloadManagementPage from './pages/TeacherWorkloadManagementPage.jsx';
import LectureAttendancePage from './pages/LectureAttendancePage.jsx';
import LibraryManagementPage from './pages/LibraryManagementPage.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import HostelManagementPage from './pages/HostelManagementPage.jsx';
import TransportManagementPage from './pages/TransportManagementPage.jsx';
import SecurityPage from './pages/SecurityPage.jsx';
import InventoryPage from './pages/InventoryPage.jsx';
import ParentsPage from './pages/ParentsPage.jsx';
import EnquiriesPage from './pages/EnquiriesPage.jsx';
import AdmissionCounsellingPage from './pages/AdmissionCounsellingPage.jsx';
import ApplicationsPage from './pages/ApplicationsPage.jsx';
import AdmissionTransactionsPage from './pages/AdmissionTransactionsPage.jsx';
import AlumniPage from './pages/AlumniPage.jsx';
import LibraryBooksPage from './pages/LibraryBooksPage.jsx';
import LibraryCategoriesPage from './pages/LibraryCategoriesPage.jsx';
import LibraryMembersPage from './pages/LibraryMembersPage.jsx';
import LibraryIssuesPage from './pages/LibraryIssuesPage.jsx';
import LibraryReturnsPage from './pages/LibraryReturnsPage.jsx';
import LibraryReservationsPage from './pages/LibraryReservationsPage.jsx';
import LibraryRenewalsPage from './pages/LibraryRenewalsPage.jsx';
import LibraryFinesPage from './pages/LibraryFinesPage.jsx';
import LibraryDamagesPage from './pages/LibraryDamagesPage.jsx';
import LibraryLostPage from './pages/LibraryLostPage.jsx';
import LibraryIssuedBooksPage from './pages/LibraryIssuedBooksPage.jsx';
import HostelRoomsPage from './pages/HostelRoomsPage.jsx';
import HostelAllocationsPage from './pages/HostelAllocationsPage.jsx';
import HostelVisitorsPage from './pages/HostelVisitorsPage.jsx';
import HostelComplaintsPage from './pages/HostelComplaintsPage.jsx';
import HostelFeesPage from './pages/HostelFeesPage.jsx';
import HostelWardensPage from './pages/HostelWardensPage.jsx';
import HostelMaintenancePage from './pages/HostelMaintenancePage.jsx';
import TransportVehiclesPage from './pages/TransportVehiclesPage.jsx';
import TransportDriversPage from './pages/TransportDriversPage.jsx';
import TransportConductorsPage from './pages/TransportConductorsPage.jsx';
import TransportRoutesPage from './pages/TransportRoutesPage.jsx';
import TransportStopsPage from './pages/TransportStopsPage.jsx';
import TransportStudentAssignmentsPage from './pages/TransportStudentAssignmentsPage.jsx';
import TransportEmployeeAssignmentsPage from './pages/TransportEmployeeAssignmentsPage.jsx';
import TransportFuelPage from './pages/TransportFuelPage.jsx';
import TransportMaintenancePage from './pages/TransportMaintenancePage.jsx';
import FeeCollectionPage from './pages/FeeCollectionPage.jsx';
import ScholarshipsPage from './pages/ScholarshipsPage.jsx';
import PaymentsPage from './pages/PaymentsPage.jsx';
import ReceiptsPage from './pages/ReceiptsPage.jsx';
import AccountsPage from './pages/AccountsPage.jsx';
import IncomePage from './pages/IncomePage.jsx';
import ExpensesPage from './pages/ExpensesPage.jsx';
import AssetsPage from './pages/AssetsPage.jsx';
import AssetCategoriesPage from './pages/AssetCategoriesPage.jsx';
import StockPage from './pages/StockPage.jsx';
import VendorsPage from './pages/VendorsPage.jsx';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage.jsx';
import GoodsReceiptsPage from './pages/GoodsReceiptsPage.jsx';
import AssetAssignmentsPage from './pages/AssetAssignmentsPage.jsx';
import MarketingPage from './pages/MarketingPage.jsx';
import CampaignsPage from './pages/CampaignsPage.jsx';
import LMSCoursesPage from './pages/LMSCoursesPage.jsx';
import StudyMaterialPage from './pages/StudyMaterialPage.jsx';
import VideoLecturesPage from './pages/VideoLecturesPage.jsx';
import OnlineTestsPage from './pages/OnlineTestsPage.jsx';
import SecurityVisitorsPage from './pages/SecurityVisitorsPage.jsx';
import GatePassPage from './pages/GatePassPage.jsx';
import IncidentsPage from './pages/IncidentsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import ChangePasswordPage from './pages/ChangePasswordPage.jsx';
import UnauthorizedPage from './pages/UnauthorizedPage.jsx';
import PermissionMatrixPage from './pages/PermissionMatrixPage.jsx';
import AuditLogPage from './pages/AuditLogPage.jsx';
import UsersPreferencesPage from './pages/UsersPreferencesPage.jsx';
import EmployeeAnnouncementPage from './pages/EmployeeAnnouncementPage.jsx';
import LibraryWebOpacPage from './pages/LibraryWebOpacPage.jsx';
import DailyCollectionReportPage from './pages/DailyCollectionReportPage.jsx';
import AdmissionSummaryReportPage from './pages/AdmissionSummaryReportPage.jsx';
import SubjectCombinationReportPage from './pages/SubjectCombinationReportPage.jsx';
import IndividualFacultyReportPage from './pages/IndividualFacultyReportPage.jsx';
import FeedbackSummaryReportPage from './pages/FeedbackSummaryReportPage.jsx';
import StudentFeedbackPage from './pages/StudentFeedbackPage.jsx';
import ComingSoonPage from './pages/ComingSoonPage.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import AllocateSubjectPage from './pages/AllocateSubjectPage.jsx';

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.22 }}
        className="min-h-screen"
      >
        <Routes location={location} key={location.pathname}>
          <Route path="/auth" element={<AuthLayout />}>
            <Route index element={<Navigate to="login" replace />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
          </Route>
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<RootLayout />}>
              <Route index element={<ProtectedRoute moduleKey="dashboard"><DashboardPage /></ProtectedRoute>} />
              <Route path="admissions" element={<ProtectedRoute moduleKey="admissions"><AdmissionsPage /></ProtectedRoute>} />
              <Route path="admissions/follow-ups" element={<ProtectedRoute moduleKey="admissions"><FollowUpsPage /></ProtectedRoute>} />
              <Route path="admissions/follow-up-remark-report" element={<ProtectedRoute moduleKey="admissions"><FollowUpRemarkReportPage /></ProtectedRoute>} />
              <Route path="admissions/reports/daily-collection" element={<ProtectedRoute moduleKey="admissions"><DailyCollectionReportPage /></ProtectedRoute>} />
              <Route path="admissions/reports/summary" element={<ProtectedRoute moduleKey="admissions"><AdmissionSummaryReportPage /></ProtectedRoute>} />
              <Route path="admissions/reports/subject-combination" element={<ProtectedRoute moduleKey="admissions"><SubjectCombinationReportPage /></ProtectedRoute>} />
              <Route path="admissions/transactions" element={<ProtectedRoute moduleKey="admissions"><AdmissionTransactionsPage /></ProtectedRoute>} />
              <Route path="students" element={<ProtectedRoute moduleKey="students"><StudentListPage /></ProtectedRoute>} />
              <Route path="students/college-wise" element={<ProtectedRoute moduleKey="students"><StudentCollegeWisePage /></ProtectedRoute>} />
              <Route path="students/certificates" element={<ProtectedRoute moduleKey="students"><StudentCertificatesPage /></ProtectedRoute>} />
              <Route path="students/update-roll" element={<ProtectedRoute moduleKey="students"><UpdateRollNumberPage /></ProtectedRoute>} />
              <Route path="students/assign-university-roll" element={<ProtectedRoute moduleKey="students"><AssignUniversityRollPage /></ProtectedRoute>} />
              <Route path="students/allocate-subject" element={<ProtectedRoute moduleKey="students"><AllocateSubjectPage /></ProtectedRoute>} />
              <Route path="students/allocate-subjects" element={<ProtectedRoute moduleKey="students"><AllocateSubjectPage /></ProtectedRoute>} />
              <Route path="students/session" element={<ProtectedRoute moduleKey="students"><StudentSessionManagementPage /></ProtectedRoute>} />
              <Route path="students/:studentId" element={<ProtectedRoute moduleKey="students"><StudentProfilePage /></ProtectedRoute>} />
              <Route path="parents" element={<ProtectedRoute moduleKey="students"><ParentsPage /></ProtectedRoute>} />
              <Route path="enquiries" element={<ProtectedRoute moduleKey="admissions"><EnquiriesPage /></ProtectedRoute>} />
              <Route path="counselling" element={<ProtectedRoute moduleKey="admissions"><AdmissionCounsellingPage /></ProtectedRoute>} />
              <Route path="applications" element={<ProtectedRoute moduleKey="admissions"><ApplicationsPage /></ProtectedRoute>} />
              <Route path="admissions/applications" element={<ProtectedRoute moduleKey="admissions"><ApplicationsPage /></ProtectedRoute>} />
              <Route path="leads" element={<ProtectedRoute moduleKey="leads"><LeadsPage /></ProtectedRoute>} />
              <Route path="admissions/leads" element={<ProtectedRoute moduleKey="leads"><LeadsPage /></ProtectedRoute>} />
              <Route path="alumni" element={<ProtectedRoute moduleKey="students"><AlumniPage /></ProtectedRoute>} />
              <Route path="fees" element={<ProtectedRoute moduleKey="fees"><FeeManagementPage /></ProtectedRoute>} />
              <Route path="teachers" element={<ProtectedRoute moduleKey="teachers"><TeacherManagementPage /></ProtectedRoute>} />
              <Route path="teachers/:teacherId" element={<ProtectedRoute moduleKey="teachers"><TeacherProfilePage /></ProtectedRoute>} />
              <Route path="employees" element={<ProtectedRoute moduleKey="employees"><EmployeeManagementPage /></ProtectedRoute>} />
              <Route path="employees/profile" element={<ProtectedRoute moduleKey="employees"><ProfilePage /></ProtectedRoute>} />
              <Route path="employees/user-preference" element={<ProtectedRoute moduleKey="employees"><UsersPreferencesPage /></ProtectedRoute>} />
              <Route path="employees/announcement" element={<ProtectedRoute moduleKey="employees"><EmployeeAnnouncementPage /></ProtectedRoute>} />
              <Route path="employees/webopac" element={<ProtectedRoute moduleKey="library"><LibraryWebOpacPage /></ProtectedRoute>} />
              <Route path="employees/faculty-report" element={<ProtectedRoute moduleKey="employees"><IndividualFacultyReportPage /></ProtectedRoute>} />
              <Route path="employees/feedback-summary-report" element={<ProtectedRoute moduleKey="employees"><FeedbackSummaryReportPage /></ProtectedRoute>} />
              <Route path="employees/:employeeId" element={<ProtectedRoute moduleKey="employees"><EmployeeProfilePage /></ProtectedRoute>} />
              <Route path="employees/salary-slip" element={<ProtectedRoute moduleKey="employees"><SalarySlipPage /></ProtectedRoute>} />
              <Route path="employees/manage" element={<ProtectedRoute moduleKey="employees"><PlaceholderPage title="Manage Employee" /></ProtectedRoute>} />
              <Route path="employees/leaves" element={<ProtectedRoute moduleKey="employees"><MyLeavesPage /></ProtectedRoute>} />
              <Route path="employees/entitled-leaves" element={<ProtectedRoute moduleKey="employees"><PlaceholderPage title="Employee Entitled Leaves" /></ProtectedRoute>} />
              <Route path="employees/attendance-calendar" element={<ProtectedRoute moduleKey="employees"><PlaceholderPage title="Attendance Calendar" /></ProtectedRoute>} />
              <Route path="employees/assign-salary-template" element={<ProtectedRoute moduleKey="employees"><PlaceholderPage title="Assign Salary Template" /></ProtectedRoute>} />
              <Route path="employees/manage-salary-templates" element={<ProtectedRoute moduleKey="employees"><PlaceholderPage title="Manage Salary Templates" /></ProtectedRoute>} />
              <Route path="employees/reports/employee" element={<ProtectedRoute moduleKey="employees"><PlaceholderPage title="Employee Report" /></ProtectedRoute>} />
              <Route path="employees/reports/leave-type" element={<ProtectedRoute moduleKey="employees"><PlaceholderPage title="Leave Type Report" /></ProtectedRoute>} />
              <Route path="employees/reports/attendance-time" element={<ProtectedRoute moduleKey="employees"><PlaceholderPage title="Attendance Time Report" /></ProtectedRoute>} />
              <Route path="employees/reports/attendance" element={<ProtectedRoute moduleKey="employees"><PlaceholderPage title="Attendance Report" /></ProtectedRoute>} />
              <Route path="employees/reports/daily-attendance-department" element={<ProtectedRoute moduleKey="employees"><PlaceholderPage title="Daily Attendance Report Department Wise" /></ProtectedRoute>} />
              <Route path="employees/reports/absentees-late-arrival" element={<ProtectedRoute moduleKey="employees"><PlaceholderPage title="Absentees & Late Arrival Report" /></ProtectedRoute>} />
              <Route path="employees/reports/leave-approval" element={<ProtectedRoute moduleKey="employees"><PlaceholderPage title="Leave Approval Report" /></ProtectedRoute>} />
              <Route path="employees/reports/attendance-logs" element={<ProtectedRoute moduleKey="employees"><PlaceholderPage title="Attendance Logs" /></ProtectedRoute>} />
              <Route path="employees/reports/working-hour" element={<ProtectedRoute moduleKey="employees"><PlaceholderPage title="Working Hour Report" /></ProtectedRoute>} />
              <Route path="employees/attendance/day-wise" element={<ProtectedRoute moduleKey="employees"><PlaceholderPage title="Mark Attendance Day Wise" /></ProtectedRoute>} />
              <Route path="employees/attendance/month-wise" element={<ProtectedRoute moduleKey="employees"><PlaceholderPage title="Mark Attendance Month Wise" /></ProtectedRoute>} />
              <Route path="employees/attendance/biometric" element={<ProtectedRoute moduleKey="employees"><PlaceholderPage title="Biometric Attendance" /></ProtectedRoute>} />
              <Route path="employees/attendance/regularization" element={<ProtectedRoute moduleKey="employees"><EmployeeAttendanceRegularizationPage /></ProtectedRoute>} />
              <Route path="employees/reports/compute-attendance" element={<ProtectedRoute moduleKey="employees"><PlaceholderPage title="Compute Attendance" /></ProtectedRoute>} />
              <Route path="employees/reports/salary-summary-month-wise" element={<ProtectedRoute moduleKey="employees"><PlaceholderPage title="Salary Summary Month Wise" /></ProtectedRoute>} />
              <Route path="employees/reports/salary-slip" element={<ProtectedRoute moduleKey="employees"><PlaceholderPage title="Salary Slip" /></ProtectedRoute>} />
              <Route path="employees/reports/salary" element={<ProtectedRoute moduleKey="employees"><PlaceholderPage title="Employee Salary Report" /></ProtectedRoute>} />
              <Route path="employees/reports/salary-register" element={<ProtectedRoute moduleKey="employees"><PlaceholderPage title="Employee Salary Register" /></ProtectedRoute>} />
              <Route path="employees/reports/salary-multiple-months" element={<ProtectedRoute moduleKey="employees"><PlaceholderPage title="Employee Salary Report - Multiple Months" /></ProtectedRoute>} />
              <Route path="employees/reports/arrear-salary" element={<ProtectedRoute moduleKey="employees"><PlaceholderPage title="Arrear Salary Report" /></ProtectedRoute>} />
              <Route path="employees/reports/earning-deduction-register" element={<ProtectedRoute moduleKey="employees"><PlaceholderPage title="Earning & Deduction Register" /></ProtectedRoute>} />
              <Route path="employees/reports/pf-challan" element={<ProtectedRoute moduleKey="employees"><PlaceholderPage title="PF Challan Report" /></ProtectedRoute>} />
              <Route path="leave-management" element={<ProtectedRoute moduleKey="leaveManagement"><LeaveManagementPage /></ProtectedRoute>} />
              <Route path="payroll-management" element={<ProtectedRoute moduleKey="payroll"><PayrollManagementPage /></ProtectedRoute>} />
              <Route path="finance-accounting" element={<ProtectedRoute moduleKey="finance"><FinanceAccountingPage /></ProtectedRoute>} />
              <Route path="designations" element={<ProtectedRoute moduleKey="designations"><DesignationManagementPage /></ProtectedRoute>} />
              <Route path="organizations" element={<ProtectedRoute moduleKey="organizations"><OrganizationManagementPage /></ProtectedRoute>} />
              <Route path="hr-documents" element={<ProtectedRoute moduleKey="hrDocuments"><HRDocumentsPage /></ProtectedRoute>} />
              <Route path="courses" element={<ProtectedRoute moduleKey="students"><CourseManagementPage /></ProtectedRoute>} />
              <Route path="departments" element={<ProtectedRoute moduleKey="students"><DepartmentManagementPage /></ProtectedRoute>} />
              <Route path="semesters" element={<ProtectedRoute moduleKey="students"><SemesterManagementPage /></ProtectedRoute>} />
              <Route path="sections" element={<SectionManagementPage />} />
              <Route path="subjects" element={<SubjectAssignmentPage />} />
              <Route path="subject-assignments" element={<ProtectedRoute moduleKey="teacherAssignments"><TeacherSubjectAssignmentPage /></ProtectedRoute>} />
              <Route path="classrooms" element={<ClassroomManagementPage />} />
              <Route path="calendar" element={<ProtectedRoute moduleKey="calendar"><AcademicCalendarPage /></ProtectedRoute>} />
              <Route path="timetable-generator" element={<ProtectedRoute moduleKey="timetable"><TimetableGeneratorPage /></ProtectedRoute>} />
              <Route path="lectures" element={<ProtectedRoute moduleKey="lectureNotes"><LectureSchedulingPage /></ProtectedRoute>} />
              <Route path="attendance" element={<ProtectedRoute moduleKey="attendance"><AttendancePage /></ProtectedRoute>} />
              <Route path="attendance/timetable" element={<ProtectedRoute moduleKey="timetable"><TimetableManagementPage /></ProtectedRoute>} />
              <Route path="attendance/students" element={<ProtectedRoute moduleKey="attendance"><StudentAttendancePage /></ProtectedRoute>} />
              <Route path="attendance/teachers" element={<ProtectedRoute moduleKey="attendance"><TeacherAttendancePage /></ProtectedRoute>} />
              <Route path="attendance/employees" element={<ProtectedRoute moduleKey="attendance"><EmployeeAttendancePage /></ProtectedRoute>} />
              <Route path="attendance/security" element={<ProtectedRoute moduleKey="attendance"><SecurityGuardAttendancePage /></ProtectedRoute>} />
              <Route path="lecture-notes" element={<ProtectedRoute moduleKey="lectureNotes"><LectureNotesPage /></ProtectedRoute>} />
              <Route path="syllabus" element={<ProtectedRoute moduleKey="syllabus"><SyllabusUploadPage /></ProtectedRoute>} />
              <Route path="assignments" element={<AssignmentsPage />} />
              <Route path="question-bank" element={<ProtectedRoute moduleKey="questionBank"><QuestionBankPage /></ProtectedRoute>} />
              <Route path="internal-marks" element={<ProtectedRoute moduleKey="internalMarks"><InternalMarksPage /></ProtectedRoute>} />
              <Route path="practical-marks" element={<ProtectedRoute moduleKey="practicalMarks"><PracticalMarksPage /></ProtectedRoute>} />
              <Route path="library" element={<ProtectedRoute moduleKey="library"><LibraryManagementPage /></ProtectedRoute>} />
              <Route path="library/books" element={<ProtectedRoute moduleKey="library"><LibraryBooksPage /></ProtectedRoute>} />
              <Route path="library/categories" element={<ProtectedRoute moduleKey="library"><LibraryCategoriesPage /></ProtectedRoute>} />
              <Route path="library/members" element={<ProtectedRoute moduleKey="library"><LibraryMembersPage /></ProtectedRoute>} />
              <Route path="library/issues" element={<ProtectedRoute moduleKey="library"><LibraryIssuesPage /></ProtectedRoute>} />
              <Route path="library/returns" element={<ProtectedRoute moduleKey="library"><LibraryReturnsPage /></ProtectedRoute>} />
              <Route path="library/reservations" element={<ProtectedRoute moduleKey="library"><LibraryReservationsPage /></ProtectedRoute>} />
              <Route path="library/renewals" element={<ProtectedRoute moduleKey="library"><LibraryRenewalsPage /></ProtectedRoute>} />
              <Route path="library/fines" element={<ProtectedRoute moduleKey="library"><LibraryFinesPage /></ProtectedRoute>} />
              <Route path="library/damages" element={<ProtectedRoute moduleKey="library"><LibraryDamagesPage /></ProtectedRoute>} />
              <Route path="library/lost" element={<ProtectedRoute moduleKey="library"><LibraryLostPage /></ProtectedRoute>} />
              <Route path="library/issue-book" element={<ProtectedRoute moduleKey="library"><PlaceholderPage title="Issue Book" /></ProtectedRoute>} />
              <Route path="library/issue-book-college-wise" element={<ProtectedRoute moduleKey="library"><PlaceholderPage title="Issue Book College Wise" /></ProtectedRoute>} />
              <Route path="library/issued-books" element={<ProtectedRoute moduleKey="library"><LibraryIssuedBooksPage /></ProtectedRoute>} />
              <Route path="library/stock-verify" element={<ProtectedRoute moduleKey="library"><PlaceholderPage title="Stock Verify" /></ProtectedRoute>} />
              <Route path="library/visitor" element={<ProtectedRoute moduleKey="library"><PlaceholderPage title="Library Visitor" /></ProtectedRoute>} />
              <Route path="library/digital" element={<ProtectedRoute moduleKey="library"><PlaceholderPage title="Digital Library" /></ProtectedRoute>} />
              <Route path="library/serial-subscription" element={<ProtectedRoute moduleKey="library"><PlaceholderPage title="Serial Subscription" /></ProtectedRoute>} />
              <Route path="library/serial-collection" element={<ProtectedRoute moduleKey="library"><PlaceholderPage title="Serial Collection" /></ProtectedRoute>} />
              <Route path="library/serial-collection-report" element={<ProtectedRoute moduleKey="library"><PlaceholderPage title="Serial Collection Report" /></ProtectedRoute>} />
              <Route path="library/reports/library-reports" element={<ProtectedRoute moduleKey="library"><PlaceholderPage title="Library Reports" /></ProtectedRoute>} />
              <Route path="library/reports/issued-books" element={<ProtectedRoute moduleKey="library"><PlaceholderPage title="Library Issued Books Report" /></ProtectedRoute>} />
              <Route path="library/reports/collection" element={<ProtectedRoute moduleKey="library"><PlaceholderPage title="Library Collection Report" /></ProtectedRoute>} />
              <Route path="library/reports/quick" element={<ProtectedRoute moduleKey="library"><PlaceholderPage title="Quick Report" /></ProtectedRoute>} />
              <Route path="library/reports/date-wise-issue-return" element={<ProtectedRoute moduleKey="library"><PlaceholderPage title="Date Wise Issue/Return Report" /></ProtectedRoute>} />
              <Route path="library/reports/member-type-issued-count" element={<ProtectedRoute moduleKey="library"><PlaceholderPage title="Member Type Wise Issued Count" /></ProtectedRoute>} />
              <Route path="library/reports/title-subtitle-summary" element={<ProtectedRoute moduleKey="library"><PlaceholderPage title="Title & Subtitle Category Summary Report" /></ProtectedRoute>} />
              <Route path="library/reports/webopac" element={<ProtectedRoute moduleKey="library"><PlaceholderPage title="WebOPAC Report" /></ProtectedRoute>} />
              <Route path="library/webopac" element={<ProtectedRoute moduleKey="library"><PlaceholderPage title="WebOPAC" /></ProtectedRoute>} />
              <Route path="library/web-opac" element={<ProtectedRoute moduleKey="library"><LibraryWebOpacPage /></ProtectedRoute>} />
              <Route path="hostel" element={<ProtectedRoute moduleKey="hostel"><HostelManagementPage /></ProtectedRoute>} />
              <Route path="hostel/rooms" element={<ProtectedRoute moduleKey="hostel"><HostelRoomsPage /></ProtectedRoute>} />
              <Route path="hostel/allocations" element={<ProtectedRoute moduleKey="hostel"><HostelAllocationsPage /></ProtectedRoute>} />
              <Route path="hostel/visitors" element={<ProtectedRoute moduleKey="hostel"><HostelVisitorsPage /></ProtectedRoute>} />
              <Route path="hostel/complaints" element={<ProtectedRoute moduleKey="hostel"><HostelComplaintsPage /></ProtectedRoute>} />
              <Route path="hostel/fees" element={<ProtectedRoute moduleKey="hostel"><HostelFeesPage /></ProtectedRoute>} />
              <Route path="hostel/wardens" element={<ProtectedRoute moduleKey="hostel"><HostelWardensPage /></ProtectedRoute>} />
              <Route path="hostel/maintenance" element={<ProtectedRoute moduleKey="hostel"><HostelMaintenancePage /></ProtectedRoute>} />
              <Route path="hostel/report" element={<ProtectedRoute moduleKey="hostel"><PlaceholderPage title="Hostel Report" /></ProtectedRoute>} />
              <Route path="hostel/occupancy-report" element={<ProtectedRoute moduleKey="hostel"><PlaceholderPage title="Occupancy Report" /></ProtectedRoute>} />
              <Route path="hostel/attendance" element={<ProtectedRoute moduleKey="hostel"><PlaceholderPage title="Hostel Attendance" /></ProtectedRoute>} />
              <Route path="hostel/qr-generator" element={<ProtectedRoute moduleKey="hostel"><PlaceholderPage title="Hostel QR Generator" /></ProtectedRoute>} />
              <Route path="hostel/live-attendance" element={<ProtectedRoute moduleKey="hostel"><PlaceholderPage title="Live Hostel Attendance" /></ProtectedRoute>} />
              <Route path="hostel/attendance-report" element={<ProtectedRoute moduleKey="hostel"><PlaceholderPage title="Hostel Attendance Report" /></ProtectedRoute>} />
              <Route path="hostel/unmarked-report" element={<ProtectedRoute moduleKey="hostel"><PlaceholderPage title="Hostel UnMarked Report" /></ProtectedRoute>} />
              <Route path="hostel/gate-pass" element={<ProtectedRoute moduleKey="hostel"><PlaceholderPage title="Hostel Gate Pass" /></ProtectedRoute>} />
              <Route path="hostel/mess-attendance" element={<ProtectedRoute moduleKey="hostel"><PlaceholderPage title="Mess Attendance" /></ProtectedRoute>} />
              <Route path="hostel/mess-summary-report" element={<ProtectedRoute moduleKey="hostel"><PlaceholderPage title="Mess Summary Report" /></ProtectedRoute>} />
              <Route path="hostel/mess-detailed-report" element={<ProtectedRoute moduleKey="hostel"><PlaceholderPage title="Mess Detailed Report" /></ProtectedRoute>} />
              <Route path="hostel/meal-feedback-report" element={<ProtectedRoute moduleKey="hostel"><PlaceholderPage title="Meal Feedback Report" /></ProtectedRoute>} />
              <Route path="transport" element={<ProtectedRoute moduleKey="transport"><TransportManagementPage /></ProtectedRoute>} />
              <Route path="transport/vehicles" element={<ProtectedRoute moduleKey="transport"><TransportVehiclesPage /></ProtectedRoute>} />
              <Route path="transport/drivers" element={<ProtectedRoute moduleKey="transport"><TransportDriversPage /></ProtectedRoute>} />
              <Route path="transport/conductors" element={<ProtectedRoute moduleKey="transport"><TransportConductorsPage /></ProtectedRoute>} />
              <Route path="transport/routes" element={<ProtectedRoute moduleKey="transport"><TransportRoutesPage /></ProtectedRoute>} />
              <Route path="transport/stops" element={<ProtectedRoute moduleKey="transport"><TransportStopsPage /></ProtectedRoute>} />
              <Route path="transport/student-assignments" element={<ProtectedRoute moduleKey="transport"><TransportStudentAssignmentsPage /></ProtectedRoute>} />
              <Route path="transport/employee-assignments" element={<ProtectedRoute moduleKey="transport"><TransportEmployeeAssignmentsPage /></ProtectedRoute>} />
              <Route path="transport/fuel" element={<ProtectedRoute moduleKey="transport"><TransportFuelPage /></ProtectedRoute>} />
              <Route path="transport/maintenance" element={<ProtectedRoute moduleKey="transport"><TransportMaintenancePage /></ProtectedRoute>} />
              <Route path="examination" element={<ProtectedRoute moduleKey="examination"><ExaminationPage /></ProtectedRoute>} />
              <Route path="examination-attendance" element={<ProtectedRoute moduleKey="examination"><ExaminationAttendancePage /></ProtectedRoute>} />
              <Route path="seating-plan" element={<ProtectedRoute moduleKey="examination"><SeatingPlanPage /></ProtectedRoute>} />
              <Route path="coe" element={<ProtectedRoute><PlaceholderPage title="COE" /></ProtectedRoute>} />
              <Route path="coe/exam-master" element={<ProtectedRoute><PlaceholderPage title="Exam Master" /></ProtectedRoute>} />
              <Route path="coe/datesheet" element={<ProtectedRoute><PlaceholderPage title="Datesheet" /></ProtectedRoute>} />
              <Route path="coe/configuration" element={<ProtectedRoute><PlaceholderPage title="Exam Configuration" /></ProtectedRoute>} />
              <Route path="coe/registration" element={<ProtectedRoute><PlaceholderPage title="Exam Registration" /></ProtectedRoute>} />
              <Route path="coe/approve-registration" element={<ProtectedRoute><PlaceholderPage title="Approve Exam Registration" /></ProtectedRoute>} />
              <Route path="coe/pending-registration" element={<ProtectedRoute><PlaceholderPage title="Pending Registration Report" /></ProtectedRoute>} />
              <Route path="coe/transactions" element={<ProtectedRoute><PlaceholderPage title="Transactions List" /></ProtectedRoute>} />
              <Route path="coe/admit-card" element={<ProtectedRoute><PlaceholderPage title="Issue Admit Card" /></ProtectedRoute>} />
              <Route path="coe/daily-dashboard" element={<ProtectedRoute><PlaceholderPage title="Daily Exam Dashboard" /></ProtectedRoute>} />
              <Route path="coe/exam-attendance" element={<ProtectedRoute><PlaceholderPage title="Exam Attendance" /></ProtectedRoute>} />
              <Route path="coe/attendance-report" element={<ProtectedRoute><PlaceholderPage title="Exam Attendance Report" /></ProtectedRoute>} />
              <Route path="coe/attendance-sheet" element={<ProtectedRoute><PlaceholderPage title="Attendance Sheet" /></ProtectedRoute>} />
              <Route path="coe/question-mapping" element={<ProtectedRoute><PlaceholderPage title="Question CO Mapping" /></ProtectedRoute>} />
              <Route path="coe/admin-marks" element={<ProtectedRoute><PlaceholderPage title="Admin Marks Entry" /></ProtectedRoute>} />
              <Route path="coe/theory-marks" element={<ProtectedRoute><PlaceholderPage title="Theory Marks Entry" /></ProtectedRoute>} />
              <Route path="coe/practical-marks" element={<ProtectedRoute><PlaceholderPage title="Practical Marks Entry" /></ProtectedRoute>} />
              <Route path="coe/internal-marks" element={<ProtectedRoute><PlaceholderPage title="Internal Marks Entry" /></ProtectedRoute>} />
              <Route path="coe/pending-marks" element={<ProtectedRoute><PlaceholderPage title="Pending Marks Entry Report" /></ProtectedRoute>} />
              <Route path="coe/reports/subject-wise" element={<ProtectedRoute><PlaceholderPage title="Subject Wise Marks Report" /></ProtectedRoute>} />
              <Route path="coe/reports/type-wise" element={<ProtectedRoute><PlaceholderPage title="Type Wise Marks Report" /></ProtectedRoute>} />
              <Route path="coe/reports/analysis" element={<ProtectedRoute><PlaceholderPage title="Result Analysis Report" /></ProtectedRoute>} />
              <Route path="coe/result-declare" element={<ProtectedRoute><PlaceholderPage title="Result Declare" /></ProtectedRoute>} />
              <Route path="coe/result-sheet" element={<ProtectedRoute><PlaceholderPage title="Result Sheet" /></ProtectedRoute>} />
              <Route path="coe/digi-locker" element={<ProtectedRoute><PlaceholderPage title="Digi Locker Report" /></ProtectedRoute>} />
              <Route path="coe/student-dmc" element={<ProtectedRoute><PlaceholderPage title="Student DMC" /></ProtectedRoute>} />
              <Route path="feedback" element={<ProtectedRoute><StudentFeedbackPage /></ProtectedRoute>} />
              <Route path="feedback/form" element={<ProtectedRoute><PlaceholderPage title="Student Feedback Form" /></ProtectedRoute>} />
              <Route path="feedback/submissions" element={<ProtectedRoute><PlaceholderPage title="Feedback Submissions" /></ProtectedRoute>} />
              <Route path="feedback/dashboard" element={<ProtectedRoute><PlaceholderPage title="Feedback Dashboard" /></ProtectedRoute>} />
              <Route path="feedback/response-management" element={<ProtectedRoute><PlaceholderPage title="Response Management" /></ProtectedRoute>} />
              <Route path="feedback/reports/summary" element={<ProtectedRoute><PlaceholderPage title="Feedback Summary Report" /></ProtectedRoute>} />
              <Route path="feedback/reports/analysis" element={<ProtectedRoute><PlaceholderPage title="Feedback Analysis Report" /></ProtectedRoute>} />
              <Route path="feedback/reports/trends" element={<ProtectedRoute><PlaceholderPage title="Feedback Trend Report" /></ProtectedRoute>} />
              <Route path="feedback/reports/student" element={<ProtectedRoute><StudentFeedbackPage /></ProtectedRoute>} />
              <Route path="invigilator-assignment" element={<ProtectedRoute moduleKey="teacherAssignments"><InvigilatorAssignmentPage /></ProtectedRoute>} />
              <Route path="security" element={<ProtectedRoute moduleKey="security"><SecurityPage /></ProtectedRoute>} />
              <Route path="security/visitors" element={<ProtectedRoute moduleKey="security"><SecurityVisitorsPage /></ProtectedRoute>} />
              <Route path="security/gate-pass" element={<ProtectedRoute moduleKey="security"><GatePassPage /></ProtectedRoute>} />
              <Route path="security/incidents" element={<ProtectedRoute moduleKey="security"><IncidentsPage /></ProtectedRoute>} />
              <Route path="front-desk/visitor" element={<ProtectedRoute moduleKey="security"><PlaceholderPage title="Visitor" /></ProtectedRoute>} />
              <Route path="front-desk/gate-pass" element={<ProtectedRoute moduleKey="security"><PlaceholderPage title="Gate Pass" /></ProtectedRoute>} />
              <Route path="front-desk/hostel-gate-pass-qr" element={<ProtectedRoute moduleKey="security"><PlaceholderPage title="Hostel Gate Pass QR" /></ProtectedRoute>} />
              <Route path="front-desk/gate-pass-qr" element={<ProtectedRoute moduleKey="security"><PlaceholderPage title="Gate Pass QR" /></ProtectedRoute>} />
              <Route path="inventory" element={<ProtectedRoute moduleKey="inventory"><InventoryPage /></ProtectedRoute>} />
              <Route path="inventory/assets" element={<ProtectedRoute moduleKey="inventory"><AssetsPage /></ProtectedRoute>} />
              <Route path="inventory/categories" element={<ProtectedRoute moduleKey="inventory"><AssetCategoriesPage /></ProtectedRoute>} />
              <Route path="inventory/stock" element={<ProtectedRoute moduleKey="inventory"><StockPage /></ProtectedRoute>} />
              <Route path="inventory/vendors" element={<ProtectedRoute moduleKey="inventory"><VendorsPage /></ProtectedRoute>} />
              <Route path="inventory/purchase-orders" element={<ProtectedRoute moduleKey="inventory"><PurchaseOrdersPage /></ProtectedRoute>} />
              <Route path="inventory/goods-receipts" element={<ProtectedRoute moduleKey="inventory"><GoodsReceiptsPage /></ProtectedRoute>} />
              <Route path="inventory/asset-assignments" element={<ProtectedRoute moduleKey="inventory"><AssetAssignmentsPage /></ProtectedRoute>} />
              <Route path="fee-collection" element={<ProtectedRoute moduleKey="fees"><FeeCollectionPage /></ProtectedRoute>} />
              <Route path="scholarships" element={<ProtectedRoute moduleKey="fees"><ScholarshipsPage /></ProtectedRoute>} />
              <Route path="payments" element={<ProtectedRoute moduleKey="fees"><PaymentsPage /></ProtectedRoute>} />
              <Route path="receipts" element={<ProtectedRoute moduleKey="fees"><ReceiptsPage /></ProtectedRoute>} />
              <Route path="accounts" element={<ProtectedRoute moduleKey="finance"><AccountsPage /></ProtectedRoute>} />
              <Route path="income" element={<ProtectedRoute moduleKey="finance"><IncomePage /></ProtectedRoute>} />
              <Route path="expenses" element={<ProtectedRoute moduleKey="finance"><ExpensesPage /></ProtectedRoute>} />
              <Route path="examination-dashboard" element={<ProtectedRoute moduleKey="reports"><ExaminationDashboardPage /></ProtectedRoute>} />
              <Route path="examination-reports" element={<ProtectedRoute moduleKey="reports"><ExaminationReportsPage /></ProtectedRoute>} />
              <Route path="reports" element={<ProtectedRoute moduleKey="reports"><ExaminationReportsPage /></ProtectedRoute>} />
              <Route path="result-processing" element={<ProtectedRoute moduleKey="resultProcessing"><ResultProcessingPage /></ProtectedRoute>} />
              <Route path="grade-card" element={<ProtectedRoute moduleKey="gradeCards"><GradeCardPage /></ProtectedRoute>} />
              <Route path="transcript" element={<ProtectedRoute moduleKey="transcripts"><TranscriptPage /></ProtectedRoute>} />
              <Route path="student-promotion" element={<ProtectedRoute moduleKey="promotions"><StudentPromotionPage /></ProtectedRoute>} />
              <Route path="teacher-semester-assignment" element={<ProtectedRoute moduleKey="teacherAssignments"><TeacherSemesterAssignmentPage /></ProtectedRoute>} />
              <Route path="teacher-course-assignment" element={<ProtectedRoute moduleKey="teacherAssignments"><TeacherCourseAssignmentPage /></ProtectedRoute>} />
              <Route path="teacher-workload" element={<ProtectedRoute moduleKey="teacherAssignments"><TeacherWorkloadManagementPage /></ProtectedRoute>} />
              <Route path="lecture-attendance" element={<ProtectedRoute moduleKey="lectureAttendance"><LectureAttendancePage /></ProtectedRoute>} />
              <Route path="lms" element={<ProtectedRoute moduleKey="lms"><LMSPage /></ProtectedRoute>} />
              <Route path="leads" element={<ProtectedRoute moduleKey="leads"><LeadsPage /></ProtectedRoute>} />
              <Route path="admissions/leads" element={<ProtectedRoute moduleKey="leads"><LeadsPage /></ProtectedRoute>} />
              <Route path="marketing" element={<ProtectedRoute moduleKey="leads"><MarketingPage /></ProtectedRoute>} />
              <Route path="campaigns" element={<ProtectedRoute moduleKey="leads"><CampaignsPage /></ProtectedRoute>} />
              <Route path="lms/courses" element={<ProtectedRoute moduleKey="lms"><LMSCoursesPage /></ProtectedRoute>} />
              <Route path="lms/study-material" element={<ProtectedRoute moduleKey="lms"><StudyMaterialPage /></ProtectedRoute>} />
              <Route path="lms/video-lectures" element={<ProtectedRoute moduleKey="lms"><VideoLecturesPage /></ProtectedRoute>} />
              <Route path="lms/online-tests" element={<ProtectedRoute moduleKey="lms"><OnlineTestsPage /></ProtectedRoute>} />
              <Route path="analytics" element={<ProtectedRoute moduleKey="reports"><AnalyticsPage /></ProtectedRoute>} />
              <Route path="notifications" element={<ProtectedRoute moduleKey="notifications"><NotificationsPage /></ProtectedRoute>} />
              <Route path="notifications/assignment" element={<ProtectedRoute moduleKey="notifications"><PlaceholderPage title="Assignment" /></ProtectedRoute>} />
              <Route path="notifications/notes" element={<ProtectedRoute moduleKey="notifications"><PlaceholderPage title="Notes" /></ProtectedRoute>} />
              <Route path="notifications/notes-new" element={<ProtectedRoute moduleKey="notifications"><PlaceholderPage title="Notes New" /></ProtectedRoute>} />
              <Route path="notifications/circular" element={<ProtectedRoute moduleKey="notifications"><PlaceholderPage title="Circular" /></ProtectedRoute>} />
              <Route path="notifications/notice" element={<ProtectedRoute moduleKey="notifications"><PlaceholderPage title="Notice" /></ProtectedRoute>} />
              <Route path="notifications/syllabus" element={<ProtectedRoute moduleKey="notifications"><PlaceholderPage title="Syllabus" /></ProtectedRoute>} />
              <Route path="notifications/date-sheet" element={<ProtectedRoute moduleKey="notifications"><PlaceholderPage title="Date Sheet" /></ProtectedRoute>} />
              <Route path="notifications/e-learning" element={<ProtectedRoute moduleKey="notifications"><PlaceholderPage title="E-Learning" /></ProtectedRoute>} />
              <Route path="notifications/time-table" element={<ProtectedRoute moduleKey="notifications"><PlaceholderPage title="Time Table" /></ProtectedRoute>} />
              <Route path="communication" element={<ProtectedRoute moduleKey="notifications"><PlaceholderPage title="Communication" /></ProtectedRoute>} />
              <Route path="communication/send-text-sms" element={<ProtectedRoute moduleKey="notifications"><PlaceholderPage title="Send Text SMS" /></ProtectedRoute>} />
              <Route path="communication/send-whatsapp-message" element={<ProtectedRoute moduleKey="notifications"><PlaceholderPage title="Send Whatsapp Message" /></ProtectedRoute>} />
              <Route path="communication/report" element={<ProtectedRoute moduleKey="notifications"><PlaceholderPage title="Report" /></ProtectedRoute>} />
              <Route path="communication/employee-announcement" element={<ProtectedRoute moduleKey="notifications"><PlaceholderPage title="Employee Announcement" /></ProtectedRoute>} />
              <Route path="lesson" element={<ProtectedRoute><PlaceholderPage title="Lesson" /></ProtectedRoute>} />
              <Route path="lesson/management" element={<ProtectedRoute moduleKey="lms"><PlaceholderPage title="Lesson Management" /></ProtectedRoute>} />
              <Route path="lesson/subject-wise-report" element={<ProtectedRoute moduleKey="lms"><PlaceholderPage title="Subject Wise Report" /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute moduleKey="settings"><SettingsPage /></ProtectedRoute>} />
              <Route path="users/preferences" element={<ProtectedRoute moduleKey="settings"><UsersPreferencesPage /></ProtectedRoute>} />
              <Route path="change-password" element={<ChangePasswordPage />} />
              <Route path="permissions" element={<ProtectedRoute moduleKey="permissionMatrix"><PermissionMatrixPage /></ProtectedRoute>} />
              <Route path="audit-log" element={<ProtectedRoute moduleKey="auditLog"><AuditLogPage /></ProtectedRoute>} />
              <Route path="*" element={<ComingSoonPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default App;
