export default {
  key: 'admission-category',
  title: 'Admission Category',
  subtitle: 'Manage admission categories used for fee mapping.',
  description: 'Add admission categories that help route students into fee category assignments.',
  resource: 'admission-categories',
  itemLabel: 'admission category',
  breadcrumbs: [
    { label: 'Dashboard', to: '/' },
    { label: 'Settings', to: '/settings' },
    { label: 'Fee Structure', to: '/settings/fee-structure' },
    { label: 'Admission Category' },
  ],
  defaultValues: { categoryName: '', status: 'Active', description: '' },
  searchFields: ['categoryName'],
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
    { name: 'categoryName', label: 'Category Name', placeholder: 'Enter admission category', validation: { required: 'Category name is required' } },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ], validation: { required: 'Status is required' } },
    { name: 'description', label: 'Description', type: 'textarea', fullWidth: true, placeholder: 'Enter description' },
  ],
  columns: [
    { key: 'categoryName', label: 'Admission Category' },
    { key: 'status', label: 'Status' },
  ],
};
