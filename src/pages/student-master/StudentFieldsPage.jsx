import SubPage from '../../components/studentMaster/SubPage.jsx';

const columns = [
  { key: 'fieldName', label: 'Field Name' },
  { key: 'label', label: 'Label' },
  { key: 'section', label: 'Section' },
  { key: 'fieldType', label: 'Field Type' },
  { key: 'mandatory', label: 'Mandatory' },
  { key: 'visible', label: 'Visible' },
  { key: 'status', label: 'Status' },
];

const demo = [
  { id: 'f1', fieldName: 'firstName', label: 'First Name', section: 'Basic', fieldType: 'Text', mandatory: 'Yes', visible: 'Yes', status: 'Active' },
  { id: 'f2', fieldName: 'lastName', label: 'Last Name', section: 'Basic', fieldType: 'Text', mandatory: 'Yes', visible: 'Yes', status: 'Active' },
  { id: 'f3', fieldName: 'dob', label: 'DOB', section: 'Basic', fieldType: 'Date', mandatory: 'Yes', visible: 'Yes', status: 'Active' },
];

export default function StudentFieldsPage() {
  return <SubPage title="Student Fields" subtitle="Manage all student profile fields." columns={columns} demoData={demo} addLabel="Add Student Field" />;
}
