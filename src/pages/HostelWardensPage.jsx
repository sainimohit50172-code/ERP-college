import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "name", "label": "Name"}, {"name": "email", "label": "Email", "type": "email"}, {"name": "phone", "label": "Phone"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Active", "label": "Active"}, {"value": "Inactive", "label": "Inactive"}]}];
const columns = [{"key": "name", "label": "Name"}, {"key": "email", "label": "Email"}, {"key": "phone", "label": "Phone"}, {"key": "status", "label": "Status"}];

export default function HostelWardensPage() {
  return (
    <GenericCrudPage
      title="Hostel wardens"
      subtitle="Maintain hostel warden records and assignments."
      resource="hostelWardens"
      itemLabel="warden"
      initialValues={{"name": "", "email": "", "phone": "", "status": "Active"}}
      fields={fields}
      columns={columns}
    />
  );
}
