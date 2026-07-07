import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "name", "label": "Asset name"}, {"name": "category", "label": "Category"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Active", "label": "Active"}, {"value": "Retired", "label": "Retired"}]}];
const columns = [{"key": "name", "label": "Asset"}, {"key": "category", "label": "Category"}, {"key": "status", "label": "Status"}];

export default function AssetsPage() {
  return (
    <GenericCrudPage
      title="Assets"
      subtitle="Manage the asset register and current usage."
      resource="assets"
      itemLabel="asset"
      initialValues={{"name": "", "category": "", "status": "Active"}}
      fields={fields}
      columns={columns}
    />
  );
}
