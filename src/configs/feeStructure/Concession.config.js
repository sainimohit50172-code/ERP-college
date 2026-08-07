export default {
  key: 'concession',
  title: 'Concession',
  subtitle: 'Configure concession schemes and discounts.',
  description: 'Track concession types and percentage or fixed discount values for eligible students.',
  resource: 'concessions',
  itemLabel: 'concession',
  breadcrumbs: [
    { label: 'Dashboard', to: '/' },
    { label: 'Settings', to: '/settings' },
    { label: 'Fee Structure', to: '/settings/fee-structure' },
    { label: 'Concession' },
  ],
  defaultValues: { concessionName: '', concessionCode: '', discountType: 'Percentage', discountValue: '', status: 'Active', description: '' },
  searchFields: ['concessionName', 'concessionCode'],
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
    { name: 'concessionName', label: 'Concession Name', placeholder: 'Enter concession name', validation: { required: 'Concession name is required' } },
    { name: 'concessionCode', label: 'Concession Code', placeholder: 'Enter concession code', validation: { required: 'Concession code is required' } },
    { name: 'discountType', label: 'Discount Type', type: 'select', options: [
      { value: 'Percentage', label: 'Percentage' },
      { value: 'Fixed', label: 'Fixed Amount' },
    ], validation: { required: 'Discount type is required' } },
    { name: 'discountValue', label: 'Discount Value', type: 'number', placeholder: 'Enter discount value', validation: { required: 'Discount value is required' } },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ], validation: { required: 'Status is required' } },
    { name: 'description', label: 'Description', type: 'textarea', fullWidth: true, placeholder: 'Enter description' },
  ],
  columns: [
    { key: 'concessionName', label: 'Concession' },
    { key: 'concessionCode', label: 'Code' },
    { key: 'discountType', label: 'Type' },
    { key: 'discountValue', label: 'Value' },
    { key: 'status', label: 'Status' },
  ],
};
