import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "issueId", "label": "Issue ID"}, {"name": "memberId", "label": "Member ID"}, {"name": "renewedOn", "label": "Renewed on", "type": "date"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Pending", "label": "Pending"}, {"value": "Approved", "label": "Approved"}]}];
const columns = [{"key": "issueId", "label": "Issue ID"}, {"key": "memberId", "label": "Member ID"}, {"key": "renewedOn", "label": "Renewed on"}, {"key": "status", "label": "Status"}];

export default function LibraryRenewalsPage() {
  return (
    <GenericCrudPage
      title="Book renewals"
      subtitle="Track renewal requests for active library loans."
      resource="libraryRenewals"
      itemLabel="renewal"
      initialValues={{"issueId": "", "memberId": "", "renewedOn": "", "status": "Pending"}}
      fields={fields}
      columns={columns}
    />
  );
}
