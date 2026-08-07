export default {
  key: 'other-income-head',
  title: 'Other Income Head',
  subtitle: 'Manage additional income heads for finance entries.',
  description: 'Define other income heads that are not part of standard fee receipts.',
  resource: 'other-income-heads',
  itemLabel: 'other income head',
  breadcrumbs: [
    { label: 'Dashboard', to: '/' },
    { label: 'Settings', to: '/settings' },
    { label: 'Fee Structure', to: '/settings/fee-structure' },
    { label: 'Other Income Head' },
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
    { name: 'name', label: 'Income Head', placeholder: 'Enter income head name', validation: { required: 'Income head name is required' } },
    { name: 'code', label: 'Code', placeholder: 'Enter income head code', validation: { required: 'Code is required' } },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ], validation: { required: 'Status is required' } },
    { name: 'description', label: 'Description', type: 'textarea', fullWidth: true, placeholder: 'Enter description' },
  ],
  columns: [
    { key: 'name', label: 'Income Head' },
    { key: 'code', label: 'Code' },
    { key: 'status', label: 'Status' },
  ],
};
