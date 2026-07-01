import { useMemo } from 'react';
import { useResourceList } from '../../hooks/useResourceHooks';

export default function VehicleDetails({ vehicle }) {
  const maintenance = useResourceList('transportMaintenance', { page: 1, pageSize: 200 });
  const fuelEntries = useResourceList('fuelEntries', { page: 1, pageSize: 200 });

  const vehicleMaintenance = useMemo(() => (maintenance.data?.items || []).filter((m) => String(m.vehicleId) === String(vehicle?.id)), [maintenance, vehicle]);
  const vehicleFuel = useMemo(() => (fuelEntries.data?.items || []).filter((f) => String(f.vehicleId) === String(vehicle?.id)), [fuelEntries, vehicle]);

  if (!vehicle) return <div className="p-4 text-sm text-slate-500">No vehicle selected</div>;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-semibold">{vehicle.registration || vehicle.id}</h3>
        <p className="text-sm text-slate-600">Type: {vehicle.vehicleType} · Capacity: {vehicle.capacity}</p>
        <p className="text-sm text-slate-600">GPS: {vehicle.gpsId || 'N/A'} · Status: {vehicle.status || 'Active'}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h4 className="text-sm font-semibold">Maintenance History</h4>
        <ul className="mt-2 text-sm text-slate-600">
          {vehicleMaintenance.map((m) => <li key={m.id}>{m.serviceType} · {m.serviceDate} · {m.expense || ''}</li>)}
          {!vehicleMaintenance.length && <li className="text-sm text-slate-500">No maintenance records</li>}
        </ul>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h4 className="text-sm font-semibold">Fuel History</h4>
        <ul className="mt-2 text-sm text-slate-600">
          {vehicleFuel.map((f) => <li key={f.id}>{f.date} · {f.quantity}L · {f.station}</li>)}
          {!vehicleFuel.length && <li className="text-sm text-slate-500">No fuel entries</li>}
        </ul>
      </div>
    </div>
  );
}
