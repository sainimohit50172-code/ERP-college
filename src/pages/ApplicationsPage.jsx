import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "name", "label": "Applicant name"}, {"name": "program", "label": "Program"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Submitted", "label": "Submitted"}, {"value": "Shortlisted", "label": "Shortlisted"}, {"value": "Admitted", "label": "Admitted"}]}];
const columns = [{"key": "name", "label": "Applicant"}, {"key": "program", "label": "Program"}, {"key": "status", "label": "Status"}];

export default function ApplicationsPage() {
  return (
    <GenericCrudPage
      title="Admission applications"
      subtitle="Review admission applications and their current stage."
      resource="leads"
      itemLabel="application"
      initialValues={{"name": "", "program": "", "status": "Submitted"}}
      fields={fields}
      columns={columns}
    />
  );
}
