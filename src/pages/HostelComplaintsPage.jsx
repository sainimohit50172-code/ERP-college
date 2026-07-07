import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "studentId", "label": "Student ID"}, {"name": "subject", "label": "Subject"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Open", "label": "Open"}, {"value": "In Progress", "label": "In Progress"}, {"value": "Resolved", "label": "Resolved"}]}];
const columns = [{"key": "studentId", "label": "Student ID"}, {"key": "subject", "label": "Subject"}, {"key": "status", "label": "Status"}];

export default function HostelComplaintsPage() {
  return (
    <GenericCrudPage
      title="Hostel complaints"
      subtitle="Capture and track hostel complaints and issue resolution."
      resource="hostelComplaints"
      itemLabel="complaint"
      initialValues={{"studentId": "", "subject": "", "status": "Open"}}
      fields={fields}
      columns={columns}
    />
  );
}
