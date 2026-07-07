import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "name", "label": "Name"}, {"name": "phone", "label": "Phone"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "New", "label": "New"}, {"value": "Follow Up", "label": "Follow Up"}, {"value": "Converted", "label": "Converted"}]}];
const columns = [{"key": "name", "label": "Name"}, {"key": "phone", "label": "Phone"}, {"key": "status", "label": "Status"}];

export default function EnquiriesPage() {
  return (
    <GenericCrudPage
      title="Admissions enquiries"
      subtitle="Track admission enquiries and follow-up actions."
      resource="leads"
      itemLabel="enquiry"
      initialValues={{"name": "", "phone": "", "status": "New"}}
      fields={fields}
      columns={columns}
    />
  );
}
