import HostelModulePage from './hostel/HostelModulePage.jsx';

const initialAllocations = [
  { id: 1, studentName: 'Aman Sharma', room: 'A-101', hostel: 'Boys Hostel A', allocationDate: '2026-06-01', status: 'Occupied' },
  { id: 2, studentName: 'Nisha Rao', room: 'C-202', hostel: 'Girls Hostel A', allocationDate: '2026-06-02', status: 'Occupied' },
  { id: 3, studentName: 'Arjun Mehta', room: 'A-201', hostel: 'Boys Hostel A', allocationDate: '2026-06-10', status: 'Pending' },
];

const formFields = [
  { key: 'studentName', label: 'Student', required: true },
  { key: 'room', label: 'Room', required: true },
  { key: 'hostel', label: 'Hostel', required: true },
  { key: 'allocationDate', label: 'Allocation Date', required: true },
  { key: 'status', label: 'Status', required: true, type: 'select', options: [{ value: 'Occupied', label: 'Occupied' }, { value: 'Pending', label: 'Pending' }, { value: 'Vacated', label: 'Vacated' }] },
];

const columns = [
  { key: 'studentName', label: 'Student' },
  { key: 'room', label: 'Room' },
  { key: 'hostel', label: 'Hostel' },
  { key: 'allocationDate', label: 'Allocation Date' },
  { key: 'status', label: 'Status' },
];

export default function HostelOccupiedPage() {
  return (
    <HostelModulePage
      title="Occupied Rooms"
      subtitle="Monitor occupied rooms and current student allocations."
      breadcrumbLabel="Occupied"
      breadcrumbItems={[
        { label: 'Settings', to: '/settings' },
        { label: 'Institute Setup', to: '/settings/institute' },
        { label: 'Occupied Rooms' },
      ]}
      addLabel="Add Allocation"
      initialItems={initialAllocations}
      columns={columns}
      formFields={formFields}
      initialFormState={{ studentName: '', room: '', hostel: '', allocationDate: '', status: 'Occupied' }}
      filterConfig={{ key: 'status', allLabel: 'All Status', options: [{ value: 'Occupied', label: 'Occupied' }, { value: 'Pending', label: 'Pending' }, { value: 'Vacated', label: 'Vacated' }] }}
      summaryText="Current occupied room allocation overview"
      buildItem={(form) => ({
        studentName: form.studentName.trim(),
        room: form.room.trim(),
        hostel: form.hostel.trim(),
        allocationDate: form.allocationDate.trim(),
        status: form.status,
      })}
    />
  );
}
