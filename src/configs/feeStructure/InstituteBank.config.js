export default {
  key: 'institute-bank',
  title: 'Institute Bank',
  subtitle: 'Configure institute bank accounts.',
  description: 'Manage bank account details used for fee collections and refunds.',
  resource: 'institute-banks',
  itemLabel: 'bank account',
  breadcrumbs: [
    { label: 'Dashboard', to: '/' },
    { label: 'Settings', to: '/settings' },
    { label: 'Fee Structure', to: '/settings/fee-structure' },
    { label: 'Institute Bank' },
  ],
  defaultValues: { bankName: '', branch: '', accountNumber: '', ifscCode: '', status: 'Active' },
  searchFields: ['bankName', 'branch', 'accountNumber', 'ifscCode'],
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
    { name: 'bankName', label: 'Bank Name', placeholder: 'Enter bank name', validation: { required: 'Bank name is required' } },
    { name: 'branch', label: 'Branch', placeholder: 'Enter branch name', validation: { required: 'Branch name is required' } },
    { name: 'accountNumber', label: 'Account Number', placeholder: 'Enter account number', validation: { required: 'Account number is required' } },
    { name: 'ifscCode', label: 'IFSC Code', placeholder: 'Enter IFSC code', validation: { required: 'IFSC code is required' } },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ], validation: { required: 'Status is required' } },
  ],
  columns: [
    { key: 'bankName', label: 'Bank' },
    { key: 'branch', label: 'Branch' },
    { key: 'accountNumber', label: 'Account' },
    { key: 'status', label: 'Status' },
  ],
};
