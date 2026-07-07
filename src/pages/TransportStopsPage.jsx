import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "name", "label": "Stop name"}, {"name": "routeId", "label": "Route ID"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Active", "label": "Active"}, {"value": "Inactive", "label": "Inactive"}]}];
const columns = [{"key": "name", "label": "Stop"}, {"key": "routeId", "label": "Route ID"}, {"key": "status", "label": "Status"}];

export default function TransportStopsPage() {
  return (
    <GenericCrudPage
      title="Transport stops"
      subtitle="Store route stops and pickup drop-off locations."
      resource="transportStops"
      itemLabel="stop"
      initialValues={{"name": "", "routeId": "", "status": "Active"}}
      fields={fields}
      columns={columns}
    />
  );
}
