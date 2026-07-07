import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "bookId", "label": "Book ID"}, {"name": "memberId", "label": "Member ID"}, {"name": "dueDate", "label": "Due date", "type": "date"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Issued", "label": "Issued"}, {"value": "Returned", "label": "Returned"}]}];
const columns = [{"key": "bookId", "label": "Book ID"}, {"key": "memberId", "label": "Member ID"}, {"key": "dueDate", "label": "Due date"}, {"key": "status", "label": "Status"}];

export default function LibraryIssuesPage() {
  return (
    <GenericCrudPage
      title="Issue books"
      subtitle="Issue books to students or staff and track due dates."
      resource="libraryIssues"
      itemLabel="issue"
      initialValues={{"bookId": "", "memberId": "", "dueDate": "", "status": "Issued"}}
      fields={fields}
      columns={columns}
    />
  );
}
