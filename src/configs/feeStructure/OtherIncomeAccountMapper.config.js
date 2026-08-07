export default {
  key: 'other-income-account-mapper',
  title: 'Other Income Account Mapper',
  subtitle: 'Map income heads to accounting accounts.',
  description: 'Create mappings between other income heads and finance account codes.',
  resource: 'other-income-account-mappers',
  itemLabel: 'income account mapping',
  breadcrumbs: [
    { label: 'Dashboard', to: '/' },
    { label: 'Settings', to: '/settings' },
    { label: 'Fee Structure', to: '/settings/fee-structure' },
    { label: 'Other Income Account Mapper' },
  ],
  defaultValues: { incomeHead: '', accountCode: '', status: 'Active', description: '' },
  searchFields: ['incomeHead', 'accountCode'],
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
    { name: 'incomeHead', label: 'Income Head', placeholder: 'Enter income head name', validation: { required: 'Income head is required' } },
    { name: 'accountCode', label: 'Account Code', placeholder: 'Enter account code', validation: { required: 'Account code is required' } },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ], validation: { required: 'Status is required' } },
    { name: 'description', label: 'Description', type: 'textarea', fullWidth: true, placeholder: 'Enter description' },
  ],
  columns: [
    { key: 'incomeHead', label: 'Income Head' },
    { key: 'accountCode', label: 'Account Code' },
    { key: 'status', label: 'Status' },
  ],
};
