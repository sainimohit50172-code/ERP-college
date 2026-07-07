import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "bookId", "label": "Book ID"}, {"name": "memberId", "label": "Member ID"}, {"name": "reportedAt", "label": "Reported on", "type": "date"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Lost", "label": "Lost"}, {"value": "Recovered", "label": "Recovered"}]}];
const columns = [{"key": "bookId", "label": "Book ID"}, {"key": "memberId", "label": "Member ID"}, {"key": "reportedAt", "label": "Reported on"}, {"key": "status", "label": "Status"}];

export default function LibraryLostPage() {
  return (
    <GenericCrudPage
      title="Lost books"
      subtitle="Track lost books and trigger replacement workflows."
      resource="libraryLosses"
      itemLabel="lost book"
      initialValues={{"bookId": "", "memberId": "", "reportedAt": "", "status": "Lost"}}
      fields={fields}
      columns={columns}
    />
  );
}
