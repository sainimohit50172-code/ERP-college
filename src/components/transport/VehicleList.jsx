import ViewButton from '../ui/ViewButton.jsx';
import IconActionButton from '../ui/IconActionButton.jsx';
import { Edit3, Archive, Trash2 } from 'lucide-react';

export default function VehicleList({ vehicles = [], onView = () => {}, onEdit = () => {}, onDelete = () => {}, onArchive = () => {} }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Vehicles</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-600">
        {vehicles.map((v) => (
          <li key={v.id} className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{v.registration || v.id}</div>
              <div className="text-xs text-slate-500">{v.make || ''} · {v.capacity || 'N/A'}</div>
            </div>
            <div className="flex items-center gap-2">
              <ViewButton
                title="View vehicle"
                ariaLabel="View vehicle"
                className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                onClick={() => onView(v)}
              />
              <IconActionButton icon={Edit3} title="Edit vehicle" ariaLabel="Edit vehicle" variant="primary" className="h-8 w-8" onClick={() => onEdit(v)} />
              <IconActionButton icon={Archive} title="Archive vehicle" ariaLabel="Archive vehicle" className="h-8 w-8" onClick={() => onArchive(v)} />
              <IconActionButton icon={Trash2} title="Delete vehicle" ariaLabel="Delete vehicle" variant="danger" className="h-8 w-8" onClick={() => onDelete(v)} />
            </div>
          </li>
        ))}
        {!vehicles.length && <li className="text-sm text-slate-500">No vehicles configured</li>}
      </ul>
    </div>
  );
}
