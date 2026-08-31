import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Edit3, Eye, LoaderCircle, Trash2 } from 'lucide-react';
import { useERP } from '../services/ERPContext.jsx';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import Modal from '../components/ui/Modal.jsx';
import { deleteAllocation, getAllocationsByCollege, updateAllocation } from '../services/allocateSubjectService.js';

export default function AllocateSubjectPage() {
  const { colleges = [] } = useERP();
  const collegeOptions = useMemo(() => {
    const source = Array.isArray(colleges) ? colleges : [];
    return source.map((college) => (typeof college === 'string' ? college : college.name || college.collegeName || college.label || String(college.id)));
  }, [colleges]);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [rows, setRows] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewRow, setViewRow] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);
  const [sortBy, setSortBy] = useState('subject');
  const [subjectType, setSubjectType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [formState, setFormState] = useState({
    subject: '',
    faculty: '',
    status: 'Allocated',
    section: '',
    semester: '',
    course: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    document.title = 'Allocate Subject - Academics Setup';
  }, []);

  useEffect(() => {
    const handleBrowserBack = () => {
      setSelectedCollege('');
      setRows([]);
      setShowTable(false);
      setSelectedIds([]);
      setCurrentPage(1);
    };

    window.addEventListener('popstate', handleBrowserBack);
    return () => window.removeEventListener('popstate', handleBrowserBack);
  }, []);

  const handleGo = async () => {
    if (!selectedCollege) {
      window.alert('Please select a college before continuing.');
      return;
    }

    window.history.pushState({ allocateSubjectCollege: selectedCollege }, '', window.location.href);
    setLoading(true);
    setShowTable(false);
    setSelectedIds([]);
    setCurrentPage(1);

    try {
      const data = await getAllocationsByCollege(selectedCollege);
      setRows(data);
      setShowTable(true);
    } catch (error) {
      window.alert(error.message || 'Failed to load allocations.');
      setRows([]);
      setShowTable(false);
    } finally {
      setLoading(false);
    }
  };

  const visibleRows = useMemo(() => {
    const filtered = [...rows].filter((item) => {
      if (subjectType !== 'all') {
        const normalized = String(item.subject || '').toLowerCase();
        const matchesType = normalized.includes(subjectType.toLowerCase());
        if (!matchesType) {
          return false;
        }
      }

      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const sortMap = {
        subject: String(a.subject || '').localeCompare(String(b.subject || '')),
        faculty: String(a.faculty || '').localeCompare(String(b.faculty || '')),
        semester: String(a.semester || '').localeCompare(String(b.semester || '')),
        section: String(a.section || '').localeCompare(String(b.section || '')),
      };

      return sortMap[sortBy] ?? 0;
    });

    return sorted;
  }, [rows, sortBy, subjectType]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(visibleRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return visibleRows.slice(startIndex, startIndex + pageSize);
  }, [currentPage, visibleRows]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = paginatedRows.map((row) => row.id);
      setSelectedIds((current) => Array.from(new Set([...current, ...allIds])));
      return;
    }

    setSelectedIds((current) => current.filter((id) => !paginatedRows.some((row) => row.id === id)));
  };

  const handleToggleRow = (id) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const allVisibleSelected = paginatedRows.length > 0 && paginatedRows.every((row) => selectedIds.includes(row.id));

  const handleEdit = (row) => {
    setEditRow(row);
    setFormState({
      subject: row.subject || '',
      faculty: row.faculty || '',
      status: row.status || 'Allocated',
      section: row.section || '',
      semester: row.semester || '',
      course: row.course || '',
    });
    setFormError('');
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();

    if (!formState.subject.trim() || !formState.faculty.trim() || !formState.section.trim() || !formState.semester.trim() || !formState.course.trim()) {
      setFormError('All fields are required.');
      return;
    }

    try {
      const updated = await updateAllocation(editRow.id, {
        subject: formState.subject.trim(),
        faculty: formState.faculty.trim(),
        status: formState.status,
        section: formState.section.trim(),
        semester: formState.semester.trim(),
        course: formState.course.trim(),
      });

      setRows((currentRows) => currentRows.map((currentRow) => (currentRow.id === updated.id ? updated : currentRow)));
      setEditRow(null);
      setFormError('');
    } catch (error) {
      setFormError(error.message || 'Unable to update allocation.');
    }
  };

  const handleDelete = (row) => {
    setDeleteRow(row);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteRow) return;

    try {
      await deleteAllocation(deleteRow.id);
      setRows((currentRows) => currentRows.filter((currentRow) => currentRow.id !== deleteRow.id));
      setDeleteRow(null);
    } catch (error) {
      window.alert(error.message || 'Unable to delete allocation.');
    }
  };

  const handleView = (row) => {
    setViewRow(row);
  };

  const renderSubjects = (row) => {
    const subjectList = [
      row.subject || 'Operating Systems',
      row.subjectCode ? `${row.subject || 'Database Management System'} Practical` : 'Database Management System Practical',
      'Computer Networks Practical',
      'Database Management System',
      'Fundamentals of AI and ML',
      'Computer Networks',
      'Object Oriented Programming using JAVA',
      'Object Oriented Programming using JAVA Practical',
      'Quantitative Aptitude and Logical Reasoning',
    ];

    return (
      <ol className="space-y-1 text-[12px] leading-[22px] text-slate-700">
        {subjectList.map((subject, index) => (
          <li key={`${row.id}-${index}`} className="flex items-start gap-2">
            <span className="mt-[1px] inline-flex h-4 min-w-[1.1rem] items-center justify-center rounded-full bg-slate-100 px-1 text-[10px] font-semibold text-slate-700">
              {index + 1}.
            </span>
            <span className="flex items-center gap-2">
              <input type="checkbox" checked={index < 3} readOnly className="mt-[2px] h-3.5 w-3.5 rounded border-slate-300 text-sky-600" />
              <span className="break-words">{subject}</span>
            </span>
          </li>
        ))}
      </ol>
    );
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      void Promise.resolve().then(() => setCurrentPage(totalPages));
    }
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen w-full bg-[#F5F7FB] px-[5px] py-4 text-slate-900 sm:px-[5px] lg:px-[5px]">
      <div className="w-full space-y-4">
        <div className="space-y-2">
          <Breadcrumb
            items={[
              { to: '/', label: 'Dashboard' },
              { label: 'Academics Setup' },
              { label: 'Allocate Subject' },
            ]}
          />
          <div className="space-y-0.5">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Allocate Subject</h1>
            <p className="text-xs text-slate-600">Allocate Subject</p>
          </div>
        </div>

        <section className="rounded-[12px] border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="w-full md:max-w-md">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">Select College</label>
              <select
                value={selectedCollege}
                onChange={(event) => setSelectedCollege(event.target.value)}
                className="h-10 w-full rounded-[8px] border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none"
              >
                <option value="">-- Select --</option>
                {collegeOptions.map((college) => (
                  <option key={college} value={college}>{college}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleGo}
              className="inline-flex h-10 items-center justify-center rounded-[8px] bg-[#1D3557] px-5 text-sm font-semibold text-white transition hover:bg-[#16324F]"
            >
              Go
            </button>
          </div>
        </section>

        {showTable && (
          <section className="rounded-[12px] border border-slate-200 bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,.08)] sm:p-4">
            <div className="mb-3 rounded-[12px] border border-slate-200 bg-[#F8FAFC] p-3 shadow-sm">
              <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">College</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedCollege}</p>
                </div>
                <div className="flex flex-col gap-2 lg:items-end">
                  <div className="grid w-full gap-2 sm:grid-cols-2">
                    <label className="space-y-1 text-sm text-slate-700">
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Sort By</span>
                      <select value={sortBy} onChange={(event) => { setSortBy(event.target.value); setCurrentPage(1); }} className="h-9 w-full rounded-[8px] border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none">
                        <option value="subject">Subject</option>
                        <option value="faculty">Faculty</option>
                        <option value="semester">Semester</option>
                        <option value="section">Section</option>
                      </select>
                    </label>
                    <label className="space-y-1 text-sm text-slate-700">
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Select Subject Type</span>
                      <select value={subjectType} onChange={(event) => { setSubjectType(event.target.value); setCurrentPage(1); }} className="h-9 w-full rounded-[8px] border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none">
                        <option value="all">All</option>
                        <option value="practical">Practical</option>
                        <option value="java">Java</option>
                        <option value="network">Network</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[240px] items-center justify-center rounded-[12px] border border-dashed border-slate-200 bg-slate-50">
                <div className="flex flex-col items-center gap-3 text-slate-600">
                  <LoaderCircle className="h-8 w-8 animate-spin text-slate-900" />
                  <p className="text-sm font-semibold text-slate-700">Loading subject allocations...</p>
                </div>
              </div>
            ) : visibleRows.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
                <h3 className="text-lg font-semibold text-slate-900">No Subject Allocation Found</h3>
                <p className="mt-2 text-sm text-slate-600">No records are available for the selected college.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.08)]">
                <div className="overflow-x-auto">
                  <table className="min-w-[1180px] w-full border-collapse table-fixed text-left text-[12px] text-slate-900">
                    <thead className="sticky top-0 z-10 bg-[#1D3557] text-white">
                      <tr className="h-[48px]">
                        <th className="w-[48px] px-2 py-1 text-center font-semibold">
                          <input type="checkbox" checked={allVisibleSelected} onChange={handleSelectAll} className="h-4 w-4 rounded border-slate-300 text-sky-600" />
                        </th>
                        <th className="w-[70px] px-2 py-1 font-semibold">S.No</th>
                        <th className="w-[130px] px-2 py-1 font-semibold">Roll Number</th>
                        <th className="w-[160px] px-2 py-1 font-semibold">Student Name</th>
                        <th className="w-[160px] px-2 py-1 font-semibold">Father Name</th>
                        <th className="w-[170px] px-2 py-1 font-semibold">University Roll No.</th>
                        <th className="w-[320px] px-2 py-1 font-semibold">Subjects</th>
                        <th className="w-[180px] px-2 py-1 text-center font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRows.map((row, index) => (
                        <tr key={row.id ?? `${row.subject}-${index}`} className="border-b border-slate-200 bg-white hover:bg-slate-50/50">
                          <td className="px-2 py-1 align-middle text-center">
                            <input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => handleToggleRow(row.id)} className="h-4 w-4 rounded border-slate-300 text-sky-600" />
                          </td>
                          <td className="px-2 py-1 align-middle font-semibold text-slate-700">{(currentPage - 1) * pageSize + index + 1}</td>
                          <td className="px-2 py-1 align-middle text-slate-700">{row.semester || '—'}</td>
                          <td className="px-2 py-1 align-middle text-slate-700">{row.faculty || '—'}</td>
                          <td className="px-2 py-1 align-middle text-slate-700">{row.course || '—'}</td>
                          <td className="px-2 py-1 align-middle text-slate-700">{row.subjectCode || '—'}</td>
                          <td className="px-2 py-1 align-middle">
                            <div className="min-h-[112px] py-0.5">
                              {renderSubjects(row)}
                            </div>
                          </td>
                          <td className="px-2 py-1 align-middle text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button type="button" onClick={() => handleView(row)} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button type="button" onClick={() => handleEdit(row)} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100">
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button type="button" onClick={() => handleDelete(row)} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100">
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <button type="button" className="inline-flex h-[36px] w-[125px] items-center justify-center rounded-[8px] bg-[#1D3557] px-2 text-[11px] font-semibold text-white transition hover:bg-[#16324F]">
                                Save Subjects
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-2 border-t border-slate-200 bg-white px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-600">Showing 1 to {paginatedRows.length} of {visibleRows.length} entries</p>
                  <div className="flex items-center gap-1 text-xs">
                    <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="inline-flex items-center gap-1 rounded-[8px] border border-slate-200 bg-white px-2 py-1 text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Prev
                    </button>
                    {[...Array(totalPages)].slice(0, 5).map((_, index) => {
                      const pageNumber = index + 1;
                      const isActive = currentPage === pageNumber;
                      return (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`h-8 min-w-[2rem] rounded-[8px] border px-2 text-xs font-semibold ${isActive ? 'border-[#1D3557] bg-[#1D3557] text-white' : 'border-slate-200 bg-white text-slate-700'}`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="inline-flex items-center gap-1 rounded-[8px] border border-slate-200 bg-white px-2 py-1 text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
                      Next
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      <Modal
        title="Allocation Details"
        isOpen={Boolean(viewRow)}
        onClose={() => setViewRow(null)}
      >
        {viewRow ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['College', viewRow.college],
              ['Course', viewRow.course],
              ['Semester', viewRow.semester],
              ['Section', viewRow.section],
              ['Subject', viewRow.subject],
              ['Subject Code', viewRow.subjectCode],
              ['Faculty', viewRow.faculty],
              ['Academic Year', viewRow.academicYear],
              ['Status', viewRow.status],
              ['Created Date', viewRow.createdDate],
              ['Updated Date', viewRow.updatedDate],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{value || '—'}</p>
              </div>
            ))}
          </div>
        ) : null}
      </Modal>

      <Modal
        title="Edit Allocation"
        isOpen={Boolean(editRow)}
        onClose={() => {
          setEditRow(null);
          setFormError('');
        }}
        footer={(
          <>
            <button type="button" onClick={() => {
              setEditRow(null);
              setFormError('');
            }} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
            <button type="submit" form="allocate-subject-edit-form" className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save</button>
          </>
        )}
      >
        {editRow ? (
          <form id="allocate-subject-edit-form" onSubmit={handleSaveEdit} className="space-y-4">
            {formError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Subject</span>
                <input value={formState.subject} onChange={(event) => setFormState((current) => ({ ...current, subject: event.target.value }))} className="h-11 w-full rounded-2xl border border-slate-200 px-3 outline-none" required />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Faculty</span>
                <input value={formState.faculty} onChange={(event) => setFormState((current) => ({ ...current, faculty: event.target.value }))} className="h-11 w-full rounded-2xl border border-slate-200 px-3 outline-none" required />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Status</span>
                <select value={formState.status} onChange={(event) => setFormState((current) => ({ ...current, status: event.target.value }))} className="h-11 w-full rounded-2xl border border-slate-200 px-3 outline-none">
                  <option value="Allocated">Allocated</option>
                  <option value="Pending">Pending</option>
                  <option value="Updated">Updated</option>
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Section</span>
                <input value={formState.section} onChange={(event) => setFormState((current) => ({ ...current, section: event.target.value }))} className="h-11 w-full rounded-2xl border border-slate-200 px-3 outline-none" required />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Semester</span>
                <input value={formState.semester} onChange={(event) => setFormState((current) => ({ ...current, semester: event.target.value }))} className="h-11 w-full rounded-2xl border border-slate-200 px-3 outline-none" required />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Course</span>
                <input value={formState.course} onChange={(event) => setFormState((current) => ({ ...current, course: event.target.value }))} className="h-11 w-full rounded-2xl border border-slate-200 px-3 outline-none" required />
              </label>
            </div>
          </form>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteRow)}
        title="Delete allocation"
        description={`Are you sure you want to delete the allocation for ${deleteRow?.subject || 'this subject'}?`}
        confirmLabel="Delete"
        onCancel={() => setDeleteRow(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
