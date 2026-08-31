import { useMemo, useState } from 'react';
import { Check, Download, FileJson, FileSpreadsheet, Filter, Package, Printer, RotateCcw, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { useERP } from '../services/ERPContext.jsx';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const DATASETS = [
  { key: 'students', label: 'Students', description: 'Student profiles, contact and academic identifiers', icon: Users },
  { key: 'teachers', label: 'Teachers', description: 'Faculty directory and teaching assignments', icon: Users },
  { key: 'employees', label: 'Employees', description: 'Employee and staff records', icon: Users },
  { key: 'departments', label: 'Departments', description: 'Academic and administrative departments', icon: Package },
  { key: 'courses', label: 'Courses', description: 'Program and course master data', icon: Package },
  { key: 'subjects', label: 'Subjects', description: 'Subject catalogue and codes', icon: FileSpreadsheet },
  { key: 'hostels', label: 'Hostels', description: 'Hostel master and accommodation data', icon: Package },
  { key: 'leads', label: 'Admission Leads', description: 'Admission enquiry and lead records', icon: Users },
];

const normalizeValue = (value) => {
  if (value == null) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const csvValue = (value) => `"${normalizeValue(value).replace(/"/g, '""')}"`;

const getColumns = (rows) => {
  const keys = new Set();
  rows.slice(0, 100).forEach((row) => Object.keys(row || {}).forEach((key) => keys.add(key)));
  return [...keys].slice(0, 24);
};

export default function StudentExportDataPage() {
  const erp = useERP();
  const [datasetKey, setDatasetKey] = useState('students');
  const [searchText, setSearchText] = useState('');
    const [format, setFormat] = useState('csv');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [showColumns, setShowColumns] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const selectedDataset = DATASETS.find((item) => item.key === datasetKey) || DATASETS[0];
  const sourceRows = useMemo(() => (Array.isArray(erp[datasetKey]) ? erp[datasetKey] : []), [datasetKey, erp]);
  const columns = useMemo(() => getColumns(sourceRows), [sourceRows]);
  const activeColumns = selectedColumns.length ? selectedColumns.filter((column) => columns.includes(column)) : columns;
  const filteredRows = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    if (!term) return sourceRows;
    return sourceRows.filter((row) => Object.values(row || {}).some((value) => normalizeValue(value).toLowerCase().includes(term)));
  }, [searchText, sourceRows]);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);
  const allVisibleSelected = visibleRows.length > 0 && visibleRows.every((row) => selectedRows.includes(row.id));
  const exportRows = selectedRows.length ? filteredRows.filter((row) => selectedRows.includes(row.id)) : filteredRows;

  const switchDataset = (key) => {
    setDatasetKey(key);
    setSearchText('');
    setSelectedColumns([]);
    setSelectedRows([]);
    setPage(1);
  };

  const toggleColumn = (column) => {
    setSelectedColumns((current) => current.includes(column) ? current.filter((item) => item !== column) : [...current, column]);
  };

  const toggleVisibleRows = () => {
    if (allVisibleSelected) {
      setSelectedRows((current) => current.filter((id) => !visibleRows.some((row) => row.id === id)));
    } else {
      setSelectedRows((current) => [...new Set([...current, ...visibleRows.map((row) => row.id)])]);
    }
  };

  const exportData = () => {
    if (!exportRows.length) {
      toast.info('No records available to export');
      return;
    }
    const payload = exportRows.map((row) => Object.fromEntries(activeColumns.map((column) => [column, row[column] ?? ''])));
    const content = format === 'json'
      ? JSON.stringify(payload, null, 2)
      : [activeColumns, ...payload.map((row) => activeColumns.map((column) => row[column]))].map((row) => row.map(csvValue).join(',')).join('\n');
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${datasetKey}-export-${new Date().toISOString().slice(0, 10)}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`${exportRows.length} ${selectedDataset.label.toLowerCase()} exported as ${format.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] px-2 py-5 text-slate-900 sm:px-3 lg:px-4">
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="mb-5 flex flex-col gap-4 border-b border-slate-200/80 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div><Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Students', to: '/students' }, { label: 'Reports' }, { label: 'Export Data' }]} /><div className="mt-3 flex items-start gap-3"><div className="rounded-2xl bg-[#0f5132] p-3 text-white shadow-lg shadow-emerald-100"><Package className="h-6 w-6" /></div><div><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-600">Student Reports</p><h1 className="mt-1 text-[22px] font-semibold tracking-tight text-slate-950 sm:text-[28px]">Export Data</h1><p className="mt-1 text-xs text-slate-500">Build a precise export from the shared ERP records without leaving the report workspace.</p></div></div></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"><Printer className="h-4 w-4" />Print</button><button type="button" onClick={exportData} disabled={!exportRows.length} className="inline-flex items-center gap-2 rounded-lg bg-[#1d3557] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#16324f] disabled:cursor-not-allowed disabled:opacity-50"><Download className="h-4 w-4" />Export {format.toUpperCase()}</button></div></div>

        <section className="mb-4 grid gap-3 lg:grid-cols-4"><div className="lg:col-span-3 rounded-2xl bg-[#101824] p-4 text-white shadow-[0_16px_35px_rgba(16,24,36,0.12)] sm:p-5"><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">Export workspace</p><h2 className="mt-1 text-lg font-semibold">Choose a data source</h2><p className="mt-1 text-xs text-slate-400">{sourceRows.length} records currently available in {selectedDataset.label.toLowerCase()}</p></div><div className="flex flex-wrap gap-2"><label className="relative"><span className="sr-only">Search records</span><input value={searchText} onChange={(event) => { setSearchText(event.target.value); setPage(1); }} placeholder={`Search ${selectedDataset.label.toLowerCase()}...`} className="h-9 w-64 rounded-lg border border-white/15 bg-white/10 px-3 text-xs text-white outline-none placeholder:text-slate-400 focus:border-emerald-300" /></label><button type="button" onClick={() => { setSearchText(''); setSelectedRows([]); setPage(1); }} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/15 px-3 text-xs font-semibold text-slate-300 hover:bg-white/10"><RotateCcw className="h-3.5 w-3.5" />Reset</button></div></div></div><div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Ready to export</p><p className="mt-2 text-2xl font-bold text-emerald-950">{exportRows.length}</p><p className="mt-1 text-[11px] text-emerald-700">{selectedRows.length ? 'Selected records' : 'Filtered records'}</p></div></section>

        <section className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{DATASETS.map((dataset) => { const Icon = dataset.icon; const active = dataset.key === datasetKey; return <button key={dataset.key} type="button" onClick={() => switchDataset(dataset.key)} className={`rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 ${active ? 'border-emerald-300 bg-emerald-50/70 ring-2 ring-emerald-100' : 'border-slate-200 bg-white hover:border-sky-300'}`}><div className="flex items-start justify-between gap-2"><div className={`rounded-xl p-2 ${active ? 'bg-[#0f5132] text-white' : 'bg-slate-100 text-slate-600'}`}><Icon className="h-4 w-4" /></div>{active && <Check className="h-4 w-4 text-emerald-600" />}</div><p className="mt-3 text-sm font-semibold text-slate-900">{dataset.label}</p><p className="mt-1 text-[11px] leading-4 text-slate-500">{dataset.description}</p><p className="mt-3 text-xs font-semibold text-slate-600">{Array.isArray(erp[dataset.key]) ? erp[dataset.key].length : 0} records</p></button>; })}</section>

        <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Column selection</p><h2 className="mt-1 text-sm font-semibold text-slate-900">Export {selectedDataset.label}</h2><p className="mt-1 text-[11px] text-slate-500">{activeColumns.length} of {columns.length} columns included</p></div><div className="flex flex-wrap gap-2"><div className="flex rounded-lg border border-slate-200 p-1"><button type="button" onClick={() => setFormat('csv')} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${format === 'csv' ? 'bg-[#1d3557] text-white' : 'text-slate-600'}`}><FileSpreadsheet className="h-3.5 w-3.5" />CSV</button><button type="button" onClick={() => setFormat('json')} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${format === 'json' ? 'bg-[#1d3557] text-white' : 'text-slate-600'}`}><FileJson className="h-3.5 w-3.5" />JSON</button></div><button type="button" onClick={() => setShowColumns((value) => !value)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Filter className="h-3.5 w-3.5" />{showColumns ? 'Hide columns' : 'Choose columns'}</button></div></div>{showColumns && <div className="mt-4 grid gap-2 border-t border-slate-200 pt-4 sm:grid-cols-2 lg:grid-cols-4">{columns.map((column) => <label key={column} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700"><input type="checkbox" checked={activeColumns.includes(column)} onChange={() => toggleColumn(column)} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />{column}</label>)}</div>}</section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3"><div><h2 className="text-sm font-semibold text-slate-900">Preview</h2><p className="mt-1 text-[11px] text-slate-500">Select individual rows or export all filtered records.</p></div><button type="button" onClick={toggleVisibleRows} disabled={!visibleRows.length} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40"><Check className="h-3.5 w-3.5" />{allVisibleSelected ? 'Clear page' : 'Select page'}</button></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead className="bg-[#1d3557] text-white"><tr><th className="w-12 px-4 py-3"><input type="checkbox" checked={allVisibleSelected} onChange={toggleVisibleRows} aria-label="Select visible records" /></th><th className="px-4 py-3">S.No</th>{activeColumns.slice(0, 8).map((column) => <th key={column} className="px-4 py-3 font-semibold">{column}</th>)}</tr></thead><tbody>{!visibleRows.length ? <tr><td colSpan={activeColumns.slice(0, 8).length + 2} className="px-4 py-16 text-center text-slate-500">No records match the current search.</td></tr> : visibleRows.map((row, index) => <tr key={row.id ?? index} className="border-b border-slate-100 odd:bg-white even:bg-slate-50/70"><td className="px-4 py-3"><input type="checkbox" checked={selectedRows.includes(row.id)} onChange={() => setSelectedRows((current) => current.includes(row.id) ? current.filter((id) => id !== row.id) : [...current, row.id])} aria-label={`Select record ${index + 1}`} /></td><td className="px-4 py-3 font-semibold text-slate-500">{(page - 1) * pageSize + index + 1}</td>{activeColumns.slice(0, 8).map((column) => <td key={column} className="max-w-[220px] truncate px-4 py-3 text-slate-700">{normalizeValue(row[column]) || '—'}</td>)}</tr>)}</tbody></table></div><div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>Showing {visibleRows.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filteredRows.length)} of {filteredRows.length} records</span><div className="flex items-center gap-2"><select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5">{PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size} / page</option>)}</select><button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 disabled:opacity-40">Previous</button><span className="font-semibold text-slate-700">{page} / {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 disabled:opacity-40">Next</button></div></div></section>
      </div>
    </div>
  );
}
