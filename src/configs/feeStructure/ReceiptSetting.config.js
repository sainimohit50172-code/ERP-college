export default {
  key: 'receipt-setting',
  title: 'Receipt Setting',
  subtitle: 'Configure receipt formatting and numbering.',
  description: 'Control prefix, suffix, and receipt number settings used across payments.',
  resource: 'receipt-settings',
  itemLabel: 'receipt setting',
  breadcrumbs: [
    { label: 'Dashboard', to: '/' },
    { label: 'Settings', to: '/settings' },
    { label: 'Fee Structure', to: '/settings/fee-structure' },
    { label: 'Receipt Setting' },
  ],
  defaultValues: { prefix: '', receiptNumber: 0, suffix: '', status: 'Active' },
  searchFields: ['prefix', 'suffix'],
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
    { name: 'prefix', label: 'Prefix', placeholder: 'Enter receipt prefix' },
    { name: 'receiptNumber', label: 'Receipt Number', type: 'number', placeholder: 'Enter starting number', validation: { required: 'Receipt number is required' } },
    { name: 'suffix', label: 'Suffix', placeholder: 'Enter receipt suffix' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ], validation: { required: 'Status is required' } },
  ],
  columns: [
    { key: 'prefix', label: 'Prefix' },
    { key: 'receiptNumber', label: 'Receipt No.' },
    { key: 'suffix', label: 'Suffix' },
    { key: 'status', label: 'Status' },
  ],
};
