export default {
  key: 'installments',
  title: 'Installments',
  subtitle: 'Define installment plans for fee payments.',
  description: 'Create installment schedules and payment terms for student fee plans.',
  resource: 'installments',
  itemLabel: 'installment plan',
  breadcrumbs: [
    { label: 'Dashboard', to: '/' },
    { label: 'Settings', to: '/settings' },
    { label: 'Fee Structure', to: '/settings/fee-structure' },
    { label: 'Installments' },
  ],
  defaultValues: { installmentName: '', installmentCount: 1, status: 'Active', description: '' },
  searchFields: ['installmentName'],
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
    { name: 'installmentName', label: 'Plan Name', placeholder: 'Enter installment plan name', validation: { required: 'Plan name is required' } },
    { name: 'installmentCount', label: 'Installment Count', type: 'number', placeholder: 'Enter number of installments', validation: { required: 'Installment count is required' } },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ], validation: { required: 'Status is required' } },
    { name: 'description', label: 'Description', type: 'textarea', fullWidth: true, placeholder: 'Enter description' },
  ],
  columns: [
    { key: 'installmentName', label: 'Plan' },
    { key: 'installmentCount', label: 'Installments' },
    { key: 'status', label: 'Status' },
  ],
};
