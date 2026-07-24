import { useMemo, useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Download, Edit3, Eye, Printer, Trash2 } from 'lucide-react';
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
      return { label: column, key: String(index), sortable: false, align: 'left' };
    }

    return {
      label: column.label || String(column.key || `Column ${index + 1}`),
      key: String(column.key ?? index),
      sortable: column.sortable !== false,
      render: column.render,
      minWidth: column.minWidth,
      align: column.align || 'left',
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
    rollnumber: '90px',
    rollno: '90px',
    universityrollnumber: '120px',
    universityrollno: '120px',
    fathername: '120px',
    mothername: '120px',
    dob: '100px',
    gender: '80px',
    mobile: '110px',
    phone: '110px',
    email: '160px',
    college: '140px',
    course: '110px',
    coursesection: '140px',
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

export default function DataTable({ columns, rows, loading = false, placeholder = 'Search...', initialPageSize = 10, hideHeader = false, hideControls = false, headerClassName = '', tableMaxHeight, tableId, onEdit = () => {}, onDelete = () => {}, onRowClick = null, query: externalQuery, onQueryChange }) {
  const columnsDefinition = useMemo(() => normalizeColumns(columns), [columns]);
  const [query, setQuery] = useState(externalQuery ?? '');
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Debounce search input
  const debouncedQuery = useDebounce(query, 300);

  // Keep internal query in sync when controlled externally
  useEffect(() => {
    if (externalQuery !== undefined && externalQuery !== null && externalQuery !== query) {
      setQuery(externalQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalQuery]);

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

  const headerClasses = `sticky top-0 border-b-2 border-slate-300 ${headerClassName || 'bg-[#1E3A5F] text-white'} h-[56px] font-semibold`;

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
    <div className="relative rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm text-xs">
      {/* Only show loading on initial load, not on pagination */}
      {loading && rows?.length === 0 && (
        <LoadingOverlay loading={true} message="Loading table data..." />
      )}
      {!hideHeader && !hideControls && (
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

      {!hideControls && (
        <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto] xl:grid-cols-[1fr_auto_auto]">
          <div className="relative max-w-lg">
            <input
              type="search"
              value={query}
              onChange={(event) => {
                const v = event.target.value;
                setQuery(v);
                if (onQueryChange) onQueryChange(v);
                setCurrentPage(1);
              }}
              placeholder={placeholder}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap text-sm text-slate-500">Rows per page</label>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setCurrentPage(1);
              }}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 outline-none"
            >
              {[10, 20, 30, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {paginatedRows.length === 0 ? (
        <EmptyState title="No matching records" description="Try adjusting your search query or changing the page size." />
      ) : (
        <div
          className="rounded-[20px] border border-slate-200/70 overflow-hidden no-hover-border"
          style={tableMaxHeight ? { maxHeight: tableMaxHeight, overflowY: 'auto' } : undefined}
        >
          <div className="w-full overflow-x-auto">
            <table id={tableId} className="min-w-full border-separate text-[10px] text-slate-900" style={{ borderSpacing: '1px 0', tableLayout: 'fixed' }}>
              <colgroup>
              {columnsDefinition.map((column) => {
                const minW = getColumnMinWidth(column);
                const widthStyle = minW && minW.endsWith('px') ? minW : undefined;
                return <col key={column.key} style={{ minWidth: minW !== 'auto' ? minW : undefined, width: widthStyle }} />;
              })}
            </colgroup>
            <thead className={headerClasses}>
              <tr>
                {columnsDefinition.map((column) => {
                  const isAction = ['action', 'actions', 'options'].includes(column.key.toLowerCase());
                  const width = getColumnMinWidth(column);
                  const textAlign = column.align === 'right' ? 'right' : column.align === 'left' ? 'left' : 'center';
                  const widthStyle = width && width.endsWith('px') ? width : undefined;
                  return (
                    <th
                      key={column.key}
                      className={`whitespace-nowrap break-words px-4 py-3 font-semibold uppercase tracking-[0.02em] align-middle border-r border-transparent ${isAction ? 'action-header' : ''} ${column.key ? String(column.key).toLowerCase() + '-cell' : ''} ${textAlign === 'left' ? 'text-left' : textAlign === 'right' ? 'text-right' : 'text-center'}`}
                      style={{ minWidth: width !== 'auto' ? width : undefined, width: widthStyle, textAlign, height: '56px' }}
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
                  className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'} hover:bg-[#EEF4FF] border-b`} 
                  style={{ borderBottomColor: '#E5E7EB' }}
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
                    const textAlign = column.align === 'right' ? 'right' : column.align === 'left' ? 'left' : 'center';
                    const widthStyle = width && width.endsWith('px') ? width : undefined;
                    // If the column is action and a custom renderer wasn't provided,
                    // render default Edit/Delete buttons wired to props.
                    if (isAction && !column.render && (onEdit || onDelete)) {
                      return (
                        <td
                          key={`${rowIndex}-${column.key}`}
                          className={`px-3 py-3 align-middle border-r border-slate-200 text-slate-700 overflow-hidden action-cell ${column.key ? String(column.key).toLowerCase() + '-cell' : ''} ${textAlign === 'left' ? 'text-left' : textAlign === 'right' ? 'text-right' : 'text-center'}`}
                          style={{ whiteSpace: 'nowrap', minWidth: width !== 'auto' ? width : undefined, width: widthStyle, textAlign }}
                        >
                          <div className="flex min-w-0 items-center justify-center gap-1.5">
                            <button type="button" title="Edit" aria-label="Edit" onClick={() => onEdit(row)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent bg-transparent text-[#1E3A5F] transition hover:text-blue-600" style={{ height: 36, width: 36 }}>
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button type="button" title="Delete" aria-label="Delete" onClick={() => onDelete(row)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent bg-transparent text-[#1E3A5F] transition hover:text-blue-600" style={{ height: 36, width: 36 }}>
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={`${rowIndex}-${column.key}`}
                        className={`px-3 py-3 align-middle border-r border-slate-200 text-slate-700 text-[11px] overflow-hidden ${isAction ? 'action-cell' : ''} ${column.key ? String(column.key).toLowerCase() + '-cell' : ''} ${textAlign === 'left' ? 'text-left' : textAlign === 'right' ? 'text-right' : 'text-center'}`}
                        style={{
                          wordWrap: 'break-word',
                          whiteSpace: column.key === 'photo' ? 'nowrap' : 'normal',
                          minWidth: width !== 'auto' ? width : undefined,
                          width: widthStyle,
                          textAlign,
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
      </div>
      )}

      <div className="mt-4 flex items-center justify-end gap-3">
        <div className="hidden sm:flex items-center gap-3 text-sm text-slate-600">
          <span>Rows per page</span>
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setCurrentPage(1);
            }}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 outline-none"
          >
            {[10, 20, 30, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600">Total: {filteredRows.length}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((current) => Math.max(current - 1, 1))}
            className="rounded-md border border-slate-200 bg-white px-3 py-1 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-2 text-slate-700 text-sm">Page {currentPage} of {pageCount}</span>
          <button
            type="button"
            disabled={currentPage === pageCount}
            onClick={() => setCurrentPage((current) => Math.min(current + 1, pageCount))}
            className="rounded-md border border-slate-200 bg-white px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
