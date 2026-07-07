import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "name", "label": "Campaign name"}, {"name": "channel", "label": "Channel"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Planned", "label": "Planned"}, {"value": "Running", "label": "Running"}, {"value": "Completed", "label": "Completed"}]}];
const columns = [{"key": "name", "label": "Campaign"}, {"key": "channel", "label": "Channel"}, {"key": "status", "label": "Status"}];

export default function MarketingPage() {
  return (
    <GenericCrudPage
      title="Marketing campaigns"
      subtitle="Coordinate campaigns and outreach activity."
      resource="leads"
      itemLabel="campaign"
      initialValues={{"name": "", "channel": "Email", "status": "Planned"}}
      fields={fields}
      columns={columns}
    />
  );
}
