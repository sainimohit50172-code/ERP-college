const STORAGE_KEY = 'erp_role_permissions';

export const ACTIONS = ['view', 'create', 'edit', 'delete', 'approve', 'export', 'print', 'import'];

export const MODULES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'admissions', label: 'Admissions' },
  { key: 'students', label: 'Students' },
  { key: 'teachers', label: 'Teachers' },
  { key: 'employees', label: 'Employees' },
  { key: 'leaveManagement', label: 'Leave Management' },
  { key: 'payroll', label: 'Payroll Management' },
  { key: 'finance', label: 'Finance & Accounting' },
  { key: 'courses', label: 'Courses' },
  { key: 'departments', label: 'Departments' },
  { key: 'designations', label: 'Designations' },
  { key: 'organizations', label: 'Organizations' },
  { key: 'hrDocuments', label: 'HR Documents' },
  { key: 'semesters', label: 'Semesters' },
  { key: 'sections', label: 'Sections' },
  { key: 'subjects', label: 'Subjects' },
  { key: 'classrooms', label: 'Classrooms' },
  { key: 'subjectAssignments', label: 'Subject Assignments' },
  { key: 'teacherAssignments', label: 'Teacher Assignments' },
  { key: 'teacherSchedule', label: 'Teacher Schedule' },
  { key: 'calendar', label: 'Academic Calendar' },
  { key: 'timetable', label: 'Timetable' },
  { key: 'lectureNotes', label: 'Lecture Notes' },
  { key: 'syllabus', label: 'Syllabus' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'library', label: 'Library' },
  { key: 'hostel', label: 'Hostel' },
  { key: 'transport', label: 'Transport' },
  { key: 'security', label: 'Security' },
  { key: 'inventory', label: 'Inventory & Procurement' },
  { key: 'lms', label: 'LMS' },
  { key: 'leads', label: 'Leads' },
  { key: 'fees', label: 'Fees' },
  { key: 'feePayments', label: 'Fee Payments' },
  { key: 'questionBank', label: 'Question Bank' },
  { key: 'internalMarks', label: 'Internal Marks' },
  { key: 'practicalMarks', label: 'Practical Marks' },
  { key: 'examination', label: 'Examination' },
  { key: 'examAttendance', label: 'Exam Attendance' },
  { key: 'seatingPlan', label: 'Seating Plan' },
  { key: 'gradeCards', label: 'Grade Cards' },
  { key: 'transcripts', label: 'Transcripts' },
  { key: 'promotions', label: 'Student Promotion' },
  { key: 'reports', label: 'Reports' },
  { key: 'resultProcessing', label: 'Result Processing' },
  { key: 'auditLog', label: 'Audit Log' },
  { key: 'permissionMatrix', label: 'Permission Matrix' },
  { key: 'settings', label: 'Settings' },
];

export const ROLES = [
  'Super Admin',
  'Admin',
  'Principal',
  'HOD',
  'Faculty',
  'Accountant',
  'Librarian',
  'Transport Manager',
  'Hostel Warden',
  'HR Manager',
  'Student',
  'Parent',
  'Security Guard',
  'Director',
  'Dean',
  'Telecaller',
  'Admission Counselor',
  'Receptionist',
];

const ROLE_ALIASES = {
  Teacher: 'Faculty',
  HR: 'HR Manager',
  Library: 'Librarian',
  Hostel: 'Hostel Warden',
  Transport: 'Transport Manager',
};

const fillActions = (actions) => MODULES.reduce((acc, module) => {
  if (actions === 'all') {
    acc[module.key] = [...ACTIONS];
  } else {
    acc[module.key] = actions[module.key] || [];
  }
  return acc;
}, {});

const defaultReadOnly = MODULES.reduce((acc, module) => {
  acc[module.key] = ['view'];
  return acc;
}, {});

const roleActions = {
  'Super Admin': 'all',
  'Admin': 'all',
  'Principal': {
    dashboard: ['view'],
    admissions: ['view', 'approve'],
    students: ['view', 'edit', 'approve'],
    teachers: ['view', 'approve'],
    employees: ['view'],
    courses: ['view'],
    departments: ['view'],
    semesters: ['view'],
    sections: ['view'],
    subjects: ['view'],
    classrooms: ['view'],
    subjectAssignments: ['view'],
    teacherAssignments: ['view'],
    teacherSchedule: ['view'],
    calendar: ['view'],
    timetable: ['view'],
    lectureNotes: ['view'],
    syllabus: ['view'],
    assignments: ['view'],
    attendance: ['view'],
    library: ['view'],
    hostel: ['view'],
    transport: ['view'],
    security: ['view'],
    inventory: ['view', 'create', 'edit', 'delete', 'export'],
    lms: ['view'],
    leads: ['view'],
    fees: ['view', 'approve'],
    feePayments: ['view', 'approve'],
    questionBank: ['view'],
    internalMarks: ['view'],
    practicalMarks: ['view'],
    examination: ['view', 'approve'],
    examAttendance: ['view'],
    seatingPlan: ['view'],
    gradeCards: ['view'],
    transcripts: ['view'],
    promotions: ['view'],
    reports: ['view', 'export', 'print'],
    resultProcessing: ['view'],
    auditLog: ['view'],
    permissionMatrix: ['view'],
    settings: ['view'],
  },
  'HOD': {
    dashboard: ['view'],
    students: ['view', 'edit'],
    teachers: ['view'],
    departments: ['view'],
    subjects: ['view'],
    classrooms: ['view'],
    syllabus: ['view', 'edit'],
    lectureNotes: ['view', 'edit'],
    examination: ['view', 'approve'],
    reports: ['view', 'export'],
    auditLog: ['view'],
  },
  'Faculty': {
    dashboard: ['view'],
    students: ['view'],
    attendance: ['view', 'edit'],
    lectureNotes: ['view', 'create', 'edit'],
    questionBank: ['view', 'create', 'edit'],
    syllabus: ['view'],
    reports: ['view', 'print'],
    auditLog: ['view'],
    teacherAssignments: ['view'],
    teacherSchedule: ['view'],
    classes: ['view'],
  },
  'Accountant': {
    dashboard: ['view'],
    fees: ['view', 'create', 'edit', 'export', 'print'],
    feePayments: ['view', 'create', 'edit', 'export', 'print'],
    reports: ['view', 'export', 'print'],
    auditLog: ['view'],
    settings: ['view'],
  },
  'Librarian': {
    dashboard: ['view'],
    library: ['view', 'create', 'edit', 'delete', 'export'],
    reports: ['view', 'export'],
    auditLog: ['view'],
    settings: ['view'],
  },
  'Hostel Warden': {
    dashboard: ['view'],
    hostel: ['view', 'create', 'edit', 'delete', 'export'],
    reports: ['view', 'export'],
    auditLog: ['view'],
    settings: ['view'],
  },
  'Transport Manager': {
    dashboard: ['view'],
    transport: ['view', 'create', 'edit', 'delete', 'export'],
    reports: ['view', 'export'],
    auditLog: ['view'],
    settings: ['view'],
  },
  'Security Guard': {
    dashboard: ['view'],
    security: ['view', 'create', 'edit'],
    reports: ['view'],
    auditLog: ['view'],
  },
  'HR Manager': {
    dashboard: ['view'],
    employees: ['view', 'create', 'edit', 'delete', 'export'],
    leaveManagement: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'print'],
    payroll: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'print'],
    finance: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'print'],
    designations: ['view', 'create', 'edit', 'delete', 'export'],
    organizations: ['view', 'create', 'edit', 'delete', 'export'],
    hrDocuments: ['view', 'create', 'edit', 'delete', 'export'],
    admissions: ['view'],
    reports: ['view', 'export'],
    auditLog: ['view'],
    settings: ['view'],
  },
  'Student': {
    dashboard: ['view'],
    attendance: ['view'],
    lectureNotes: ['view'],
    lms: ['view'],
    questionBank: ['view'],
    gradeCards: ['view'],
    transcripts: ['view'],
    reports: ['view'],
    assignments: ['view'],
  },
  'Parent': {
    dashboard: ['view'],
    attendance: ['view'],
    lectureNotes: ['view'],
    lms: ['view'],
    questionBank: ['view'],
    gradeCards: ['view'],
    transcripts: ['view'],
    reports: ['view'],
    assignments: ['view'],
  },
  'Director': {
    ...defaultReadOnly,
    admissions: ['view', 'approve'],
    fees: ['view', 'approve'],
    reports: ['view', 'export', 'print'],
    auditLog: ['view'],
  },
  'Dean': {
    ...defaultReadOnly,
    students: ['view', 'approve'],
    teachers: ['view', 'approve'],
    reports: ['view', 'export'],
    auditLog: ['view'],
  },
  'Telecaller': {
    dashboard: ['view'],
    admissions: ['view', 'create'],
    leads: ['view', 'create', 'edit'],
    reports: ['view'],
    auditLog: ['view'],
  },
  'Admission Counselor': {
    dashboard: ['view'],
    admissions: ['view', 'create', 'edit'],
    leads: ['view', 'create'],
    reports: ['view'],
    auditLog: ['view'],
  },
  'Receptionist': {
    dashboard: ['view'],
    admissions: ['view', 'create'],
    employees: ['view'],
    reports: ['view'],
    auditLog: ['view'],
  },
};

function normalizeRole(role) {
  if (!role) return 'Super Admin';
  return ROLE_ALIASES[role] || role;
}

function loadSavedPermissions() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

function savePermissions(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getRoles() {
  return [...ROLES];
}

export function getActions() {
  return [...ACTIONS];
}

export function getModules() {
  return [...MODULES];
}

export function getRolePermissions(role) {
  const normalizedRole = normalizeRole(role);
  const savedPermissions = loadSavedPermissions();
  const customActions = savedPermissions[normalizedRole];
  if (customActions) {
    return fillActions(customActions);
  }
  const defaultActions = roleActions[normalizedRole];
  if (!defaultActions) {
    return fillActions(defaultReadOnly);
  }
  return fillActions(defaultActions);
}

export function updateRolePermissions(role, actionsByModule) {
  const normalizedRole = normalizeRole(role);
  const savedPermissions = loadSavedPermissions();
  savedPermissions[normalizedRole] = actionsByModule;
  savePermissions(savedPermissions);
  return fillActions(actionsByModule);
}

export function resetRolePermissions(role) {
  const normalizedRole = normalizeRole(role);
  const savedPermissions = loadSavedPermissions();
  if (savedPermissions[normalizedRole]) {
    delete savedPermissions[normalizedRole];
    savePermissions(savedPermissions);
  }
  return getRolePermissions(normalizedRole);
}

export function getPermissionsForRole(role) {
  return getRolePermissions(role);
}

export function hasPermission(permissions, moduleKey, action = 'view') {
  if (!permissions || !moduleKey) return false;
  const moduleActions = permissions[moduleKey];
  if (!moduleActions) return false;
  return moduleActions.includes(action);
}

export function getModuleLabel(moduleKey) {
  return MODULES.find((item) => item.key === moduleKey)?.label || moduleKey;
}
