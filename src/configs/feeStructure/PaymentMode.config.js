export default {
  key: 'payment-mode',
  title: 'Payment Mode',
  subtitle: 'Set up allowed payment modes.',
  description: 'Manage accepted payment modes for fee collections and receipts.',
  resource: 'payment-modes',
  itemLabel: 'payment mode',
  breadcrumbs: [
    { label: 'Dashboard', to: '/' },
    { label: 'Settings', to: '/settings' },
    { label: 'Fee Structure', to: '/settings/fee-structure' },
    { label: 'Payment Mode' },
  ],
  defaultValues: { modeName: '', code: '', status: 'Active', description: '' },
  searchFields: ['modeName', 'code'],
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
    { name: 'modeName', label: 'Payment Mode', placeholder: 'Enter payment mode name', validation: { required: 'Payment mode is required' } },
    { name: 'code', label: 'Mode Code', placeholder: 'Enter mode code', validation: { required: 'Mode code is required' } },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ], validation: { required: 'Status is required' } },
    { name: 'description', label: 'Description', type: 'textarea', fullWidth: true, placeholder: 'Enter description' },
  ],
  columns: [
    { key: 'modeName', label: 'Payment Mode' },
    { key: 'code', label: 'Code' },
    { key: 'status', label: 'Status' },
  ],
};
