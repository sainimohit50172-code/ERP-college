import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "name", "label": "Campaign name"}, {"name": "priority", "label": "Priority"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Active", "label": "Active"}, {"value": "Paused", "label": "Paused"}]}];
const columns = [{"key": "name", "label": "Campaign"}, {"key": "priority", "label": "Priority"}, {"key": "status", "label": "Status"}];

export default function CampaignsPage() {
  return (
    <GenericCrudPage
      title="CRM campaigns"
      subtitle="Review outreach campaigns and promoter activity."
      resource="leads"
      itemLabel="campaign"
      initialValues={{"name": "", "priority": "Medium", "status": "Active"}}
      fields={fields}
      columns={columns}
    />
  );
}
