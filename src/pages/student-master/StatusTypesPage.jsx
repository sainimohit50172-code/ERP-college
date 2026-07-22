import SubPage from '../../components/studentMaster/SubPage.jsx';

const columns = [
  { key: 'type', label: 'Type' },
  { key: 'description', label: 'Description' },
  { key: 'status', label: 'Status' },
];

const demo = [
  { id: 's1', type: 'Active', description: 'Currently enrolled', status: 'Active' },
  { id: 's2', type: 'Graduated', description: 'Completed program', status: 'Active' },
  { id: 's3', type: 'Suspended', description: 'Temporarily suspended', status: 'Active' },
];

export default function StatusTypesPage() {
  return <SubPage title="Student Status Types" subtitle="Manage student lifecycle status." columns={columns} demoData={demo} addLabel="Add Status" />;
}
