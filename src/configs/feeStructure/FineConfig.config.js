export default {
  key: 'fine-config',
  title: 'Fine Config',
  subtitle: 'Manage late fee and fine rules.',
  description: 'Configure fine settings that apply to overdue payments and missed deadlines.',
  resource: 'fine-configs',
  itemLabel: 'fine configuration',
  breadcrumbs: [
    { label: 'Dashboard', to: '/' },
    { label: 'Settings', to: '/settings' },
    { label: 'Fee Structure', to: '/settings/fee-structure' },
    { label: 'Fine Config' },
  ],
  defaultValues: { fineName: '', fineType: 'Fixed', amount: '', dueDays: '', status: 'Active', description: '' },
  searchFields: ['fineName'],
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
    { name: 'fineName', label: 'Fine Name', placeholder: 'Enter fine name', validation: { required: 'Fine name is required' } },
    { name: 'fineType', label: 'Fine Type', type: 'select', options: [
      { value: 'Fixed', label: 'Fixed Amount' },
      { value: 'Percentage', label: 'Percentage' },
    ], validation: { required: 'Fine type is required' } },
    { name: 'amount', label: 'Amount', type: 'number', placeholder: 'Enter fine amount', validation: { required: 'Fine amount is required' } },
    { name: 'dueDays', label: 'Due Days', type: 'number', placeholder: 'Enter days after due date', validation: { required: 'Due days is required' } },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ], validation: { required: 'Status is required' } },
    { name: 'description', label: 'Description', type: 'textarea', fullWidth: true, placeholder: 'Enter description' },
  ],
  columns: [
    { key: 'fineName', label: 'Fine Name' },
    { key: 'fineType', label: 'Type' },
    { key: 'amount', label: 'Amount' },
    { key: 'dueDays', label: 'Due Days' },
    { key: 'status', label: 'Status' },
  ],
};
