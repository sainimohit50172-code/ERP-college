import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "memberId", "label": "Member ID"}, {"name": "amount", "label": "Amount", "type": "number"}, {"name": "reason", "label": "Reason"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Pending", "label": "Pending"}, {"value": "Collected", "label": "Collected"}]}];
const columns = [{"key": "memberId", "label": "Member ID"}, {"key": "amount", "label": "Amount"}, {"key": "reason", "label": "Reason"}, {"key": "status", "label": "Status"}];

export default function LibraryFinesPage() {
  return (
    <GenericCrudPage
      title="Library fines"
      subtitle="Track overdue penalties and outstanding fines."
      resource="libraryFines"
      itemLabel="fine"
      initialValues={{"memberId": "", "amount": "", "reason": "", "status": "Pending"}}
      fields={fields}
      columns={columns}
    />
  );
}
