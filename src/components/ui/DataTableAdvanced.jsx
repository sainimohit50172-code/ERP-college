import { useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Printer, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { CSVLink } from 'react-csv';
import LoadingOverlay from './LoadingOverlay.jsx';
import EmptyState from './EmptyState.jsx';

function getSortedRows(rows, sortColumn, sortDirection) {
  if (!sortColumn) return rows;
  return [...rows].sort((a, b) => {
    const aValue = a[sortColumn] ?? '';
    const bValue = b[sortColumn] ?? '';
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    return sortDirection === 'asc' ? (aValue > bValue ? 1 : -1) : aValue < bValue ? 1 : -1;
  });
}

function buildCsvData(columns, rows) {
  return [columns.map((column) => column.label || column.key), ...rows.map((row) => columns.map((column) => String(row[column.key] ?? '')),)];
}

export default function DataTableAdvanced({
  columns,
  rows,
  loading = false,
  searchKey: _searchKey = 'name',
  placeholder = 'Search records...',
  initialPageSize = 10,
  hideHeader = false,
}) {
  const [query, setQuery] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return rows;
    return rows.filter((row) =>
      columns.some((column) => {
        const value = row[column.key];
        return String(value ?? '').toLowerCase().includes(normalized);
      }),
    );
  }, [columns, query, rows]);

  const sortedRows = useMemo(() => getSortedRows(filteredRows, sortColumn, sortDirection), [filteredRows, sortColumn, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [currentPage, pageSize, sortedRows]);

  const tableRef = useRef(null);
  const handlePrint = useReactToPrint({ content: () => tableRef.current });

  const csvData = useMemo(() => buildCsvData(columns, filteredRows), [columns, filteredRows]);

  const toggleSort = (key) => {
    if (sortColumn === key) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  if (loading) {
    return <LoadingOverlay loading message="Loading table data..." />;
  }

  return (
    <div className="rounded-[20px] border border-slate-200/70 bg-white/95 p-4 shadow-sm sm:p-5">
      {!hideHeader && (
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-slate-950">Data table</h3>
            <p className="text-sm text-slate-500">Search, sort, page and export your data with one flexible table.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={handlePrint} className="btn btn-secondary inline-flex items-center gap-2">
              <Printer className="h-4 w-4" /> Print
            </button>
            <CSVLink data={csvData} filename="table-export.csv" className="btn btn-secondary inline-flex items-center gap-2">
              <Download className="h-4 w-4" /> CSV
            </CSVLink>
          </div>
        </div>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto] xl:grid-cols-[1fr_auto_auto]">
        <div className="relative max-w-lg">
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCurrentPage(1);
            }}
            placeholder={placeholder}
            className="w-full rounded-3xl border border-slate-200/80 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">Search</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-500">Rows per page</label>
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setCurrentPage(1);
            }}
            className="rounded-3xl border border-slate-200/80 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
          >
            {[10, 20, 30, 50].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      {paginatedRows.length === 0 ? (
        <EmptyState title="No matching records" description="Try a different search term or change the filters." />
      ) : (
        <div className="overflow-x-auto rounded-[20px] border border-slate-200/70">
          <table ref={tableRef} className="w-full table-fixed text-left text-sm text-slate-900">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="min-w-[140px] px-4 py-3 font-semibold uppercase tracking-[0.18em] text-slate-600 text-left">
                    <button type="button" className="inline-flex items-center gap-2" onClick={() => toggleSort(column.key)}>
                      <span>{column.label}</span>
                      {sortColumn === column.key ? (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      ) : null}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, index) => (
                <tr key={`row-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  {columns.map((column) => (
                  <td key={`${index}-${column.key}`} className="break-words px-4 py-3 align-top text-slate-700">
                      {column.render ? column.render(row[column.key], row) : row[column.key] ?? ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Showing {paginatedRows.length} of {filteredRows.length} entries
        </p>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
            className="btn btn-secondary rounded-full px-4 py-2 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 text-slate-700">Page {currentPage} of {totalPages}</span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
            className="btn btn-secondary rounded-full px-4 py-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
