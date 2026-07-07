import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "name", "label": "Driver name"}, {"name": "phone", "label": "Phone"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Active", "label": "Active"}, {"value": "Inactive", "label": "Inactive"}]}];
const columns = [{"key": "name", "label": "Driver"}, {"key": "phone", "label": "Phone"}, {"key": "status", "label": "Status"}];

export default function TransportDriversPage() {
  return (
    <GenericCrudPage
      title="Transport drivers"
      subtitle="Track driver records and assignment status."
      resource="transportDrivers"
      itemLabel="driver"
      initialValues={{"name": "", "phone": "", "status": "Active"}}
      fields={fields}
      columns={columns}
    />
  );
}
