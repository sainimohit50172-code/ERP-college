import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "bookId", "label": "Book ID"}, {"name": "memberId", "label": "Member ID"}, {"name": "returnedAt", "label": "Returned on", "type": "date"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Returned", "label": "Returned"}, {"value": "Overdue", "label": "Overdue"}]}];
const columns = [{"key": "bookId", "label": "Book ID"}, {"key": "memberId", "label": "Member ID"}, {"key": "returnedAt", "label": "Returned on"}, {"key": "status", "label": "Status"}];

export default function LibraryReturnsPage() {
  return (
    <GenericCrudPage
      title="Library returns"
      subtitle="Log returned books and close circulation events."
      resource="libraryIssues"
      itemLabel="return"
      initialValues={{"bookId": "", "memberId": "", "returnedAt": "", "status": "Returned"}}
      fields={fields}
      columns={columns}
    />
  );
}
