import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "bookId", "label": "Book ID"}, {"name": "reportedBy", "label": "Reported by"}, {"name": "damageType", "label": "Damage type"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Reported", "label": "Reported"}, {"value": "Replaced", "label": "Replaced"}]}];
const columns = [{"key": "bookId", "label": "Book ID"}, {"key": "reportedBy", "label": "Reported by"}, {"key": "damageType", "label": "Damage type"}, {"key": "status", "label": "Status"}];

export default function LibraryDamagesPage() {
  return (
    <GenericCrudPage
      title="Damaged books"
      subtitle="Log damaged library items and coordinate replacements."
      resource="libraryDamages"
      itemLabel="damage record"
      initialValues={{"bookId": "", "reportedBy": "", "damageType": "Physical", "status": "Reported"}}
      fields={fields}
      columns={columns}
    />
  );
}
