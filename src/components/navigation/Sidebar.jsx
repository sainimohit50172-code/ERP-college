import { useLocation } from 'react-router-dom';
import {
  Home,
  UserPlus,
  Users,
  School,
  Wallet,
  Layers,
  AlertCircle,
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
  Clipboard,
  ShoppingCart,
  ShieldCheck,
  Activity,
  BarChart3,
  Database,
  Award,
  Briefcase,
  Laptop,
  TrendingUp,
  Settings2,
  Search,
  Bell,
  Fuel,
} from 'lucide-react';
import { useAuth } from '../../services/AuthContext.jsx';
import { useEffect, useMemo, useState } from 'react';
import { hasPermission } from '../../services/rbac.js';
import SidebarMenuItem from './SidebarMenuItem.jsx';

const menuGroups = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, children: [{ id: 'dashboard-root', label: 'Dashboard', to: '/', icon: Home, moduleKey: 'dashboard' }] },
  {
    id: 'admissions',
    label: 'Admissions',
    icon: UserPlus,
    children: [
      { id: 'admissions-root', label: 'Admissions', to: '/admissions', icon: UserPlus, moduleKey: 'admissions' },
      { id: 'enquiries', label: 'Enquiries', icon: HelpCircle, disabled: true, comingSoon: true },
      { id: 'counselling', label: 'Counselling', icon: Users, disabled: true, comingSoon: true },
      { id: 'applications', label: 'Applications', icon: ClipboardList, disabled: true, comingSoon: true },
    ],
  },
  {
    id: 'students',
    label: 'Students',
    icon: Users,
    children: [
      { id: 'students-root', label: 'Student Management', to: '/students', icon: Users, moduleKey: 'students' },
      { id: 'promotions', label: 'Promotions', icon: TrendingUp, disabled: true, comingSoon: true },
      { id: 'certificates', label: 'Certificates', icon: Award, disabled: true, comingSoon: true },
      { id: 'alumni', label: 'Alumni', icon: Users, disabled: true, comingSoon: true },
    ],
  },
  {
    id: 'parents',
    label: 'Parents',
    icon: Users,
    children: [{ id: 'parents-root', label: 'Parents', to: '/parents', icon: Users, moduleKey: 'parents' }],
  },
  {
    id: 'employees',
    label: 'Employees',
    icon: Briefcase,
    children: [{ id: 'employees-root', label: 'Employees', to: '/employees', icon: Briefcase, moduleKey: 'employees' }],
  },
  {
    id: 'teachers',
    label: 'Teachers',
    icon: School,
    children: [
      { id: 'teachers-root', label: 'Faculty', to: '/teachers', icon: School, moduleKey: 'teachers' },
      { id: 'teacher-workload', label: 'Workloads', icon: Briefcase, disabled: true, comingSoon: true },
      { id: 'teacher-attendance', label: 'Attendance', to: '/attendance/teachers', icon: CheckCircle2, moduleKey: 'attendance' },
    ],
  },
  {
    id: 'academic',
    label: 'Academic',
    icon: BookOpen,
    children: [
      { id: 'departments-root', label: 'Departments', to: '/departments', icon: Building, moduleKey: 'departments' },
      { id: 'designations-root', label: 'Designations', to: '/designations', icon: Award, moduleKey: 'designations' },
      { id: 'courses-root', label: 'Courses', to: '/courses', icon: BookOpen, moduleKey: 'courses' },
      { id: 'subjects-root', label: 'Subjects', to: '/subjects', icon: BookOpen, moduleKey: 'subjects' },
      { id: 'subject-assignments-root', label: 'Subject Assignments', to: '/subject-assignments', icon: ClipboardList, moduleKey: 'teacherAssignments' },
      { id: 'teacher-assignments-root', label: 'Teacher Assignments', to: '/teacher-assignments', icon: Briefcase, moduleKey: 'teacherAssignments' },
      { id: 'semesters-root', label: 'Semesters', to: '/semesters', icon: Layers, moduleKey: 'semesters' },
      { id: 'sections-root', label: 'Sections', to: '/sections', icon: Layers, moduleKey: 'sections' },
      { id: 'classrooms-root', label: 'Classrooms', to: '/classrooms', icon: Building, moduleKey: 'classrooms' },
      { id: 'timetable-root', label: 'Timetable', to: '/timetable-generator', icon: Clock3, moduleKey: 'timetable' },
      { id: 'lectures-root', label: 'Lecture Schedule', to: '/lectures', icon: Video, moduleKey: 'lectureNotes' },
      { id: 'lecture-notes-root', label: 'Lecture Notes', to: '/lecture-notes', icon: FileText, moduleKey: 'lectureNotes' },
      { id: 'lesson-plans', label: 'Lesson Plans', icon: FileText, disabled: true, comingSoon: true },
      { id: 'syllabus-root', label: 'Syllabus', to: '/syllabus', icon: ClipboardCheck, moduleKey: 'syllabus' },
    ],
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: CheckCircle2,
    children: [
      { id: 'attendance-root', label: 'Attendance', to: '/attendance', icon: CheckCircle2, moduleKey: 'attendance' },
      { id: 'attendance-students-root', label: 'Students', to: '/attendance/students', icon: Users, moduleKey: 'attendance' },
      { id: 'attendance-teachers-root', label: 'Teachers', to: '/attendance/teachers', icon: School, moduleKey: 'attendance' },
      { id: 'attendance-employees-root', label: 'Employees', to: '/attendance/employees', icon: Briefcase, moduleKey: 'attendance' },
      { id: 'attendance-security-root', label: 'Security Guards', to: '/attendance/security', icon: ShieldCheck, moduleKey: 'attendance' },
    ],
  },
  {
    id: 'examinations',
    label: 'Examinations',
    icon: Clipboard,
    children: [
      { id: 'examination-root', label: 'Examinations', to: '/examination', icon: Clipboard, moduleKey: 'examination' },
      { id: 'exam-dashboard-root', label: 'Exam Dashboard', to: '/examination-dashboard', icon: Activity, moduleKey: 'reports' },
      { id: 'internal-marks-root', label: 'Marks Entry', to: '/internal-marks', icon: Gauge, moduleKey: 'internalMarks' },
      { id: 'practical-marks-root', label: 'Practical Marks', to: '/practical-marks', icon: Gauge, moduleKey: 'practicalMarks' },
      { id: 'results-root', label: 'Results', to: '/result-processing', icon: Database, moduleKey: 'resultProcessing' },
      { id: 'grade-cards-root', label: 'Grade Cards', to: '/grade-card', icon: Award, moduleKey: 'gradeCards' },
      { id: 'transcripts-root', label: 'Transcripts', to: '/transcript', icon: FileText, moduleKey: 'transcripts' },
      { id: 'exam-reports-root', label: 'Reports', to: '/examination-reports', icon: BarChart3, moduleKey: 'reports' },
    ],
  },
  {
    id: 'library',
    label: 'Library',
    icon: BookOpen,
    children: [
      { id: 'library-root', label: 'Library', to: '/library', icon: BookOpen, moduleKey: 'library' },
      { id: 'library-books-root', label: 'Books', icon: BookOpen, disabled: true, comingSoon: true },
      { id: 'library-categories-root', label: 'Categories', icon: Layers, disabled: true, comingSoon: true },
      { id: 'library-members-root', label: 'Members', icon: Users, disabled: true, comingSoon: true },
      { id: 'library-issues-root', label: 'Issue Books', icon: BookOpen, disabled: true, comingSoon: true },
      { id: 'library-return-root', label: 'Return Books', icon: BookOpen, disabled: true, comingSoon: true },
      { id: 'library-reservations-root', label: 'Reservations', icon: CalendarDays, disabled: true, comingSoon: true },
      { id: 'library-renewals-root', label: 'Renewals', icon: CalendarDays, disabled: true, comingSoon: true },
      { id: 'library-fines-root', label: 'Fines', icon: Wallet, disabled: true, comingSoon: true },
      { id: 'library-damages-root', label: 'Damages', icon: ShieldCheck, disabled: true, comingSoon: true },
      { id: 'library-lost-root', label: 'Lost Books', icon: HelpCircle, disabled: true, comingSoon: true },
    ],
  },
  {
    id: 'hostel',
    label: 'Hostel',
    icon: Home,
    children: [
      { id: 'hostel-root', label: 'Hostel', to: '/hostel', icon: Home, moduleKey: 'hostel' },
      { id: 'hostel-rooms-root', label: 'Rooms', icon: Building, disabled: true, comingSoon: true },
      { id: 'hostel-allocations-root', label: 'Allocations', icon: Layers, disabled: true, comingSoon: true },
      { id: 'hostel-visitors-root', label: 'Visitors', icon: Users, disabled: true, comingSoon: true },
      { id: 'hostel-complaints-root', label: 'Complaints', icon: ShieldCheck, disabled: true, comingSoon: true },
      { id: 'hostel-fees-root', label: 'Fees', icon: Wallet, disabled: true, comingSoon: true },
      { id: 'hostel-wardens-root', label: 'Wardens', icon: School, disabled: true, comingSoon: true },
      { id: 'hostel-maintenance-root', label: 'Maintenance', icon: Settings2, disabled: true, comingSoon: true },
    ],
  },
  {
    id: 'transport',
    label: 'Transport',
    icon: Truck,
    children: [
      { id: 'transport-root', label: 'Transport', to: '/transport', icon: Truck, moduleKey: 'transport' },
      { id: 'transport-vehicles-root', label: 'Vehicles', icon: Truck, disabled: true, comingSoon: true },
      { id: 'transport-drivers-root', label: 'Drivers', icon: Briefcase, disabled: true, comingSoon: true },
      { id: 'transport-conductors-root', label: 'Conductors', icon: Briefcase, disabled: true, comingSoon: true },
      { id: 'transport-routes-root', label: 'Routes', icon: CalendarDays, disabled: true, comingSoon: true },
      { id: 'transport-stops-root', label: 'Stops', icon: Layers, disabled: true, comingSoon: true },
      { id: 'transport-student-assignments-root', label: 'Student Assignments', icon: Users, disabled: true, comingSoon: true },
      { id: 'transport-employee-assignments-root', label: 'Employee Assignments', icon: Briefcase, disabled: true, comingSoon: true },
      { id: 'transport-fuel-root', label: 'Fuel Entries', icon: Fuel, disabled: true, comingSoon: true },
      { id: 'transport-maintenance-root', label: 'Maintenance', icon: Settings2, disabled: true, comingSoon: true },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: Wallet,
    children: [
      { id: 'finance-fee-collection-root', label: 'Fee Collection', icon: Wallet, disabled: true, comingSoon: true },
      { id: 'finance-scholarships-root', label: 'Scholarships', icon: Award, disabled: true, comingSoon: true },
      { id: 'finance-payments-root', label: 'Payments', icon: Wallet, disabled: true, comingSoon: true },
      { id: 'finance-receipts-root', label: 'Receipts', icon: ClipboardCheck, disabled: true, comingSoon: true },
      { id: 'finance-accounts-root', label: 'Accounts', icon: Database, disabled: true, comingSoon: true },
      { id: 'finance-income-root', label: 'Income', icon: BarChart3, disabled: true, comingSoon: true },
      { id: 'finance-expenses-root', label: 'Expenses', icon: Wallet, disabled: true, comingSoon: true },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Database,
    children: [
      { id: 'inventory-root', label: 'Inventory', to: '/inventory', icon: Database, moduleKey: 'inventory' },
      { id: 'inventory-assets-root', label: 'Assets', icon: Database, disabled: true, comingSoon: true },
      { id: 'inventory-categories-root', label: 'Categories', icon: Layers, disabled: true, comingSoon: true },
      { id: 'inventory-stock-root', label: 'Stock', icon: Database, disabled: true, comingSoon: true },
      { id: 'inventory-vendors-root', label: 'Vendors', icon: Building, disabled: true, comingSoon: true },
      { id: 'inventory-purchase-orders-root', label: 'Purchase Orders', icon: ShoppingCart, disabled: true, comingSoon: true },
      { id: 'inventory-goods-receipts-root', label: 'Goods Receipts', icon: ClipboardCheck, disabled: true, comingSoon: true },
      { id: 'inventory-asset-assignments-root', label: 'Asset Assignments', icon: Briefcase, disabled: true, comingSoon: true },
    ],
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: TrendingUp,
    children: [
      { id: 'crm-root', label: 'CRM', to: '/leads', icon: TrendingUp, moduleKey: 'leads' },
      { id: 'crm-leads-root', label: 'Leads', to: '/leads', icon: TrendingUp, moduleKey: 'leads' },
      { id: 'crm-counselling-root', label: 'Counselling', icon: Users, disabled: true, comingSoon: true },
      { id: 'crm-marketing-root', label: 'Marketing', icon: TrendingUp, disabled: true, comingSoon: true },
      { id: 'crm-campaigns-root', label: 'Campaigns', icon: ClipboardList, disabled: true, comingSoon: true },
    ],
  },
  {
    id: 'lms',
    label: 'LMS',
    icon: Laptop,
    children: [
      { id: 'lms-root', label: 'LMS', to: '/lms', icon: Laptop, moduleKey: 'lms' },
      { id: 'lms-courses-root', label: 'Courses', icon: BookOpen, disabled: true, comingSoon: true },
      { id: 'lms-study-material-root', label: 'Study Material', icon: FileText, disabled: true, comingSoon: true },
      { id: 'lms-video-lectures-root', label: 'Video Lectures', icon: Video, disabled: true, comingSoon: true },
      { id: 'lms-assignments-root', label: 'Assignments', icon: ClipboardList, disabled: true, comingSoon: true },
      { id: 'lms-online-tests-root', label: 'Online Tests', icon: ClipboardCheck, disabled: true, comingSoon: true },
      { id: 'lms-certificates-root', label: 'Certificates', icon: Award, disabled: true, comingSoon: true },
    ],
  },
  {
    id: 'security',
    label: 'Security',
    icon: ShieldCheck,
    children: [
      { id: 'security-root', label: 'Security', to: '/security', icon: ShieldCheck, moduleKey: 'security' },
      { id: 'security-visitors-root', label: 'Visitors', icon: Users, disabled: true, comingSoon: true },
      { id: 'security-gate-pass-root', label: 'Gate Pass', icon: ShieldCheck, disabled: true, comingSoon: true },
      { id: 'security-incidents-root', label: 'Incidents', icon: AlertCircle, disabled: true, comingSoon: true },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    children: [
      { id: 'reports-root', label: 'Reports', to: '/reports', icon: BarChart3, moduleKey: 'reports' },
      { id: 'analytics-root', label: 'Analytics', to: '/analytics', icon: Activity, moduleKey: 'reports' },
      { id: 'notifications-root', label: 'Notifications', to: '/notifications', icon: Bell, moduleKey: 'notifications' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings2,
    children: [{ id: 'settings-root', label: 'Settings', to: '/settings', icon: Settings2, moduleKey: 'settings' }],
  },
];

const getMenuGroups = (permissions) => {
  const filterNode = (node) => {
    if (node.children) {
      const filteredChildren = node.children.map(filterNode).filter(Boolean);
      if (filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }
      return null;
    }

    if (!node.moduleKey) return node;
    if (!permissions) return node;
    return hasPermission(permissions, node.moduleKey, 'view') ? node : null;
  };

  return menuGroups.map(filterNode).filter(Boolean);
};

const findMatchingGroup = (groups, pathname) => {
  const walk = (nodes) => {
    for (const node of nodes) {
      if (node.to === pathname) return node.id;
      if (node.children) {
        const childMatch = walk(node.children);
        if (childMatch) return childMatch;
      }
    }
    return null;
  };
  return walk(groups);
};

const readExpandedState = () => {
  if (typeof window === 'undefined') {
    return {}; 
  }

  try {
    const stored = window.localStorage.getItem('erp-sidebar-expanded');
    if (!stored) return {};
    return JSON.parse(stored);
  } catch {
    return {};
  }
};

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const { auth } = useAuth();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState(readExpandedState);
  const visibleGroups = useMemo(() => getMenuGroups(auth?.permissions), [auth?.permissions]);
  const desktopVisibleGroups = useMemo(
    () =>
      visibleGroups
        .filter((group) => !['admissions', 'finance'].includes(group.id))
        .map((group) =>
          group.id === 'reports'
            ? { ...group, children: group.children.filter((child) => child.id !== 'analytics-root') }
            : group,
        ),
    [visibleGroups],
  );

  const filterGroups = (groups) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return groups;

    const filterNode = (node) => {
      const labelMatch = node.label.toLowerCase().includes(query);
      if (node.children) {
        const filteredChildren = node.children.map(filterNode).filter(Boolean);
        if (labelMatch || filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }
        return null;
      }
      return labelMatch ? node : null;
    };

    return groups.map(filterNode).filter(Boolean);
  };

  const desktopFilteredGroups = useMemo(() => filterGroups(desktopVisibleGroups), [searchTerm, desktopVisibleGroups]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('erp-sidebar-expanded', JSON.stringify(expandedGroups));
    }
  }, [expandedGroups]);

  useEffect(() => {
    if (searchTerm.trim()) return;
    const activeGroupId = findMatchingGroup(visibleGroups, location.pathname);
    if (!activeGroupId) return;
    setExpandedGroups((current) => ({ ...current, [activeGroupId]: true }));
  }, [location.pathname, searchTerm, visibleGroups]);

  useEffect(() => {
    const activeElement = document.querySelector(`[data-nav-id="${findMatchingGroup(visibleGroups, location.pathname)}"]`);
    if (activeElement instanceof HTMLElement) {
      activeElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [location.pathname, visibleGroups]);

  const filteredGroups = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return visibleGroups;

    const filterNode = (node) => {
      const labelMatch = node.label.toLowerCase().includes(query);
      if (node.children) {
        const filteredChildren = node.children.map(filterNode).filter(Boolean);
        if (labelMatch || filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }
        return null;
      }
      return labelMatch ? node : null;
    };

    return visibleGroups.map(filterNode).filter(Boolean);
  }, [searchTerm, visibleGroups]);

  const toggleGroup = (groupId) => {
    setExpandedGroups((current) => ({ ...current, [groupId]: !current[groupId] }));
  };

  const onNavigate = () => {
    if (window.innerWidth < 768) onClose();
  };

  return (
    <>
      <aside className="hidden md:fixed md:left-0 md:top-0 md:z-50 md:flex md:h-full md:w-72 md:flex-col md:overflow-y-auto md:border-r md:border-slate-200/10 md:bg-[#05331e] md:px-4 md:py-6 md:shadow-[0_35px_80px_rgba(7,43,22,0.18)] md:backdrop-blur-xl">
        <div className="mb-5 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-100">Enterprise</p>
            <h2 className="text-lg font-semibold text-white">College ERP</h2>
          </div>
        </div>

        <div className="mb-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
          <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/20 px-3 py-2 text-sm text-slate-300">
            <Search className="h-4 w-4 text-emerald-200" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search menu"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#34d399 transparent' }}>
          {desktopFilteredGroups.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-sm text-slate-300">
              No matching menu items.
            </div>
          ) : (
            desktopFilteredGroups.map((group) => (
              <div key={group.id} className="rounded-2xl border border-white/10 bg-white/5 p-2">
                <SidebarMenuItem
                  item={group}
                  isExpanded={expandedGroups[group.id] !== false}
                  onToggle={toggleGroup}
                  onNavigate={onNavigate}
                  activePath={location.pathname}
                />
              </div>
            ))
          )}
        </nav>
      </aside>

      <div className={`fixed inset-0 z-50 md:hidden ${isOpen ? 'block' : 'hidden'}`} role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-black/40" onClick={onClose} />
        <aside className={`fixed left-0 top-0 flex h-full w-[86vw] max-w-[320px] flex-col bg-[#05331e] p-3 shadow-[0_35px_80px_rgba(7,43,22,0.18)] transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-emerald-200/80">Enterprise</p>
                <h2 className="text-lg font-semibold text-slate-50">College ERP</h2>
              </div>
            </div>
            <button onClick={onClose} className="rounded-2xl border border-white/10 px-3 py-2 text-sm text-slate-200">Close</button>
          </div>

          <div className="mb-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/20 px-3 py-2 text-sm text-slate-300">
              <Search className="h-4 w-4 text-emerald-200" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search menu"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
              />
            </label>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#34d399 transparent' }}>
            {filteredGroups.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-sm text-slate-300">
                No matching menu items.
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.id} className="rounded-2xl border border-white/10 bg-white/5 p-2">
                  <SidebarMenuItem
                    item={group}
                    isExpanded={expandedGroups[group.id] !== false}
                    onToggle={toggleGroup}
                    onNavigate={onNavigate}
                    activePath={location.pathname}
                  />
                </div>
              ))
            )}
          </nav>
        </aside>
      </div>
    </>
  );
}

