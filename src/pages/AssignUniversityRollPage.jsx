import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import DataTableAdvanced from '../components/ui/DataTableAdvanced.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useResourceList, useUpdateResource } from '../hooks/useResourceHooks';

const DEFAULT_FILTERS = {
  college: '',
  course: '',
  semester: '',
  section: '',
};

const DEMO_STUDENTS = [
  {
    id: 'demo-1',
    firstName: 'Aarav',
    lastName: 'Sharma',
    admissionNo: 'ADM-1001',
    status: 'Active',
    meta: {
      collegeName: 'Global College',
      course: 'B.Tech',
      semester: '4th',
      section: 'A',
      universityRollNo: 'U2024-101',
    },
  },
  {
    id: 'demo-2',
    firstName: 'Meera',
    lastName: 'Patel',
    admissionNo: 'ADM-1002',
    status: 'Active',
    meta: {
      collegeName: 'Global College',
      course: 'B.Tech',
      semester: '4th',
      section: 'A',
      universityRollNo: 'U2024-102',
    },
  },
  {
    id: 'demo-3',
    firstName: 'Rohan',
    lastName: 'Verma',
    admissionNo: 'ADM-1003',
    status: 'Active',
    meta: {
      collegeName: 'State University',
      course: 'MBA',
      semester: '2nd',
      section: 'B',
      universityRollNo: 'U2024-103',
    },
  },
  {
    id: 'demo-4',
    firstName: 'Sana',
    lastName: 'Khan',
    admissionNo: 'ADM-1004',
    status: 'Active',
    meta: {
      collegeName: 'State University',
      course: 'MBA',
      semester: '2nd',
      section: 'B',
      universityRollNo: 'U2024-104',
    },
  },
];

export default function AssignUniversityRollPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState('first_name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [activeFilters, setActiveFilters] = useState(DEFAULT_FILTERS);
  const [autoPrefix, setAutoPrefix] = useState('U2024-');
  const [autoStart, setAutoStart] = useState('101');
  const [editableRollNumbers, setEditableRollNumbers] = useState({});

  const queryParams = useMemo(
    () => ({
      page,
      pageSize,
      sortBy,
      sortOrder: sortDirection,
      search: searchTerm || undefined,
    }),
    [page, pageSize, sortBy, sortDirection, searchTerm],
  );

  const { data: studentsData = {}, isLoading } = useResourceList('students', queryParams);
  const students = useMemo(() => {
    const liveStudents = Array.isArray(studentsData?.items) ? studentsData.items : [];
    return liveStudents.length > 0 ? liveStudents : DEMO_STUDENTS;
  }, [studentsData]);

  const collegeOptions = useMemo(
    () => Array.from(new Set(students.map((student) => student.meta?.collegeName).filter(Boolean))).sort(),
    [students],
  );
  const courseOptions = useMemo(
    () => Array.from(new Set(students.map((student) => student.meta?.course).filter(Boolean))).sort(),
    [students],
  );
  const semesterOptions = useMemo(
    () => Array.from(new Set(students.map((student) => student.meta?.semester).filter(Boolean))).sort(),
    [students],
  );
  const sectionOptions = useMemo(
    () => Array.from(new Set(students.map((student) => student.meta?.section).filter(Boolean))).sort(),
    [students],
  );

  const filteredStudents = useMemo(
    () => students.filter((student) => {
      if (activeFilters.college && student.meta?.collegeName !== activeFilters.college) return false;
      if (activeFilters.course && student.meta?.course !== activeFilters.course) return false;
      if (activeFilters.semester && student.meta?.semester !== activeFilters.semester) return false;
      if (activeFilters.section && student.meta?.section !== activeFilters.section) return false;
      return true;
    }),
    [students, activeFilters],
  );

  const rows = useMemo(
    () => filteredStudents.map((student, index) => ({
      id: student.id,
      sno: (page - 1) * pageSize + index + 1,
      name: `${student.firstName || student.name || ''} ${student.lastName || ''}`.trim(),
      admissionNo: student.admissionNo || student.admission_number || '',
      universityRollNumber: editableRollNumbers[student.id] ?? (student.meta?.universityRollNo || ''),
      college: student.meta?.collegeName || '',
      courseSection: [student.meta?.course, student.meta?.section].filter(Boolean).join(' - '),
      semester: student.meta?.semester || '',
      section: student.meta?.section || '',
      status: student.status || 'Active',
      raw: student,
    })),
    [filteredStudents, page, pageSize, editableRollNumbers],
  );

  const updateStudent = useUpdateResource('students');

  const handleUniversityRollChange = (studentId, value) => {
    setEditableRollNumbers((current) => ({
      ...current,
      [studentId]: value,
    }));
  };

  const handleSaveRollNumber = (row) => {
    const newUniversityRoll = editableRollNumbers[row.id] ?? row.universityRollNumber;
    if (newUniversityRoll === (row.universityRollNumber || '')) {
      toast.info('No changes to save');
      return;
    }

    const payload = {
      admission_number: row.admissionNo,
      first_name: row.raw.firstName || row.raw.first_name || '',
      last_name: row.raw.lastName || row.raw.last_name || '',
      status: row.raw.status || 'Active',
      meta: {
        ...row.raw.meta,
        universityRollNo: newUniversityRoll || null,
      },
    };

    updateStudent.mutate({ id: row.id, payload }, {
      onSuccess: () => {
        toast.success('University roll number saved');
        setEditableRollNumbers((current) => {
          const next = { ...current };
          delete next[row.id];
          return next;
        });
      },
      onError: (err) => {
        toast.error(err?.message || 'Unable to save university roll number');
      },
    });
  };

  const handleAutoAssign = () => {
    const baseStart = Number(autoStart) || 1;
    const assignableStudents = filteredStudents;

    if (assignableStudents.length === 0) {
      toast.info('No students available for auto assignment');
      return;
    }

    const updatedNumbers = {};
    assignableStudents.forEach((student, index) => {
      updatedNumbers[student.id] = `${autoPrefix}${baseStart + index}`;
    });

    setEditableRollNumbers((current) => ({ ...current, ...updatedNumbers }));
    toast.success(`Auto-assigned ${assignableStudents.length} university roll numbers`);
  };

  const handleOpenFilters = () => setFilterModalOpen(true);
  const handleCancelFilters = () => {
    setDraftFilters(activeFilters);
    setFilterModalOpen(false);
  };

  const handleApplyFilters = () => {
    setActiveFilters(draftFilters);
    setFilterModalOpen(false);
    setPage(1);
  };

  const handleResetFilters = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setActiveFilters(DEFAULT_FILTERS);
  };

  const columns = [
    { key: 'sno', label: 'S.No' },
    { key: 'name', label: 'Student Name' },
    { key: 'admissionNo', label: 'Admission No.' },
    {
      key: 'universityRollNumber',
      label: 'University Roll No.',
      render: (_, row) => (
        <input
          type="text"
          value={editableRollNumbers[row.id] ?? row.universityRollNumber}
          onChange={(event) => handleUniversityRollChange(row.id, event.target.value)}
          className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          placeholder="Enter roll no."
        />
      ),
    },
    { key: 'college', label: 'College' },
    { key: 'courseSection', label: 'Course - Section' },
    { key: 'semester', label: 'Semester' },
    { key: 'section', label: 'Section' },
    {
      key: 'action',
      label: 'Action',
      render: (_, row) => (
        <button
          type="button"
          onClick={() => handleSaveRollNumber(row)}
          className="h-11 rounded-2xl bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          disabled={updateStudent.isLoading}
        >
          Save
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FB] py-6 text-slate-900">
      <div className="space-y-6 w-full max-w-full">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between pr-[10px]">
          <div className="space-y-3">
            <Breadcrumb items={[{ to: '/', label: 'Dashboard' }, { label: 'Assign University Roll No.' }]} />
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-slate-950">Assign University Roll No.</h1>
              <span className="text-sm text-slate-600">Assign or update university roll numbers across student records.</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleOpenFilters}
              className="mr-5 h-11 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={handleAutoAssign}
              className="h-11 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              Auto Assign
            </button>
          </div>
        </div>

        <div className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-200 w-full">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Search students</label>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, admission no, or university roll no."
                className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Auto assign prefix</label>
              <input
                type="text"
                value={autoPrefix}
                onChange={(event) => setAutoPrefix(event.target.value)}
                placeholder="U2024-"
                className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Starting number</label>
              <input
                type="number"
                min="1"
                value={autoStart}
                onChange={(event) => setAutoStart(event.target.value)}
                className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
        </div>

        <div className="mt-2">
          <DataTableAdvanced
            columns={columns}
            rows={rows}
            loading={isLoading}
            placeholder="Search rows by student, admission number, or roll number"
            initialPageSize={pageSize}
            className="mt-2"
          />
        </div>
      </div>

      <Modal
        title="Filter students"
        isOpen={filterModalOpen}
        onClose={handleCancelFilters}
        footer={(
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancelFilters}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleApplyFilters}
              className="rounded-2xl bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white"
            >
              Apply Filters
            </button>
          </div>
        )}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            College
            <select
              value={draftFilters.college}
              onChange={(event) => setDraftFilters((current) => ({ ...current, college: event.target.value }))}
              className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">All colleges</option>
              {collegeOptions.map((college) => (
                <option key={college} value={college}>{college}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            Course
            <select
              value={draftFilters.course}
              onChange={(event) => setDraftFilters((current) => ({ ...current, course: event.target.value }))}
              className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">All courses</option>
              {courseOptions.map((course) => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            Semester
            <select
              value={draftFilters.semester}
              onChange={(event) => setDraftFilters((current) => ({ ...current, semester: event.target.value }))}
              className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">All semesters</option>
              {semesterOptions.map((semester) => (
                <option key={semester} value={semester}>{semester}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            Section
            <select
              value={draftFilters.section}
              onChange={(event) => setDraftFilters((current) => ({ ...current, section: event.target.value }))}
              className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">All sections</option>
              {sectionOptions.map((section) => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </label>
        </div>
      </Modal>
    </div>
  );
}
