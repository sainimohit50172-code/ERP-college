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
      align: column.align || 'center',
    };
  });
}

function getColumnMinWidth(column) {
  const key = String(column.key || '').toLowerCase();
  const widthMap = {
    checkbox: '40px',
    sno: '40px',
    photo: '50px',
    name: '120px',
    'rollnumber': '90px',
    rollno: '90px',
    'universityrollnumber': '120px',
    'universityrollno': '120px',
    fathername: '120px',
    mothername: '120px',
    dob: '100px',
    gender: '80px',
    mobile: '110px',
    phone: '110px',
    email: '160px',
    college: '140px',
    course: '110px',
    semester: '80px',
    section: '80px',
    status: '90px',
    action: '120px',
    actions: '120px',
    options: '120px',
  };
  return column.minWidth || widthMap[key] || 'auto';
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

export default function DataTable({ columns, rows, loading = false, placeholder = 'Search...', initialPageSize = 10, hideHeader = false, headerClassName = '', tableMaxHeight, tableId, onEdit = () => {}, onDelete = () => {}, onRowClick = null }) {
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

  const headerClasses = `sticky top-0 border-b-2 border-slate-300 ${headerClassName || 'bg-slate-100 text-slate-700'}`;

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
        <div
          className="rounded-[20px] border border-slate-200/70 overflow-hidden"
          style={tableMaxHeight ? { maxHeight: tableMaxHeight, overflowY: 'auto' } : undefined}
        >
          <table id={tableId} className="w-full table-fixed border-separate text-[10px] text-slate-900" style={{ borderSpacing: '1px 0' }}>
            <colgroup>
              {columnsDefinition.map((column) => {
                const minW = getColumnMinWidth(column);
                // Use explicit pixel width when we have a px-based min width (ensures action/buttons visible)
                const widthStyle = minW && minW.endsWith('px') ? minW : undefined;
                return <col key={column.key} style={{ minWidth: minW !== 'auto' ? minW : undefined, width: widthStyle }} />;
              })}
            </colgroup>
            <thead className={headerClasses}>
              <tr>
                {columnsDefinition.map((column) => {
                  const isAction = ['action', 'actions', 'options'].includes(column.key.toLowerCase());
                  const width = getColumnMinWidth(column);
                  return (
                    <th
                      key={column.key}
                      className={`whitespace-nowrap break-words px-[4px] py-[5px] font-semibold uppercase tracking-[0.02em] text-center align-middle border-r border-slate-200 ${isAction ? 'action-header' : ''} ${column.key ? String(column.key).toLowerCase() + '-cell' : ''}`}
                      style={{ minWidth: width !== 'auto' ? width : undefined }}
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
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, rowIndex) => (
                <tr
                  key={`row-${rowIndex}`}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-100 transition-colors border-b border-slate-200 ${onRowClick ? 'cursor-pointer' : ''}`}
                >
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
                    
                    const isAction = ['action', 'actions', 'options'].includes(column.key.toLowerCase());
                    const width = getColumnMinWidth(column);
                    // If the column is action and a custom renderer wasn't provided,
                    // render default Edit/Delete buttons wired to props.
                    if (isAction && !column.render && (onEdit || onDelete)) {
                      return (
                        <td
                          key={`${rowIndex}-${column.key}`}
                          className={`px-2 py-2 align-middle border-r border-slate-200 text-slate-700 overflow-hidden text-left action-cell ${column.key ? String(column.key).toLowerCase() + '-cell' : ''}`}
                          style={{ whiteSpace: 'nowrap', minWidth: width !== 'auto' ? width : undefined }}
                        >
                          <div className="min-w-0 flex items-center justify-center gap-2">
                            <button type="button" onClick={() => onEdit(row)} className="rounded-2xl bg-sky-500 px-3 py-1 text-xs font-semibold text-white">Edit</button>
                            <button type="button" onClick={() => onDelete(row)} className="rounded-2xl bg-rose-500 px-3 py-1 text-xs font-semibold text-white">Delete</button>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={`${rowIndex}-${column.key}`}
                        className={`px-2 py-2 align-middle border-r border-slate-200 text-slate-700 text-[11px] overflow-hidden text-left ${isAction ? 'action-cell' : ''} ${column.key ? String(column.key).toLowerCase() + '-cell' : ''}`}
                        style={{
                          wordWrap: 'break-word',
                          whiteSpace: column.key === 'photo' ? 'nowrap' : 'normal',
                          minWidth: width !== 'auto' ? width : undefined,
                        }}
                      >
                        <div className="min-w-0 flex items-center justify-center gap-1">
                          {typeof finalContent === 'string' || typeof finalContent === 'number' || typeof finalContent === 'boolean' ? (
                            <span className="truncate">{finalContent}</span>
                          ) : (
                            finalContent
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
