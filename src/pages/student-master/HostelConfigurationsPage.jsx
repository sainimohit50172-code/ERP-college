import SubPage from '../../components/studentMaster/SubPage.jsx';

const columns = [
  { key: 'hostelRequired', label: 'Hostel Required' },
  { key: 'hostelBlock', label: 'Hostel Block' },
  { key: 'roomCategory', label: 'Room Category' },
  { key: 'messRequired', label: 'Mess Required' },
  { key: 'status', label: 'Status' },
];

const demo = [
  { id: 'h1', hostelRequired: 'Yes', hostelBlock: 'A', roomCategory: 'Single', messRequired: 'Yes', status: 'Active' },
  { id: 'h2', hostelRequired: 'No', hostelBlock: '-', roomCategory: '-', messRequired: 'No', status: 'Active' },
];

export default function HostelConfigurationsPage() {
  return <SubPage title="Hostel Configurations" subtitle="Configure hostel settings." columns={columns} demoData={demo} addLabel="Add Hostel Configuration" />;
}
