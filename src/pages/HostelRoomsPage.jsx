import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "roomNumber", "label": "Room number"}, {"name": "capacity", "label": "Capacity", "type": "number"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Vacant", "label": "Vacant"}, {"value": "Occupied", "label": "Occupied"}]}];
const columns = [{"key": "roomNumber", "label": "Room number"}, {"key": "capacity", "label": "Capacity"}, {"key": "status", "label": "Status"}];

export default function HostelRoomsPage() {
  return (
    <GenericCrudPage
      title="Hostel rooms"
      subtitle="Manage hostel rooms, beds and occupancy."
      resource="hostelRooms"
      itemLabel="room"
      initialValues={{"roomNumber": "", "capacity": "2", "status": "Vacant"}}
      fields={fields}
      columns={columns}
    />
  );
}
