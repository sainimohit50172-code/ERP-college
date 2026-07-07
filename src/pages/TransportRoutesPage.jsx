import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "name", "label": "Route name"}, {"name": "startPoint", "label": "Start point"}, {"name": "endPoint", "label": "End point"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Active", "label": "Active"}, {"value": "Inactive", "label": "Inactive"}]}];
const columns = [{"key": "name", "label": "Route"}, {"key": "startPoint", "label": "Start point"}, {"key": "endPoint", "label": "End point"}, {"key": "status", "label": "Status"}];

export default function TransportRoutesPage() {
  return (
    <GenericCrudPage
      title="Transport routes"
      subtitle="Plan routes and keep route details up to date."
      resource="transportRoutes"
      itemLabel="route"
      initialValues={{"name": "", "startPoint": "", "endPoint": "", "status": "Active"}}
      fields={fields}
      columns={columns}
    />
  );
}
