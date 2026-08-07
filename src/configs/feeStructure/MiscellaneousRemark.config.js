export default {
  key: 'miscellaneous-remark',
  title: 'Miscellaneous Remark',
  subtitle: 'Track miscellaneous remarks used in fee receipts.',
  description: 'Add and manage standard remarks that can be selected while generating fee receipts.',
  resource: 'miscellaneous-remarks',
  itemLabel: 'miscellaneous remark',
  breadcrumbs: [
    { label: 'Dashboard', to: '/' },
    { label: 'Settings', to: '/settings' },
    { label: 'Fee Structure', to: '/settings/fee-structure' },
    { label: 'Miscellaneous Remark' },
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
    { name: 'remark', label: 'Remark', placeholder: 'Enter remark text', validation: { required: 'Remark is required' } },
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
