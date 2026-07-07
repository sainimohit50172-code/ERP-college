import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "title", "label": "Insight title"}, {"name": "category", "label": "Category"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Published", "label": "Published"}, {"value": "Draft", "label": "Draft"}]}];
const columns = [{"key": "title", "label": "Insight"}, {"key": "category", "label": "Category"}, {"key": "status", "label": "Status"}];

export default function AnalyticsPage() {
  return (
    <GenericCrudPage
      title="Analytics"
      subtitle="Review KPI widgets and operational metrics."
      resource="reports"
      itemLabel="analytics insight"
      initialValues={{"title": "", "category": "Performance", "status": "Published"}}
      fields={fields}
      columns={columns}
    />
  );
}
