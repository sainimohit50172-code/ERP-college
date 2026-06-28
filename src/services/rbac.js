export const ROLES = [
  'Super Admin',
  'Admin',
  'Principal',
  'Director',
  'Dean',
  'HOD',
  'Teacher',
  'Student',
  'Accountant',
  'Librarian',
  'Hostel Warden',
  'Transport Manager',
  'Security Guard',
  'HR',
  'Telecaller',
  'Admission Counselor',
  'Receptionist',
];

export const ACTIONS = ['view', 'create', 'edit', 'delete', 'import', 'export', 'print', 'approve'];

export const MODULES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'admissions', label: 'Admissions' },
  { key: 'students', label: 'Students' },
  { key: 'teachers', label: 'Teachers' },
  { key: 'employees', label: 'Employees' },
  { key: 'fees', label: 'Fees' },
  { key: 'library', label: 'Library' },
  { key: 'hostel', label: 'Hostel' },
  { key: 'transport', label: 'Transport' },
  { key: 'security', label: 'Security' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'lms', label: 'LMS' },
  { key: 'settings', label: 'Settings' },
  { key: 'leads', label: 'Leads' },
  { key: 'questionBank', label: 'Question Bank' },
  { key: 'internalMarks', label: 'Internal Marks' },
  { key: 'practicalMarks', label: 'Practical Marks' },
  { key: 'examination', label: 'Examination' },
  { key: 'gradeCards', label: 'Grade Cards' },
  { key: 'transcripts', label: 'Transcripts' },
  { key: 'promotions', label: 'Student Promotion' },
  { key: 'teacherAssignments', label: 'Teacher Assignment' },
  { key: 'lectureAttendance', label: 'Lecture Attendance' },
  { key: 'lectureNotes', label: 'Lecture Notes' },
  { key: 'syllabus', label: 'Syllabus' },
  { key: 'calendar', label: 'Academic Calendar' },
  { key: 'timetable', label: 'Timetable' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'reports', label: 'Reports' },
  { key: 'auditLog', label: 'Audit Log' },
  { key: 'permissionMatrix', label: 'Permission Matrix' },
];

const fillActions = (actions) => MODULES.reduce((acc, module) => {
  if (actions === 'all') {
    acc[module.key] = [...ACTIONS];
  } else {
    acc[module.key] = actions[module.key] || [];
  }
  return acc;
}, {});

const defaultAll = MODULES.reduce((acc, module) => {
  acc[module.key] = [...ACTIONS];
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
    students: ['view', 'edit'],
    teachers: ['view', 'approve'],
    employees: ['view'],
    fees: ['view', 'approve'],
    library: ['view'],
    hostel: ['view'],
    transport: ['view'],
    security: ['view'],
    inventory: ['view'],
    lms: ['view'],
    settings: ['view'],
    leads: ['view'],
    questionBank: ['view'],
    internalMarks: ['view'],
    practicalMarks: ['view'],
    examination: ['view', 'approve'],
    gradeCards: ['view'],
    transcripts: ['view'],
    promotions: ['view'],
    teacherAssignments: ['view'],
    lectureAttendance: ['view'],
    lectureNotes: ['view'],
    syllabus: ['view'],
    calendar: ['view'],
    timetable: ['view'],
    attendance: ['view'],
    reports: ['view', 'export', 'print'],
    auditLog: ['view'],
    permissionMatrix: ['view'],
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
  'HOD': {
    dashboard: ['view'],
    students: ['view', 'edit'],
    teachers: ['view'],
    syllabus: ['view', 'edit'],
    lectureNotes: ['view', 'edit'],
    examination: ['view', 'approve'],
    reports: ['view', 'export'],
    auditLog: ['view'],
  },
  'Teacher': {
    dashboard: ['view'],
    students: ['view'],
    attendance: ['view', 'edit'],
    lectureNotes: ['view', 'create', 'edit'],
    questionBank: ['view', 'create', 'edit'],
    syllabus: ['view'],
    reports: ['view', 'print'],
    auditLog: ['view'],
  },
  'Student': {
    dashboard: ['view'],
    attendance: ['view'],
    lectureNotes: ['view'],
    lms: ['view'],
    questionBank: ['view'],
    reports: ['view'],
  },
  'Accountant': {
    dashboard: ['view'],
    fees: ['view', 'create', 'edit', 'export', 'print'],
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
  'HR': {
    dashboard: ['view'],
    employees: ['view', 'create', 'edit', 'delete', 'export'],
    admissions: ['view'],
    reports: ['view', 'export'],
    auditLog: ['view'],
    settings: ['view'],
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

export function getPermissionsForRole(role) {
  if (!roleActions[role]) {
    return fillActions(defaultReadOnly);
  }
  return fillActions(roleActions[role]);
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
