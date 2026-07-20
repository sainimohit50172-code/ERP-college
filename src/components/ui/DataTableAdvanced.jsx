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

function getColumnMinWidth(column) {
  const key = String(column.key || '').toLowerCase();
  const widthMap = {
    checkbox: '40px',
    sno: '50px',
    photo: '60px',
    name: '140px',
    rollnumber: '120px',
    rollno: '120px',
    universityrollnumber: '150px',
    universityrollno: '150px',
    fathername: '160px',
    mothername: '160px',
    dob: '120px',
    gender: '90px',
    mobile: '120px',
    phone: '120px',
    email: '200px',
    college: '180px',
    course: '140px',
    coursesection: '140px',
    semester: '90px',
    section: '90px',
    status: '110px',
    action: '140px',
    actions: '140px',
    options: '140px',
  };
  return widthMap[key] || 'auto';
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
  className = '',
  onEdit = () => {},
  onDelete = () => {},
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
    <div className={`w-full max-w-full rounded-[20px] border border-slate-200/70 bg-white/95 p-3 shadow-sm sm:p-4 ${className}`} style={{ marginLeft: 10, marginRight: 10 }}>
      {!hideHeader && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-slate-950">Data table</h3>
            <p className="text-xs text-slate-500">Search, sort, page and export your data.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={handlePrint} className="btn btn-secondary inline-flex items-center gap-2 hover-gradient-border">
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
        <div className="overflow-x-auto rounded-[20px] border border-slate-200/70 no-hover-border">
          <table ref={tableRef} className="w-full text-left text-[11px] text-slate-900" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              {columns.map((column) => {
                const width = getColumnMinWidth(column);
                const colWidth = width && String(width).endsWith('px') ? width : undefined;
                return <col key={column.key} style={{ minWidth: width !== 'auto' ? width : undefined, width: colWidth }} />;
              })}
            </colgroup>
            <thead className="bg-[#1e3a5f] text-white">
              <tr>
                {columns.map((column) => {
                  const key = String(column.key || '').toLowerCase();
                  const width = getColumnMinWidth(column);
                  const colWidth = width && String(width).endsWith('px') ? width : undefined;
                  const isAction = ['action', 'actions', 'options'].includes(key);
                  const textAlign = isAction ? 'center' : column.align === 'right' ? 'right' : 'left';
                  return (
                    <th
                      key={column.key}
                      className={`px-4 py-3 font-semibold uppercase tracking-[0.18em] text-white ${isAction ? 'action-header' : ''} ${column.key ? String(column.key).toLowerCase() + '-cell' : ''} ${textAlign === 'left' ? 'text-left' : textAlign === 'right' ? 'text-right' : 'text-center'}`}
                      style={{ minWidth: width !== 'auto' ? width : undefined, width: colWidth, textAlign }}
                    >
                      <button type="button" className="inline-flex items-center gap-2 hover-gradient-border" onClick={() => toggleSort(column.key)}>
                        <span>{column.label}</span>
                        {sortColumn === column.key ? (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : null}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, index) => (
                <tr key={`row-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    {columns.map((column) => {
                    const key = String(column.key || '').toLowerCase();
                    const width = getColumnMinWidth(column);
                    const isAction = ['action', 'actions', 'options'].includes(key);
                    const textAlign = isAction ? 'center' : column.align === 'right' ? 'right' : 'left';
                    const content = column.render ? column.render(row[column.key], row) : row[column.key] ?? '';
                    // Render default edit/delete buttons when this is an action column and no custom render provided
                    if (isAction && !column.render && (onEdit || onDelete)) {
                      return (
                        <td key={`${index}-${column.key}`} className={`break-words px-3 py-3 align-top text-slate-700 action-cell ${column.key ? String(column.key).toLowerCase() + '-cell' : ''} ${textAlign === 'left' ? 'text-left' : textAlign === 'right' ? 'text-right' : 'text-center'}`} style={{ minWidth: width !== 'auto' ? width : undefined, width: width && width.endsWith('px') ? width : undefined, whiteSpace: 'nowrap', textAlign }}>
                          <div className="min-w-0 flex items-center justify-center gap-2">
                            <button type="button" onClick={() => onEdit(row)} className="rounded-2xl bg-sky-500 px-3 py-1 text-xs font-semibold text-white">Edit</button>
                            <button type="button" onClick={() => onDelete(row)} className="rounded-2xl bg-rose-500 px-3 py-1 text-xs font-semibold text-white">Delete</button>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={`${index}-${column.key}`}
                        className={`break-words px-3 py-3 align-top text-slate-700 ${isAction ? 'action-cell' : ''} ${column.key ? String(column.key).toLowerCase() + '-cell' : ''} ${textAlign === 'left' ? 'text-left' : textAlign === 'right' ? 'text-right' : 'text-center'}`}
                        style={{ minWidth: width !== 'auto' ? width : undefined, width: width && width.endsWith('px') ? width : undefined, whiteSpace: isAction ? 'nowrap' : undefined, textAlign }}
                      >
                        <div className="min-w-0 flex items-center justify-center gap-2">
                          {typeof content === 'string' || typeof content === 'number' || typeof content === 'boolean' ? (
                            <span className="truncate block">{content}</span>
                          ) : (
                            content
                          )}
                        </div>
                      </td>
                    );
                  })}
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
