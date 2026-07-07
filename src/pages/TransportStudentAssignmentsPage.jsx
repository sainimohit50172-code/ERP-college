import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "studentId", "label": "Student ID"}, {"name": "routeId", "label": "Route ID"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Active", "label": "Active"}, {"value": "Inactive", "label": "Inactive"}]}];
const columns = [{"key": "studentId", "label": "Student ID"}, {"key": "routeId", "label": "Route ID"}, {"key": "status", "label": "Status"}];

export default function TransportStudentAssignmentsPage() {
  return (
    <GenericCrudPage
      title="Student transport assignments"
      subtitle="Assign students to transport routes and pickups."
      resource="studentTransportAssignments"
      itemLabel="assignment"
      initialValues={{"studentId": "", "routeId": "", "status": "Active"}}
      fields={fields}
      columns={columns}
    />
  );
}
