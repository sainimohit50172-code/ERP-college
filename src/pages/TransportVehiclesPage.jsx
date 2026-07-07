import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "name", "label": "Vehicle name"}, {"name": "registrationNumber", "label": "Registration number"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Active", "label": "Active"}, {"value": "Inactive", "label": "Inactive"}]}];
const columns = [{"key": "name", "label": "Vehicle"}, {"key": "registrationNumber", "label": "Registration number"}, {"key": "status", "label": "Status"}];

export default function TransportVehiclesPage() {
  return (
    <GenericCrudPage
      title="Transport vehicles"
      subtitle="Manage vehicle inventory and service readiness."
      resource="transportVehicles"
      itemLabel="vehicle"
      initialValues={{"name": "", "registrationNumber": "", "status": "Active"}}
      fields={fields}
      columns={columns}
    />
  );
}
