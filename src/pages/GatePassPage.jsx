import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "name", "label": "Person name"}, {"name": "reason", "label": "Reason"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Active", "label": "Active"}, {"value": "Expired", "label": "Expired"}]}];
const columns = [{"key": "name", "label": "Person"}, {"key": "reason", "label": "Reason"}, {"key": "status", "label": "Status"}];

export default function GatePassPage() {
  return (
    <GenericCrudPage
      title="Gate pass"
      subtitle="Issue temporary gate passes for approved entry."
      resource="gatePasses"
      itemLabel="gate pass"
      initialValues={{"name": "", "reason": "", "status": "Active"}}
      fields={fields}
      columns={columns}
    />
  );
}
