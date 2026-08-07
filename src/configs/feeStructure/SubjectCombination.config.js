export default {
  key: 'subject-combination',
  title: 'Subject Combination',
  subtitle: 'Manage subject combination groups.',
  description: 'Create subject combinations that can be assigned in fee and academic workflows.',
  resource: 'subject-combinations',
  itemLabel: 'subject combination',
  breadcrumbs: [
    { label: 'Dashboard', to: '/' },
    { label: 'Settings', to: '/settings' },
    { label: 'Fee Structure', to: '/settings/fee-structure' },
    { label: 'Subject Combination' },
  ],
  defaultValues: { name: '', status: 'Active', description: '' },
  searchFields: ['name'],
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
    { name: 'name', label: 'Combination Name', placeholder: 'Enter subject combination name', validation: { required: 'Combination name is required' } },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ], validation: { required: 'Status is required' } },
    { name: 'description', label: 'Description', type: 'textarea', fullWidth: true, placeholder: 'Enter description' },
  ],
  columns: [
    { key: 'name', label: 'Combination' },
    { key: 'status', label: 'Status' },
  ],
};
