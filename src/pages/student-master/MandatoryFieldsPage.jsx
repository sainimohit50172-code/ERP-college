import SubPage from '../../components/studentMaster/SubPage.jsx';

const columns = [
  { key: 'field', label: 'Field' },
  { key: 'required', label: 'Required' },
  { key: 'validation', label: 'Validation' },
  { key: 'defaultValue', label: 'Default Value' },
  { key: 'status', label: 'Status' },
];

const demo = [
  { id: 'm1', field: 'firstName', required: 'Yes', validation: 'alpha', defaultValue: '', status: 'Active' },
  { id: 'm2', field: 'aadharNumber', required: 'Yes', validation: 'numeric|12', defaultValue: '', status: 'Active' },
];

export default function MandatoryFieldsPage() {
  return <SubPage title="Mandatory Fields" subtitle="Configure mandatory admission fields." columns={columns} demoData={demo} addLabel="Add Mandatory Field" />;
}
