export default {
  key: 'manage-online-fee',
  title: 'Manage Online Fee',
  subtitle: 'Configure online fee collection settings.',
  description: 'Create online fee provider records and maintain payment gateway details.',
  resource: 'online-fee-settings',
  itemLabel: 'online fee configuration',
  breadcrumbs: [
    { label: 'Dashboard', to: '/' },
    { label: 'Settings', to: '/settings' },
    { label: 'Fee Structure', to: '/settings/fee-structure' },
    { label: 'Manage Online Fee' },
  ],
  defaultValues: { providerName: '', providerCode: '', status: 'Active', description: '' },
  searchFields: ['providerName', 'providerCode'],
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
    { name: 'providerName', label: 'Provider Name', placeholder: 'Enter provider name', validation: { required: 'Provider name is required' } },
    { name: 'providerCode', label: 'Provider Code', placeholder: 'Enter provider code', validation: { required: 'Provider code is required' } },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ], validation: { required: 'Status is required' } },
    { name: 'description', label: 'Description', type: 'textarea', fullWidth: true, placeholder: 'Enter description' },
  ],
  columns: [
    { key: 'providerName', label: 'Provider' },
    { key: 'providerCode', label: 'Code' },
    { key: 'status', label: 'Status' },
  ],
};
