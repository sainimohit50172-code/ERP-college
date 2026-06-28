import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useResourceList,
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
  useBulkImport,
  useBulkExport,
} from '../hooks/useResourceHooks';
import {
  FaChartLine,
  FaDownload,
  FaEdit,
  FaFileImport,
  FaPlus,
  FaTrash,
} from 'react-icons/fa';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';
import { usePermissions } from '../services/permissionHelpers.js';
import Button from '../components/ui/Button.jsx';

const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Resigned', label: 'Resigned' },
];

const defaultValues = {
  name: '',
  email: '',
  department: 'Computer Science',
  subjects: 'Data Structures',
  experience: '1',
  shift: 'Morning',
  status: 'Active',
  salary: '4800',
};

const defaultAssignmentValues = {
  teacher: '',
  course: '',
  semester: '',
  subjects: '2',
  credits: '8',
  prerequisite: 'None',
  yearsTeaching: '5',
  status: 'Active',
};

const defaultLectureValues = {
  subject: '',
  teacher: '',
  course: '',
  section: '',
  date: '',
  time: '',
  room: '',
  type: 'Theory',
  status: 'Scheduled',
};

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export default function TeacherManagementPage() {
  const importInputRef = useRef(null);
  const perms = usePermissions();

  const { data: teachersData } = useResourceList('teachers', { page: 1, pageSize: 200 });
  const { data: departmentsData } = useResourceList('departments', { page: 1, pageSize: 200 });
  const { data: assignmentsData } = useResourceList('teacherCourseAssignments', { page: 1, pageSize: 200 });
  const { data: semesterAssignmentsData } = useResourceList('teacherSemesterAssignments', { page: 1, pageSize: 200 });
  const { data: lectureSchedulesData } = useResourceList('lectureSchedules', { page: 1, pageSize: 200 });
  const { data: coursesData } = useResourceList('courses', { page: 1, pageSize: 200 });
  const { data: subjectsData } = useResourceList('subjects', { page: 1, pageSize: 200 });
  const { data: sectionsData } = useResourceList('sections', { page: 1, pageSize: 200 });

  const teachers = teachersData?.items || [];
  const departments = departmentsData?.items || [];
  const assignments = assignmentsData?.items || [];
  const semesterAssignments = semesterAssignmentsData?.items || [];
  const lectureSchedules = lectureSchedulesData?.items || [];
  const courses = coursesData?.items || [];
  const subjects = subjectsData?.items || [];
  const sections = sectionsData?.items || [];

  const createTeacher = useCreateResource('teachers');
  const updateTeacher = useUpdateResource('teachers');
  const deleteTeacher = useDeleteResource('teachers');
  const importTeacher = useBulkImport('teachers');
  const exportTeacher = useBulkExport('teachers');
  const exportAssignments = useBulkExport('teacherCourseAssignments');
  const exportSchedule = useBulkExport('lectureSchedules');
  const createCourseAssignment = useCreateResource('teacherCourseAssignments');
  const createLectureSchedule = useCreateResource('lectureSchedules');

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [assignmentPage, setAssignmentPage] = useState(1);
  const [schedulePage, setSchedulePage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isLectureModalOpen, setIsLectureModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [importStatus, setImportStatus] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingAssignments, setIsExportingAssignments] = useState(false);
  const [isExportingSchedule, setIsExportingSchedule] = useState(false);
  const pageSize = 6;
  const assignmentPageSize = 4;
  const schedulePageSize = 4;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });

  const {
    register: registerAssignment,
    handleSubmit: handleSubmitAssignment,
    reset: resetAssignment,
    formState: { errors: assignmentErrors, isSubmitting: isAssignmentSubmitting },
  } = useForm({ defaultValues: defaultAssignmentValues });

  const {
    register: registerLecture,
    handleSubmit: handleSubmitLecture,
    reset: resetLecture,
    formState: { errors: lectureErrors, isSubmitting: isLectureSubmitting },
  } = useForm({ defaultValues: defaultLectureValues });

  const teacherMap = useMemo(() => new Map(teachers.map((teacher) => [teacher.id, teacher])), [teachers]);
  const courseMap = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);
  const sectionMap = useMemo(() => new Map(sections.map((section) => [section.id, section])), [sections]);
  const subjectMap = useMemo(() => new Map(subjects.map((subject) => [subject.id, subject])), [subjects]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = [
        teacher.name,
        teacher.email,
        teacher.department,
        teacher.subjects,
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || teacher.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [teachers, search, filter]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = [assignment.teacher, assignment.course, assignment.semester].some((field) =>
        String(field || '').toLowerCase().includes(searchTerm),
      );
      const matchesFilter = filter === 'All' || assignment.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [assignments, search, filter]);

  const filteredSchedule = useMemo(() => {
    return lectureSchedules.filter((lecture) => {
      const searchTerm = search.toLowerCase();
      const teacher = teacherMap.get(lecture.teacherId)?.name || '';
      const course = courseMap.get(lecture.courseId)?.code || '';
      const subject = subjectMap.get(lecture.subjectId)?.title || '';
      const section = sectionMap.get(lecture.sectionId)?.name || '';
      const matchesSearch = [teacher, course, subject, section, lecture.room, lecture.day].some((field) =>
        String(field || '').toLowerCase().includes(searchTerm),
      );
      const matchesFilter = filter === 'All' || lecture.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [lectureSchedules, search, filter, teacherMap, courseMap, subjectMap, sectionMap]);

  const pageCount = Math.max(1, Math.ceil(filteredTeachers.length / pageSize));
  const displayedTeachers = filteredTeachers.slice((page - 1) * pageSize, page * pageSize);
  const assignmentPageCount = Math.max(1, Math.ceil(filteredAssignments.length / assignmentPageSize));
  const displayedAssignments = filteredAssignments.slice((assignmentPage - 1) * assignmentPageSize, assignmentPage * assignmentPageSize);
  const schedulePageCount = Math.max(1, Math.ceil(filteredSchedule.length / schedulePageSize));
  const displayedSchedule = filteredSchedule.slice((schedulePage - 1) * schedulePageSize, schedulePage * schedulePageSize);

  const activeCount = teachers.filter((teacher) => teacher.status === 'Active').length;
  const pendingCount = teachers.filter((teacher) => teacher.status === 'Pending').length;
  const averageExperience = teachers.length
    ? (teachers.reduce((total, teacher) => {
        const years = Number(String(teacher.experience).replace(/[^0-9.]/g, '')) || 0;
        return total + years;
      }, 0) / teachers.length).toFixed(1)
    : '0.0';
  const topDepartment = useMemo(() => {
    const counts = teachers.reduce((acc, teacher) => {
      const dept = teacher.department || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  }, [teachers]);
  const totalSalary = teachers.reduce((sum, teacher) => sum + (Number(String(teacher.salary).replace(/[^0-9.]/g, '')) || 0), 0);
  const totalTeachingHours = semesterAssignments.reduce((sum, assignment) => sum + Number(assignment.totalHours || 0), 0);
  const lectureLoad = lectureSchedules.length;
  const plannedAssignments = assignments.length;

  const resetForm = () => {
    reset(defaultValues);
    setSelectedTeacher(null);
    setIsEditMode(false);
  };

  const openNewTeacherModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditTeacherModal = (teacher) => {
    setSelectedTeacher(teacher);
    setIsEditMode(true);
    reset({
      name: teacher.name || '',
      email: teacher.email || '',
      department: teacher.department || 'Computer Science',
      subjects: teacher.subjects || '',
      experience: String(teacher.experience).replace(/[^0-9.]/g, '') || '1',
      shift: teacher.shift || 'Morning',
      status: teacher.status || 'Active',
      salary: String(teacher.salary).replace(/[^0-9.]/g, '') || '4800',
    });
    setIsModalOpen(true);
  };

  const onSubmit = (formValues) => {
    const payload = {
      ...formValues,
      experience: `${Number(formValues.experience)} yrs`,
      salary: `$${Number(formValues.salary || 0)}`,
    };

    if (isEditMode && selectedTeacher) {
      updateTeacher.mutate(
        { id: selectedTeacher.id, payload },
        {
          onSuccess: () => {
            resetForm();
            setPage(1);
            setIsModalOpen(false);
          },
        },
      );
    } else {
      createTeacher.mutate(payload, {
        onSuccess: () => {
          resetForm();
          setPage(1);
          setIsModalOpen(false);
        },
      });
    }
  };

  const handleDelete = (teacher) => {
    if (!window.confirm(`Delete ${teacher.name} from the faculty roster?`)) {
      return;
    }
    deleteTeacher.mutate(teacher.id);
  };

  const handleImport = (file) => {
    if (!file) return;
    setImportStatus('Uploading…');
    const formData = new FormData();
    formData.append('file', file);
    importTeacher.mutate(formData, {
      onSuccess: () => setImportStatus('Teacher roster imported successfully.'),
      onError: () => setImportStatus('Import failed. Please try a valid CSV file.'),
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    handleImport(file);
    event.target.value = '';
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportTeacher.mutateAsync();
      downloadBlob(blob, 'teachers-export.xlsx');
    } catch (error) {
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAssignments = async () => {
    setIsExportingAssignments(true);
    try {
      const blob = await exportAssignments.mutateAsync();
      downloadBlob(blob, 'teacher-course-assignments.xlsx');
    } catch (error) {
      console.error(error);
    } finally {
      setIsExportingAssignments(false);
    }
  };

  const handleExportSchedule = async () => {
    setIsExportingSchedule(true);
    try {
      const blob = await exportSchedule.mutateAsync();
      downloadBlob(blob, 'lecture-schedule.xlsx');
    } catch (error) {
      console.error(error);
    } finally {
      setIsExportingSchedule(false);
    }
  };

  const handleAssignmentSubmit = (formValues) => {
    createCourseAssignment.mutate(formValues, {
      onSuccess: () => {
        resetAssignment(defaultAssignmentValues);
        setAssignmentPage(1);
        setIsAssignmentModalOpen(false);
      },
    });
  };

  const handleLectureSubmit = (formValues) => {
    const teacherRecord = teachers.find((t) => t.name === formValues.teacher);
    const courseRecord = courses.find((course) => course.code === formValues.course || course.title === formValues.course);
    const sectionRecord = sections.find((section) => section.name === formValues.section);
    const subjectRecord = subjects.find((subject) => subject.title === formValues.subject || subject.code === formValues.subject);

    const payload = {
      subjectId: subjectRecord?.id || formValues.subject,
      teacherId: teacherRecord?.id || formValues.teacher,
      courseId: courseRecord?.id || formValues.course,
      sectionId: sectionRecord?.id || formValues.section,
      room: formValues.room,
      day: formValues.date || 'Monday',
      time: formValues.time,
      type: formValues.type,
      status: formValues.status,
    };

    createLectureSchedule.mutate(payload, {
      onSuccess: () => {
        resetLecture(defaultLectureValues);
        setSchedulePage(1);
        setIsLectureModalOpen(false);
      },
    });
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Teacher management"
        subtitle="Faculty profiles, academic load planning, payroll and performance analytics."
        action={
          <div className="flex flex-wrap items-center gap-3">
            {perms.canExport('teachers') && (
              <Button type="button" onClick={handleExport} variant="secondary" className="inline-flex items-center gap-2 px-4 py-3 text-sm"><FaDownload /> Export roster</Button>
            )}
            {perms.canImport('teachers') && (
              <Button type="button" onClick={() => importInputRef.current?.click()} variant="secondary" className="inline-flex items-center gap-2 px-4 py-3 text-sm"><FaFileImport /> Import CSV</Button>
            )}
            {perms.canCreate('teachers') && (
              <Button type="button" onClick={openNewTeacherModal} variant="primary" className="inline-flex items-center gap-2 px-4 py-3 text-sm"><FaPlus /> Add teacher</Button>
            )}
          </div>
        }
      />

      <input ref={importInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Faculty count</p>
              <p className="mt-4 text-3xl font-semibold text-white">{teachers.length}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Active faculty</p>
              <p className="mt-4 text-3xl font-semibold text-white">{activeCount}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Average experience</p>
              <p className="mt-4 text-3xl font-semibold text-white">{averageExperience} yrs</p>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Faculty roster</h2>
                <p className="text-sm text-slate-400">Search, filter, and manage teaching staff records in one place.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-3xl bg-slate-950/70 px-4 py-3 text-sm text-slate-200">Top department: {topDepartment}</div>
                <div className="rounded-3xl bg-slate-950/70 px-4 py-3 text-sm text-slate-200">Pending hires: {pendingCount}</div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} />
            </div>

            <div className="mt-6">
              <DataTable
                columns={['Faculty', 'Department', 'Subjects', 'Shift', 'Experience', 'Status', 'Actions']}
                rows={displayedTeachers.map((teacher) => [
                  <div className="space-y-1" key={teacher.id}>
                    <p className="font-semibold text-white">{teacher.name}</p>
                    <p className="text-sm text-slate-400">{teacher.email}</p>
                  </div>,
                  teacher.department,
                  teacher.subjects,
                  teacher.shift,
                  teacher.experience,
                  <StatusBadge key={`${teacher.id}-status`} status={teacher.status} />,
                  <div className="flex flex-wrap gap-2">
                    {perms.canEdit('teachers') && (
                      <button
                        type="button"
                        onClick={() => openEditTeacherModal(teacher)}
                        className="rounded-full border border-white/10 bg-slate-800/80 px-3 py-2 text-xs text-slate-200 transition hover:bg-slate-700"
                      >
                        <FaEdit className="inline-block" /> Edit
                      </button>
                    )}
                    {perms.canDelete('teachers') && (
                      <button
                        type="button"
                        onClick={() => handleDelete(teacher)}
                        className="rounded-full border border-white/10 bg-rose-500/10 px-3 py-2 text-xs text-rose-300 transition hover:bg-rose-500/20"
                      >
                        <FaTrash className="inline-block" /> Remove
                      </button>
                    )}
                  </div>,
                ])}
              />
            </div>
            <div className="mt-6">
              <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-500/10 text-sky-300">
              <FaChartLine className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Faculty analytics</p>
              <h3 className="text-xl font-semibold text-white">Academic coverage</h3>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
              <p className="text-sm text-slate-400">Most staffed department</p>
              <p className="mt-3 text-3xl font-semibold text-white">{topDepartment}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
              <p className="text-sm text-slate-400">Staff utilization</p>
              <p className="mt-3 text-3xl font-semibold text-white">{teachers.length ? `${Math.round((activeCount / teachers.length) * 100)}%` : '0%'}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
              <p className="text-sm text-slate-400">Monthly payroll</p>
              <p className="mt-3 text-3xl font-semibold text-white">${totalSalary.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-6">
          <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Academic operations</h2>
                <p className="text-sm text-slate-400">Manage course and semester assignments across the faculty pool.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {perms.canExport('teacherAssignments') && (
                  <button
                    type="button"
                    onClick={handleExportAssignments}
                    className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700"
                  >
                    <FaDownload /> Export assignments
                  </button>
                )}
                {perms.canCreate('teacherAssignments') && (
                  <button
                    type="button"
                    onClick={() => setIsAssignmentModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
                  >
                    <FaPlus /> Assign course
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
                  <p className="text-sm text-slate-400">Total assignments</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{assignments.length}</p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
                  <p className="text-sm text-slate-400">Semester workload</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{semesterAssignments.length}</p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
                  <p className="text-sm text-slate-400">Planned lectures</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{lectureLoad}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <DataTable
                columns={['Teacher', 'Course', 'Semester', 'Subjects', 'Credits', 'Status']}
                rows={displayedAssignments.map((assignment) => [
                  <div key={assignment.id} className="font-semibold text-white">{assignment.teacher}</div>,
                  assignment.course,
                  assignment.semester,
                  assignment.subjects,
                  assignment.credits,
                  <StatusBadge key={`${assignment.id}-status`} status={assignment.status} />,
                ])}
              />
            </div>
            <div className="mt-6">
              <TablePagination page={assignmentPage} pageCount={assignmentPageCount} onPageChange={setAssignmentPage} />
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Schedule planner</h2>
              <p className="text-sm text-slate-400">Track confirmed lectures, rooms and section coverage.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {perms.canExport('teacherSchedule') && (
                <button
                  type="button"
                  onClick={handleExportSchedule}
                  className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700"
                >
                  <FaDownload /> Export schedule
                </button>
              )}
              {perms.canCreate('teacherSchedule') && (
                <button
                  type="button"
                  onClick={() => setIsLectureModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
                >
                  <FaPlus /> Add lecture
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
              <p className="text-sm text-slate-400">Total teaching hours</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totalTeachingHours}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
              <p className="text-sm text-slate-400">Pending schedule items</p>
              <p className="mt-3 text-3xl font-semibold text-white">{lectureSchedules.filter((lecture) => lecture.status !== 'Completed').length}</p>
            </div>
          </div>

          <div className="mt-6">
            <DataTable
              columns={['Subject', 'Teacher', 'Course', 'Section', 'Day', 'Time', 'Room', 'Status']}
              rows={displayedSchedule.map((lecture) => [
                <div key={lecture.id} className="font-semibold text-white">{subjectMap.get(lecture.subjectId)?.title || lecture.subjectId || 'Unknown'}</div>,
                teacherMap.get(lecture.teacherId)?.name || lecture.teacherId || 'Unknown',
                courseMap.get(lecture.courseId)?.code || lecture.courseId || 'Unknown',
                sectionMap.get(lecture.sectionId)?.name || lecture.sectionId || 'Unknown',
                lecture.day,
                lecture.time,
                lecture.room,
                <StatusBadge key={`${lecture.id}-status`} status={lecture.status} />,
              ])}
            />
          </div>
          <div className="mt-6">
            <TablePagination page={schedulePage} pageCount={schedulePageCount} onPageChange={setSchedulePage} />
          </div>
        </div>
      </div>

      {importStatus && (
        <div className="rounded-[28px] border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-200">{importStatus}</div>
      )}

      <Modal
        title={isEditMode ? 'Edit faculty member' : 'Add new faculty member'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        footer={
          <Button type="button" onClick={handleSubmit(onSubmit)} isLoading={isSubmitting} variant="primary">
            {isEditMode ? 'Update teacher' : 'Save teacher'}
          </Button>
        }
      >
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Full name">
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
              placeholder="Enter faculty name"
            />
            {errors.name && <p className="mt-1 text-sm text-rose-400">{errors.name.message}</p>}
          </FormField>
          <FormField label="Email address">
            <input
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
              })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
              placeholder="faculty@example.edu"
            />
            {errors.email && <p className="mt-1 text-sm text-rose-400">{errors.email.message}</p>}
          </FormField>
          <FormField label="Department">
            <select
              {...register('department', { required: 'Department is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            >
              {departments.length > 0 ? (
                departments.map((department) => (
                  <option key={department.id} value={department.name}>{department.name}</option>
                ))
              ) : (
                <>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="English">English</option>
                  <option value="Business Administration">Business Administration</option>
                  <option value="Biology">Biology</option>
                </>
              )}
            </select>
            {errors.department && <p className="mt-1 text-sm text-rose-400">{errors.department.message}</p>}
          </FormField>
          <FormField label="Subjects taught">
            <input
              type="text"
              {...register('subjects', { required: 'Subjects are required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
              placeholder="Example: Data Structures, Algorithms"
            />
            {errors.subjects && <p className="mt-1 text-sm text-rose-400">{errors.subjects.message}</p>}
          </FormField>
          <FormField label="Experience (years)">
            <input
              type="number"
              {...register('experience', {
                required: 'Experience is required',
                min: { value: 1, message: 'Minimum 1 year' },
              })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
              placeholder="Years of teaching experience"
            />
            {errors.experience && <p className="mt-1 text-sm text-rose-400">{errors.experience.message}</p>}
          </FormField>
          <FormField label="Shift">
            <select
              {...register('shift', { required: 'Shift selection is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            >
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
            </select>
            {errors.shift && <p className="mt-1 text-sm text-rose-400">{errors.shift.message}</p>}
          </FormField>
          <FormField label="Status">
            <select
              {...register('status', { required: 'Status is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            >
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Resigned">Resigned</option>
            </select>
            {errors.status && <p className="mt-1 text-sm text-rose-400">{errors.status.message}</p>}
          </FormField>
          <FormField label="Monthly salary">
            <input
              type="number"
              {...register('salary', {
                required: 'Salary is required',
                min: { value: 1000, message: 'Minimum salary 1000' },
              })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
              placeholder="Salary in USD"
            />
            {errors.salary && <p className="mt-1 text-sm text-rose-400">{errors.salary.message}</p>}
          </FormField>
        </form>
      </Modal>

      <Modal
        title="Assign teacher to course"
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        footer={
          <Button type="button" onClick={handleSubmitAssignment(handleAssignmentSubmit)} isLoading={isAssignmentSubmitting} variant="primary">Save assignment</Button>
        }
      >
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Teacher name">
            <select
              {...registerAssignment('teacher', { required: 'Teacher is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            >
              <option value="">Select teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.name}>{teacher.name}</option>
              ))}
            </select>
            {assignmentErrors.teacher && <p className="mt-1 text-sm text-rose-400">{assignmentErrors.teacher.message}</p>}
          </FormField>
          <FormField label="Course">
            <select
              {...registerAssignment('course', { required: 'Course is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.code}>{course.title}</option>
              ))}
            </select>
            {assignmentErrors.course && <p className="mt-1 text-sm text-rose-400">{assignmentErrors.course.message}</p>}
          </FormField>
          <FormField label="Semester">
            <input
              type="text"
              {...registerAssignment('semester', { required: 'Semester is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
              placeholder="Semester 1"
            />
            {assignmentErrors.semester && <p className="mt-1 text-sm text-rose-400">{assignmentErrors.semester.message}</p>}
          </FormField>
          <FormField label="Subject count">
            <input
              type="number"
              {...registerAssignment('subjects')}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            />
          </FormField>
          <FormField label="Total credits">
            <input
              type="number"
              {...registerAssignment('credits')}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            />
          </FormField>
          <FormField label="Prerequisite">
            <input
              type="text"
              {...registerAssignment('prerequisite')}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
              placeholder="None"
            />
          </FormField>
          <FormField label="Years teaching">
            <input
              type="number"
              {...registerAssignment('yearsTeaching')}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            />
          </FormField>
          <FormField label="Status">
            <select
              {...registerAssignment('status')}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            >
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Resigned">Resigned</option>
            </select>
          </FormField>
        </form>
      </Modal>

      <Modal
        title="Schedule new lecture"
        isOpen={isLectureModalOpen}
        onClose={() => setIsLectureModalOpen(false)}
        footer={
          <Button type="button" onClick={handleSubmitLecture(handleLectureSubmit)} isLoading={isLectureSubmitting} variant="primary">Save lecture</Button>
        }
      >
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Subject">
            <select
              {...registerLecture('subject', { required: 'Subject is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            >
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.title}>{subject.title}</option>
              ))}
            </select>
            {lectureErrors.subject && <p className="mt-1 text-sm text-rose-400">{lectureErrors.subject.message}</p>}
          </FormField>
          <FormField label="Teacher">
            <select
              {...registerLecture('teacher', { required: 'Teacher is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            >
              <option value="">Select teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.name}>{teacher.name}</option>
              ))}
            </select>
            {lectureErrors.teacher && <p className="mt-1 text-sm text-rose-400">{lectureErrors.teacher.message}</p>}
          </FormField>
          <FormField label="Course">
            <select
              {...registerLecture('course', { required: 'Course is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.code}>{course.title}</option>
              ))}
            </select>
            {lectureErrors.course && <p className="mt-1 text-sm text-rose-400">{lectureErrors.course.message}</p>}
          </FormField>
          <FormField label="Section">
            <select
              {...registerLecture('section', { required: 'Section is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            >
              <option value="">Select section</option>
              {sections.map((section) => (
                <option key={section.id} value={section.name}>{section.name}</option>
              ))}
            </select>
            {lectureErrors.section && <p className="mt-1 text-sm text-rose-400">{lectureErrors.section.message}</p>}
          </FormField>
          <FormField label="Date">
            <input
              type="date"
              {...registerLecture('date', { required: 'Date is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            />
            {lectureErrors.date && <p className="mt-1 text-sm text-rose-400">{lectureErrors.date.message}</p>}
          </FormField>
          <FormField label="Time">
            <input
              type="text"
              {...registerLecture('time', { required: 'Time is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
              placeholder="09:00 - 10:30"
            />
            {lectureErrors.time && <p className="mt-1 text-sm text-rose-400">{lectureErrors.time.message}</p>}
          </FormField>
          <FormField label="Room">
            <input
              type="text"
              {...registerLecture('room', { required: 'Room is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
              placeholder="A-101"
            />
            {lectureErrors.room && <p className="mt-1 text-sm text-rose-400">{lectureErrors.room.message}</p>}
          </FormField>
          <FormField label="Type">
            <select
              {...registerLecture('type', { required: 'Type is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            >
              <option value="Theory">Theory</option>
              <option value="Practical">Practical</option>
              <option value="Seminar">Seminar</option>
            </select>
            {lectureErrors.type && <p className="mt-1 text-sm text-rose-400">{lectureErrors.type.message}</p>}
          </FormField>
          <FormField label="Status">
            <select
              {...registerLecture('status', { required: 'Status is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            {lectureErrors.status && <p className="mt-1 text-sm text-rose-400">{lectureErrors.status.message}</p>}
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
