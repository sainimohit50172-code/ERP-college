import SubPage from '../../components/studentMaster/SubPage.jsx';

const columns = [
  { key: 'field', label: 'Field' },
  { key: 'value', label: 'Value' },
  { key: 'notes', label: 'Notes' },
  { key: 'status', label: 'Status' },
];

const demo = [
  { id: 'md1', field: 'Blood Group', value: 'B+', notes: '', status: 'Active' },
  { id: 'md2', field: 'Allergies', value: 'Peanuts', notes: 'Carry epipen', status: 'Active' },
];

export default function MedicalRecordsPage() {
  return <SubPage title="Medical Records" subtitle="Configure medical information." columns={columns} demoData={demo} addLabel="Add Medical Record" />;
}
