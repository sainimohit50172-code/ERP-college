import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "name", "label": "Student name"}, {"name": "guardianName", "label": "Guardian name"}, {"name": "guardianMobile", "label": "Guardian mobile"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Active", "label": "Active"}, {"value": "Inactive", "label": "Inactive"}]}];
const columns = [{"key": "name", "label": "Student"}, {"key": "guardianName", "label": "Guardian"}, {"key": "guardianMobile", "label": "Guardian mobile"}, {"key": "status", "label": "Status"}];

export default function ParentsPage() {
  return (
    <GenericCrudPage
      title="Parents & guardians"
      subtitle="Review parent and guardian information linked to student records."
      resource="students"
      itemLabel="parent"
      initialValues={{"name": "", "guardianName": "", "guardianMobile": "", "status": "Active"}}
      fields={fields}
      columns={columns}
    />
  );
}
