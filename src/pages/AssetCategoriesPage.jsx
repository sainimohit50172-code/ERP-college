import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "name", "label": "Category name"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Active", "label": "Active"}, {"value": "Inactive", "label": "Inactive"}]}];
const columns = [{"key": "name", "label": "Category"}, {"key": "status", "label": "Status"}];

export default function AssetCategoriesPage() {
  return (
    <GenericCrudPage
      title="Asset categories"
      subtitle="Organize asset inventory by category."
      resource="assetCategories"
      itemLabel="asset category"
      initialValues={{"name": "", "status": "Active"}}
      fields={fields}
      columns={columns}
    />
  );
}
