import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "itemName", "label": "Item name"}, {"name": "quantity", "label": "Quantity", "type": "number"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "In Stock", "label": "In Stock"}, {"value": "Low Stock", "label": "Low Stock"}]}];
const columns = [{"key": "itemName", "label": "Item"}, {"key": "quantity", "label": "Quantity"}, {"key": "status", "label": "Status"}];

export default function StockPage() {
  return (
    <GenericCrudPage
      title="Inventory stock"
      subtitle="Monitor stock levels and replenishment status."
      resource="stockMovements"
      itemLabel="stock item"
      initialValues={{"itemName": "", "quantity": "", "status": "In Stock"}}
      fields={fields}
      columns={columns}
    />
  );
}
