import AttendanceModule from '../components/attendance/AttendanceModule.jsx';

export default function TeacherAttendancePage() {
  return (
    <AttendanceModule
      scope="teacher"
      title="Teacher attendance"
      subtitle="Track faculty presence, late arrivals, leave requests and lesson-level attendance records."
      entityLabel="Teacher"
      entityPlaceholder="Dr. Priya Menon"
    />
  );
}
