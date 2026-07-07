import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "receiptNumber", "label": "Receipt number"}, {"name": "vendorName", "label": "Vendor"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Received", "label": "Received"}, {"value": "Pending", "label": "Pending"}]}];
const columns = [{"key": "receiptNumber", "label": "Receipt"}, {"key": "vendorName", "label": "Vendor"}, {"key": "status", "label": "Status"}];

export default function GoodsReceiptsPage() {
  return (
    <GenericCrudPage
      title="Goods receipts"
      subtitle="Track received inventory and deliveries."
      resource="purchaseOrders"
      itemLabel="goods receipt"
      initialValues={{"receiptNumber": "", "vendorName": "", "status": "Received"}}
      fields={fields}
      columns={columns}
    />
  );
}
