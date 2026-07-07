import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "studentName", "label": "Student name"}, {"name": "counsellor", "label": "Counsellor"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Scheduled", "label": "Scheduled"}, {"value": "Completed", "label": "Completed"}]}];
const columns = [{"key": "studentName", "label": "Student"}, {"key": "counsellor", "label": "Counsellor"}, {"key": "status", "label": "Status"}];

export default function CounsellingPage() {
  return (
    <GenericCrudPage
      title="Counselling sessions"
      subtitle="Track student counselling sessions and outcomes."
      resource="students"
      itemLabel="counselling session"
      initialValues={{"studentName": "", "counsellor": "", "status": "Scheduled"}}
      fields={fields}
      columns={columns}
    />
  );
}
