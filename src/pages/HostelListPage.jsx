import HostelModulePage from './hostel/HostelModulePage.jsx';

const initialHostels = [
  { id: 1, hostelName: 'Boys Hostel A', hostelType: 'Residential', capacity: '150', warden: 'Rajesh Kumar', address: 'North Wing', status: 'Active' },
  { id: 2, hostelName: 'Girls Hostel A', hostelType: 'Residential', capacity: '120', warden: 'Sunita Sharma', address: 'East Wing', status: 'Active' },
  { id: 3, hostelName: 'Research Hostel', hostelType: 'Scholars', capacity: '80', warden: 'Nitin Rawat', address: 'Research Block', status: 'Maintenance' },
];

const formFields = [
  { key: 'hostelName', label: 'Hostel Name', required: true },
  { key: 'hostelType', label: 'Hostel Type', required: true },
  { key: 'capacity', label: 'Capacity', required: true },
  { key: 'warden', label: 'Warden', required: true },
  { key: 'address', label: 'Address', required: true },
  { key: 'status', label: 'Status', required: true, type: 'select', options: [{ value: 'Active', label: 'Active' }, { value: 'Maintenance', label: 'Maintenance' }, { value: 'Inactive', label: 'Inactive' }] },
];

const columns = [
  { key: 'hostelName', label: 'Hostel Name' },
  { key: 'hostelType', label: 'Hostel Type' },
  { key: 'capacity', label: 'Capacity' },
  { key: 'warden', label: 'Warden' },
  { key: 'status', label: 'Status' },
];

export default function HostelListPage() {
  return (
    <HostelModulePage
      title="Hostel List"
      subtitle="Create and manage hostel profiles, capacities, and wardens from one place."
      breadcrumbLabel="Hostels"
      breadcrumbItems={[
        { label: 'Settings', to: '/settings' },
        { label: 'Institute Setup', to: '/settings/institute' },
        { label: 'Hostel List' },
      ]}
      addLabel="Add Hostel"
      initialItems={initialHostels}
      columns={columns}
      formFields={formFields}
      initialFormState={{ hostelName: '', hostelType: '', capacity: '', warden: '', address: '', status: 'Active' }}
      filterConfig={{ key: 'status', allLabel: 'All Status', options: [{ value: 'Active', label: 'Active' }, { value: 'Maintenance', label: 'Maintenance' }, { value: 'Inactive', label: 'Inactive' }] }}
      summaryText="Hostel profiles and capacity overview"
      buildItem={(form) => ({
        hostelName: form.hostelName.trim(),
        hostelType: form.hostelType.trim(),
        capacity: form.capacity.trim(),
        warden: form.warden.trim(),
        address: form.address.trim(),
        status: form.status,
      })}
    />
  );
}
