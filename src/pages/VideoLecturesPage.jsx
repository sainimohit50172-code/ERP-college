import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "title", "label": "Title"}, {"name": "url", "label": "Video URL", "type": "url"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Draft", "label": "Draft"}, {"value": "Published", "label": "Published"}]}];
const columns = [{"key": "title", "label": "Title"}, {"key": "url", "label": "URL"}, {"key": "status", "label": "Status"}];

export default function VideoLecturesPage() {
  return (
    <GenericCrudPage
      title="Video lectures"
      subtitle="Manage recorded lectures and embedded video links."
      resource="courses"
      itemLabel="video lecture"
      initialValues={{"title": "", "url": "", "status": "Draft"}}
      fields={fields}
      columns={columns}
    />
  );
}
