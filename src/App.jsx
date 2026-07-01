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
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import StudentManagementPage from './pages/StudentManagementPage.jsx';
import StudentProfilePage from './pages/StudentProfilePage.jsx';
import FeeManagementPage from './pages/FeeManagementPage.jsx';
import TeacherManagementPage from './pages/TeacherManagementPage.jsx';
import TeacherProfilePage from './pages/TeacherProfilePage.jsx';
import CourseManagementPage from './pages/CourseManagementPage.jsx';
import DepartmentManagementPage from './pages/DepartmentManagementPage.jsx';
import DesignationManagementPage from './pages/DesignationManagementPage.jsx';
import OrganizationManagementPage from './pages/OrganizationManagementPage.jsx';
import HRDocumentsPage from './pages/HRDocumentsPage.jsx';
import EmployeeProfilePage from './pages/EmployeeProfilePage.jsx';
import LeaveManagementPage from './pages/LeaveManagementPage.jsx';
import PayrollManagementPage from './pages/PayrollManagementPage.jsx';
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
import HostelManagementPage from './pages/HostelManagementPage.jsx';
import TransportManagementPage from './pages/TransportManagementPage.jsx';
import SecurityPage from './pages/SecurityPage.jsx';
import InventoryPage from './pages/InventoryPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import ChangePasswordPage from './pages/ChangePasswordPage.jsx';
import UnauthorizedPage from './pages/UnauthorizedPage.jsx';
import PermissionMatrixPage from './pages/PermissionMatrixPage.jsx';
import AuditLogPage from './pages/AuditLogPage.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

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
              <Route path="students" element={<ProtectedRoute moduleKey="students"><StudentManagementPage /></ProtectedRoute>} />
              <Route path="students/:studentId" element={<ProtectedRoute moduleKey="students"><StudentProfilePage /></ProtectedRoute>} />
              <Route path="fees" element={<ProtectedRoute moduleKey="fees"><FeeManagementPage /></ProtectedRoute>} />
              <Route path="teachers" element={<ProtectedRoute moduleKey="teachers"><TeacherManagementPage /></ProtectedRoute>} />
              <Route path="teachers/:teacherId" element={<ProtectedRoute moduleKey="teachers"><TeacherProfilePage /></ProtectedRoute>} />
              <Route path="employees" element={<ProtectedRoute moduleKey="employees"><EmployeeManagementPage /></ProtectedRoute>} />
              <Route path="employees/:employeeId" element={<ProtectedRoute moduleKey="employees"><EmployeeProfilePage /></ProtectedRoute>} />
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
              <Route path="hostel" element={<ProtectedRoute moduleKey="hostel"><HostelManagementPage /></ProtectedRoute>} />
              <Route path="transport" element={<ProtectedRoute moduleKey="transport"><TransportManagementPage /></ProtectedRoute>} />
              <Route path="examination" element={<ProtectedRoute moduleKey="examination"><ExaminationPage /></ProtectedRoute>} />
              <Route path="examination-attendance" element={<ProtectedRoute moduleKey="examination"><ExaminationAttendancePage /></ProtectedRoute>} />
              <Route path="seating-plan" element={<ProtectedRoute moduleKey="examination"><SeatingPlanPage /></ProtectedRoute>} />
              <Route path="invigilator-assignment" element={<ProtectedRoute moduleKey="teacherAssignments"><InvigilatorAssignmentPage /></ProtectedRoute>} />
              <Route path="security" element={<ProtectedRoute moduleKey="security"><SecurityPage /></ProtectedRoute>} />
              <Route path="inventory" element={<ProtectedRoute moduleKey="inventory"><InventoryPage /></ProtectedRoute>} />
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
              <Route path="settings" element={<ProtectedRoute moduleKey="settings"><SettingsPage /></ProtectedRoute>} />
              <Route path="change-password" element={<ChangePasswordPage />} />
              <Route path="permissions" element={<ProtectedRoute moduleKey="permissionMatrix"><PermissionMatrixPage /></ProtectedRoute>} />
              <Route path="audit-log" element={<ProtectedRoute moduleKey="auditLog"><AuditLogPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default App;
