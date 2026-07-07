import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "name", "label": "Student name"}, {"name": "certificateType", "label": "Certificate type"}, {"name": "issueDate", "label": "Issue date", "type": "date"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Issued", "label": "Issued"}, {"value": "Pending", "label": "Pending"}, {"value": "Revoked", "label": "Revoked"}]}];
const columns = [{"key": "name", "label": "Student"}, {"key": "certificateType", "label": "Certificate type"}, {"key": "issueDate", "label": "Issue date"}, {"key": "status", "label": "Status"}];

export default function StudentCertificatesPage() {
  return (
    <GenericCrudPage
      title="Student certificates"
      subtitle="Generate and track certificates for completed academic milestones."
      resource="students"
      itemLabel="certificate"
      initialValues={{"name": "", "certificateType": "Completion", "issueDate": "", "status": "Issued"}}
      fields={fields}
      columns={columns}
    />
  );
}
