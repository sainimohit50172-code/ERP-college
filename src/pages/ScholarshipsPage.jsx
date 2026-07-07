import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "name", "label": "Scholarship name"}, {"name": "studentId", "label": "Student ID"}, {"name": "amount", "label": "Amount", "type": "number"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Approved", "label": "Approved"}, {"value": "Pending", "label": "Pending"}]}];
const columns = [{"key": "name", "label": "Scholarship"}, {"key": "studentId", "label": "Student ID"}, {"key": "amount", "label": "Amount"}, {"key": "status", "label": "Status"}];

export default function ScholarshipsPage() {
  return (
    <GenericCrudPage
      title="Scholarships"
      subtitle="Manage scholarship programmes and disbursements."
      resource="scholarships"
      itemLabel="scholarship"
      initialValues={{"name": "", "studentId": "", "amount": "", "status": "Approved"}}
      fields={fields}
      columns={columns}
    />
  );
}
