import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "orderNumber", "label": "Order number"}, {"name": "vendorName", "label": "Vendor"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Draft", "label": "Draft"}, {"value": "Approved", "label": "Approved"}]}];
const columns = [{"key": "orderNumber", "label": "Order"}, {"key": "vendorName", "label": "Vendor"}, {"key": "status", "label": "Status"}];

export default function PurchaseOrdersPage() {
  return (
    <GenericCrudPage
      title="Purchase orders"
      subtitle="Manage purchasing requests and approvals."
      resource="purchaseOrders"
      itemLabel="purchase order"
      initialValues={{"orderNumber": "", "vendorName": "", "status": "Draft"}}
      fields={fields}
      columns={columns}
    />
  );
}
