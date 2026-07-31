import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';

const initialEmployees = [
  { id: 'emp-1', name: 'Tushant Kumar', employeeId: 'HU175', dateCount: 9 },
  { id: 'emp-2', name: 'Ravindra Kr Arya', employeeId: 'HU111', dateCount: 17 },
  { id: 'emp-3', name: 'Mukul Saini', employeeId: 'HU278', dateCount: 5 },
  { id: 'emp-4', name: 'Bhuvnesh Kumar', employeeId: 'HU134', dateCount: 51 },
  { id: 'emp-5', name: 'Narayan Jee', employeeId: 'HU143', dateCount: 49 },
  { id: 'emp-6', name: 'Vimal Panday', employeeId: 'HU149', dateCount: 51 },
  { id: 'emp-7', name: 'Sulochna', employeeId: 'HU113', dateCount: 34 },
  { id: 'emp-8', name: 'Neha Sharma', employeeId: 'HU182', dateCount: 12 },
  { id: 'emp-9', name: 'Rajeev Kumar', employeeId: 'HU164', dateCount: 28 },
  { id: 'emp-10', name: 'Deepak Singh', employeeId: 'HU190', dateCount: 22 },
];

const teacherOptions = [
  'Ravindra Kr Arya',
  'Narayan Jee',
  'Bhuvnesh Kumar',
  'Neha Sharma',
  'Vimal Panday',
  'Rajeev Kumar',
  'Deepak Singh',
];

const pageSizeOptions = [5, 10, 15];

export default function EmployeeCalendarListPage() {
  const [rows, setRows] = useState(initialEmployees);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replacementTeacher, setReplacementTeacher] = useState(teacherOptions[0]);
  const [effectiveFrom, setEffectiveFrom] = useState('2026-07-01');
  const [effectiveTo, setEffectiveTo] = useState('2026-07-31');
  const [reason, setReason] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    if (!actionMessage) return undefined;
    const timer = window.setTimeout(() => setActionMessage(''), 2800);
    return () => window.clearTimeout(timer);
  }, [actionMessage]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return rows;
    return rows.filter((row) =>
      [row.name, row.employeeId].some((value) => value.toLowerCase().includes(normalizedSearch))
    );
  }, [rows, search]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const displayedRows = filteredRows.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  const selectedRows = rows.filter((row) => selectedIds.has(row.id));
  const isAllSelected = displayedRows.length > 0 && displayedRows.every((row) => selectedIds.has(row.id));
  const hasSelection = selectedIds.size > 0;

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleSelectAll = () => {
    const nextSelectedIds = new Set(selectedIds);
    if (isAllSelected) {
      displayedRows.forEach((row) => nextSelectedIds.delete(row.id));
    } else {
      displayedRows.forEach((row) => nextSelectedIds.add(row.id));
    }
    setSelectedIds(nextSelectedIds);
  };

  const handleSelectRow = (rowId) => {
    const nextSelectedIds = new Set(selectedIds);
    if (nextSelectedIds.has(rowId)) nextSelectedIds.delete(rowId);
    else nextSelectedIds.add(rowId);
    setSelectedIds(nextSelectedIds);
  };

  const handleDeleteRow = (rowId) => {
    const row = rows.find((item) => item.id === rowId);
    if (!row) return;
    if (!window.confirm(`Delete ${row.name} from the employee calendar list?`)) return;
    setRows((current) => current.filter((item) => item.id !== rowId));
    setSelectedIds((current) => {
      const next = new Set(current);
      next.delete(rowId);
      return next;
    });
  };

  const handleOpenReplaceModal = () => setIsModalOpen(true);
  const handleCloseReplaceModal = () => setIsModalOpen(false);

  const clearSelection = () => setSelectedIds(new Set());

  const showActionMessage = (message) => {
    setActionMessage(message);
  };

  const handleReplaceTeacher = () => {
    if (!hasSelection) return;
    setRows((current) =>
      current.map((row) =>
        selectedIds.has(row.id)
          ? {
              ...row,
              replacementTeacher,
              replacementFrom: effectiveFrom,
              replacementTo: effectiveTo,
              replacementReason: reason,
              status: row.status || 'Active',
            }
          : row
      )
    );
    setIsModalOpen(false);
    setReason('');
    showActionMessage('Replacement teacher updated for selected employees.');
  };

  const handleCancelLectures = () => {
    if (!hasSelection) return;
    setRows((current) =>
      current.map((row) =>
        selectedIds.has(row.id)
          ? { ...row, status: 'Cancelled' }
          : row
      )
    );
    clearSelection();
    showActionMessage('Selected lectures were cancelled.');
  };

  const handleDeleteEmployeeLecturesByCollege = () => {
    if (!hasSelection) return;
    if (!window.confirm(`Delete lectures by college for ${selectedRows.length} selected employee(s)?`)) return;
    setRows((current) => current.filter((row) => !selectedIds.has(row.id)));
    setSelectedIds(new Set());
    showActionMessage('Selected employee lectures were deleted by college.');
  };

  const handleDeleteEmployeeLectures = () => {
    if (!hasSelection) return;
    if (!window.confirm(`Delete lectures for ${selectedRows.length} selected employee(s)?`)) return;
    setRows((current) => current.filter((row) => !selectedIds.has(row.id)));
    setSelectedIds(new Set());
    showActionMessage('Selected employee lectures were deleted.');
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setPage(1);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_45%,#f0fdf4_100%)] p-0">
      <div className="m-2.5 rounded-[22px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_22px_70px_-24px_rgba(2,8,23,0.35)] sm:p-6">
        <Breadcrumb
          items={[
            { label: 'Dashboard', to: '/' },
            { label: 'Academics Setup', to: '/academics' },
            { label: 'Employee Calendar List' },
          ]}
        />

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Employee Calendar List</h1>
            <p className="mt-2 text-sm text-slate-500">Employee Calendar</p>
          </div>
          <Button
            type="button"
            onClick={handleOpenReplaceModal}
            disabled={!hasSelection}
            variant="primary"
            className="inline-flex items-center justify-center gap-2 px-4 text-sm font-semibold"
          >
            Replace Teacher
          </Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="relative max-w-md">
            <input
              type="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search Employee..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
            />
          </div>
          {actionMessage && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
              {actionMessage}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span>Items per page:</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-950 text-slate-100">
                <tr>
                  <th className="sticky top-0 border-b border-slate-700 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-slate-300 bg-slate-900 text-white"
                      aria-label="Select all employees"
                    />
                  </th>
                  <th className="sticky top-0 border-b border-slate-700 px-4 py-3 font-semibold uppercase tracking-[0.14em]">S.No</th>
                  <th className="sticky top-0 border-b border-slate-700 px-4 py-3 font-semibold uppercase tracking-[0.14em]">Employee Name</th>
                  <th className="sticky top-0 border-b border-slate-700 px-4 py-3 font-semibold uppercase tracking-[0.14em]">Employee Id</th>
                  <th className="sticky top-0 border-b border-slate-700 px-4 py-3 font-semibold uppercase tracking-[0.14em]">Date Count</th>
                  <th className="sticky top-0 border-b border-slate-700 px-4 py-3 font-semibold uppercase tracking-[0.14em]">Status</th>
                  <th className="sticky top-0 border-b border-slate-700 px-4 py-3 font-semibold uppercase tracking-[0.14em]">Replacement Teacher</th>
                  <th className="sticky top-0 border-b border-slate-700 px-4 py-3 font-semibold uppercase tracking-[0.14em]">Effective From</th>
                  <th className="sticky top-0 border-b border-slate-700 px-4 py-3 font-semibold uppercase tracking-[0.14em]">Effective To</th>
                  <th className="sticky top-0 border-b border-slate-700 px-4 py-3 font-semibold uppercase tracking-[0.14em]">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedRows.map((row, index) => (
                  <tr key={row.id} className="border-b border-slate-200 transition hover:bg-slate-50">
                    <td className="px-4 py-4 align-top">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900"
                        aria-label={`Select ${row.name}`}
                      />
                    </td>
                    <td className="px-4 py-4 align-top font-semibold text-slate-900">{(page - 1) * pageSize + index + 1}</td>
                    <td className="px-4 py-4 align-top text-slate-900">{row.name}</td>
                    <td className="px-4 py-4 align-top text-slate-900">{row.employeeId}</td>
                    <td className="px-4 py-4 align-top text-slate-900">{row.dateCount}</td>
                    <td className="px-4 py-4 align-top text-slate-900">{row.status || 'Active'}</td>
                    <td className="px-4 py-4 align-top text-slate-900">{row.replacementTeacher || '-'}</td>
                    <td className="px-4 py-4 align-top text-slate-900">{row.replacementFrom || '-'}</td>
                    <td className="px-4 py-4 align-top text-slate-900">{row.replacementTo || '-'}</td>
                    <td className="px-4 py-4 align-top">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(row.id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                        aria-label={`Delete ${row.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {displayedRows.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-sm text-slate-500">
                      No employees match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Showing {displayedRows.length} of {filteredRows.length} employees
            </p>
            <TablePagination page={page} pageCount={pageCount} onPageChange={handlePageChange} />
          </div>

          {hasSelection && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.22 }}
              className="mt-4 rounded-[20px] border border-slate-200 bg-white px-4 py-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <Button
              type="button"
              variant="danger"
              onClick={handleCancelLectures}
              className="min-w-[180px] rounded-2xl px-4 py-2 text-sm font-semibold"
            >
              Cancel Lectures
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteEmployeeLecturesByCollege}
              className="min-w-[220px] rounded-2xl px-4 py-2 text-sm font-semibold"
            >
              Delete Employee Lectures By College
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteEmployeeLectures}
              className="min-w-[180px] rounded-2xl px-4 py-2 text-sm font-semibold"
            >
              Delete Employee Lectures
            </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <Modal
        title="Replace Teacher"
        isOpen={isModalOpen}
        onClose={handleCloseReplaceModal}
        footer={
          <>
            <button
              type="button"
              onClick={handleCloseReplaceModal}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReplaceTeacher}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              disabled={!hasSelection}
            >
              Replace
            </button>
          </>
        }
      >
        <div className="grid gap-5 sm:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">Selected Employee(s)</p>
              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                {selectedRows.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedRows.map((row) => (
                      <li key={row.id} className="flex items-center gap-2 text-slate-900">
                        <span className="inline-flex h-8 min-w-[24px] items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">{row.employeeId}</span>
                        {row.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">No employee selected.</p>
                )}
              </div>
            </div>

            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              Replacement Teacher
              <select
                value={replacementTeacher}
                onChange={(event) => setReplacementTeacher(event.target.value)}
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
              >
                {teacherOptions.map((teacher) => (
                  <option key={teacher} value={teacher}>{teacher}</option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Effective From
                <input
                  type="date"
                  value={effectiveFrom}
                  onChange={(event) => setEffectiveFrom(event.target.value)}
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Effective To
                <input
                  type="date"
                  value={effectiveTo}
                  onChange={(event) => setEffectiveTo(event.target.value)}
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              Reason
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={4}
                className="min-h-[120px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                placeholder="Enter replacement reason"
              />
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
