import SubPage from '../../components/studentMaster/SubPage.jsx';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type' },
  { key: 'example', label: 'Example' },
  { key: 'status', label: 'Status' },
];

const demo = [
  { id: 'a1', name: 'Course', type: 'Select', example: 'BCA', status: 'Active' },
  { id: 'a2', name: 'Department', type: 'Select', example: 'Computer Science', status: 'Active' },
  { id: 'a3', name: 'Semester', type: 'Select', example: 'Odd', status: 'Active' },
];

export default function AcademicFieldsPage() {
  return <SubPage title="Academic Fields" subtitle="Manage academic profile fields." columns={columns} demoData={demo} addLabel="Add Academic Field" />;
}
