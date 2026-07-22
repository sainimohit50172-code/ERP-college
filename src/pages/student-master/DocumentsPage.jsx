import SubPage from '../../components/studentMaster/SubPage.jsx';

const columns = [
  { key: 'document', label: 'Document' },
  { key: 'mandatory', label: 'Mandatory' },
  { key: 'uploadEnabled', label: 'Upload Enabled' },
  { key: 'status', label: 'Status' },
];

const demo = [
  { id: 'd1', document: 'Passport Photo', mandatory: 'Yes', uploadEnabled: 'Yes', status: 'Active' },
  { id: 'd2', document: 'Aadhar Card', mandatory: 'Yes', uploadEnabled: 'Yes', status: 'Active' },
  { id: 'd3', document: 'Birth Certificate', mandatory: 'No', uploadEnabled: 'Yes', status: 'Active' },
];

export default function DocumentsPage() {
  return <SubPage title="Documents Required" subtitle="Configure required admission documents." columns={columns} demoData={demo} addLabel="Add Document" />;
}
