import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "title", "label": "Book title"}, {"name": "author", "label": "Author"}, {"name": "isbn", "label": "ISBN"}, {"name": "category", "label": "Category"}, {"name": "copies", "label": "Copies", "type": "number"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Available", "label": "Available"}, {"value": "Issued", "label": "Issued"}, {"value": "Damaged", "label": "Damaged"}]}];
const columns = [{"key": "title", "label": "Title"}, {"key": "author", "label": "Author"}, {"key": "isbn", "label": "ISBN"}, {"key": "category", "label": "Category"}, {"key": "copies", "label": "Copies"}, {"key": "status", "label": "Status"}];

export default function LibraryBooksPage() {
  return (
    <GenericCrudPage
      title="Library books"
      subtitle="Track book inventory, ISBNs and availability in the library."
      resource="libraryBooks"
      itemLabel="book"
      initialValues={{"title": "", "author": "", "isbn": "", "category": "General", "copies": "1", "status": "Available"}}
      fields={fields}
      columns={columns}
    />
  );
}
