import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "title", "label": "Incident title"}, {"name": "severity", "label": "Severity"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Open", "label": "Open"}, {"value": "Resolved", "label": "Resolved"}]}];
const columns = [{"key": "title", "label": "Incident"}, {"key": "severity", "label": "Severity"}, {"key": "status", "label": "Status"}];

export default function IncidentsPage() {
  return (
    <GenericCrudPage
      title="Security incidents"
      subtitle="Record security incidents and follow-up actions."
      resource="incidents"
      itemLabel="incident"
      initialValues={{"title": "", "severity": "Medium", "status": "Open"}}
      fields={fields}
      columns={columns}
    />
  );
}
