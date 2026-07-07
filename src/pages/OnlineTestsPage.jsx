import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "title", "label": "Test title"}, {"name": "duration", "label": "Duration (mins)", "type": "number"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Draft", "label": "Draft"}, {"value": "Published", "label": "Published"}]}];
const columns = [{"key": "title", "label": "Title"}, {"key": "duration", "label": "Duration"}, {"key": "status", "label": "Status"}];

export default function OnlineTestsPage() {
  return (
    <GenericCrudPage
      title="Online tests"
      subtitle="Create and administer online assessments."
      resource="courses"
      itemLabel="online test"
      initialValues={{"title": "", "duration": "60", "status": "Draft"}}
      fields={fields}
      columns={columns}
    />
  );
}
