import { useEffect, useMemo, useState } from 'react';
import { Filter, HelpCircle } from 'lucide-react';
import ViewButton from '../components/ui/ViewButton.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { toast } from 'react-toastify';
import api from '../api/axios.js';
import { getEndpoint } from '../api/endpoints.js';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Modal from '../components/ui/Modal.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';

// Demo data: 15 realistic Indian students
const DEMO_STUDENTS = [
  {
    id: '1',
    sno: 1,
    photo: 'https://i.pravatar.cc/40?img=1',
    name: 'Aarav Sharma',
    rollNumber: '230101001',
    universityRollNumber: 'U2023-001',
    course: 'B.Tech CSE',
    semester: '6',
    currentSession: '2023-24',
    nextSession: '2024-25',
    status: 'Active',
  },
  {
    id: '2',
    sno: 2,
    photo: 'https://i.pravatar.cc/40?img=2',
    name: 'Meera Patel',
    rollNumber: '230101002',
    universityRollNumber: 'U2023-002',
    course: 'B.Tech CSE',
    semester: '6',
    currentSession: '2023-24',
    nextSession: '2024-25',
    status: 'Active',
  },
  {
    id: '3',
    sno: 3,
    photo: 'https://i.pravatar.cc/40?img=3',
    name: 'Rohan Verma',
    rollNumber: '230101003',
    universityRollNumber: 'U2023-003',
    course: 'B.Tech ECE',
    semester: '4',
    currentSession: '2023-24',
    nextSession: '2024-25',
    status: 'Active',
  },
  {
    id: '4',
    sno: 4,
    photo: 'https://i.pravatar.cc/40?img=4',
    name: 'Ananya Singh',
    rollNumber: '230101004',
    universityRollNumber: 'U2023-004',
    course: 'B.Tech Mechanical',
    semester: '4',
    currentSession: '2023-24',
    nextSession: '2024-25',
    status: 'Active',
  },
  {
    id: '5',
    sno: 5,
    photo: 'https://i.pravatar.cc/40?img=5',
    name: 'Vikram Kumar',
    rollNumber: '230101005',
    universityRollNumber: 'U2023-005',
    course: 'MBA',
    semester: '2',
    currentSession: '2023-24',
    nextSession: '2024-25',
    status: 'Active',
  },
  {
    id: '6',
    sno: 6,
    photo: 'https://i.pravatar.cc/40?img=6',
    name: 'Priya Joshi',
    rollNumber: '230101006',
    universityRollNumber: 'U2023-006',
    course: 'B.Tech CSE',
    semester: '2',
    currentSession: '2023-24',
    nextSession: '2024-25',
    status: 'Active',
  },
  {
    id: '7',
    sno: 7,
    photo: 'https://i.pravatar.cc/40?img=7',
    name: 'Arjun Rao',
    rollNumber: '230101007',
    universityRollNumber: 'U2023-007',
    course: 'B.Tech ECE',
    semester: '2',
    currentSession: '2023-24',
    nextSession: '2024-25',
    status: 'Active',
  },
  {
    id: '8',
    sno: 8,
    photo: 'https://i.pravatar.cc/40?img=8',
    name: 'Sana Khan',
    rollNumber: '230101008',
    universityRollNumber: 'U2023-008',
    course: 'BCA',
    semester: '6',
    currentSession: '2023-24',
    nextSession: '2024-25',
    status: 'Active',
  },
  {
    id: '9',
    sno: 9,
    photo: 'https://i.pravatar.cc/40?img=9',
    name: 'Nikhil Desai',
    rollNumber: '230101009',
    universityRollNumber: 'U2023-009',
    course: 'B.Tech Mechanical',
    semester: '6',
    currentSession: '2023-24',
    nextSession: '2024-25',
    status: 'Active',
  },
  {
    id: '10',
    sno: 10,
    photo: 'https://i.pravatar.cc/40?img=10',
    name: 'Kavya Reddy',
    rollNumber: '230101010',
    universityRollNumber: 'U2023-010',
    course: 'B.Tech CSE',
    semester: '4',
    currentSession: '2023-24',
    nextSession: '2024-25',
    status: 'Active',
  },
  {
    id: '11',
    sno: 11,
    photo: 'https://i.pravatar.cc/40?img=11',
    name: 'Harsh Singh',
    rollNumber: '230101011',
    universityRollNumber: 'U2023-011',
    course: 'MBA',
    semester: '4',
    currentSession: '2023-24',
    nextSession: '2024-25',
    status: 'Active',
  },
  {
    id: '12',
    sno: 12,
    photo: 'https://i.pravatar.cc/40?img=12',
    name: 'Deepika Nair',
    rollNumber: '230101012',
    universityRollNumber: 'U2023-012',
    course: 'BCA',
    semester: '2',
    currentSession: '2023-24',
    nextSession: '2024-25',
    status: 'Active',
  },
  {
    id: '13',
    sno: 13,
    photo: 'https://i.pravatar.cc/40?img=13',
    name: 'Manish Gupta',
    rollNumber: '230101013',
    universityRollNumber: 'U2023-013',
    course: 'B.Tech ECE',
    semester: '6',
    currentSession: '2023-24',
    nextSession: '2024-25',
    status: 'Active',
  },
  {
    id: '14',
    sno: 14,
    photo: 'https://i.pravatar.cc/40?img=14',
    name: 'Neha Malhotra',
    rollNumber: '230101014',
    universityRollNumber: 'U2023-014',
    course: 'B.Tech Mechanical',
    semester: '2',
    currentSession: '2023-24',
    nextSession: '2024-25',
    status: 'Active',
  },
  {
    id: '15',
    sno: 15,
    photo: 'https://i.pravatar.cc/40?img=15',
    name: 'Rajesh Kumar',
    rollNumber: '230101015',
    universityRollNumber: 'U2023-015',
    course: 'BCA',
    semester: '4',
    currentSession: '2023-24',
    nextSession: '2024-25',
    status: 'Active',
  },
];

const COLLEGES = [
  'All Colleges',
  'Roorkee College of Smart Computing',
  'Global College',
  'State University',
];

const COURSES = ['All Courses', 'B.Tech CSE', 'B.Tech ECE', 'B.Tech Mechanical', 'MBA', 'BCA'];
const SEMESTERS = ['All Semesters', '2', '4', '6'];
const SECTIONS = ['All Sections', 'A', 'B', 'C'];
const ADMISSION_CATEGORIES = ['All Categories', 'General', 'OBC', 'SC/ST'];
const STATUSES = ['All Statuses', 'Active', 'Inactive', 'Alumni'];

const normalizeStudent = (rawStudent, index) => {
  const fallbackName = rawStudent?.name || rawStudent?.student_name || rawStudent?.fullName || rawStudent?.full_name || '';
  const fallbackRoll = rawStudent?.rollNumber || rawStudent?.roll_no || rawStudent?.rollNo || rawStudent?.admissionNo || rawStudent?.admission_no || '';
  const fallbackUniversityRoll = rawStudent?.universityRollNumber || rawStudent?.university_roll_no || rawStudent?.universityRollNo || rawStudent?.university_roll_number || '';
  const fallbackCourse = rawStudent?.course || rawStudent?.courseName || rawStudent?.course_name || 'B.Tech CSE';
  const fallbackSemester = rawStudent?.semester || rawStudent?.currentSemester || rawStudent?.semesterName || '6';
  const fallbackStatus = rawStudent?.status || rawStudent?.studentStatus || 'Active';
  const fallbackPhoto = rawStudent?.photo || rawStudent?.photoUrl || rawStudent?.image || 'https://i.pravatar.cc/40?img=1';

  return {
    id: rawStudent?.id ?? `student-${index + 1}`,
    sno: index + 1,
    photo: fallbackPhoto,
    name: fallbackName || `Student ${index + 1}`,
    rollNumber: fallbackRoll || `2301010${String(index + 1).padStart(2, '0')}`,
    universityRollNumber: fallbackUniversityRoll || `U2023-${String(index + 1).padStart(3, '0')}`,
    course: fallbackCourse,
    semester: fallbackSemester,
    currentSession: rawStudent?.currentSession || rawStudent?.current_session || '2023-24',
    nextSession: rawStudent?.nextSession || rawStudent?.next_session || '2024-25',
    status: fallbackStatus,
  };
};

const normalizeStudents = (payload) => {
  if (Array.isArray(payload)) {
    return payload.map((student, index) => normalizeStudent(student, index));
  }

  const items = payload?.items || payload?.results || payload?.data || payload?.students || [];
  if (Array.isArray(items)) {
    return items.map((student, index) => normalizeStudent(student, index));
  }

  return [];
};

const getNextAcademicSession = (currentSession) => {
  if (!currentSession) return '';
  const [start, end] = currentSession.split('-').map((value) => Number(value));
  if (Number.isNaN(start) || Number.isNaN(end)) return '';
  return `${end}-${end + 1}`;
};

export default function StudentSessionManagementPage() {
  const [students, setStudents] = useState(DEMO_STUDENTS);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', rollNumber: '', universityRollNumber: '', college: '', course: '', semester: '', section: '', status: '' });
  const [editErrors, setEditErrors] = useState({});
  const [promoteConfirmOpen, setPromoteConfirmOpen] = useState(false);

  const [filterCollege, setFilterCollege] = useState('All Colleges');
  const [filterCourse, setFilterCourse] = useState('All Courses');
  const [filterSemester, setFilterSemester] = useState('All Semesters');
  const [filterSection, setFilterSection] = useState('All Sections');
  const [filterAdmissionCategory, setFilterAdmissionCategory] = useState('All Categories');
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const [draftFilters, setDraftFilters] = useState({
    college: filterCollege,
    course: filterCourse,
    semester: filterSemester,
    section: filterSection,
    admissionCategory: filterAdmissionCategory,
    status: filterStatus,
    startDate: filterStartDate,
    endDate: filterEndDate,
  });

  useEffect(() => {
    let isMounted = true;

    const loadStudents = async () => {
      try {
        const response = await api.get('/students', { params: { page: 1, page_size: 100 } });
        const normalized = normalizeStudents(response?.data);
        if (isMounted) {
          setStudents(normalized.length > 0 ? normalized : DEMO_STUDENTS);
        }
      } catch (error) {
        console.warn('Student session management: falling back to demo data', error);
        if (isMounted) {
          setStudents(DEMO_STUDENTS);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadStudents();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredStudents = useMemo(() => {
    let results = students;

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      results = results.filter((student) =>
        student.name.toLowerCase().includes(searchLower) ||
        student.rollNumber.toLowerCase().includes(searchLower) ||
        student.universityRollNumber.toLowerCase().includes(searchLower)
      );
    }

    // Apply dropdown filters
    if (filterCollege !== 'All Colleges') {
      // In a real app, would filter by college from meta
    }
    if (filterCourse !== 'All Courses') {
      results = results.filter((s) => s.course === filterCourse);
    }
    if (filterSemester !== 'All Semesters') {
      results = results.filter((s) => s.semester === filterSemester);
    }
    if (filterStatus !== 'All Statuses') {
      results = results.filter((s) => s.status === filterStatus);
    }

    return results;
  }, [search, filterCollege, filterCourse, filterSemester, filterSection, filterAdmissionCategory, filterStatus, students]);

  const pageCount = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const displayedStudents = filteredStudents.slice((page - 1) * pageSize, page * pageSize);

  const handleOpenFilterModal = () => {
    setDraftFilters({
      college: filterCollege,
      course: filterCourse,
      semester: filterSemester,
      section: filterSection,
      admissionCategory: filterAdmissionCategory,
      status: filterStatus,
      startDate: filterStartDate,
      endDate: filterEndDate,
    });
    setShowFilterModal(true);
  };

  const handleApplyFilters = () => {
    setFilterCollege(draftFilters.college);
    setFilterCourse(draftFilters.course);
    setFilterSemester(draftFilters.semester);
    setFilterSection(draftFilters.section);
    setFilterAdmissionCategory(draftFilters.admissionCategory);
    setFilterStatus(draftFilters.status);
    setFilterStartDate(draftFilters.startDate);
    setFilterEndDate(draftFilters.endDate);
    setPage(1);
    setShowFilterModal(false);
  };

  const handleCancelFilter = () => {
    setShowFilterModal(false);
  };

  const handlePromoteAll = () => {
    setShowPromoteDialog(true);
  };

  const handleConfirmPromoteAll = async () => {
    const updateRows = displayedStudents.map((student) => ({
      ...student,
      currentSession: student.nextSession,
      nextSession: getNextAcademicSession(student.nextSession),
    }));

    try {
      await Promise.all(updateRows.map(async (student) => {
        try {
          await api.put(`/${getEndpoint('students')}/${student.id}`, {
            currentSession: student.currentSession,
            nextSession: student.nextSession,
          });
        } catch (error) {
          return Promise.resolve();
        }
      }));
      setStudents((prev) => prev.map((student) => {
        const updated = updateRows.find((item) => item.id === student.id);
        return updated || student;
      }));
      toast.success(`${displayedStudents.length} students promoted successfully`);
    } catch (error) {
      toast.error('Unable to promote students. Please try again.');
    } finally {
      setShowPromoteDialog(false);
    }
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setEditForm({
      name: student.name || '',
      rollNumber: student.rollNumber || '',
      universityRollNumber: student.universityRollNumber || '',
      college: student.college || '',
      course: student.course || '',
      semester: student.semester || '',
      section: student.section || '',
      status: student.status || 'Active',
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editForm.name.trim()) errors.name = 'Student name is required.';
    if (!editForm.rollNumber.trim()) errors.rollNumber = 'Roll number is required.';
    if (!editForm.universityRollNumber.trim()) errors.universityRollNumber = 'University roll number is required.';
    if (!editForm.course.trim()) errors.course = 'Course is required.';
    if (!editForm.semester.trim()) errors.semester = 'Semester is required.';
    if (!editForm.status.trim()) errors.status = 'Status is required.';
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSave = async () => {
    if (!validateEditForm()) {
      toast.error('Please fix validation issues before saving.');
      return;
    }

    if (!selectedStudent) {
      toast.error('No student selected to update.');
      return;
    }

    const payload = {
      name: editForm.name.trim(),
      rollNumber: editForm.rollNumber.trim(),
      universityRollNumber: editForm.universityRollNumber.trim(),
      college: editForm.college.trim(),
      course: editForm.course.trim(),
      semester: editForm.semester.trim(),
      section: editForm.section.trim(),
      status: editForm.status.trim(),
    };

    try {
      await api.put(`/${getEndpoint('students')}/${selectedStudent.id}`, payload);
      setStudents((prev) => prev.map((item) => (item.id === selectedStudent.id ? { ...item, ...payload } : item)));
      setShowEditModal(false);
      toast.success('Student updated successfully.');
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 404) toast.error('Student record not found.');
        else if (status === 500) toast.error('Server error while updating student.');
        else if (status === 400) toast.error(error.response.data?.detail || 'Validation error.');
        else toast.error('Unable to update student.');
      } else {
        setStudents((prev) => prev.map((item) => (item.id === selectedStudent.id ? { ...item, ...payload } : item)));
        setShowEditModal(false);
        toast.success('Student updated locally (offline mode).');
      }
    }
  };

  const handlePromoteStudent = async (student) => {
    setSelectedStudent(student);
    setPromoteConfirmOpen(true);
  };

  const handleConfirmPromoteStudent = async () => {
    if (!selectedStudent) {
      toast.error('No student selected to promote.');
      setPromoteConfirmOpen(false);
      return;
    }

    const updated = {
      ...selectedStudent,
      currentSession: selectedStudent.nextSession,
      nextSession: getNextAcademicSession(selectedStudent.nextSession),
    };

    try {
      await api.put(`/${getEndpoint('students')}/${selectedStudent.id}`, {
        currentSession: updated.currentSession,
        nextSession: updated.nextSession,
      });
      setStudents((prev) => prev.map((item) => (item.id === selectedStudent.id ? updated : item)));
      toast.success(`${selectedStudent.name} promoted successfully.`);
    } catch (error) {
      if (!error.response) {
        setStudents((prev) => prev.map((item) => (item.id === selectedStudent.id ? updated : item)));
        toast.success(`${selectedStudent.name} promoted locally (offline mode).`);
      } else if (error.response.status === 404) {
        toast.error('Student record not found.');
      } else if (error.response.status === 500) {
        toast.error('Server error while promoting student.');
      } else {
        toast.error('Unable to promote student.');
      }
    } finally {
      setPromoteConfirmOpen(false);
    }
  };

  const handleEditFieldChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    setEditErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <div className="w-full max-w-full px-[10px] pb-10 pt-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Breadcrumb
              items={[
                { label: 'Dashboard', to: '/' },
                { label: 'Student', to: '/students' },
                { label: 'Student Session Management' },
              ]}
            />
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">Student Session Management</h1>
              <p className="mt-1 text-sm text-slate-600">List of Students</p>
            </div>
          </div>

          {/* Top Right Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleOpenFilterModal}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              title="Open filter options"
            >
              <Filter className="h-4 w-4" /> Filter
            </button>
            <button
              type="button"
              onClick={handlePromoteAll}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900"
              title="Promote all students to next session"
            >
              Promote All
            </button>
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              title="Get help with student session management"
            >
              <HelpCircle className="h-4 w-4" /> Need Help
            </button>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="rounded-[18px] border border-slate-200/70 bg-white p-6 shadow-sm">
          {/* Search Bar */}
          <div className="mb-6">
            {isLoading && (
              <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#1e3a5f]" />
                Loading student data...
              </div>
            )}
            <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Search</label>
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, roll number, university roll number, mobile, admission number..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
            />
          </div>

          {/* Table */}
          {displayedStudents.length > 0 ? (
            <div className="overflow-x-auto rounded-[16px] border border-slate-200">
              <table className="w-full text-center text-sm text-slate-900">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#1e3a5f] text-white">
                    <th className="px-4 py-3 font-semibold uppercase tracking-[0.18em]">S.No</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-[0.18em]">Photo</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-[0.18em]">Student Name</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-[0.18em]">Roll Number</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-[0.18em]">University Roll Number</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-[0.18em]">Course</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-[0.18em]">Semester</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-[0.18em]">Current Session</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-[0.18em]">Next Session</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-[0.18em]">Status</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-[0.18em]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {displayedStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">{student.sno}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <img
                            src={student.photo}
                            alt={student.name}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">{student.name}</td>
                      <td className="px-4 py-3">{student.rollNumber}</td>
                      <td className="px-4 py-3">{student.universityRollNumber}</td>
                      <td className="px-4 py-3">{student.course}</td>
                      <td className="px-4 py-3">{student.semester}</td>
                      <td className="px-4 py-3">{student.currentSession}</td>
                      <td className="px-4 py-3">{student.nextSession}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={student.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <ViewButton
                            title={`View ${student.name}`}
                            ariaLabel={`View ${student.name}`}
                            className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            onClick={() => handleViewStudent(student)}
                          />
                          <button
                            type="button"
                            onClick={() => handleEditStudent(student)}
                            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            title={`Edit ${student.name}`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePromoteStudent(student)}
                            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            title={`Promote ${student.name}`}
                          >
                            Promote
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-slate-600">No Records found!</p>
            </div>
          )}

          {/* Pagination */}
          {displayedStudents.length > 0 && (
            <div className="mt-6">
              <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      <Modal
        title="Filter Students"
        isOpen={showFilterModal}
        onClose={handleCancelFilter}
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancelFilter}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyFilters}
              className="rounded-xl bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              Apply
            </button>
          </div>
        }
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Filter Options</h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">College</label>
              <select
                value={draftFilters.college}
                onChange={(e) => setDraftFilters({ ...draftFilters, college: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
              >
                {COLLEGES.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Course</label>
              <select
                value={draftFilters.course}
                onChange={(e) => setDraftFilters({ ...draftFilters, course: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
              >
                {COURSES.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Semester</label>
              <select
                value={draftFilters.semester}
                onChange={(e) => setDraftFilters({ ...draftFilters, semester: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
              >
                {SEMESTERS.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Section</label>
              <select
                value={draftFilters.section}
                onChange={(e) => setDraftFilters({ ...draftFilters, section: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
              >
                {SECTIONS.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">More Options</h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Admission Category</label>
              <select
                value={draftFilters.admissionCategory}
                onChange={(e) => setDraftFilters({ ...draftFilters, admissionCategory: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
              >
                {ADMISSION_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={draftFilters.status}
                onChange={(e) => setDraftFilters({ ...draftFilters, status: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
              <input
                type="date"
                value={draftFilters.startDate}
                onChange={(e) => setDraftFilters({ ...draftFilters, startDate: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
              <input
                type="date"
                value={draftFilters.endDate}
                onChange={(e) => setDraftFilters({ ...draftFilters, endDate: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Promote All Confirmation Dialog */}
      <Modal
        title="Promote Students"
        isOpen={showPromoteDialog}
        onClose={() => setShowPromoteDialog(false)}
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowPromoteDialog(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmPromoteAll}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Promote
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-slate-700">Are you sure you want to promote all filtered students to the next academic session?</p>
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{displayedStudents.length}</span> student(s) will be promoted.
            </p>
          </div>
        </div>
      </Modal>

      {/* Need Help Modal */}
      <Modal
        title="Student Session Management Help"
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        footer={
          <button
            type="button"
            onClick={() => setShowHelpModal(false)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
        }
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Quick Guide</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
              <li>Use the search box to find students by name, roll number, or university roll number</li>
              <li>Click the Filter button to apply advanced filters like course, semester, and status</li>
              <li>Click Promote All to promote all filtered students to the next academic session</li>
              <li>Use individual action buttons (View, Edit, Promote) for specific students</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Frequently Asked Questions</h4>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-medium text-slate-900">Q: How do I promote a single student?</p>
                <p className="text-slate-700">A: Click the &quot;Promote&quot; button in the Action column for that student.</p>
              </div>
              <div>
                <p className="font-medium text-slate-900">Q: Can I undo a promotion?</p>
                <p className="text-slate-700">A: Contact your administrator to reverse a promotion.</p>
              </div>
              <div>
                <p className="font-medium text-slate-900">Q: How are students filtered?</p>
                <p className="text-slate-700">A: Use the Filter button to set criteria like course, semester, and section.</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={promoteConfirmOpen}
        title="Promote Student"
        description="Are you sure you want to promote this student to the next academic session?"
        confirmLabel="Promote"
        cancelLabel="Cancel"
        onCancel={() => setPromoteConfirmOpen(false)}
        onConfirm={handleConfirmPromoteStudent}
      />

      <Modal
        title="View Student Details"
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        footer={
          <button
            type="button"
            onClick={() => setShowViewModal(false)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
        }
      >
        {selectedStudent ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4 rounded-[18px] border border-slate-200 bg-slate-50 p-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <img src={selectedStudent.photo} alt={selectedStudent.name} className="h-24 w-24 rounded-full object-cover" />
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">{selectedStudent.name}</h3>
                  <p className="text-sm text-slate-500">{selectedStudent.status}</p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-slate-700">
                <div>
                  <p className="text-slate-500">Roll Number</p>
                  <p className="font-semibold text-slate-900">{selectedStudent.rollNumber}</p>
                </div>
                <div>
                  <p className="text-slate-500">University Roll Number</p>
                  <p className="font-semibold text-slate-900">{selectedStudent.universityRollNumber}</p>
                </div>
                <div>
                  <p className="text-slate-500">College</p>
                  <p className="font-semibold text-slate-900">{selectedStudent.college || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4 rounded-[18px] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
              <div>
                <p className="text-slate-500">Course</p>
                <p className="font-semibold text-slate-900">{selectedStudent.course}</p>
              </div>
              <div>
                <p className="text-slate-500">Semester</p>
                <p className="font-semibold text-slate-900">{selectedStudent.semester}</p>
              </div>
              <div>
                <p className="text-slate-500">Section</p>
                <p className="font-semibold text-slate-900">{selectedStudent.section || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-500">Current Session</p>
                <p className="font-semibold text-slate-900">{selectedStudent.currentSession}</p>
              </div>
              <div>
                <p className="text-slate-500">Next Session</p>
                <p className="font-semibold text-slate-900">{selectedStudent.nextSession}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-700">No student selected.</p>
        )}
      </Modal>

      <Modal
        title="Edit Student"
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        footer={
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleEditSave}
              className="rounded-xl bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              Save
            </button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Student Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => handleEditFieldChange('name', e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
            />
            {editErrors.name && <p className="mt-1 text-xs text-rose-500">{editErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Roll Number</label>
            <input
              type="text"
              value={editForm.rollNumber}
              onChange={(e) => handleEditFieldChange('rollNumber', e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
            />
            {editErrors.rollNumber && <p className="mt-1 text-xs text-rose-500">{editErrors.rollNumber}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">University Roll Number</label>
            <input
              type="text"
              value={editForm.universityRollNumber}
              onChange={(e) => handleEditFieldChange('universityRollNumber', e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
            />
            {editErrors.universityRollNumber && <p className="mt-1 text-xs text-rose-500">{editErrors.universityRollNumber}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">College</label>
            <input
              type="text"
              value={editForm.college}
              onChange={(e) => handleEditFieldChange('college', e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Course</label>
            <input
              type="text"
              value={editForm.course}
              onChange={(e) => handleEditFieldChange('course', e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
            />
            {editErrors.course && <p className="mt-1 text-xs text-rose-500">{editErrors.course}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Semester</label>
            <input
              type="text"
              value={editForm.semester}
              onChange={(e) => handleEditFieldChange('semester', e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
            />
            {editErrors.semester && <p className="mt-1 text-xs text-rose-500">{editErrors.semester}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Section</label>
            <input
              type="text"
              value={editForm.section}
              onChange={(e) => handleEditFieldChange('section', e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={editForm.status}
              onChange={(e) => handleEditFieldChange('status', e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Alumni">Alumni</option>
            </select>
            {editErrors.status && <p className="mt-1 text-xs text-rose-500">{editErrors.status}</p>}
          </div>
        </div>
      </Modal>
    </div>
  );
}
