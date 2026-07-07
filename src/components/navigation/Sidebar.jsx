import { useLocation } from 'react-router-dom';
import {
  Home,
  UserPlus,
  Users,
  ChevronRight,
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
import { useERP } from '../../services/ERPContext.jsx';
import { Link } from 'react-router-dom';
import SidebarMenuItem from './SidebarMenuItem.jsx';

const menuGroups = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, children: [{ id: 'dashboard-root', label: 'Dashboard', to: '/', icon: Home, moduleKey: 'dashboard' }] },
  {
    id: 'admissions',
    label: 'Admissions',
    icon: UserPlus,
    children: [
      { id: 'admissions-root', label: 'Admissions', to: '/admissions', icon: UserPlus, moduleKey: 'admissions' },
      { id: 'enquiries', label: 'Enquiries', to: '/enquiries', icon: HelpCircle, moduleKey: 'admissions' },
      { id: 'counselling', label: 'Counselling', to: '/counselling', icon: Users, moduleKey: 'admissions' },
      { id: 'applications', label: 'Applications', to: '/applications', icon: ClipboardList, moduleKey: 'admissions' },
    ],
  },
  {
    id: 'students',
    label: 'Students',
    icon: Users,
    children: [
      { id: 'students-root', label: 'Student Management', to: '/students', icon: Users, moduleKey: 'students' },
      { id: 'promotions', label: 'Promotions', to: '/student-promotion', icon: TrendingUp, moduleKey: 'promotions' },
      { id: 'certificates', label: 'Certificates', to: '/student-certificates', icon: Award, moduleKey: 'students' },
      { id: 'alumni', label: 'Alumni', to: '/alumni', icon: Users, moduleKey: 'students' },
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
      { id: 'library-books-root', label: 'Books', to: '/library/books', icon: BookOpen, moduleKey: 'library' },
      { id: 'library-categories-root', label: 'Categories', to: '/library/categories', icon: Layers, moduleKey: 'library' },
      { id: 'library-members-root', label: 'Members', to: '/library/members', icon: Users, moduleKey: 'library' },
      { id: 'library-issues-root', label: 'Issue Books', to: '/library/issues', icon: BookOpen, moduleKey: 'library' },
      { id: 'library-return-root', label: 'Return Books', to: '/library/returns', icon: BookOpen, moduleKey: 'library' },
      { id: 'library-reservations-root', label: 'Reservations', to: '/library/reservations', icon: CalendarDays, moduleKey: 'library' },
      { id: 'library-renewals-root', label: 'Renewals', to: '/library/renewals', icon: CalendarDays, moduleKey: 'library' },
      { id: 'library-fines-root', label: 'Fines', to: '/library/fines', icon: Wallet, moduleKey: 'library' },
      { id: 'library-damages-root', label: 'Damages', to: '/library/damages', icon: ShieldCheck, moduleKey: 'library' },
      { id: 'library-lost-root', label: 'Lost Books', to: '/library/lost', icon: HelpCircle, moduleKey: 'library' },
    ],
  },
  {
    id: 'hostel',
    label: 'Hostel',
    icon: Home,
    children: [
      { id: 'hostel-root', label: 'Hostel', to: '/hostel', icon: Home, moduleKey: 'hostel' },
      { id: 'hostel-rooms-root', label: 'Rooms', to: '/hostel/rooms', icon: Building, moduleKey: 'hostel' },
      { id: 'hostel-allocations-root', label: 'Allocations', to: '/hostel/allocations', icon: Layers, moduleKey: 'hostel' },
      { id: 'hostel-visitors-root', label: 'Visitors', to: '/hostel/visitors', icon: Users, moduleKey: 'hostel' },
      { id: 'hostel-complaints-root', label: 'Complaints', to: '/hostel/complaints', icon: ShieldCheck, moduleKey: 'hostel' },
      { id: 'hostel-fees-root', label: 'Fees', to: '/hostel/fees', icon: Wallet, moduleKey: 'hostel' },
      { id: 'hostel-wardens-root', label: 'Wardens', to: '/hostel/wardens', icon: School, moduleKey: 'hostel' },
      { id: 'hostel-maintenance-root', label: 'Maintenance', to: '/hostel/maintenance', icon: Settings2, moduleKey: 'hostel' },
    ],
  },
  {
    id: 'transport',
    label: 'Transport',
    icon: Truck,
    children: [
      { id: 'transport-root', label: 'Transport', to: '/transport', icon: Truck, moduleKey: 'transport' },
      { id: 'transport-vehicles-root', label: 'Vehicles', to: '/transport/vehicles', icon: Truck, moduleKey: 'transport' },
      { id: 'transport-drivers-root', label: 'Drivers', to: '/transport/drivers', icon: Briefcase, moduleKey: 'transport' },
      { id: 'transport-conductors-root', label: 'Conductors', to: '/transport/conductors', icon: Briefcase, moduleKey: 'transport' },
      { id: 'transport-routes-root', label: 'Routes', to: '/transport/routes', icon: CalendarDays, moduleKey: 'transport' },
      { id: 'transport-stops-root', label: 'Stops', to: '/transport/stops', icon: Layers, moduleKey: 'transport' },
      { id: 'transport-student-assignments-root', label: 'Student Assignments', to: '/transport/student-assignments', icon: Users, moduleKey: 'transport' },
      { id: 'transport-employee-assignments-root', label: 'Employee Assignments', to: '/transport/employee-assignments', icon: Briefcase, moduleKey: 'transport' },
      { id: 'transport-fuel-root', label: 'Fuel Entries', to: '/transport/fuel', icon: Fuel, moduleKey: 'transport' },
      { id: 'transport-maintenance-root', label: 'Maintenance', to: '/transport/maintenance', icon: Settings2, moduleKey: 'transport' },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: Wallet,
    children: [
      { id: 'finance-fee-collection-root', label: 'Fee Collection', to: '/fee-collection', icon: Wallet, moduleKey: 'fees' },
      { id: 'finance-scholarships-root', label: 'Scholarships', to: '/scholarships', icon: Award, moduleKey: 'fees' },
      { id: 'finance-payments-root', label: 'Payments', to: '/payments', icon: Wallet, moduleKey: 'fees' },
      { id: 'finance-receipts-root', label: 'Receipts', to: '/receipts', icon: ClipboardCheck, moduleKey: 'fees' },
      { id: 'finance-accounts-root', label: 'Accounts', to: '/accounts', icon: Database, moduleKey: 'finance' },
      { id: 'finance-income-root', label: 'Income', to: '/income', icon: BarChart3, moduleKey: 'finance' },
      { id: 'finance-expenses-root', label: 'Expenses', to: '/expenses', icon: Wallet, moduleKey: 'finance' },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Database,
    children: [
      { id: 'inventory-root', label: 'Inventory', to: '/inventory', icon: Database, moduleKey: 'inventory' },
      { id: 'inventory-assets-root', label: 'Assets', to: '/inventory/assets', icon: Database, moduleKey: 'inventory' },
      { id: 'inventory-categories-root', label: 'Categories', to: '/inventory/categories', icon: Layers, moduleKey: 'inventory' },
      { id: 'inventory-stock-root', label: 'Stock', to: '/inventory/stock', icon: Database, moduleKey: 'inventory' },
      { id: 'inventory-vendors-root', label: 'Vendors', to: '/inventory/vendors', icon: Building, moduleKey: 'inventory' },
      { id: 'inventory-purchase-orders-root', label: 'Purchase Orders', to: '/inventory/purchase-orders', icon: ShoppingCart, moduleKey: 'inventory' },
      { id: 'inventory-goods-receipts-root', label: 'Goods Receipts', to: '/inventory/goods-receipts', icon: ClipboardCheck, moduleKey: 'inventory' },
      { id: 'inventory-asset-assignments-root', label: 'Asset Assignments', to: '/inventory/asset-assignments', icon: Briefcase, moduleKey: 'inventory' },
    ],
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: TrendingUp,
    children: [
      { id: 'crm-root', label: 'CRM', to: '/leads', icon: TrendingUp, moduleKey: 'leads' },
      { id: 'crm-leads-root', label: 'Leads', to: '/leads', icon: TrendingUp, moduleKey: 'leads' },
      { id: 'crm-counselling-root', label: 'Counselling', to: '/counselling', icon: Users, moduleKey: 'leads' },
      { id: 'crm-marketing-root', label: 'Marketing', to: '/marketing', icon: TrendingUp, moduleKey: 'leads' },
      { id: 'crm-campaigns-root', label: 'Campaigns', to: '/campaigns', icon: ClipboardList, moduleKey: 'leads' },
    ],
  },
  {
    id: 'lms',
    label: 'LMS',
    icon: Laptop,
    children: [
      { id: 'lms-root', label: 'LMS', to: '/lms', icon: Laptop, moduleKey: 'lms' },
      { id: 'lms-courses-root', label: 'Courses', to: '/lms/courses', icon: BookOpen, moduleKey: 'lms' },
      { id: 'lms-study-material-root', label: 'Study Material', to: '/lms/study-material', icon: FileText, moduleKey: 'lms' },
      { id: 'lms-video-lectures-root', label: 'Video Lectures', to: '/lms/video-lectures', icon: Video, moduleKey: 'lms' },
      { id: 'lms-assignments-root', label: 'Assignments', to: '/assignments', icon: ClipboardList, moduleKey: 'lms' },
      { id: 'lms-online-tests-root', label: 'Online Tests', to: '/lms/online-tests', icon: ClipboardCheck, moduleKey: 'lms' },
      { id: 'lms-certificates-root', label: 'Certificates', to: '/lms/certificates', icon: Award, moduleKey: 'lms' },
    ],
  },
  {
    id: 'security',
    label: 'Security',
    icon: ShieldCheck,
    children: [
      { id: 'security-root', label: 'Security', to: '/security', icon: ShieldCheck, moduleKey: 'security' },
      { id: 'security-visitors-root', label: 'Visitors', to: '/security/visitors', icon: Users, moduleKey: 'security' },
      { id: 'security-gate-pass-root', label: 'Gate Pass', to: '/security/gate-pass', icon: ShieldCheck, moduleKey: 'security' },
      { id: 'security-incidents-root', label: 'Incidents', to: '/security/incidents', icon: AlertCircle, moduleKey: 'security' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    children: [
      { id: 'reports-root', label: 'Reports', to: '/reports', icon: BarChart3, moduleKey: 'reports' },
      { id: 'analytics-root', label: 'Analytics', to: '/analytics', icon: Activity, moduleKey: 'reports' },
      { id: 'notifications-root', label: 'Notifications', to: '/notifications', icon: Bell, moduleKey: 'reports' },
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
  const { sidebarCollapsed, setSidebarCollapsed } = useERP();
  const [isHovered, setIsHovered] = useState(false);
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

  // Flatten groups into direct menu items (no dropdowns)
  const flatMenuItems = useMemo(() => {
    const items = [];
    for (const g of desktopFilteredGroups) {
      if (g.children && g.children.length) {
        for (const c of g.children) items.push(c);
      } else {
        items.push(g);
      }
    }
    return items;
  }, [desktopFilteredGroups]);

  const toggleGroup = (groupId) => {
    setExpandedGroups((current) => ({ ...current, [groupId]: !current[groupId] }));
  };

  const onNavigate = () => {
    if (window.innerWidth < 768) onClose();
  };

  return (
    <>
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="hidden md:fixed md:left-0 md:top-0 md:z-50 md:flex md:flex-col md:overflow-y-auto md:py-4 md:shadow-[0_35px_80px_rgba(7,43,22,0.18)]"
        style={{
          width: sidebarCollapsed && !isHovered ? '72px' : '240px',
          transition: 'width 0.25s ease',
          height: '100vh',
          background: '#0a2e1a',
        }}
      >
        <div style={{ height: 64 }} className="flex items-center px-3">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded"
                style={{ width: 32, height: 32, background: 'transparent' }}
              >
                <ShieldCheck className="h-8 w-8 text-emerald-400" />
              </div>
              <div style={{ opacity: sidebarCollapsed && !isHovered ? 0 : 1, transition: 'opacity 0.2s ease' }}>
                <p className="text-[11px] uppercase tracking-[0.28em]" style={{ color: '#94a3b8' }}>ENTERPRISE</p>
                <h2 className="text-[15px] font-semibold" style={{ color: '#ffffff' }}>College ERP</h2>
              </div>
            </div>
            <button
              onClick={() => setSidebarCollapsed((s) => !s)}
              className="hidden rounded p-1 text-emerald-200 hover:text-white md:inline-flex"
              title="Toggle sidebar"
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
            </button>
          </div>
        </div>

        <div className="mb-3 px-3">
          <label className="flex items-center gap-2 rounded bg-transparent px-2 py-1 text-sm text-slate-300">
            <Search className="h-4 w-4 text-[#86efac]" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search menu"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
              style={{ opacity: sidebarCollapsed && !isHovered ? 0 : 1, transition: 'opacity 0.2s ease' }}
            />
          </label>
        </div>

        <nav className="flex-1 overflow-y-auto px-2" style={{ paddingBottom: 80 }}>
          {flatMenuItems.length === 0 ? (
            <div className="px-3 text-sm text-slate-300">No matching menu items.</div>
          ) : (
            flatMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.to && (location.pathname === item.to || location.pathname.startsWith(`${item.to}/`));
              return (
                <Link
                  key={item.id}
                  to={item.to || '/'}
                  title={sidebarCollapsed && !isHovered ? item.label : ''}
                  onClick={onNavigate}
                  data-nav-id={item.id}
                  className="flex items-center"
                  style={{ height: 52, margin: '6px 8px' }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{ width: 44, height: 44, borderRadius: 8, background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent' }}
                  >
                    {Icon ? (
                      <Icon className="" style={{ width: 20, height: 20, color: isActive ? '#ffffff' : '#86efac' }} />
                    ) : null}
                  </div>
                  <div
                    style={{
                      marginLeft: 12,
                      opacity: sidebarCollapsed && !isHovered ? 0 : 1,
                      transition: 'opacity 0.2s ease',
                      color: isActive ? '#ffffff' : '#86efac',
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    {item.label}
                  </div>
                  {isActive ? (
                    <div style={{ marginLeft: 'auto', borderLeft: '3px solid #4ade80', height: 36, marginRight: 8 }} />
                  ) : null}
                </Link>
              );
            })
          )}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-3">
          <div className="flex items-center gap-3 rounded p-2" style={{ color: '#fff' }}>
            <div style={{ width: 32, height: 32, borderRadius: 999, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#012' }}>
              <span className="font-semibold text-sm">AD</span>
            </div>
            <div style={{ opacity: sidebarCollapsed && !isHovered ? 0 : 1, transition: 'opacity 0.2s ease' }}>
              <div className="text-sm font-semibold">Admin Demo</div>
              <div className="text-xs text-slate-300">Super Admin</div>
            </div>
            <button className="ml-auto rounded p-2 text-slate-200 hover:text-white">Logout</button>
          </div>
        </div>
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

