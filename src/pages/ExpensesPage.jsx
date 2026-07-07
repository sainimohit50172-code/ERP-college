import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "name", "label": "Expense name"}, {"name": "amount", "label": "Amount", "type": "number"}, {"name": "date", "label": "Date", "type": "date"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Pending", "label": "Pending"}, {"value": "Approved", "label": "Approved"}]}];
const columns = [{"key": "name", "label": "Expense"}, {"key": "amount", "label": "Amount"}, {"key": "date", "label": "Date"}, {"key": "status", "label": "Status"}];

export default function ExpensesPage() {
  return (
    <GenericCrudPage
      title="Expenses"
      subtitle="Track operational expenses and approvals."
      resource="accounts"
      itemLabel="expense"
      initialValues={{"name": "", "amount": "", "date": "", "status": "Pending"}}
      fields={fields}
      columns={columns}
    />
  );
}
