import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "name", "label": "Entry name"}, {"name": "amount", "label": "Amount", "type": "number"}, {"name": "date", "label": "Date", "type": "date"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Recorded", "label": "Recorded"}, {"value": "Approved", "label": "Approved"}]}];
const columns = [{"key": "name", "label": "Entry"}, {"key": "amount", "label": "Amount"}, {"key": "date", "label": "Date"}, {"key": "status", "label": "Status"}];

export default function IncomePage() {
  return (
    <GenericCrudPage
      title="Income entries"
      subtitle="Track recurring and one-off income entries."
      resource="accounts"
      itemLabel="income entry"
      initialValues={{"name": "", "amount": "", "date": "", "status": "Recorded"}}
      fields={fields}
      columns={columns}
    />
  );
}
