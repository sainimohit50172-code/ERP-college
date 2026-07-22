import SubPage from '../../components/studentMaster/SubPage.jsx';

const columns = [
  { key: 'relation', label: 'Relation' },
  { key: 'name', label: 'Name' },
  { key: 'occupation', label: 'Occupation' },
  { key: 'income', label: 'Income' },
  { key: 'contact', label: 'Contact' },
  { key: 'status', label: 'Status' },
];

const demo = [
  { id: 'p1', relation: 'Father', name: 'Raj Sharma', occupation: 'Engineer', income: '800000', contact: '9876543210', status: 'Active' },
  { id: 'p2', relation: 'Mother', name: 'Sita Sharma', occupation: 'Teacher', income: '400000', contact: '9876512340', status: 'Active' },
];

export default function ParentFieldsPage() {
  return <SubPage title="Parent Fields" subtitle="Manage parent & guardian information." columns={columns} demoData={demo} addLabel="Add Parent Field" />;
}
