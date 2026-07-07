import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "name", "label": "Vendor name"}, {"name": "email", "label": "Email", "type": "email"}, {"name": "phone", "label": "Phone"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Active", "label": "Active"}, {"value": "Inactive", "label": "Inactive"}]}];
const columns = [{"key": "name", "label": "Vendor"}, {"key": "email", "label": "Email"}, {"key": "phone", "label": "Phone"}, {"key": "status", "label": "Status"}];

export default function VendorsPage() {
  return (
    <GenericCrudPage
      title="Vendors"
      subtitle="Track supplier records and procurement relationships."
      resource="vendors"
      itemLabel="vendor"
      initialValues={{"name": "", "email": "", "phone": "", "status": "Active"}}
      fields={fields}
      columns={columns}
    />
  );
}
