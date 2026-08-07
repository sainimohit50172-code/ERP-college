export default {
  key: 'fee-group',
  title: 'Fee Group',
  subtitle: 'Manage fee group classifications.',
  description: 'Create fee groups to categorize related fee heads and simplify bulk assignments.',
  resource: 'fee-groups',
  itemLabel: 'fee group',
  breadcrumbs: [
    { label: 'Dashboard', to: '/' },
    { label: 'Settings', to: '/settings' },
    { label: 'Fee Structure', to: '/settings/fee-structure' },
    { label: 'Fee Group' },
  ],
  defaultValues: { feeGroupName: '', feeGroupCode: '', status: 'Active', description: '' },
  searchFields: ['feeGroupName', 'feeGroupCode'],
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
    { name: 'feeGroupName', label: 'Fee Group Name', placeholder: 'Enter fee group name', validation: { required: 'Fee group name is required' } },
    { name: 'feeGroupCode', label: 'Fee Group Code', placeholder: 'Enter fee group code', validation: { required: 'Fee group code is required' } },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ], validation: { required: 'Status is required' } },
    { name: 'description', label: 'Description', type: 'textarea', fullWidth: true, placeholder: 'Enter description' },
  ],
  columns: [
    { key: 'feeGroupName', label: 'Fee Group' },
    { key: 'feeGroupCode', label: 'Code' },
    { key: 'status', label: 'Status' },
  ],
};
