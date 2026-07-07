import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const fields = [{"name": "vehicleId", "label": "Vehicle ID"}, {"name": "quantity", "label": "Quantity", "type": "number"}, {"name": "date", "label": "Date", "type": "date"}, {"name": "status", "label": "Status", "type": "select", "options": [{"value": "Recorded", "label": "Recorded"}, {"value": "Approved", "label": "Approved"}]}];
const columns = [{"key": "vehicleId", "label": "Vehicle ID"}, {"key": "quantity", "label": "Quantity"}, {"key": "date", "label": "Date"}, {"key": "status", "label": "Status"}];

export default function TransportFuelPage() {
  return (
    <GenericCrudPage
      title="Fuel entries"
      subtitle="Record fuel consumption for each transport vehicle."
      resource="fuelEntries"
      itemLabel="fuel entry"
      initialValues={{"vehicleId": "", "quantity": "", "date": "", "status": "Recorded"}}
      fields={fields}
      columns={columns}
    />
  );
}
