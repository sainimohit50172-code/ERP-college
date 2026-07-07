import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "visitorName", "label": "Visitor name"}, {"name": "studentId", "label": "Student ID"}, {"name": "visitDate", "label": "Visit date", "type": "date"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Checked In", "label": "Checked In"}, {"value": "Checked Out", "label": "Checked Out"}]}];
const columns = [{"key": "visitorName", "label": "Visitor"}, {"key": "studentId", "label": "Student ID"}, {"key": "visitDate", "label": "Visit date"}, {"key": "status", "label": "Status"}];

export default function HostelVisitorsPage() {
  return (
    <GenericCrudPage
      title="Hostel visitors"
      subtitle="Log hostel visitor entries and exit timing."
      resource="hostelVisitors"
      itemLabel="visitor"
      initialValues={{"visitorName": "", "studentId": "", "visitDate": "", "status": "Checked In"}}
      fields={fields}
      columns={columns}
    />
  );
}
