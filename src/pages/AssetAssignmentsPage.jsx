import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "assetId", "label": "Asset ID"}, {"name": "assignedTo", "label": "Assigned to"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Assigned", "label": "Assigned"}, {"value": "Returned", "label": "Returned"}]}];
const columns = [{"key": "assetId", "label": "Asset ID"}, {"key": "assignedTo", "label": "Assigned to"}, {"key": "status", "label": "Status"}];

export default function AssetAssignmentsPage() {
  return (
    <GenericCrudPage
      title="Asset assignments"
      subtitle="Assign assets to departments and employees."
      resource="assetAssignments"
      itemLabel="asset assignment"
      initialValues={{"assetId": "", "assignedTo": "", "status": "Assigned"}}
      fields={fields}
      columns={columns}
    />
  );
}
