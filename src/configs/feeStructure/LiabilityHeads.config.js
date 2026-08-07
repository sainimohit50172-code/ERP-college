export default {
  key: 'liability-heads',
  title: 'Liability Heads',
  subtitle: 'Maintain liability head records.',
  description: 'Define liability heads used in fee accounting and reporting.',
  resource: 'liability-heads',
  itemLabel: 'liability head',
  breadcrumbs: [
    { label: 'Dashboard', to: '/' },
    { label: 'Settings', to: '/settings' },
    { label: 'Fee Structure', to: '/settings/fee-structure' },
    { label: 'Liability Heads' },
  ],
  defaultValues: { name: '', code: '', status: 'Active', description: '' },
  searchFields: ['name', 'code'],
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
    { name: 'name', label: 'Name', placeholder: 'Enter liability head name', validation: { required: 'Name is required' } },
    { name: 'code', label: 'Code', placeholder: 'Enter code', validation: { required: 'Code is required' } },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ], validation: { required: 'Status is required' } },
    { name: 'description', label: 'Description', type: 'textarea', fullWidth: true, placeholder: 'Enter description' },
  ],
  columns: [
    { key: 'name', label: 'Liability Head' },
    { key: 'code', label: 'Code' },
    { key: 'status', label: 'Status' },
  ],
};
