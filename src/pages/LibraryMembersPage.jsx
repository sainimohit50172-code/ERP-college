import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "name", "label": "Member name"}, {"name": "memberType", "label": "Member type"}, {"name": "email", "label": "Email", "type": "email"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Active", "label": "Active"}, {"value": "Inactive", "label": "Inactive"}]}];
const columns = [{"key": "name", "label": "Name"}, {"key": "memberType", "label": "Type"}, {"key": "email", "label": "Email"}, {"key": "status", "label": "Status"}];

export default function LibraryMembersPage() {
  return (
    <GenericCrudPage
      title="Library members"
      subtitle="Manage memberships, borrower profiles and active library access."
      resource="libraryMembers"
      itemLabel="member"
      initialValues={{"name": "", "memberType": "Student", "email": "", "status": "Active"}}
      fields={fields}
      columns={columns}
    />
  );
}
