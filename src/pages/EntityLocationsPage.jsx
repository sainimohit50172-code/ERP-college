import { useMemo, useState } from 'react';
import { Building2, Download, Eye, FileDown, MapPin, RefreshCw, RotateCcw, Settings2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import { useResourceList } from '../hooks/useResourceHooks';

const getLocation = (item) => item.officeLocation || item.location || '';

export default function EntityLocationsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const { data, isLoading, refetch } = useResourceList('organizations', { page: 1, pageSize: 500 });
  const organizations = useMemo(() => data?.items || [], [data]);
  const locations = useMemo(() => {
    const grouped = new Map();
    organizations.forEach((organization) => {
      const name = getLocation(organization) || 'Location not specified';
      const current = grouped.get(name) || { name, units: [], heads: new Set() };
      current.units.push(organization);
      if (organization.head) current.heads.add(organization.head);
      grouped.set(name, current);
    });
    return [...grouped.values()].map((item) => ({ ...item, headCount: item.heads.size }));
  }, [organizations]);
  const filteredLocations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return locations.filter((location) => !query || [location.name, ...location.units.map((unit) => unit.name), ...location.units.map((unit) => unit.code)].join(' ').toLowerCase().includes(query));
  }, [locations, search]);

  const exportLocations = () => {
    const rows = [['Office location', 'Organization units', 'Reporting heads'], ...filteredLocations.map((location) => [location.name, location.units.length, location.headCount])];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = 'entity-locations.csv'; link.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-5 border-b border-slate-200/80 pb-4">
          <div className="mb-3 text-[10px] text-slate-500"><Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'HRM Master', to: '/settings/hrm' }, { label: 'Entity Locations' }]} /></div>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-600">HRM Master</p><h1 className="mt-1 text-[20px] font-semibold tracking-tight text-slate-900 sm:text-[24px]">Entity Locations</h1><p className="mt-1 text-[11px] text-slate-400">View office locations and the organization units mapped to each location.</p></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"><FileDown className="h-3.5 w-3.5" /> Print</button><button type="button" onClick={exportLocations} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"><Download className="h-3.5 w-3.5" /> Export</button><button type="button" onClick={() => refetch()} disabled={isLoading} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"><RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh</button><button type="button" onClick={() => navigate('/organizations')} className="inline-flex items-center gap-1.5 rounded-lg border border-[#0f5132] bg-white px-3 py-2 text-xs font-semibold text-[#0f5132] hover:bg-emerald-50"><Settings2 className="h-3.5 w-3.5" /> Manage organizations</button></div></div>
        </div>

        <section className="mb-5 grid gap-3 sm:grid-cols-3"><div className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Locations</p><p className="mt-3 text-2xl font-semibold text-slate-950">{locations.length}</p><p className="mt-1 text-[10px] text-slate-400">Mapped office locations</p></div><div className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Organization units</p><p className="mt-3 text-2xl font-semibold text-slate-950">{organizations.length}</p><p className="mt-1 text-[10px] text-slate-400">Across all locations</p></div><div className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Mapped heads</p><p className="mt-3 text-2xl font-semibold text-slate-950">{new Set(organizations.map((item) => item.head).filter(Boolean)).size}</p><p className="mt-1 text-[10px] text-slate-400">Responsible reporting heads</p></div></section>

        <section className="mb-5 rounded-[16px] border border-slate-200 bg-white p-3 shadow-sm"><div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]"><label htmlFor="entity-location-search" className="text-[10px] font-semibold text-slate-600">Search location or organization<input id="entity-location-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search office location..." className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] font-normal outline-none focus:border-emerald-400" /></label><button type="button" onClick={() => setSearch('')} className="inline-flex h-[28px] items-center justify-center gap-1 self-end rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-semibold text-slate-600 hover:bg-slate-100"><RotateCcw className="h-3 w-3" /> Reset</button></div></section>

        <section className="flex-1 overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5"><div className="flex items-center gap-2 text-xs font-semibold text-slate-800"><MapPin className="h-3.5 w-3.5" /> Location Directory</div><span className="text-[10px] text-slate-500">Showing {filteredLocations.length} locations</span></div><div className="overflow-x-auto"><table className="min-w-[760px] w-full border-collapse text-center text-[10px]"><thead><tr className="bg-[#0f5132] text-white"><th className="border-r border-white/30 px-3 py-2.5">S.No.</th><th className="border-r border-white/30 px-3 py-2.5 text-left">Office location</th><th className="border-r border-white/30 px-3 py-2.5">Organization units</th><th className="border-r border-white/30 px-3 py-2.5">Reporting heads</th><th className="px-3 py-2.5">Actions</th></tr></thead><tbody>{isLoading ? <tr><td colSpan="5" className="py-12 text-center text-slate-500">Loading locations...</td></tr> : filteredLocations.length === 0 ? <tr><td colSpan="5" className="py-12 text-center text-slate-500">No entity locations found.</td></tr> : filteredLocations.map((location, index) => <tr key={location.name} className="border-b border-slate-200 text-slate-700 odd:bg-slate-50/50 hover:bg-emerald-50/30"><td className="border-r border-white px-3 py-2">{index + 1}</td><td className="border-r border-white px-3 py-2 text-left font-semibold text-slate-900"><MapPin className="mr-1 inline h-3 w-3 text-emerald-600" />{location.name}</td><td className="border-r border-white px-3 py-2">{location.units.length}</td><td className="border-r border-white px-3 py-2">{location.headCount}</td><td className="px-3 py-2"><button type="button" onClick={() => setSelectedLocation(location)} aria-label={`View ${location.name} details`} title="View details" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"><Eye className="h-3 w-3" /></button></td></tr>)}</tbody></table></div></section>
      </div>

      {selectedLocation && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">Location record</p><h2 className="text-xl font-semibold text-slate-900">{selectedLocation.name}</h2></div><button type="button" onClick={() => setSelectedLocation(null)} aria-label="Close location details"><X className="h-4 w-4 text-slate-500" /></button></div><div className="space-y-2">{selectedLocation.units.map((unit) => <div key={unit.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"><span className="font-medium text-slate-800"><Building2 className="mr-2 inline h-3.5 w-3.5 text-emerald-600" />{unit.name || 'Unnamed unit'}</span><span className="text-xs text-slate-500">{unit.code || '-'}</span></div>)}</div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => navigate('/organizations')} className="inline-flex items-center gap-1.5 rounded-lg border border-[#0f5132] px-3 py-2 text-xs font-semibold text-[#0f5132] hover:bg-emerald-50"><Settings2 className="h-3.5 w-3.5" /> Manage units</button><button type="button" onClick={() => setSelectedLocation(null)} className="rounded-lg bg-[#0f5132] px-4 py-2 text-xs font-semibold text-white">Close</button></div></div></div>}
    </div>
  );
}
