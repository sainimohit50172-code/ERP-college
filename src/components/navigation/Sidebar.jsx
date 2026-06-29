import { NavLink } from 'react-router-dom';
import {
  Home,
  UserPlus,
  Users,
  School,
  Layers,
  BookOpen,
  ClipboardList,
  Building,
  CalendarDays,
  Clock3,
  Video,
  CheckCircle2,
  FileText,
  ClipboardCheck,
  Truck,
  HelpCircle,
  Gauge,
  SlidersHorizontal,
  Clipboard,
  CheckSquare,
  LayoutGrid,
  ShieldCheck,
  Activity,
  BarChart3,
  Database,
  Award,
  ArrowUpRight,
  CalendarCheck,
  Briefcase,
  Laptop,
  TrendingUp,
  Settings2,
} from 'lucide-react';
import { useAuth } from '../../services/AuthContext.jsx';
import { useEffect } from 'react';
import { hasPermission } from '../../services/rbac.js';

const links = [
  { label: 'Dashboard', to: '/', icon: Home, moduleKey: 'dashboard' },
  { label: 'Admissions', to: '/admissions', icon: UserPlus, moduleKey: 'admissions' },
  { label: 'Students', to: '/students', icon: Users, moduleKey: 'students' },
  { label: 'Teachers', to: '/teachers', icon: School, moduleKey: 'teachers' },
  { label: 'Sections', to: '/sections', icon: Layers },
  { label: 'Subjects', to: '/subjects', icon: BookOpen },
  { label: 'Subject Assignments', to: '/subject-assignments', icon: ClipboardList, moduleKey: 'teacherAssignments' },
  { label: 'Classrooms', to: '/classrooms', icon: Building },
  { label: 'Academic Calendar', to: '/calendar', icon: CalendarDays, moduleKey: 'calendar' },
  { label: 'Timetable Generator', to: '/timetable-generator', icon: Clock3, moduleKey: 'timetable' },
  { label: 'Lectures', to: '/lectures', icon: Video, moduleKey: 'lectureNotes' },
  { label: 'Attendance', to: '/attendance', icon: CheckCircle2, moduleKey: 'attendance' },
  { label: 'Lecture Notes', to: '/lecture-notes', icon: FileText, moduleKey: 'lectureNotes' },
  { label: 'Syllabus', to: '/syllabus', icon: ClipboardCheck, moduleKey: 'syllabus' },
  { label: 'Assignments', to: '/assignments', icon: ClipboardList },
  { label: 'Library', to: '/library', icon: BookOpen, moduleKey: 'library' },
  { label: 'Hostel', to: '/hostel', icon: Home, moduleKey: 'hostel' },
  { label: 'Transport', to: '/transport', icon: Truck, moduleKey: 'transport' },
  { label: 'Security & Gate Pass', to: '/security', icon: ShieldCheck, moduleKey: 'security' },
  { label: 'Inventory & Assets', to: '/inventory', icon: Database, moduleKey: 'inventory' },
  { label: 'Question Bank', to: '/question-bank', icon: HelpCircle, moduleKey: 'questionBank' },
  { label: 'Internal Marks', to: '/internal-marks', icon: Gauge, moduleKey: 'internalMarks' },
  { label: 'Practical Marks', to: '/practical-marks', icon: SlidersHorizontal, moduleKey: 'practicalMarks' },
  { label: 'Examination', to: '/examination', icon: Clipboard, moduleKey: 'examination' },
  { label: 'Exam Attendance', to: '/examination-attendance', icon: CheckSquare, moduleKey: 'examination' },
  { label: 'Seating Plan', to: '/seating-plan', icon: LayoutGrid, moduleKey: 'examination' },
  { label: 'Invigilator Duty', to: '/invigilator-assignment', icon: ShieldCheck, moduleKey: 'teacherAssignments' },
  { label: 'Exam Dashboard', to: '/examination-dashboard', icon: Activity, moduleKey: 'reports' },
  { label: 'Exam Reports', to: '/examination-reports', icon: BarChart3, moduleKey: 'reports' },
  { label: 'Result Processing', to: '/result-processing', icon: Database },
  { label: 'Grade Card', to: '/grade-card', icon: Award, moduleKey: 'gradeCards' },
  { label: 'Transcript', to: '/transcript', icon: FileText, moduleKey: 'transcripts' },
  { label: 'Student Promotion', to: '/student-promotion', icon: ArrowUpRight, moduleKey: 'promotions' },
  { label: 'Teacher Semester Assign', to: '/teacher-semester-assignment', icon: CalendarCheck, moduleKey: 'teacherAssignments' },
  { label: 'Teacher Course Assign', to: '/teacher-course-assignment', icon: BookOpen, moduleKey: 'teacherAssignments' },
  { label: 'Teacher Workload', to: '/teacher-workload', icon: Briefcase, moduleKey: 'teacherAssignments' },
  { label: 'Lecture Attendance', to: '/lecture-attendance', icon: Users, moduleKey: 'lectureAttendance' },
  { label: 'LMS', to: '/lms', icon: Laptop, moduleKey: 'lms' },
  { label: 'Leads', to: '/leads', icon: TrendingUp, moduleKey: 'leads' },
  { label: 'Settings', to: '/settings', icon: Settings2, moduleKey: 'settings' },
];

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const { auth } = useAuth();

  // close on ESC
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // lock body scroll handled in RootLayout; ensure sidebar cleans up

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:z-50 md:flex md:h-full md:w-80 md:flex-col md:overflow-y-auto md:border-r md:border-slate-200/10 md:bg-[#05331e] md:px-4 md:py-6 md:shadow-[0_35px_80px_rgba(7,43,22,0.18)] md:backdrop-blur-xl">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-100">Enterprise</p>
            <h2 className="text-lg font-semibold text-white">College ERP</h2>
          </div>
        </div>
        <nav className="space-y-1">
          {links
            .filter((item) => {
              if (!item.moduleKey) return true;
              // if permissions not yet loaded, show links to avoid empty nav during initialization
              if (!auth?.permissions) return true;
              return hasPermission(auth.permissions, item.moduleKey, 'view');
            })
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                      `flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? 'bg-white/10 text-white shadow-[0_20px_45px_rgba(255,255,255,0.08)] ring-1 ring-white/10'
                          : 'text-white/90 hover:bg-white/5 hover:text-white'
                      }`
                    }
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-emerald-200 transition group-hover:bg-white/10">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
        </nav>
      </aside>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 md:hidden ${isOpen ? 'block' : 'hidden'}`} role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-black/40" onClick={onClose} />
        <aside className={`fixed left-0 top-0 h-full w-72 bg-[#05331e] p-4 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-emerald-200/80">Enterprise</p>
                <h2 className="text-lg font-semibold text-slate-50">College ERP</h2>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-200">Close</button>
          </div>
          <nav className="space-y-1">
            {links
              .filter((item) => {
                if (!item.moduleKey) return true;
                // if permissions not yet loaded, show links to avoid empty nav during initialization
                if (!auth?.permissions) return true;
                return hasPermission(auth.permissions, item.moduleKey, 'view');
              })
              .map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    onClick={() => onClose()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'text-slate-200 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-emerald-200 transition group-hover:bg-white/10">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
          </nav>
        </aside>
      </div>
    </>
  );
}

