import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "name", "label": "Category name"}, {"name": "description", "label": "Description", "type": "textarea"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Active", "label": "Active"}, {"value": "Inactive", "label": "Inactive"}]}];
const columns = [{"key": "name", "label": "Category"}, {"key": "description", "label": "Description"}, {"key": "status", "label": "Status"}];

export default function LibraryCategoriesPage() {
  return (
    <GenericCrudPage
      title="Library categories"
      subtitle="Organize the library catalogue by category and subject."
      resource="libraryCategories"
      itemLabel="category"
      initialValues={{"name": "", "description": "", "status": "Active"}}
      fields={fields}
      columns={columns}
    />
  );
}
