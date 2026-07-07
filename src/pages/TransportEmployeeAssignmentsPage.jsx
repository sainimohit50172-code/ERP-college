import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "employeeId", "label": "Employee ID"}, {"name": "routeId", "label": "Route ID"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Active", "label": "Active"}, {"value": "Inactive", "label": "Inactive"}]}];
const columns = [{"key": "employeeId", "label": "Employee ID"}, {"key": "routeId", "label": "Route ID"}, {"key": "status", "label": "Status"}];

export default function TransportEmployeeAssignmentsPage() {
  return (
    <GenericCrudPage
      title="Employee transport assignments"
      subtitle="Track transport assignments for staff and employees."
      resource="employeeTransportAssignments"
      itemLabel="assignment"
      initialValues={{"employeeId": "", "routeId": "", "status": "Active"}}
      fields={fields}
      columns={columns}
    />
  );
}
