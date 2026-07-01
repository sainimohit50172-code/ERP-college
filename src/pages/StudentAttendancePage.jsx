import AttendanceModule from '../components/attendance/AttendanceModule.jsx';

export default function StudentAttendancePage() {
  return (
    <AttendanceModule
      scope="student"
      title="Student attendance"
      subtitle="Manage daily attendance, leave requests, reports and attendance history for students."
      entityLabel="Student"
      entityPlaceholder="Aarav Sharma"
    />
  );
}