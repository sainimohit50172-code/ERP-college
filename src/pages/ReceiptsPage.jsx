import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "receiptNumber", "label": "Receipt number"}, {"name": "amount", "label": "Amount", "type": "number"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Issued", "label": "Issued"}, {"value": "Cancelled", "label": "Cancelled"}]}];
const columns = [{"key": "receiptNumber", "label": "Receipt"}, {"key": "amount", "label": "Amount"}, {"key": "status", "label": "Status"}];

export default function ReceiptsPage() {
  return (
    <GenericCrudPage
      title="Receipts"
      subtitle="Generate and track official receipts."
      resource="receipts"
      itemLabel="receipt"
      initialValues={{"receiptNumber": "", "amount": "", "status": "Issued"}}
      fields={fields}
      columns={columns}
    />
  );
}
