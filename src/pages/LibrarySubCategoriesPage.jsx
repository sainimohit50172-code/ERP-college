import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [
  { name: 'name', label: 'Subcategory name', placeholder: 'e.g. Computer Science' },
  { name: 'code', label: 'Code', placeholder: 'CS', type: 'text' },
  { name: 'parentCategory', label: 'Parent category', placeholder: 'e.g. Technology' },
  { name: 'sortOrder', label: 'Display order', type: 'number', placeholder: '1' },
  { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ],
  },
];

const columns = [
  { key: 'name', label: 'Subcategory' },
  { key: 'code', label: 'Code' },
  { key: 'parentCategory', label: 'Parent category' },
  { key: 'description', label: 'Description' },
  { key: 'status', label: 'Status' },
  { key: 'sortOrder', label: 'Order' },
];

export default function LibrarySubCategoriesPage() {
  return (
    <GenericCrudPage
      title="Library subcategories"
      subtitle="Create a clear second level for organising your library catalogue."
      description="Group books beneath parent categories so catalogue searches, reports, and shelf planning stay easy to navigate."
      resource="librarySubCategories"
      itemLabel="subcategory"
      createButtonLabel="Add subcategory"
      initialValues={{ name: '', code: '', parentCategory: '', description: '', status: 'Active', sortOrder: 1 }}
      fields={fields}
      columns={columns}
    />
  );
}