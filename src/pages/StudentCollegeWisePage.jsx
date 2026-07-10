import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useCreateResource, useResourceList } from '../hooks/useResourceHooks';
import { ChevronDown, Download, Filter, Printer, UserPlus, X } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge.jsx';

const NAVY = 'text-white bg-[#1e3a5f] border-[#1e3a5f]';
const OUTLINE = 'border border-white text-white bg-transparent hover:bg-white/10';

const defaultFormValues = {
  firstName: '',
  lastName: '',
  admissionNo: '',
  rollNo: '',
  email: '',
  phone: '',
  dob: '',
  gender: 'M',
  status: 'Active',
  college: '',
  courseSection: '',
  semester: '',
  fatherName: '',
  motherName: '',
  guardianName: '',
  guardianMobile: '',
  guardianEmail: '',
  address: '',
  remarks: '',
};

function formatCell(value) {
  return value || '—';
}

function makeCsvRow(values) {
  return values.map((value) => `"${String(value || '').replace(/"/g, '""')}"`).join(',');
}

export default function StudentCollegeWisePage() {
  const [showNewStudent, setShowNewStudent] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const pageSize = 20;

  const queryParams = useMemo(() => {
    const params = { page, pageSize };
    if (search.trim()) params.search = search.trim();
    if (statusFilter !== 'All') {
      params.filter_field = 'status';
      params.filter_value = statusFilter;
      params.filter_operator = 'eq';
    }
    return params;
  }, [page, pageSize, search, statusFilter]);

  const {
    data: studentsData,
    isLoading: isStudentsLoading,
    isError: isStudentsError,
    error: studentsError,
  } = useResourceList('students', queryParams);
  const students = studentsData?.items || [];
  const pageCount = Math.max(1, studentsData?.pages ?? 1);
  const createStudent = useCreateResource('students');

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({ defaultValues: defaultFormValues });

  useEffect(() => {
    reset(defaultFormValues);
  }, [reset]);

  const totalCount = studentsData?.total ?? 0;
  const displayedStudents = students;

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [pageCount, page]);

  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => displayedStudents.some((student) => student.id === id)));
  }, [displayedStudents]);

  const toggleSelect = (id) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const toggleSelectAll = () => {
    const pageIds = displayedStudents.map((student) => student.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : pageIds);
  };

  const handleExport = () => {
    const header = ['S.No', 'Admission No', 'Name', 'Email', 'Phone', 'DOB', 'Gender', 'Status'];
    const rows = students.map((student, index) => [
      index + 1,
      student.admissionNo,
      student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim(),
      student.email,
      student.phone,
      student.dob || student.date_of_birth,
      student.gender,
      student.status,
    ]);
    const csv = [header, ...rows].map(makeCsvRow).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'student-list-college-wise.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateStudent = async (values) => {
    try {
      await createStudent.mutateAsync({
        name: `${values.firstName} ${values.lastName}`.trim(),
        email: values.email,
        phone: values.phone,
        admissionNo: values.admissionNo,
        rollNo: values.rollNo,
        admissionDate: values.dob,
        gender: values.gender,
        status: values.status,
      });
      toast.success('Student saved successfully');
      setShowNewStudent(false);
      reset(defaultFormValues);
      setPage(1);
    } catch (err) {
      toast.error(err?.message || 'Unable to save student');
    }
  };

  const tableRows = displayedStudents.map((student, index) => ({
    id: student.id,
    serial: (page - 1) * pageSize + index + 1,
    admissionNo: student.admissionNo,
    photo: student.photo || student.avatar || null,
    name: student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim(),
    email: student.email,
    phone: student.phone,
    dob: student.dob || student.date_of_birth,
    gender: student.gender,
    status: student.status || 'Active',
  }));

  return (
    <div className="space-y-6 px-4 pb-16 pt-6 md:px-8">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Dashboard &gt; Student List College Wise</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Student List College Wise</h1>
            <p className="mt-1 text-sm text-slate-500">List of Students College Wise</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium ${OUTLINE}`} onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print All ID Cards
            </button>
            <button type="button" className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium ${OUTLINE}`}>
              <Filter className="h-4 w-4" /> Filter
            </button>
            <button type="button" className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium ${NAVY}`} onClick={() => setShowNewStudent(true)}>
              <UserPlus className="h-4 w-4" /> New Student
            </button>
            <button type="button" className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium ${NAVY}`} onClick={handleExport}>
              <Download className="h-4 w-4" /> Export To Excel
            </button>
            <button type="button" className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium ${NAVY}`} onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white/95 p-4 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Search</label>
              <input
                type="search"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
                placeholder="Search students"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Status</label>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10">
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Alumni">Alumni</option>
                <option value="Withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-[24px] border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed border-separate border-spacing-0 text-left text-[12px] leading-5">
              <thead className="bg-[#1e3a5f] text-white">
                <tr>
                  <th className="w-[40px] px-3 py-3 text-left"><input type="checkbox" checked={displayedStudents.length > 0 && displayedStudents.every((student) => selectedIds.includes(student.id))} onChange={toggleSelectAll} className="h-4 w-4 rounded border-white bg-transparent" /></th>
                  <th className="w-[44px] px-3 py-3 font-semibold">S.No</th>
                  <th className="w-[180px] px-3 py-3 font-semibold">Admission No</th>
                  <th className="w-[200px] px-3 py-3 font-semibold">Name</th>
                  <th className="w-[220px] px-3 py-3 font-semibold">Email</th>
                  <th className="w-[130px] px-3 py-3 font-semibold">Phone</th>
                  <th className="w-[110px] px-3 py-3 font-semibold">DOB</th>
                  <th className="w-[90px] px-3 py-3 font-semibold">Gender</th>
                  <th className="w-[100px] px-3 py-3 font-semibold">Status</th>
                  <th className="w-[120px] px-3 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {isStudentsLoading ? (
                  <tr>
                    <td colSpan="10" className="px-3 py-12 text-center text-sm text-slate-500">Loading students…</td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-3 py-12 text-center text-sm text-slate-500">No students available.</td>
                  </tr>
                ) : displayedStudents.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-3 py-12 text-center text-sm text-slate-500">No matching students. Adjust filters or search.</td>
                  </tr>
                ) : (
                  tableRows.map((row, rowIndex) => (
                    <tr key={row.id} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-3 py-3"><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleSelect(row.id)} className="h-4 w-4 rounded border-slate-300 text-[#1e3a5f]" /></td>
                      <td className="px-3 py-3 font-medium text-slate-700">{row.serial}</td>
                      <td className="px-3 py-3 text-slate-700">{formatCell(row.admissionNo)}</td>
                      <td className="px-3 py-3 text-slate-700">{formatCell(row.name)}</td>
                      <td className="px-3 py-3 text-slate-700 break-words">{formatCell(row.email)}</td>
                      <td className="px-3 py-3 text-slate-700">{formatCell(row.phone)}</td>
                      <td className="px-3 py-3 text-slate-700">{formatCell(row.dob)}</td>
                      <td className="px-3 py-3 text-slate-700">{formatCell(row.gender)}</td>
                      <td className="px-3 py-3"><StatusBadge status={row.status} /></td>
                      <td className="px-3 py-3">
                        <div className="inline-flex rounded-2xl border border-slate-300 bg-white px-3 py-2 text-[11px] text-slate-700">
                          Actions <ChevronDown className="ml-2 h-3.5 w-3.5" />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">Showing {displayedStudents.length} of {totalCount} students</p>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(value - 1, 1))} className="rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 disabled:opacity-50">Prev</button>
            <span className="text-sm text-slate-700">Page {page} of {pageCount}</span>
            <button type="button" disabled={page === pageCount} onClick={() => setPage((value) => Math.min(value + 1, pageCount))} className="rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {showNewStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="mx-auto min-h-[90vh] w-full max-w-[95vw] overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">New Student Registration</h2>
                <p className="mt-1 text-sm text-slate-500">Add a new student record and save directly to the database.</p>
              </div>
              <button type="button" className="rounded-full border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-100" onClick={() => setShowNewStudent(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(handleCreateStudent)} className="flex min-h-[80vh] flex-col">
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Student Photo</h3>
                    <div className="mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-slate-200 text-slate-500">Upload</div>
                    <input type="file" className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" />
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Personal Details</h3>
                    <div className="grid gap-3">
                      <div className="grid gap-2 text-sm">
                        <label className="text-slate-700">First name</label>
                        <input type="text" {...register('firstName')} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900" />
                      </div>
                      <div className="grid gap-2 text-sm">
                        <label className="text-slate-700">Last name</label>
                        <input type="text" {...register('lastName')} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900" />
                      </div>
                      <div className="grid gap-2 text-sm">
                        <label className="text-slate-700">Admission No</label>
                        <input type="text" {...register('admissionNo')} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900" />
                      </div>
                      <div className="grid gap-2 text-sm">
                        <label className="text-slate-700">Roll No</label>
                        <input type="text" {...register('rollNo')} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900" />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Academic Details</h3>
                    <div className="grid gap-3">
                      <div className="grid gap-2 text-sm">
                        <label className="text-slate-700">College</label>
                        <input type="text" {...register('college')} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900" />
                      </div>
                      <div className="grid gap-2 text-sm">
                        <label className="text-slate-700">Course / Section</label>
                        <input type="text" {...register('courseSection')} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900" />
                      </div>
                      <div className="grid gap-2 text-sm">
                        <label className="text-slate-700">Semester</label>
                        <input type="text" {...register('semester')} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900" />
                      </div>
                      <div className="grid gap-2 text-sm">
                        <label className="text-slate-700">Status</label>
                        <select {...register('status')} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                          <option value="Active">Active</option>
                          <option value="Alumni">Alumni</option>
                          <option value="Withdrawn">Withdrawn</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-3">
                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Parents & Guardian</h3>
                    <div className="grid gap-3">
                      <div className="grid gap-2 text-sm">
                        <label className="text-slate-700">Father Name</label>
                        <input type="text" {...register('fatherName')} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900" />
                      </div>
                      <div className="grid gap-2 text-sm">
                        <label className="text-slate-700">Mother Name</label>
                        <input type="text" {...register('motherName')} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900" />
                      </div>
                      <div className="grid gap-2 text-sm">
                        <label className="text-slate-700">Guardian Name</label>
                        <input type="text" {...register('guardianName')} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900" />
                      </div>
                      <div className="grid gap-2 text-sm">
                        <label className="text-slate-700">Guardian Mobile</label>
                        <input type="text" {...register('guardianMobile')} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900" />
                      </div>
                      <div className="grid gap-2 text-sm">
                        <label className="text-slate-700">Guardian Email</label>
                        <input type="email" {...register('guardianEmail')} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900" />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-4 xl:col-span-2">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Contact, Address & Documents</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="grid gap-2 text-sm">
                        <label className="text-slate-700">Email</label>
                        <input type="email" {...register('email')} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900" />
                      </div>
                      <div className="grid gap-2 text-sm">
                        <label className="text-slate-700">Mobile No</label>
                        <input type="text" {...register('phone')} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900" />
                      </div>
                      <div className="grid gap-2 text-sm">
                        <label className="text-slate-700">DOB</label>
                        <input type="date" {...register('dob')} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900" />
                      </div>
                      <div className="grid gap-2 text-sm">
                        <label className="text-slate-700">Gender</label>
                        <select {...register('gender')} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3">
                      <div className="grid gap-2 text-sm">
                        <label className="text-slate-700">Address</label>
                        <textarea {...register('address')} rows="3" className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900" />
                      </div>
                      <div className="grid gap-2 text-sm">
                        <label className="text-slate-700">Document Uploads</label>
                        <input type="file" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900" />
                      </div>
                      <div className="grid gap-2 text-sm">
                        <label className="text-slate-700">Remarks</label>
                        <textarea {...register('remarks')} rows="2" className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 z-30 border-t border-slate-200 bg-white px-6 py-4 shadow-[0_-12px_30px_-22px_rgba(15,23,42,0.12)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button type="button" onClick={() => setShowNewStudent(false)} className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-[#1e3a5f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#152d52] disabled:opacity-60">Save Student</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {isStudentsError && (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Unable to load students. {studentsError?.message || 'Please refresh the page.'}</div>
      )}
    </div>
  );
}
