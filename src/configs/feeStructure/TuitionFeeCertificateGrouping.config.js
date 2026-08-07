export default {
  key: 'tuition-fee-certificate-grouping',
  title: 'Tuition Fee Certificate Grouping',
  subtitle: 'Manage certificate groups for tuition fee receipts.',
  description: 'Define groupings used while generating tuition fee certificates.',
  resource: 'tuition-fee-certificate-groups',
  itemLabel: 'certificate grouping',
  breadcrumbs: [
    { label: 'Dashboard', to: '/' },
    { label: 'Settings', to: '/settings' },
    { label: 'Fee Structure', to: '/settings/fee-structure' },
    { label: 'Tuition Fee Certificate Grouping' },
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
    { name: 'groupName', label: 'Group Name', placeholder: 'Enter grouping name', validation: { required: 'Group name is required' } },
    { name: 'groupCode', label: 'Group Code', placeholder: 'Enter grouping code', validation: { required: 'Group code is required' } },
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
