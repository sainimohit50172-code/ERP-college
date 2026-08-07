export default {
  key: 'term-groups',
  title: 'Term Groups',
  subtitle: 'Organize terms into groups.',
  description: 'Define term groupings that can be applied to fee schedules and academic programs.',
  resource: 'term-groups',
  itemLabel: 'term group',
  breadcrumbs: [
    { label: 'Dashboard', to: '/' },
    { label: 'Settings', to: '/settings' },
    { label: 'Fee Structure', to: '/settings/fee-structure' },
    { label: 'Term Groups' },
  ],
  defaultValues: { groupName: '', termCount: 1, status: 'Active', description: '' },
  searchFields: ['groupName'],
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
    { name: 'groupName', label: 'Group Name', placeholder: 'Enter term group name', validation: { required: 'Group name is required' } },
    { name: 'termCount', label: 'Term Count', type: 'number', placeholder: 'Enter number of terms', validation: { required: 'Term count is required' } },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ], validation: { required: 'Status is required' } },
    { name: 'description', label: 'Description', type: 'textarea', fullWidth: true, placeholder: 'Enter description' },
  ],
  columns: [
    { key: 'groupName', label: 'Term Group' },
    { key: 'termCount', label: 'Terms' },
    { key: 'status', label: 'Status' },
  ],
};
