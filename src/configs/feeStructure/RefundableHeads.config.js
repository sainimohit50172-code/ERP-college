export default {
  key: 'refundable-heads',
  title: 'Refundable Heads',
  subtitle: 'Configure refundable fee head options.',
  description: 'Track fee heads that are marked refundable for billing and refund workflows.',
  resource: 'refundable-heads',
  itemLabel: 'refundable head',
  breadcrumbs: [
    { label: 'Dashboard', to: '/' },
    { label: 'Settings', to: '/settings' },
    { label: 'Fee Structure', to: '/settings/fee-structure' },
    { label: 'Refundable Heads' },
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
    { name: 'name', label: 'Name', placeholder: 'Enter refundable head name', validation: { required: 'Name is required' } },
    { name: 'code', label: 'Code', placeholder: 'Enter code', validation: { required: 'Code is required' } },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ], validation: { required: 'Status is required' } },
    { name: 'description', label: 'Description', type: 'textarea', fullWidth: true, placeholder: 'Enter description' },
  ],
  columns: [
    { key: 'name', label: 'Refundable Head' },
    { key: 'code', label: 'Code' },
    { key: 'status', label: 'Status' },
  ],
};
