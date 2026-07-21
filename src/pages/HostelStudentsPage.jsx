import HostelModulePage from './hostel/HostelModulePage.jsx';

const initialAllocations = [
  { id: 1, studentName: 'Aman Sharma', room: 'A-101', hostel: 'Boys Hostel A', date: '2026-06-01', status: 'Active' },
  { id: 2, studentName: 'Nisha Rao', room: 'C-202', hostel: 'Girls Hostel A', date: '2026-06-02', status: 'Active' },
  { id: 3, studentName: 'Arjun Mehta', room: 'A-201', hostel: 'Boys Hostel A', date: '2026-06-10', status: 'Pending' },
];

const formFields = [
  { key: 'studentName', label: 'Student', required: true },
  { key: 'room', label: 'Room', required: true },
  { key: 'hostel', label: 'Hostel', required: true },
  { key: 'date', label: 'Allocation Date', required: true },
  { key: 'status', label: 'Status', required: true, type: 'select', options: [{ value: 'Active', label: 'Active' }, { value: 'Pending', label: 'Pending' }, { value: 'Completed', label: 'Completed' }] },
];

const columns = [
  { key: 'studentName', label: 'Student' },
  { key: 'room', label: 'Room' },
  { key: 'hostel', label: 'Hostel' },
  { key: 'date', label: 'Allocation Date' },
  { key: 'status', label: 'Status' },
];

export default function HostelStudentsPage() {
  return (
    <HostelModulePage
      title="Student Hostel Allocation"
      subtitle="Allocate and manage hostel placements for students."
      breadcrumbLabel="Students"
      breadcrumbItems={[
        { label: 'Settings', to: '/settings' },
        { label: 'Institute Setup', to: '/settings/institute' },
        { label: 'Student Hostel Allocation' },
      ]}
      addLabel="Allocate Student"
      initialItems={initialAllocations}
      columns={columns}
      formFields={formFields}
      initialFormState={{ studentName: '', room: '', hostel: '', date: '', status: 'Active' }}
      filterConfig={{ key: 'status', allLabel: 'All Status', options: [{ value: 'Active', label: 'Active' }, { value: 'Pending', label: 'Pending' }, { value: 'Completed', label: 'Completed' }] }}
      summaryText="Student allocations and room assignment status"
      buildItem={(form) => ({
        studentName: form.studentName.trim(),
        room: form.room.trim(),
        hostel: form.hostel.trim(),
        date: form.date.trim(),
        status: form.status,
      })}
    />
  );
}
