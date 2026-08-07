export default {
  key: 'receipt-remark',
  title: 'Receipt Remark',
  subtitle: 'Configure receipt-specific remarks.',
  description: 'Maintain short remarks that can be added to receipts and payment acknowledgements.',
  resource: 'receipt-remarks',
  itemLabel: 'receipt remark',
  breadcrumbs: [
    { label: 'Dashboard', to: '/' },
    { label: 'Settings', to: '/settings' },
    { label: 'Fee Structure', to: '/settings/fee-structure' },
    { label: 'Receipt Remark' },
  ],
  defaultValues: { remark: '', status: 'Active' },
  searchFields: ['remark'],
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
    { name: 'remark', label: 'Remark', placeholder: 'Enter receipt remark', validation: { required: 'Remark is required' } },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ], validation: { required: 'Status is required' } },
  ],
  columns: [
    { key: 'remark', label: 'Remark' },
    { key: 'status', label: 'Status' },
  ],
};
