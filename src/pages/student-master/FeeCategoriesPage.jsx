import SubPage from '../../components/studentMaster/SubPage.jsx';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type' },
  { key: 'description', label: 'Description' },
  { key: 'status', label: 'Status' },
];

const demo = [
  { id: 'fc1', name: 'Regular', type: 'Default', description: 'Standard fee category', status: 'Active' },
  { id: 'fc2', name: 'Scholarship', type: 'Discount', description: 'Scholarship mappings', status: 'Active' },
  { id: 'fc3', name: 'International', type: 'Special', description: 'International students', status: 'Active' },
];

export default function FeeCategoriesPage() {
  return <SubPage title="Fee Categories" subtitle="Manage fee categories." columns={columns} demoData={demo} addLabel="Add Fee Category" />;
}
