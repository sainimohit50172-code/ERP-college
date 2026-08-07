export default {
  key: 'fee-head-group',
  title: 'Fee Head Group',
  subtitle: 'Organize fee heads into logical groups.',
  description: 'Create and maintain fee head groups for bundled billing and reporting.',
  resource: 'fee-head-groups',
  itemLabel: 'fee head group',
  breadcrumbs: [
    { label: 'Dashboard', to: '/' },
    { label: 'Settings', to: '/settings' },
    { label: 'Fee Structure', to: '/settings/fee-structure' },
    { label: 'Fee Head Group' },
  ],
  defaultValues: { groupName: '', groupCode: '', status: 'Active', description: '' },
  searchFields: ['groupName', 'groupCode'],
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
    { name: 'groupName', label: 'Group Name', placeholder: 'Enter group name', validation: { required: 'Group name is required' } },
    { name: 'groupCode', label: 'Group Code', placeholder: 'Enter group code', validation: { required: 'Group code is required' } },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ], validation: { required: 'Status is required' } },
    { name: 'description', label: 'Description', type: 'textarea', fullWidth: true, placeholder: 'Enter description' },
  ],
  columns: [
    { key: 'groupName', label: 'Group Name' },
    { key: 'groupCode', label: 'Group Code' },
    { key: 'status', label: 'Status' },
  ],
};
