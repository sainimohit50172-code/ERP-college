import SubPage from '../../components/studentMaster/SubPage.jsx';

const columns = [
  { key: 'route', label: 'Route' },
  { key: 'pickupPoint', label: 'Pickup Point' },
  { key: 'vehicle', label: 'Vehicle' },
  { key: 'transportRequired', label: 'Transport Required' },
  { key: 'status', label: 'Status' },
];

const demo = [
  { id: 't1', route: 'Route 1', pickupPoint: 'Gate A', vehicle: 'Bus 12', transportRequired: 'Yes', status: 'Active' },
  { id: 't2', route: 'Route 2', pickupPoint: 'Gate B', vehicle: 'Van 3', transportRequired: 'No', status: 'Active' },
];

export default function TransportConfigurationsPage() {
  return <SubPage title="Transport Configurations" subtitle="Configure transport settings." columns={columns} demoData={demo} addLabel="Add Transport Configuration" />;
}
