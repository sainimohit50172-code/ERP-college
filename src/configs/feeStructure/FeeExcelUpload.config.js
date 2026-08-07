export default {
  key: 'fee-excel-upload',
  title: 'Fee Excel Upload',
  subtitle: 'Manage fee import templates.',
  description: 'Track Excel-based fee upload templates and manage the file metadata.',
  resource: 'fee-excel-uploads',
  itemLabel: 'fee upload template',
  breadcrumbs: [
    { label: 'Dashboard', to: '/' },
    { label: 'Settings', to: '/settings' },
    { label: 'Fee Structure', to: '/settings/fee-structure' },
    { label: 'Fee Excel Upload' },
  ],
  defaultValues: { templateName: '', fileUrl: '', status: 'Active' },
  searchFields: ['templateName', 'fileUrl'],
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
    { name: 'templateName', label: 'Template Name', placeholder: 'Enter template name', validation: { required: 'Template name is required' } },
    { name: 'fileUrl', label: 'File URL', placeholder: 'Enter file or template URL', validation: { required: 'File URL is required' } },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ], validation: { required: 'Status is required' } },
  ],
  columns: [
    { key: 'templateName', label: 'Template' },
    { key: 'fileUrl', label: 'File URL' },
    { key: 'status', label: 'Status' },
  ],
};
