import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "roomId", "label": "Room ID"}, {"name": "subject", "label": "Subject"}, {"name": "priority", "label": "Priority"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Open", "label": "Open"}, {"value": "Closed", "label": "Closed"}]}];
const columns = [{"key": "roomId", "label": "Room ID"}, {"key": "subject", "label": "Subject"}, {"key": "priority", "label": "Priority"}, {"key": "status", "label": "Status"}];

export default function HostelMaintenancePage() {
  return (
    <GenericCrudPage
      title="Hostel maintenance"
      subtitle="Track hostel maintenance requests and asset upkeep."
      resource="maintenanceRequests"
      itemLabel="maintenance request"
      initialValues={{"roomId": "", "subject": "", "priority": "Medium", "status": "Open"}}
      fields={fields}
      columns={columns}
    />
  );
}
