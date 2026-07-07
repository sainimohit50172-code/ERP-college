import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "reference", "label": "Payment reference"}, {"name": "amount", "label": "Amount", "type": "number"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Pending", "label": "Pending"}, {"value": "Completed", "label": "Completed"}]}];
const columns = [{"key": "reference", "label": "Reference"}, {"key": "amount", "label": "Amount"}, {"key": "status", "label": "Status"}];

export default function PaymentsPage() {
  return (
    <GenericCrudPage
      title="Payments"
      subtitle="Record and review business payments and settlements."
      resource="payments"
      itemLabel="payment"
      initialValues={{"reference": "", "amount": "", "status": "Pending"}}
      fields={fields}
      columns={columns}
    />
  );
}
