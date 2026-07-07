import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "vehicleId", "label": "Vehicle ID"}, {"name": "serviceType", "label": "Service type"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Scheduled", "label": "Scheduled"}, {"value": "Completed", "label": "Completed"}]}];
const columns = [{"key": "vehicleId", "label": "Vehicle ID"}, {"key": "serviceType", "label": "Service type"}, {"key": "status", "label": "Status"}];

export default function TransportMaintenancePage() {
  return (
    <GenericCrudPage
      title="Transport maintenance"
      subtitle="Track repairs and preventive maintenance for vehicles."
      resource="maintenanceRecords"
      itemLabel="maintenance record"
      initialValues={{"vehicleId": "", "serviceType": "", "status": "Scheduled"}}
      fields={fields}
      columns={columns}
    />
  );
}
