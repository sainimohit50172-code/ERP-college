import HostelModulePage from './hostel/HostelModulePage.jsx';

const initialAvailableRooms = [
  { id: 1, roomNumber: 'A-401', block: 'A', floor: '4', roomType: 'Single', capacity: '1', status: 'Available' },
  { id: 2, roomNumber: 'C-202', block: 'C', floor: '2', roomType: 'Double', capacity: '2', status: 'Available' },
  { id: 3, roomNumber: 'D-301', block: 'D', floor: '3', roomType: 'Double', capacity: '2', status: 'Available' },
];

const formFields = [
  { key: 'roomNumber', label: 'Room Number', required: true },
  { key: 'block', label: 'Block', required: true },
  { key: 'floor', label: 'Floor', required: true },
  { key: 'roomType', label: 'Room Type', required: true },
  { key: 'capacity', label: 'Capacity', required: true },
  { key: 'status', label: 'Status', required: true, type: 'select', options: [{ value: 'Available', label: 'Available' }, { value: 'Full', label: 'Full' }, { value: 'Maintenance', label: 'Maintenance' }] },
];

const columns = [
  { key: 'roomNumber', label: 'Room Number' },
  { key: 'block', label: 'Block' },
  { key: 'floor', label: 'Floor' },
  { key: 'roomType', label: 'Room Type' },
  { key: 'capacity', label: 'Capacity' },
  { key: 'status', label: 'Status' },
];

export default function HostelAvailablePage() {
  return (
    <HostelModulePage
      title="Available Rooms"
      subtitle="List and manage rooms that are currently available for allocation."
      breadcrumbLabel="Available"
      breadcrumbItems={[
        { label: 'Settings', to: '/settings' },
        { label: 'Institute Setup', to: '/settings/institute' },
        { label: 'Available Rooms' },
      ]}
      addLabel="Add Room"
      initialItems={initialAvailableRooms}
      columns={columns}
      formFields={formFields}
      initialFormState={{ roomNumber: '', block: '', floor: '', roomType: '', capacity: '', status: 'Available' }}
      filterConfig={{ key: 'status', allLabel: 'All Status', options: [{ value: 'Available', label: 'Available' }, { value: 'Full', label: 'Full' }, { value: 'Maintenance', label: 'Maintenance' }] }}
      summaryText="Currently available rooms ready for occupancy"
      buildItem={(form) => ({
        roomNumber: form.roomNumber.trim(),
        block: form.block.trim(),
        floor: form.floor.trim(),
        roomType: form.roomType.trim(),
        capacity: form.capacity.trim(),
        status: form.status,
      })}
    />
  );
}
