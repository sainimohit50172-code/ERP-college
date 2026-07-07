import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "name", "label": "Student name"}, {"name": "counsellor", "label": "Counsellor"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Scheduled", "label": "Scheduled"}, {"value": "Completed", "label": "Completed"}]}];
const columns = [{"key": "name", "label": "Student"}, {"key": "counsellor", "label": "Counsellor"}, {"key": "status", "label": "Status"}];

export default function AdmissionCounsellingPage() {
  return (
    <GenericCrudPage
      title="Admission counselling"
      subtitle="Track admission counselling calls and meetings."
      resource="leads"
      itemLabel="counselling entry"
      initialValues={{"name": "", "counsellor": "", "status": "Scheduled"}}
      fields={fields}
      columns={columns}
    />
  );
}
