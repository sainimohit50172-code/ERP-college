import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "bookId", "label": "Book ID"}, {"name": "memberId", "label": "Member ID"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Pending", "label": "Pending"}, {"value": "Approved", "label": "Approved"}, {"value": "Cancelled", "label": "Cancelled"}]}];
const columns = [{"key": "bookId", "label": "Book ID"}, {"key": "memberId", "label": "Member ID"}, {"key": "status", "label": "Status"}];

export default function LibraryReservationsPage() {
  return (
    <GenericCrudPage
      title="Book reservations"
      subtitle="Track reservation requests and waitlist activity."
      resource="libraryReservations"
      itemLabel="reservation"
      initialValues={{"bookId": "", "memberId": "", "status": "Pending"}}
      fields={fields}
      columns={columns}
    />
  );
}
