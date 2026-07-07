import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "name", "label": "Course name"}, {"name": "category", "label": "Category"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Draft", "label": "Draft"}, {"value": "Published", "label": "Published"}]}];
const columns = [{"key": "name", "label": "Course"}, {"key": "category", "label": "Category"}, {"key": "status", "label": "Status"}];

export default function LMSCoursesPage() {
  return (
    <GenericCrudPage
      title="LMS courses"
      subtitle="Maintain learning content and course catalogues."
      resource="courses"
      itemLabel="course"
      initialValues={{"name": "", "category": "General", "status": "Draft"}}
      fields={fields}
      columns={columns}
    />
  );
}
