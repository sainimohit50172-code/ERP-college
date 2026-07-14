import { useMemo, useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Download, Printer } from 'lucide-react';
import EmptyState from './EmptyState.jsx';
import LoadingOverlay from './LoadingOverlay.jsx';

// Debounce hook for search input
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function normalizeColumns(columns) {
  return columns.map((column, index) => {
    if (typeof column === 'string') {
      return { label: column, key: String(index), sortable: false };
    }

    return {
      label: column.label || String(column.key || `Column ${index + 1}`),
      key: String(column.key ?? index),
      sortable: column.sortable !== false,
      render: column.render,
      minWidth: column.minWidth,
    };
  });
}

function getCellValue(row, column, columnIndex) {
  if (Array.isArray(row)) {
    return row[columnIndex];
  }
  if (row && typeof row === 'object') {
    return row[column.key];
  }
  return row;
}

function getCellText(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object') {
    if ('props' in value && value.props) {
      const child = value.props.children;
      if (typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean') return String(child);
      if (Array.isArray(child)) return child.map((item) => getCellText(item)).join(' ');
    }
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function getSortedRows(rows, columns, sortKey, direction) {
  if (!sortKey) return rows;
  const sortColumnIndex = columns.findIndex((column) => column.key === sortKey);
  if (sortColumnIndex === -1) return rows;

  return [...rows].sort((a, b) => {
    const aValue = getCellText(getCellValue(a, columns[sortColumnIndex], sortColumnIndex));
    const bValue = getCellText(getCellValue(b, columns[sortColumnIndex], sortColumnIndex));
    if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
      return direction === 'asc' ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
    }
    return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
  });
}

export default function DataTable({ columns, rows, loading = false, placeholder = 'Search...', initialPageSize = 10, hideHeader = false }) {
  const columnsDefinition = useMemo(() => normalizeColumns(columns), [columns]);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Debounce search input
  const debouncedQuery = useDebounce(query, 300);

  const filteredRows = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLowerCase();
    if (!normalizedQuery) return rows;

    return rows.filter((row, _rowIndex) =>
      columnsDefinition.some((column, columnIndex) => {
        const value = getCellText(getCellValue(row, column, columnIndex));
        return value.toLowerCase().includes(normalizedQuery);
      }),
    );
  }, [columnsDefinition, debouncedQuery, rows]);

  const sortedRows = useMemo(() => getSortedRows(filteredRows, columnsDefinition, sortKey, sortDirection), [filteredRows, columnsDefinition, sortKey, sortDirection]);
  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedRows.slice(startIndex, startIndex + pageSize);
  }, [currentPage, pageSize, sortedRows]);

  const csvContent = useMemo(() => {
    const header = columnsDefinition.map((column) => column.label);
    const rowsData = filteredRows.map((row) =>
      columnsDefinition.map((column, columnIndex) => getCellText(getCellValue(row, column, columnIndex))),
    );
    return [header, ...rowsData].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  }, [columnsDefinition, filteredRows]);

  const downloadCsv = () => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.setAttribute('download', 'table-export.csv');
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <div className="relative rounded-[20px] border border-slate-200/70 bg-white/95 p-4 shadow-sm text-xs">
      {/* Only show loading on initial load, not on pagination */}
      {loading && rows?.length === 0 && (
        <LoadingOverlay loading={true} message="Loading table data..." />
      )}
      {!hideHeader && (
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Data table</h2>
            <p className="mt-1 text-xs text-slate-500">Search, sort, paginate, export, and print your records.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={downloadCsv} className="btn btn-secondary inline-flex items-center gap-2">
              <Download className="h-4 w-4" /> CSV
            </button>
            <button type="button" onClick={() => window.print()} className="btn btn-secondary inline-flex items-center gap-2">
              <Printer className="h-4 w-4" /> Print
            </button>
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
            className="w-full rounded-3xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="whitespace-nowrap text-xs text-slate-500">Rows per page</label>
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setCurrentPage(1);
            }}
            className="rounded-3xl border border-slate-200/80 bg-white px-2 py-1 text-xs text-slate-900 outline-none"
          >
            {[10, 20, 30, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {paginatedRows.length === 0 ? (
        <EmptyState title="No matching records" description="Try adjusting your search query or changing the page size." />
      ) : (
        <div className="rounded-[20px] border border-slate-200/70 overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-xs text-slate-900">
            <colgroup>
              {columnsDefinition.map((column) => {
                let width = 'auto';
                if (column.key === 'checkbox') width = '5%';
                else if (column.key === 'sno') width = '4%';
                else if (column.key === 'photo') width = '5%';
                else if (column.key === 'status' || column.key === 'gender' || column.key === 'actions') width = '8%';
                else if (column.key === 'dob' || column.key === 'semester' || column.key === 'section') width = '7%';
                else if (column.key === 'admissionNo' || column.key === 'rollNo' || column.key === 'phone') width = '8%';
                else width = '12%';
                return <col key={column.key} style={{ width }} />;
              })}
            </colgroup>
            <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b-2 border-slate-300">
              <tr>
                {columnsDefinition.map((column) => (
                  <th
                    key={column.key}
                    className="whitespace-nowrap break-words px-4 py-3 font-semibold uppercase tracking-wider text-slate-700 text-center align-middle border-r border-slate-200"
                  >
                    <button
                      type="button"
                      onClick={() => column.sortable && toggleSort(column.key)}
                      className="inline-flex items-center justify-center gap-1 w-full"
                      title={column.label}
                    >
                      <span className="truncate">{column.label}</span>
                      {column.sortable && sortKey === column.key ? (
                        sortDirection === 'asc' ? <ChevronUp className="h-3 w-3 flex-shrink-0" /> : <ChevronDown className="h-3 w-3 flex-shrink-0" />
                      ) : null}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`} className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-100 transition-colors border-b border-slate-200`}>
                  {columnsDefinition.map((column, columnIndex) => {
                    const cellValue = getCellValue(row, column, columnIndex);
                    const rendered = column.render ? column.render(cellValue, row) : cellValue;
                    
                    // Handle image lazy loading
                    let finalContent = rendered;
                    if (column.key === 'photo' && typeof rendered === 'object' && rendered?.type === 'img') {
                      finalContent = {
                        ...rendered,
                        props: {
                          ...rendered.props,
                          loading: 'lazy',
                          alt: rendered.props.alt || 'Photo',
                        }
                      };
                    }
                    
                    return (
                      <td 
                        key={`${rowIndex}-${column.key}`} 
                        className="px-4 py-3 align-middle border-r border-slate-200 text-slate-700 overflow-hidden text-center"
                        style={{
                          wordWrap: 'break-word',
                          whiteSpace: column.key === 'photo' ? 'nowrap' : 'normal',
                        }}
                      >
                        <div className={`${column.key === 'photo' ? 'flex items-center justify-center' : 'flex items-center justify-center'}`}>
                          {finalContent}
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
        <p className="text-xs text-slate-500">
          Showing {paginatedRows.length} of {filteredRows.length} entries
          {loading && rows?.length > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 text-blue-600">
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
              Updating...
            </span>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((current) => Math.max(current - 1, 1))}
            className="btn btn-secondary rounded-full px-3 py-1 text-xs disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-2 text-slate-700 text-xs">Page {currentPage} of {pageCount}</span>
          <button
            type="button"
            disabled={currentPage === pageCount}
            onClick={() => setCurrentPage((current) => Math.min(current + 1, pageCount))}
            className="btn btn-secondary rounded-full px-3 py-1 text-xs disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
