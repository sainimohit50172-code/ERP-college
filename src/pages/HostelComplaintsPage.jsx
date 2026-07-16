import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [
  { name: 'subject', label: 'Subject' },
  { name: 'category', label: 'Category' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'Open', label: 'Open' },
      { value: 'InProgress', label: 'In Progress' },
      { value: 'Resolved', label: 'Resolved' },
      { value: 'Closed', label: 'Closed' },
    ] },
];
const columns = [
  { key: 'subject', label: 'Subject' },
  { key: 'category', label: 'Category' },
  { key: 'status', label: 'Status' },
];

export default function HostelComplaintsPage() {
  return (
    <GenericCrudPage
      title="Hostel complaints"
      subtitle="Capture and track hostel complaints and issue resolution."
      resource="hostelComplaints"
      itemLabel="complaint"
      initialValues={{ category: 'General', subject: '', description: '', status: 'Open' }}
      fields={fields}
      columns={columns}
    />
  );
}
