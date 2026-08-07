export default {
  key: 'fee-category',
  title: 'Fee Category',
  subtitle: 'Classify fees into categories.',
  description: 'Create fee categories to group fee heads and support reporting.',
  resource: 'fee-categories',
  itemLabel: 'fee category',
  breadcrumbs: [
    { label: 'Dashboard', to: '/' },
    { label: 'Settings', to: '/settings' },
    { label: 'Fee Structure', to: '/settings/fee-structure' },
    { label: 'Fee Category' },
  ],
  defaultValues: { categoryName: '', categoryCode: '', status: 'Active', description: '' },
  searchFields: ['categoryName', 'categoryCode'],
  filters: [
    {
      name: 'status',
      label: 'Status',
      options: [
        { value: 'All', label: 'All Statuses' },
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
      ],
    },
  ],
  fields: [
    { name: 'categoryName', label: 'Category Name', placeholder: 'Enter category name', validation: { required: 'Category name is required' } },
    { name: 'categoryCode', label: 'Category Code', placeholder: 'Enter category code', validation: { required: 'Category code is required' } },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ], validation: { required: 'Status is required' } },
    { name: 'description', label: 'Description', type: 'textarea', fullWidth: true, placeholder: 'Enter description' },
  ],
  columns: [
    { key: 'categoryName', label: 'Category' },
    { key: 'categoryCode', label: 'Code' },
    { key: 'status', label: 'Status' },
  ],
};
