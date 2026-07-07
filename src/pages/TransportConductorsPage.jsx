import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "name", "label": "Conductor name"}, {"name": "phone", "label": "Phone"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Active", "label": "Active"}, {"value": "Inactive", "label": "Inactive"}]}];
const columns = [{"key": "name", "label": "Conductor"}, {"key": "phone", "label": "Phone"}, {"key": "status", "label": "Status"}];

export default function TransportConductorsPage() {
  return (
    <GenericCrudPage
      title="Transport conductors"
      subtitle="Manage conductor assignments and support staff details."
      resource="transportConductors"
      itemLabel="conductor"
      initialValues={{"name": "", "phone": "", "status": "Active"}}
      fields={fields}
      columns={columns}
    />
  );
}
