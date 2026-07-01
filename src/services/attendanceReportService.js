import { listAttendance } from './attendanceService.js';

function escapeCsvValue(value) {
  const stringValue = String(value ?? '');
  return /[",\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
}

export async function getAttendanceReport(scope = 'student', params = {}) {
  const response = await listAttendance(scope, params);
  return {
    items: response.items,
    total: response.total,
    exportRows: response.items.map((item) => ({
      date: item.date,
      studentId: item.studentId || item.teacherName || item.employeeName || item.guardName || '',
      name: item.studentName || item.teacherName || item.employeeName || item.guardName || '',
      department: item.department || '',
      subject: item.subject || '',
      course: item.course || '',
      status: item.status || '',
      remarks: item.remarks || '',
    })),
  };
}

export function buildAttendanceCsv(rows = []) {
  const header = ['Date', 'Student/Staff', 'Department', 'Subject', 'Course', 'Status', 'Remarks'];
  const content = [header, ...rows.map((row) => [row.date, row.name, row.department, row.subject, row.course, row.status, row.remarks])]
    .map((line) => line.map(escapeCsvValue).join(','))
    .join('\n');
  return new Blob([content], { type: 'text/csv;charset=utf-8;' });
}

export default {
  getAttendanceReport,
  buildAttendanceCsv,
};
