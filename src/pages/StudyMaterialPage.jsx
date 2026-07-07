import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "title", "label": "Title"}, {"name": "topic", "label": "Topic"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Draft", "label": "Draft"}, {"value": "Published", "label": "Published"}]}];
const columns = [{"key": "title", "label": "Title"}, {"key": "topic", "label": "Topic"}, {"key": "status", "label": "Status"}];

export default function StudyMaterialPage() {
  return (
    <GenericCrudPage
      title="Study material"
      subtitle="Publish notes and lessons for LMS learners."
      resource="courses"
      itemLabel="study material"
      initialValues={{"title": "", "topic": "", "status": "Draft"}}
      fields={fields}
      columns={columns}
    />
  );
}
