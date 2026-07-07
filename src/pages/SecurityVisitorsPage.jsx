import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "name", "label": "Visitor name"}, {"name": "purpose", "label": "Purpose"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Checked In", "label": "Checked In"}, {"value": "Checked Out", "label": "Checked Out"}]}];
const columns = [{"key": "name", "label": "Visitor"}, {"key": "purpose", "label": "Purpose"}, {"key": "status", "label": "Status"}];

export default function SecurityVisitorsPage() {
  return (
    <GenericCrudPage
      title="Security visitors"
      subtitle="Track visitor access and security clearance."
      resource="visitors"
      itemLabel="visitor"
      initialValues={{"name": "", "purpose": "", "status": "Checked In"}}
      fields={fields}
      columns={columns}
    />
  );
}
