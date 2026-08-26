import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [
  { name: 'name', label: 'Availability name', placeholder: 'e.g. Available' },
  { name: 'code', label: 'Code', placeholder: 'AVL', type: 'text' },
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
  { name: 'sortOrder', label: 'Display order', type: 'number', placeholder: '1' },
];

const columns = [
  { key: 'name', label: 'Availability' },
  { key: 'code', label: 'Code' },
  { key: 'description', label: 'Description' },
  { key: 'status', label: 'Status' },
  { key: 'sortOrder', label: 'Order' },
];

export default function LibraryAvailabilityPage() {
  return (
    <GenericCrudPage
      title="Library availability"
      subtitle="Define the circulation states used across your library catalogue."
      description="Keep book availability labels consistent for librarians, reports, reservations, and member searches."
      resource="libraryAvailabilities"
      itemLabel="availability"
      createButtonLabel="Add availability"
      initialValues={{ name: '', code: '', description: '', status: 'Active', sortOrder: 1 }}
      fields={fields}
      columns={columns}
    />
  );
}