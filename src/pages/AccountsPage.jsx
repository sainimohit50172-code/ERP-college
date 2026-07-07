import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "name", "label": "Account name"}, {"name": "accountType", "label": "Account type"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Active", "label": "Active"}, {"value": "Inactive", "label": "Inactive"}]}];
const columns = [{"key": "name", "label": "Account"}, {"key": "accountType", "label": "Type"}, {"key": "status", "label": "Status"}];

export default function AccountsPage() {
  return (
    <GenericCrudPage
      title="Chart of accounts"
      subtitle="Maintain account categories and ledger structures."
      resource="accounts"
      itemLabel="account"
      initialValues={{"name": "", "accountType": "Asset", "status": "Active"}}
      fields={fields}
      columns={columns}
    />
  );
}
