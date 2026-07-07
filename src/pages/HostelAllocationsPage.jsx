import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "studentId", "label": "Student ID"}, {"name": "roomId", "label": "Room ID"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Active", "label": "Active"}, {"value": "Transferred", "label": "Transferred"}]}];
const columns = [{"key": "studentId", "label": "Student ID"}, {"key": "roomId", "label": "Room ID"}, {"key": "status", "label": "Status"}];

export default function HostelAllocationsPage() {
  return (
    <GenericCrudPage
      title="Hostel allocations"
      subtitle="Assign students to hostel rooms and monitor occupancy."
      resource="hostelAllocations"
      itemLabel="allocation"
      initialValues={{"studentId": "", "roomId": "", "status": "Active"}}
      fields={fields}
      columns={columns}
    />
  );
}
