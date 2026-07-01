import AttendanceModule from '../components/attendance/AttendanceModule.jsx';

export default function EmployeeAttendancePage() {
  return (
    <AttendanceModule
      scope="employee"
      title="Employee attendance"
      subtitle="Manage non-teaching staff attendance, shifts and absence coverage."
      entityLabel="Employee"
      entityPlaceholder="Naveen R."
    />
  );
}