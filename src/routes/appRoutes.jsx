import AdmissionsPage from '../pages/AdmissionsPage.jsx';
import AttendancePage from '../pages/AttendancePage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import EmployeeAttendancePage from '../pages/EmployeeAttendancePage.jsx';
import EmployeeManagementPage from '../pages/EmployeeManagementPage.jsx';
import LMSPage from '../pages/LMSPage.jsx';
import LeadsPage from '../pages/LeadsPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import SecurityGuardAttendancePage from '../pages/SecurityGuardAttendancePage.jsx';
import SettingsPage from '../pages/SettingsPage.jsx';
import StudentAttendancePage from '../pages/StudentAttendancePage.jsx';
import StudentManagementPage from '../pages/StudentManagementPage.jsx';
import TeacherAttendancePage from '../pages/TeacherAttendancePage.jsx';
import TeacherManagementPage from '../pages/TeacherManagementPage.jsx';
import EmployeeManagementPage from '../pages/EmployeeManagementPage.jsx';
import FeeManagementPage from '../pages/FeeManagementPage.jsx';
import TimetableManagementPage from '../pages/TimetableManagementPage.jsx';
import SectionManagementPage from '../pages/SectionManagementPage.jsx';
import SubjectAssignmentPage from '../pages/SubjectAssignmentPage.jsx';
import TeacherSubjectAssignmentPage from '../pages/TeacherSubjectAssignmentPage.jsx';
import ClassroomManagementPage from '../pages/ClassroomManagementPage.jsx';
import AcademicCalendarPage from '../pages/AcademicCalendarPage.jsx';
import TimetableGeneratorPage from '../pages/TimetableGeneratorPage.jsx';
import LectureSchedulingPage from '../pages/LectureSchedulingPage.jsx';
import LectureNotesPage from '../pages/LectureNotesPage.jsx';
import SyllabusUploadPage from '../pages/SyllabusUploadPage.jsx';
import AssignmentsPage from '../pages/AssignmentsPage.jsx';
import QuestionBankPage from '../pages/QuestionBankPage.jsx';
import InternalMarksPage from '../pages/InternalMarksPage.jsx';
import PracticalMarksPage from '../pages/PracticalMarksPage.jsx';
import ExaminationPage from '../pages/ExaminationPage.jsx';
import ResultProcessingPage from '../pages/ResultProcessingPage.jsx';
import GradeCardPage from '../pages/GradeCardPage.jsx';
import TranscriptPage from '../pages/TranscriptPage.jsx';
import StudentPromotionPage from '../pages/StudentPromotionPage.jsx';
import TeacherSemesterAssignmentPage from '../pages/TeacherSemesterAssignmentPage.jsx';
import TeacherCourseAssignmentPage from '../pages/TeacherCourseAssignmentPage.jsx';
import TeacherWorkloadManagementPage from '../pages/TeacherWorkloadManagementPage.jsx';
import LectureAttendancePage from '../pages/LectureAttendancePage.jsx';

export const routes = [
  { path: '/', element: DashboardPage },
  { path: '/admissions', element: AdmissionsPage },
  { path: '/students', element: StudentManagementPage },
  { path: '/teachers', element: TeacherManagementPage },
  { path: '/employees', element: EmployeeManagementPage },
  { path: '/fees', element: FeeManagementPage },
  { path: '/sections', element: SectionManagementPage },
  { path: '/subjects', element: SubjectAssignmentPage },
  { path: '/subject-assignments', element: TeacherSubjectAssignmentPage },
  { path: '/classrooms', element: ClassroomManagementPage },
  { path: '/calendar', element: AcademicCalendarPage },
  { path: '/timetable-generator', element: TimetableGeneratorPage },
  { path: '/lectures', element: LectureSchedulingPage },
  { path: '/attendance', element: AttendancePage },
  { path: '/attendance/timetable', element: TimetableManagementPage },
  { path: '/attendance/students', element: StudentAttendancePage },
  { path: '/attendance/teachers', element: TeacherAttendancePage },
  { path: '/attendance/employees', element: EmployeeAttendancePage },
  { path: '/attendance/security', element: SecurityGuardAttendancePage },
  { path: '/lecture-notes', element: LectureNotesPage },
  { path: '/syllabus', element: SyllabusUploadPage },
  { path: '/assignments', element: AssignmentsPage },
  { path: '/question-bank', element: QuestionBankPage },
  { path: '/internal-marks', element: InternalMarksPage },
  { path: '/practical-marks', element: PracticalMarksPage },
  { path: '/examination', element: ExaminationPage },
  { path: '/result-processing', element: ResultProcessingPage },
  { path: '/grade-card', element: GradeCardPage },
  { path: '/transcript', element: TranscriptPage },
  { path: '/student-promotion', element: StudentPromotionPage },
  { path: '/teacher-semester-assignment', element: TeacherSemesterAssignmentPage },
  { path: '/teacher-course-assignment', element: TeacherCourseAssignmentPage },
  { path: '/teacher-workload', element: TeacherWorkloadManagementPage },
  { path: '/lecture-attendance', element: LectureAttendancePage },
  { path: '/lms', element: LMSPage },
  { path: '/leads', element: LeadsPage },
  { path: '/settings', element: SettingsPage },
  { path: '/auth/login', element: LoginPage },
  { path: '*', element: NotFoundPage },
];
