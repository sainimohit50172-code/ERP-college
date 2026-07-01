import { recordAuditEvent } from './auditService.js';
import { normalizeAcademicContext, normalizeEntityPayload } from '../utils/domainModels.js';

export const ATTENDANCE_STATUSES = ['Present', 'Absent', 'Late', 'Half Day', 'Leave', 'Medical Leave', 'Holiday', 'Online'];

const STORAGE_KEYS = {
  student: 'erp_attendance_student_records',
  teacher: 'erp_attendance_teacher_records',
  employee: 'erp_attendance_employee_records',
  security: 'erp_attendance_security_records',
};

function getStorage() {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

function getSeedRecords(scope) {
  const today = new Date().toISOString().slice(0, 10);
  const commonBase = {
    academicYear: '2025-26',
    campus: 'Main Campus',
    date: today,
    status: 'Present',
    remarks: 'Auto-seeded demo record',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (scope === 'teacher') {
    return [
      { id: 'teacher-1', teacherName: 'Dr. Priya Menon', department: 'Computer Science', subject: 'Data Structures', date: today, status: 'Present', remarks: 'Lecture delivered', ...commonBase },
      { id: 'teacher-2', teacherName: 'Prof. Anand Rao', department: 'Mathematics', subject: 'Calculus', date: today, status: 'Late', remarks: 'Arrived after 10 mins', ...commonBase },
    ];
  }

  if (scope === 'employee') {
    return [
      { id: 'employee-1', employeeName: 'Naveen R.', department: 'Admissions', shift: 'Day', date: today, status: 'Present', remarks: 'Shift covered', ...commonBase },
      { id: 'employee-2', employeeName: 'Leela S.', department: 'Library', shift: 'Afternoon', date: today, status: 'Absent', remarks: 'Pending replacement', ...commonBase },
    ];
  }

  if (scope === 'security') {
    return [
      { id: 'security-1', guardName: 'Ramesh Kumar', post: 'Main Gate', shift: 'Night', date: today, status: 'Present', remarks: 'Gate coverage complete', ...commonBase },
      { id: 'security-2', guardName: 'Arun Das', post: 'Hostel Gate', shift: 'Night', date: today, status: 'Late', remarks: 'Arrived late', ...commonBase },
    ];
  }

  return [
    { id: 'student-1', studentId: 'STU-1001', studentName: 'Aarav Sharma', course: 'BCA', department: 'Computer Science', semester: 'Sem 2', section: 'A', subject: 'Programming', faculty: 'Dr. Priya Menon', date: today, status: 'Present', remarks: 'Attended lab', ...commonBase },
    { id: 'student-2', studentId: 'STU-1002', studentName: 'Meera Nair', course: 'BCA', department: 'Computer Science', semester: 'Sem 2', section: 'A', subject: 'DBMS', faculty: 'Prof. Anand Rao', date: today, status: 'Absent', remarks: 'Leave requested', ...commonBase },
    { id: 'student-3', studentId: 'STU-1003', studentName: 'Rahul Verma', course: 'MBA', department: 'Business', semester: 'Sem 1', section: 'B', subject: 'Economics', faculty: 'Ms. Kavya', date: today, status: 'Late', remarks: 'Arrived 15 mins late', ...commonBase },
  ];
}

function loadRecords(scope) {
  const storage = getStorage();
  const raw = storage?.getItem(STORAGE_KEYS[scope]);
  if (!raw) {
    const seedData = getSeedRecords(scope);
    storage?.setItem(STORAGE_KEYS[scope], JSON.stringify(seedData));
    return seedData;
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : getSeedRecords(scope);
  } catch {
    return getSeedRecords(scope);
  }
}

function saveRecords(scope, records) {
  const storage = getStorage();
  storage?.setItem(STORAGE_KEYS[scope], JSON.stringify(records));
}

function createRecordId(scope) {
  return `${scope}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
}

function normalizeRecord(scope, payload) {
  const base = normalizeEntityPayload(
    {
      ...payload,
      id: payload.id || createRecordId(scope),
      date: payload.date || new Date().toISOString().slice(0, 10),
      timeSlot: payload.timeSlot || '09:00-10:00',
      status: payload.status || 'Present',
      remarks: payload.remarks || '',
    },
    { fallbackContext: normalizeAcademicContext(payload) },
  );

  if (scope === 'teacher') {
    return { ...base, teacherName: payload.teacherName || '', department: payload.department || '', subject: payload.subject || '', faculty: payload.faculty || '' };
  }

  if (scope === 'employee') {
    return { ...base, employeeName: payload.employeeName || '', department: payload.department || '', shift: payload.shift || 'Day' };
  }

  if (scope === 'security') {
    return { ...base, guardName: payload.guardName || '', post: payload.post || '', shift: payload.shift || 'Night' };
  }

  return {
    ...base,
    studentId: payload.studentId || payload.student || '',
    studentName: payload.studentName || payload.student || '',
    course: payload.course || '',
    department: payload.department || '',
    semester: payload.semester || '',
    section: payload.section || '',
    subject: payload.subject || '',
    faculty: payload.faculty || '',
  };
}

function buildAuditDescription(scope, action, id) {
  const entityLabel = scope === 'teacher' ? 'teacher attendance' : scope === 'employee' ? 'employee attendance' : scope === 'security' ? 'security attendance' : 'student attendance';
  return `${action} ${entityLabel} ${id}`;
}

export async function listAttendance(scope = 'student', params = {}) {
  const records = loadRecords(scope);
  const normalizedQuery = (params.query || '').toLowerCase();
  const filtered = records.filter((record) => {
    const searchable = [
      record.studentId,
      record.studentName,
      record.teacherName,
      record.employeeName,
      record.guardName,
      record.course,
      record.department,
      record.semester,
      record.section,
      record.subject,
      record.faculty,
      record.date,
      record.status,
      record.shift,
      record.post,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
    const matchesStatus = !params.status || params.status === 'All' || record.status === params.status;
    const matchesDepartment = !params.department || params.department === 'All' || record.department === params.department;
    const matchesCourse = !params.course || params.course === 'All' || record.course === params.course;
    const matchesSemester = !params.semester || params.semester === 'All' || record.semester === params.semester;
    const matchesSubject = !params.subject || params.subject === 'All' || record.subject === params.subject;
    const matchesFaculty = !params.faculty || params.faculty === 'All' || record.faculty === params.faculty;
    const matchesDateRange = (!params.dateFrom || record.date >= params.dateFrom) && (!params.dateTo || record.date <= params.dateTo);

    return matchesQuery && matchesStatus && matchesDepartment && matchesCourse && matchesSemester && matchesSubject && matchesFaculty && matchesDateRange;
  });

  return { items: filtered, total: filtered.length };
}

export async function createAttendance(scope = 'student', payload) {
  const record = normalizeRecord(scope, payload);
  const next = [record, ...loadRecords(scope)];
  saveRecords(scope, next);
  recordAuditEvent({ action: 'Create', moduleKey: `${scope}-attendance`, description: buildAuditDescription(scope, 'Created', record.id), resourceId: record.id, metadata: { status: record.status, date: record.date } });
  return record;
}

export async function updateAttendance(scope = 'student', id, payload) {
  const records = loadRecords(scope);
  const updated = records.map((record) => (record.id === id ? { ...record, ...payload, updatedAt: new Date().toISOString() } : record));
  saveRecords(scope, updated);
  recordAuditEvent({ action: 'Update', moduleKey: `${scope}-attendance`, description: buildAuditDescription(scope, 'Updated', id), resourceId: id, metadata: { status: payload.status } });
  return updated.find((record) => record.id === id);
}

export async function deleteAttendance(scope = 'student', id) {
  const records = loadRecords(scope).filter((record) => record.id !== id);
  saveRecords(scope, records);
  recordAuditEvent({ action: 'Delete', moduleKey: `${scope}-attendance`, description: buildAuditDescription(scope, 'Deleted', id), resourceId: id });
  return { deletedId: id };
}

export async function bulkCreateAttendance(scope = 'student', payloads = []) {
  const records = payloads.map((payload) => normalizeRecord(scope, payload));
  const existing = loadRecords(scope);
  saveRecords(scope, [...records, ...existing]);
  recordAuditEvent({ action: 'Bulk Create', moduleKey: `${scope}-attendance`, description: `Bulk created ${records.length} attendance entries`, metadata: { count: records.length } });
  return records;
}

export async function getAttendanceSummary(scope = 'student', records = null) {
  const attendanceRecords = records || loadRecords(scope);
  const today = new Date().toISOString().slice(0, 10);
  const todaysRecords = attendanceRecords.filter((record) => record.date === today);
  const presentCount = todaysRecords.filter((record) => record.status === 'Present').length;
  const absentCount = todaysRecords.filter((record) => record.status === 'Absent').length;
  const lateCount = todaysRecords.filter((record) => record.status === 'Late').length;
  const percentage = todaysRecords.length ? Math.round((presentCount / todaysRecords.length) * 100) : 0;
  const lowAttendanceAlerts = attendanceRecords.filter((record) => record.status === 'Absent' || record.status === 'Leave').length;

  return {
    totalRecords: attendanceRecords.length,
    todaysEntries: todaysRecords.length,
    presentCount,
    absentCount,
    lateCount,
    attendancePercentage: percentage,
    lowAttendanceAlerts,
    facultyAttendance: Math.max(1, presentCount),
  };
}

export async function getAttendanceHistory(scope = 'student', studentId) {
  const records = loadRecords(scope)
    .filter((record) => (record.studentId || record.studentName || '').toLowerCase() === String(studentId).toLowerCase())
    .sort((a, b) => b.date.localeCompare(a.date));

  const presentCount = records.filter((record) => record.status === 'Present').length;
  const attendancePercentage = records.length ? Math.round((presentCount / records.length) * 100) : 0;

  return {
    items: records,
    attendancePercentage,
    trends: records.slice(0, 5).map((record) => ({ date: record.date, status: record.status })),
  };
}

export function getDefaultAttendanceValues(scope = 'student') {
  if (scope === 'teacher') {
    return { teacherName: '', department: 'Computer Science', subject: 'Data Structures', status: 'Present', date: new Date().toISOString().slice(0, 10), remarks: '', academicYear: '2025-26', campus: 'Main Campus', timeSlot: '09:00-10:00' };
  }

  if (scope === 'employee') {
    return { employeeName: '', department: 'Admissions', shift: 'Day', status: 'Present', date: new Date().toISOString().slice(0, 10), remarks: '', academicYear: '2025-26', campus: 'Main Campus', timeSlot: '09:00-10:00' };
  }

  if (scope === 'security') {
    return { guardName: '', post: 'Main Gate', shift: 'Night', status: 'Present', date: new Date().toISOString().slice(0, 10), remarks: '', academicYear: '2025-26', campus: 'Main Campus', timeSlot: '20:00-08:00' };
  }

  return { studentId: '', studentName: '', course: 'BCA', department: 'Computer Science', semester: 'Sem 2', section: 'A', subject: 'Programming', faculty: 'Dr. Priya Menon', status: 'Present', date: new Date().toISOString().slice(0, 10), remarks: '', academicYear: '2025-26', campus: 'Main Campus', timeSlot: '09:00-10:00' };
}

export default {
  ATTENDANCE_STATUSES,
  listAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  bulkCreateAttendance,
  getAttendanceSummary,
  getAttendanceHistory,
  getDefaultAttendanceValues,
};
