import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "studentId", "label": "Student ID"}, {"name": "amount", "label": "Amount", "type": "number"}, {"name": "paymentDate", "label": "Payment date", "type": "date"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Paid", "label": "Paid"}, {"value": "Pending", "label": "Pending"}]}];
const columns = [{"key": "studentId", "label": "Student ID"}, {"key": "amount", "label": "Amount"}, {"key": "paymentDate", "label": "Payment date"}, {"key": "status", "label": "Status"}];

export default function FeeCollectionPage() {
  return (
    <GenericCrudPage
      title="Fee collection"
      subtitle="Collect student fees and view outstanding balances."
      resource="feePayments"
      itemLabel="fee collection"
      initialValues={{"studentId": "", "amount": "", "paymentDate": "", "status": "Paid"}}
      fields={fields}
      columns={columns}
    />
  );
}
