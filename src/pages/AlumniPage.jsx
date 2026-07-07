import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "name", "label": "Student name"}, {"name": "graduationYear", "label": "Graduation year", "type": "number"}, {"name": "department", "label": "Department"}, {"name": "email", "label": "Email", "type": "email"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Active", "label": "Active"}, {"value": "Inactive", "label": "Inactive"}]}];
const columns = [{"key": "name", "label": "Name"}, {"key": "graduationYear", "label": "Graduation year"}, {"key": "department", "label": "Department"}, {"key": "email", "label": "Email"}, {"key": "status", "label": "Status"}];

export default function AlumniPage() {
  return (
    <GenericCrudPage
      title="Alumni directory"
      subtitle="Maintain alumni records and graduation history for the institution."
      resource="students"
      itemLabel="alumni record"
      initialValues={{"name": "", "graduationYear": "", "department": "", "email": "", "status": "Active"}}
      fields={fields}
      columns={columns}
    />
  );
}
