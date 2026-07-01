import AttendanceModule from '../components/attendance/AttendanceModule.jsx';

export default function SecurityGuardAttendancePage() {
  return (
    <AttendanceModule
      scope="security"
      title="Security guard attendance"
      subtitle="Track guard duty coverage, shifts and attendance exceptions across campus posts."
      entityLabel="Guard"
      entityPlaceholder="Ramesh Kumar"
    />
  );
}