import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [
  { name: 'name', label: 'Subject name', placeholder: 'e.g. Data Structures' },
  { name: 'code', label: 'Subject code', placeholder: 'e.g. CS201' },
  { name: 'course_id', label: 'Course ID', type: 'number', placeholder: 'Optional course ID' },
];

const columns = [
  { key: 'name', label: 'Subject name' },
  { key: 'code', label: 'Subject code' },
  { key: 'course_id', label: 'Course ID' },
];

export default function LibrarySubjectsPage() {
  return (
    <GenericCrudPage
      title="Library subjects"
      subtitle="Maintain the subjects used to classify and discover library books."
      description="Create a clean subject catalogue with searchable codes and course links for consistent book classification across the institution."
      resource="subjects"
      itemLabel="subject"
      createButtonLabel="Add subject"
      initialValues={{ name: '', code: '', course_id: '' }}
      fields={fields}
      columns={columns}
    />
  );
}