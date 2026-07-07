import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "studentId", "label": "Student ID"}, {"name": "amount", "label": "Amount", "type": "number"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Pending", "label": "Pending"}, {"value": "Paid", "label": "Paid"}]}];
const columns = [{"key": "studentId", "label": "Student ID"}, {"key": "amount", "label": "Amount"}, {"key": "status", "label": "Status"}];

export default function HostelFeesPage() {
  return (
    <GenericCrudPage
      title="Hostel fees"
      subtitle="Capture hostel fee records and payment status."
      resource="hostelFees"
      itemLabel="hostel fee"
      initialValues={{"studentId": "", "amount": "", "status": "Pending"}}
      fields={fields}
      columns={columns}
    />
  );
}
