import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "learnerName", "label": "Learner name"}, {"name": "courseName", "label": "Course name"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Issued", "label": "Issued"}, {"value": "Pending", "label": "Pending"}]}];
const columns = [{"key": "learnerName", "label": "Learner"}, {"key": "courseName", "label": "Course"}, {"key": "status", "label": "Status"}];

export default function LMSCertificatesPage() {
  return (
    <GenericCrudPage
      title="LMS certificates"
      subtitle="Issue completion certificates for course learners."
      resource="courses"
      itemLabel="certificate"
      initialValues={{"learnerName": "", "courseName": "", "status": "Issued"}}
      fields={fields}
      columns={columns}
    />
  );
}
