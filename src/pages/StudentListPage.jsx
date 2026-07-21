import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaFileImport, FaPrint } from 'react-icons/fa';
import { useResourceList, useCreateResource, useUpdateResource, useDeleteResource } from '../hooks/useResourceHooks';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import WithPermission from '../components/auth/WithPermission.jsx';
import CircleAvatar from '../components/ui/CircleAvatar.jsx';

const defaultFormValues = {
  admissionNo: '',
  universityRollNo: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  status: 'Active',
  admissionDate: '',
  academicSession: '',
  collegeName: '',
  course: '',
  department: '',
  semester: '',
  section: '',
  address: '',
  emergencyContact: '',
  fatherName: '',
  motherName: '',
  guardianName: '',
  guardianRelationship: 'Guardian',
  guardianMobile: '',
  guardianEmail: '',
  guardianAddress: '',
  totalFee: '0',
  scholarship: '0',
  fine: '0',
  installments: '1',
  gpa: '',
  cgpa: '',
  mentor: '',
  photoUrl: '',
};

const filterFieldOptions = [
  { value: 'All', label: 'All students' },
  { value: 'Active', label: 'Active' },
  { value: 'Alumni', label: 'Alumni' },
  { value: 'Withdrawn', label: 'Withdrawn' },
];

const NAVY_BTN = 'inline-flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900';
const OUTLINE_BTN = 'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50';
const INPUT_FIELD = 'h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10';
const SELECT_FIELD = 'h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10';

const ALL_FORMAT_OPTIONS = ['All Capital', 'First Capital'];

const FORMAT_FIELDS = [
  'UID Number','SRN','PEN','Blood Group','Height','Weight','Student Name','First Name','Last Name','Date of Birth','Admission Date','Gender','Phone','Identification Mark','MotherTongue','Birth Place','Nationality','Religion','Social Category','Caste','Sub Caste','Other Languages','Medical History','BMI','Left Vision','Right Vision','Colour Vision','Left Glasses','Right Glasses','Oral Hygiene','Disease','Allergy','Current Medication','Address','City','State','Country','Pin Code','Correspondence Address','Correspondence City','Correspondence State','Correspondence Country','Correspondence Pin Code','Last School','Last School Board','Passing Out Course','Percentage Achieved','Father Name','Father Mobile','Father Email','Father DOB','Father UID','Father Qualification','Father Occupation','Father Organisation','Father Designation','Father Annual Income','Father Address','Father City','Father State','Father Country','Father Pin Code','Father Employee Of Institute','Mother Name','Mother Mobile','Mother Email','Mother DOB','Mother UID','Mother Qualification','Mother Occupation','Mother Organisation','Mother Designation','Mother Annual Income','Mother Address','Mother City','Mother State','Mother Country','Mother Pin Code','Mother Employee Of Institute','Guardian Name','Relation With Guardian','Guardian Mobile','Guardian Email','Guardian DOB','Guardian UID','Guardian Qualification','Guardian Occupation','Guardian Organisation','Guardian Designation','Guardian Annual Income','Guardian Address','Guardian City','Guardian State','Guardian Country','Guardian Pin Code','Guardian Employee Of Institute','Family Id','APARR ID','Student Ledger Master','Student Ledger Group Master','Student PEN','Area Type','Admission Course','Application Number','Ledger Name','Ledger Group Name','Admission Year','Expected Graduation Year','Domicile','Family Id','Gap Year','Account Holder Name','IFSC','Account Number','Bank Name','Bank Branch','Education Details1 Class','Education Details1 School','Education Details1 University','Education Details1 Passing Year','Education Details1 RollNo','Education Details1 Max Marks','Education Details1 Obtained Marks','Education Details1 Result','Education Details1 Percentage','Education Details1 Remark','Education Details1 School City','Education Details1 School State','Education Details2 Class','Education Details2 School','Education Details2 University','Education Details2 Passing Year','Education Details2 RollNo','Education Details2 Max Marks','Education Details2 Obtained Marks','Education Details2 Result','Education Details2 Percentage','Education Details2 Remark','Education Details2 School City','Education Details2 School State','Education Details3 Class','Education Details3 School','Education Details3 University','Education Details3 Passing Year','Education Details3 RollNo','Education Details3 Max Marks','Education Details3 Obtained Marks','Education Details3 Result','Education Details3 Percentage','Education Details3 Remark','Education Details3 School City','Education Details3 School State','Education Details4 Class','Education Details4 School','Education Details4 University','Education Details4 Passing Year','Education Details4 RollNo','Education Details4 Max Marks','Education Details4 Obtained Marks','Education Details4 Result','Education Details4 Percentage','Education Details4 Remark','Education Details4 School City','Education Details4 School State','Education Details4 Marksheet','Education Details5 Class','Education Details5 School','Education Details5 University','Education Details5 Passing Year','Education Details5 RollNo','Education Details5 Max Marks','Education Details5 Obtained Marks','Education Details5 Result','Education Details5 Percentage','Education Details5 Remark','Education Details5 School City','Education Details5 School State','Education Details5 Marksheet','Education Details6 Class','Education Details6 School','Education Details6 University','Education Details6 Passing Year','Education Details6 RollNo','Education Details6 Max Marks','Education Details6 Obtained Marks','Education Details6 Result','Education Details6 Percentage','Education Details6 Remark','Education Details6 School City','Education Details6 School State','Education Details6 Marksheet','Entrance Exam1 Name','Entrance Exam1 RollNo','Entrance Exam1 Score','Entrance Exam1 Rank','Entrance Exam2 Name','Entrance Exam2 RollNo','Entrance Exam2 Score','Entrance Exam2 Rank','Entrance Exam3 Name','Entrance Exam3 RollNo','Entrance Exam3 Score','Entrance Exam3 Rank','Entrance Exam4 Name','Entrance Exam4 RollNo','Entrance Exam4 Score','Entrance Exam4 Rank','Entrance Exam5 Name','Entrance Exam5 RollNo','Entrance Exam5 Score','Entrance Exam5 Rank','Qualifying Subject1 Name','Qualifying Subject1 Total Marks','Qualifying Subject1 Obtained Marks','Qualifying Subject2 Name','Qualifying Subject2 Total Marks','Qualifying Subject2 Obtained Marks','Qualifying Subject3 Name','Qualifying Subject3 Total Marks','Qualifying Subject3 Obtained Marks','Qualifying Subject4 Name','Qualifying Subject4 Total Marks','Qualifying Subject4 Obtained Marks','Qualifying Subject5 Name','Qualifying Subject5 Total Marks','Qualifying Subject5 Obtained Marks','Qualifying Exam Name','Qualifying Exam Roll No','Qualifying Exam Rank1','Qualifying Exam Rank2','Partner Institute Name','Actual Graduation Year','Nationality','Social Category','Email','House','Custom Field 1','Custom Field 2','Custom Field 3','Custom Field 4','Custom Field 5','Aadhaar Card Front','DOB Certificate','Father Aadhar Card','Mother Aadhar Card','Family Id','Aadhaar Card Back','Migration Certificate','Character Certificate','Education Details 1 Mark Sheet','Education Details 2 Mark Sheet','Education Details 3 Mark Sheet','Gap Year Certificate','Income Certificate','Caste Certificate','Domicile Certificate','Signature Doc','Father Pan Card','Mother Pan Card','Pan Card','Custom Doc 1','Custom Doc 2','Custom Doc 3','Custom Doc 4','Custom Doc 5','Father Photo','Mother Photo','Guardian Photo'
];
const parseCsvRows = (csvText) => {
  const rows = csvText.split(/\r?\n/).filter((row) => row.trim() !== '');
  const header = rows.shift()?.split(',').map((col) => col.trim().toLowerCase()) || [];
  return rows.map((row) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i += 1) {
      const char = row[i];
      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }
      if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
        continue;
      }
      current += char;
    }
    values.push(current);
    const record = {};
    header.forEach((key, index) => {
      record[key] = values[index]?.trim() || '';
    });
    return record;
  });
};

export default function StudentListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('first_name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [importing, setImporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [extraCourse, setExtraCourse] = useState('');
  const [extraSemester, setExtraSemester] = useState('');
  const [filterType, setFilterType] = useState('Course Wise');
  const [collegeFilter, setCollegeFilter] = useState('ALL');
  const [courseFilter, setCourseFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [feeCategoryFilter, setFeeCategoryFilter] = useState('');
  const [admissionCategoryFilter, setAdmissionCategoryFilter] = useState('');
  const [awakeStatusFilter, setAwakeStatusFilter] = useState('');
  const [tcStatusFilter, setTcStatusFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [showSetFormatModal, setShowSetFormatModal] = useState(false);
  const [formatOption, setFormatOption] = useState(ALL_FORMAT_OPTIONS[0]);
  const [selectedFormatFields, setSelectedFormatFields] = useState(new Set());
  const [formatError, setFormatError] = useState('');
  const [fieldsError, setFieldsError] = useState('');

  const queryParams = useMemo(() => {
    const params = {
      page,
      pageSize,
      sortBy,
      sortOrder: sortDirection,
    };

    if (search.trim()) {
      params.search = search.trim();
    }

    if (statusFilter !== 'All') {
      params.filter_field = 'status';
      params.filter_value = statusFilter;
      params.filter_operator = 'eq';
    }

    if (extraCourse) params.course = extraCourse;
    if (extraSemester) params.semester = extraSemester;
    if (collegeFilter) params.college = collegeFilter;
    if (courseFilter) params.course = courseFilter;
    if (semesterFilter) params.semester = semesterFilter;
    if (sectionFilter) params.section = sectionFilter;
    if (feeCategoryFilter) params.fee_category = feeCategoryFilter;
    if (admissionCategoryFilter) params.admission_category = admissionCategoryFilter;
    if (awakeStatusFilter) params.awake_status = awakeStatusFilter;
    if (tcStatusFilter) params.tc_status = tcStatusFilter;
    if (startDateFilter) params.start_date = startDateFilter;
    if (endDateFilter) params.end_date = endDateFilter;

    return params;
  }, [page, pageSize, search, statusFilter, sortBy, sortDirection, extraCourse, extraSemester, collegeFilter, courseFilter, semesterFilter, sectionFilter, feeCategoryFilter, admissionCategoryFilter, awakeStatusFilter, tcStatusFilter, startDateFilter, endDateFilter, filterType]);

  const {
    data: studentsData = {},
    isLoading: isLoadingStudents,
    isError: isStudentsError,
    error: studentsError,
  } = useResourceList('students', queryParams);

  const students = studentsData?.items || [];
  const totalStudents = studentsData?.total || 0;
  const pageCount = Math.max(1, Math.ceil(totalStudents / pageSize));

  const sampleStudents = [
    ...Array.from({ length: 10 }).map((_, i) => ({
      id: `sample-${i + 1}`,
      firstName: `Student${i + 1}`,
      lastName: `Example`,
      admissionNo: `ADM${1000 + i}`,
      email: `student${i + 1}@example.edu`,
      phone: `90000000${(10 + i).toString().padStart(2, '0')}`,
      status: i % 4 === 0 ? 'Alumni' : 'Active',
      meta: {
        photoUrl: '',
        universityRollNo: `UR${2000 + i}`,
        collegeName: 'Demo College',
        course: `Course ${((i % 3) + 1)}`,
        semester: `${(i % 8) + 1}`,
      },
    })),
  ];

  const createStudent = useCreateResource('students');
  const updateStudent = useUpdateResource('students');
  const deleteStudent = useDeleteResource('students');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: defaultFormValues });

  useEffect(() => {
    if (!isFormOpen) return;
    if (selectedStudent) {
      reset({
        admissionNo: selectedStudent.admissionNo || selectedStudent.admission_number || '',
        universityRollNo: selectedStudent.meta?.universityRollNo || selectedStudent.universityRollNo || '',
        firstName: selectedStudent.firstName || selectedStudent.first_name || '',
        lastName: selectedStudent.lastName || selectedStudent.last_name || '',
        email: selectedStudent.email || '',
        phone: selectedStudent.phone || '',
        dateOfBirth: selectedStudent.dateOfBirth || selectedStudent.date_of_birth || '',
        gender: selectedStudent.gender || '',
        status: selectedStudent.status || 'Active',
        admissionDate: selectedStudent.meta?.admissionDate || '',
        academicSession: selectedStudent.meta?.academicSession || '',
        collegeName: selectedStudent.meta?.collegeName || '',
        course: selectedStudent.meta?.course || '',
        department: selectedStudent.meta?.department || '',
        semester: selectedStudent.meta?.semester || '',
        section: selectedStudent.meta?.section || '',
        address: selectedStudent.meta?.address || '',
        emergencyContact: selectedStudent.meta?.emergencyContact || '',
        fatherName: selectedStudent.meta?.fatherName || '',
        motherName: selectedStudent.meta?.motherName || '',
        guardianName: selectedStudent.meta?.guardianName || '',
        guardianRelationship: selectedStudent.meta?.guardianRelationship || 'Guardian',
        guardianMobile: selectedStudent.meta?.guardianMobile || '',
        guardianEmail: selectedStudent.meta?.guardianEmail || '',
        guardianAddress: selectedStudent.meta?.guardianAddress || '',
        totalFee: selectedStudent.meta?.totalFee?.toString?.() || '0',
        scholarship: selectedStudent.meta?.scholarship?.toString?.() || '0',
        fine: selectedStudent.meta?.fine?.toString?.() || '0',
        installments: selectedStudent.meta?.installments?.toString?.() || '1',
        gpa: selectedStudent.meta?.gpa || '',
        cgpa: selectedStudent.meta?.cgpa || '',
        mentor: selectedStudent.meta?.mentor || '',
        photoUrl: selectedStudent.meta?.photoUrl || '',
      });
    } else {
      reset({
        ...defaultFormValues,
        admissionDate: new Date().toISOString().slice(0, 10),
      });
    }
  }, [isFormOpen, selectedStudent, reset]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortBy, sortDirection, pageSize]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  const openCreateForm = () => {
    setSelectedStudent(null);
    setIsFormOpen(true);
  };

  const openEditForm = (student) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setSelectedStudent(null);
    setIsFormOpen(false);
  };

  const openStudent = (student) => {
    navigate(`/students/${student.id}`);
  };

  const navigate = useNavigate();

  const toggleSelection = (studentId) => {
    setSelectedIds((current) =>
      current.includes(studentId) ? current.filter((id) => id !== studentId) : [...current, studentId],
    );
  };

  const toggleAll = () => {
    const ids = students.map((student) => student.id);
    const allSelected = ids.length > 0 && ids.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : ids);
  };

  const buildPayload = (values) => ({
    admission_number: values.admissionNo,
    first_name: values.firstName,
    last_name: values.lastName,
    email: values.email,
    phone: values.phone,
    date_of_birth: values.dateOfBirth,
    gender: values.gender,
    status: values.status,
    meta: {
      universityRollNo: values.universityRollNo,
      admissionDate: values.admissionDate,
      academicSession: values.academicSession,
      collegeName: values.collegeName,
      course: values.course,
      department: values.department,
      semester: values.semester,
      section: values.section,
      address: values.address,
      emergencyContact: values.emergencyContact,
      fatherName: values.fatherName,
      motherName: values.motherName,
      guardianName: values.guardianName,
      guardianRelationship: values.guardianRelationship,
      guardianMobile: values.guardianMobile,
      guardianEmail: values.guardianEmail,
      guardianAddress: values.guardianAddress,
      totalFee: Number(values.totalFee || 0),
      scholarship: Number(values.scholarship || 0),
      fine: Number(values.fine || 0),
      installments: Number(values.installments || 1),
      gpa: values.gpa,
      cgpa: values.cgpa,
      mentor: values.mentor,
      photoUrl: values.photoUrl,
    },
  });

  const handleSubmitForm = (values) => {
    const payload = buildPayload(values);
    const onSuccess = () => {
      closeForm();
      setPage(1);
      toast.success(selectedStudent ? 'Student updated successfully' : 'Student created successfully');
    };

    if (selectedStudent) {
      updateStudent.mutate({ id: selectedStudent.id, payload }, { onSuccess, onError: (error) => toast.error(error?.message || 'Unable to update student') });
      return;
    }

    createStudent.mutate(payload, { onSuccess, onError: (error) => toast.error(error?.message || 'Unable to create student') });
  };

  const handleDelete = (student) => {
    if (!window.confirm(`Delete ${student.firstName || student.name || 'this student'}?`)) return;
    deleteStudent.mutate(student.id, { onSuccess: () => toast.success('Student deleted successfully'), onError: (error) => toast.error(error?.message || 'Unable to delete student') });
  };

  const handleExportCsv = () => {
    const rows = students.map((student) => [
      student.photoUrl || student.meta?.photoUrl || '',
      `${student.firstName || ''} ${student.lastName || ''}`.trim(),
      student.admissionNo || student.admission_number || '',
      student.meta?.universityRollNo || '',
      [student.meta?.fatherName, student.meta?.motherName].filter(Boolean).join(', '),
      student.phone || student.contact?.phone || '',
      student.meta?.collegeName || '',
      `${student.meta?.course || ''}-${student.meta?.section || ''}`.trim(),
      student.meta?.semester || '',
      student.status,
    ]);
    const header = ['Photo', 'Name', 'Roll Number', 'University Roll No.', 'Parents Details', 'Mobile No', 'College', 'Course-Section', 'Semester', 'Status'];
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'student-list.csv';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleSetStudentDataFormat = () => {
    if (selectedIds.length === 0) {
      toast.info('Select one or more students to set data format');
      setShowActionMenu(false);
      return;
    }
    setShowActionMenu(false);
    setShowSetFormatModal(true);
  };

  const handleSyncStudentsToODPay = async () => {
    if (selectedIds.length === 0) {
      toast.info('Select one or more students to sync');
      setShowActionMenu(false);
      return;
    }
    // Placeholder: implement sync logic here (API call)
    toast.success(`Sync started for ${selectedIds.length} students`);
    setShowActionMenu(false);
  };

  const toggleFormatField = (field) => {
    setSelectedFormatFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  };

  const applySetFormat = async () => {
    setFormatError('');
    setFieldsError('');
    if (!formatOption) {
      setFormatError('Field required');
      return;
    }
    if (selectedFormatFields.size === 0) {
      setFieldsError('Field required');
      return;
    }
    // Placeholder: call API with selectedIds, Array.from(selectedFormatFields), and formatOption
    toast.success(`Formatting ${selectedIds.length} students (${selectedFormatFields.size} fields) using ${formatOption}`);
    setShowSetFormatModal(false);
    setSelectedFormatFields(new Set());
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportStatus('Reading Excel/CSV file...');
    try {
      const text = await file.text();
      const records = parseCsvRows(text);
      let imported = 0;
      await Promise.all(records.map(async (record) => {
        const payload = buildPayload({
          admissionNo: record['admission no'] || record['roll no'] || record['admission_number'] || '',
          universityRollNo: record['university roll no'] || record['university_roll_no'] || '',
          firstName: record['first name'] || '',
          lastName: record['last name'] || '',
          email: record.email || '',
          phone: record['mobile no'] || record.phone || '',
          dateOfBirth: record['date of birth'] || record.dob || '',
          gender: record.gender || '',
          status: record.status || 'Active',
          admissionDate: record['admission date'] || '',
          academicSession: record['academic session'] || '',
          collegeName: record.college || '',
          course: record.course || '',
          department: record.department || '',
          semester: record.semester || '',
          section: record.section || '',
          address: record.address || '',
          emergencyContact: record['emergency contact'] || '',
          fatherName: record['father name'] || '',
          motherName: record['mother name'] || '',
          guardianName: record['guardian name'] || '',
          guardianRelationship: record['guardian relationship'] || 'Guardian',
          guardianMobile: record['guardian mobile'] || '',
          guardianEmail: record['guardian email'] || '',
          guardianAddress: record['guardian address'] || '',
          totalFee: record['total fee'] || '0',
          scholarship: record.scholarship || '0',
          fine: record.fine || '0',
          installments: record.installments || '1',
          gpa: record.gpa || '',
          cgpa: record.cgpa || '',
          mentor: record.mentor || '',
          photoUrl: record.photo || record['photo url'] || '',
        });
        await createStudent.mutateAsync(payload);
        imported += 1;
      }));
      setImportStatus(`Imported ${imported} student records successfully.`);
      setPage(1);
    } catch (err) {
      setImportStatus(`Import failed: ${err?.message || 'Invalid file format.'}`);
    } finally {
      setImporting(false);
      event.target.value = null;
    }
  };

  const handleApplyFilters = () => {
    setExtraCourse(courseFilter || extraCourse);
    setExtraSemester(semesterFilter || extraSemester);
    setPage(1);
    setShowFilters(false);
  };

  const handleCancelFilters = () => {
    setShowFilters(false);
  };

  const effectiveStudents = students.length ? students : sampleStudents;

  const studentsRows = useMemo(() => effectiveStudents.map((student) => ({
    id: student.id,
    photo: student.meta?.photoUrl || student.photoUrl || '',
    name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
    rollNumber: student.admissionNo || student.admission_number || '',
    universityRollNumber: student.meta?.universityRollNo || '',
    parentsDetails: [student.meta?.fatherName, student.meta?.motherName, student.meta?.guardianName].filter(Boolean).join(' / '),
    mobile: student.phone || student.contact?.phone || '',
    collegeCourse: `${student.meta?.collegeName || ''}${student.meta?.course ? ` - ${student.meta.course}` : ''}`,
    semester: student.meta?.semester || '',
    status: student.status || 'Active',
    student,
  })), [effectiveStudents]);
  

  return (
    <>
      <div className="min-h-screen bg-[#f5f6fa] text-slate-900 overflow-x-hidden">
      <div className="w-full max-w-full pb-10 pt-6">
        <div className="mb-6 flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Student List' }]} />
              <div>
                <h1 className="text-3xl font-semibold text-slate-950">Student List</h1>
                <p className="mt-1 max-w-2xl text-sm text-slate-500">
                  Browse student records with backend paging, quick search, import, and registration management.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={openCreateForm} className={NAVY_BTN}>
                <FaPlus /> New Student
              </button>
              <label htmlFor="student-import-file" className={`${OUTLINE_BTN} cursor-pointer`}>
                <FaFileImport /> Import
              </label>
              <button type="button" onClick={() => setShowFilters((s) => !s)} className={OUTLINE_BTN}>
                Filter
              </button>
              <div className="relative">
                <button type="button" onClick={() => setShowActionMenu((s) => !s)} className={OUTLINE_BTN}>
                  Action
                </button>
                {showActionMenu && (
                  <div className="absolute right-0 mt-2 w-44 rounded-md border bg-white p-2 shadow-lg">
                    <button type="button" onClick={handleSetStudentDataFormat} className="w-full text-left px-2 py-2 text-sm hover:bg-slate-50 hover-gradient-border">Set Student Data Format</button>
                    <button type="button" onClick={handleSyncStudentsToODPay} className="w-full text-left px-2 py-2 text-sm hover:bg-slate-50 hover-gradient-border">Sync Students to OD Pay</button>
                    <div className="border-t my-1" />
                    <button type="button" onClick={handleExportCsv} className="w-full text-left px-2 py-2 text-sm hover:bg-slate-50 hover-gradient-border">Export CSV</button>
                    <button type="button" onClick={() => { setSelectedIds([]); setShowActionMenu(false); }} className="w-full text-left px-2 py-2 text-sm text-rose-600 hover:bg-slate-50">Clear Selection</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Student list</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Photo, roll numbers, contact, college and status in one place.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={handleExportCsv} className={OUTLINE_BTN}>
                  <FaPrint /> Export CSV
                </button>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.6fr_0.9fr_0.85fr]">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Search</label>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, roll number, phone, or college"
                  className={INPUT_FIELD}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Status</label>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={SELECT_FIELD}>
                  {filterFieldOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Sort by</label>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className={SELECT_FIELD}>
                  <option value="first_name">Name</option>
                  <option value="admission_number">Admission No</option>
                  <option value="status">Status</option>
                  <option value="phone">Phone</option>
                </select>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Filter</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2 text-sm text-slate-700">
                        Select College
                        <select value={collegeFilter} onChange={(e) => setCollegeFilter(e.target.value)} className={SELECT_FIELD}>
                          <option value="ALL">ALL, ROORKEE COLLEGE ...</option>
                          <option value="Demo College">Demo College</option>
                        </select>
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Select Course
                        <input value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} placeholder="B.Tech, M.Sc..." className={INPUT_FIELD} />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Select Semester
                        <input value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)} placeholder="Sem 1, Sem 3..." className={INPUT_FIELD} />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Select Section
                        <input value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} placeholder="A, B, C..." className={INPUT_FIELD} />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Select Fee Category
                        <select value={feeCategoryFilter} onChange={(e) => setFeeCategoryFilter(e.target.value)} className={SELECT_FIELD}>
                          <option value="">Any</option>
                          <option value="Regular">Regular</option>
                          <option value="Scholarship">Scholarship</option>
                        </select>
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Select Admission Category
                        <select value={admissionCategoryFilter} onChange={(e) => setAdmissionCategoryFilter(e.target.value)} className={SELECT_FIELD}>
                          <option value="">Any</option>
                          <option value="General">General</option>
                        </select>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Options</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2 text-sm text-slate-700">
                        Select Status
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={SELECT_FIELD}>
                          {filterFieldOptions.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
                        </select>
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Select Awake Status
                        <select value={awakeStatusFilter} onChange={(e) => setAwakeStatusFilter(e.target.value)} className={SELECT_FIELD}>
                          <option value="">Any</option>
                          <option value="Awake">Awake</option>
                        </select>
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Select TC Status
                        <select value={tcStatusFilter} onChange={(e) => setTcStatusFilter(e.target.value)} className={SELECT_FIELD}>
                          <option value="">Any</option>
                        </select>
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Select Filter Type
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={SELECT_FIELD}>
                          <option value="Course Wise">Course Wise</option>
                          <option value="College Wise">College Wise</option>
                        </select>
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Choose Start Date for Admission
                        <input type="date" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} className={INPUT_FIELD} />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Choose End Date for Admission
                        <input type="date" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} className={INPUT_FIELD} />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={handleCancelFilters} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover-gradient-border">Cancel</button>
                  <button type="button" onClick={handleApplyFilters} className="rounded-2xl bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white hover-gradient-border">Go →</button>
                </div>
              </div>
            )}

            <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white">
              <table className="student-list-table w-full table-fixed divide-y divide-slate-200 text-[11px] text-slate-900">
                <thead className="bg-[#1e3a5f] text-white">
                  <tr>
                    <th className="w-[40px] px-2 py-2 text-left font-semibold uppercase tracking-[0.18em] text-[10px] whitespace-nowrap">
                      <input type="checkbox" checked={students.length > 0 && students.every((student) => selectedIds.includes(student.id))} onChange={toggleAll} className="h-4 w-4 rounded border-slate-300 text-sky-600" />
                    </th>
                    <th className="w-[45px] px-2 py-2 text-left font-semibold uppercase tracking-[0.18em] text-[10px] whitespace-nowrap">Photo</th>
                    <th className="w-[18%] px-2 py-2 text-left font-semibold uppercase tracking-[0.18em] text-[10px] whitespace-nowrap">Name</th>
                    <th className="w-[8%] px-2 py-2 text-left font-semibold uppercase tracking-[0.18em] text-[10px] whitespace-nowrap">Roll Number</th>
                    <th className="w-[10%] px-2 py-2 text-left font-semibold uppercase tracking-[0.18em] text-[10px] whitespace-nowrap">University Roll No.</th>
                    <th className="w-[12%] px-2 py-2 text-left font-semibold uppercase tracking-[0.18em] text-[10px] whitespace-nowrap">Parents Details</th>
                    <th className="w-[8%] px-2 py-2 text-left font-semibold uppercase tracking-[0.18em] text-[10px] whitespace-nowrap">Mobile No</th>
                    <th className="w-[18%] px-2 py-2 text-left font-semibold uppercase tracking-[0.18em] text-[10px] whitespace-nowrap">College / Course-Section</th>
                    <th className="w-[6%] px-2 py-2 text-left font-semibold uppercase tracking-[0.18em] text-[10px] whitespace-nowrap">Semester</th>
                    <th className="w-[6%] px-2 py-2 text-left font-semibold uppercase tracking-[0.18em] text-[10px] whitespace-nowrap">Status</th>
                    <th className="w-[9%] px-2 py-2 text-left font-semibold uppercase tracking-[0.18em] text-[10px] whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {studentsRows.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="px-2 py-10 text-center text-[11px] text-slate-500">No students found. Try widening your search or filters.</td>
                    </tr>
                  ) : (
                    studentsRows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50">
                        <td className="px-2 py-2 align-top whitespace-nowrap text-[11px]">
                          <input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleSelection(row.id)} className="h-4 w-4 rounded border-slate-300 text-sky-600" />
                        </td>
                        <td className="px-2 py-2 align-top whitespace-nowrap text-[11px]">
                          <CircleAvatar src={row.photo} alt={row.name} name={row.name} sizeClass="h-8 w-8" />
                        </td>
                        <td className="px-2 py-2 align-top whitespace-nowrap text-[11px]">
                          <button type="button" onClick={() => openStudent(row.student)} className="text-left text-slate-900 hover:text-sky-600">
                            <div className="max-w-[150px] truncate font-semibold">{row.name || '—'}</div>
                            <div className="max-w-[170px] truncate text-[10px] text-slate-500">{row.student.email || 'No email'}</div>
                          </button>
                        </td>
                        <td className="px-2 py-2 align-top whitespace-nowrap text-[11px]">{row.rollNumber || '—'}</td>
                        <td className="px-2 py-2 align-top whitespace-nowrap text-[11px]">{row.universityRollNumber || '—'}</td>
                        <td className="px-2 py-2 align-top whitespace-nowrap text-[11px] max-w-[150px] truncate">{row.parentsDetails || '—'}</td>
                        <td className="px-2 py-2 align-top whitespace-nowrap text-[11px]">{row.mobile || '—'}</td>
                        <td className="px-2 py-2 align-top whitespace-nowrap text-[11px] max-w-[170px] truncate">{row.collegeCourse || '—'}</td>
                        <td className="px-2 py-2 align-top whitespace-nowrap text-[11px]">{row.semester || '—'}</td>
                        <td className="px-2 py-2 align-top whitespace-nowrap text-[11px]"><StatusBadge status={row.status} /></td>
                        <td className="px-2 py-2 align-top whitespace-nowrap text-[11px]">
                          <div className="flex flex-wrap items-center justify-center gap-1.5">
                            <WithPermission moduleKey="students" action="edit">
                              <button type="button" title="Edit" aria-label="Edit" onClick={() => openEditForm(row.student)} className="h-8 w-8 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 hover-gradient-border">
                                <FaEdit className="mx-auto" />
                              </button>
                            </WithPermission>
                            <WithPermission moduleKey="students" action="delete">
                              <button type="button" title="Delete" aria-label="Delete" onClick={() => handleDelete(row.student)} className="h-8 w-8 rounded-full border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 hover-gradient-border">
                                <FaTrash className="mx-auto" />
                              </button>
                            </WithPermission>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">Showing {effectiveStudents.length} of {totalStudents || effectiveStudents.length} students</p>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500">Rows</label>
                <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none">
                  {[10, 15, 20, 30].map((size) => (<option key={size} value={size}>{size}</option>))}
                </select>
              </div>
            </div>
            <div className="mt-4"><TablePagination page={page} pageCount={pageCount} onPageChange={setPage} /></div>
          </div>
        </div>
      </div>
    </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 p-4">
          <div className="mx-auto flex h-full max-h-[calc(100vh-2rem)] w-full max-w-[1200px] flex-col overflow-hidden rounded-[28px] bg-white text-slate-900 shadow-2xl ring-1 ring-slate-900/10">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{selectedStudent ? 'Edit student' : 'New student'}</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">{selectedStudent ? 'Update student profile' : 'Admission form'}</h2>
              </div>
              <button type="button" onClick={closeForm} className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-300 bg-slate-50 px-4 text-sm text-slate-700 transition hover:bg-slate-100 hover-gradient-border">Close</button>
            </div>
            <form onSubmit={handleSubmit(handleSubmitForm)} className="flex h-full flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="grid gap-6 lg:grid-cols-2">
                  <section className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Institution & academic</h3>
                      <p className="text-sm text-slate-500">College, course and semester details.</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2 text-sm text-slate-700">
                        College
                        <input type="text" {...register('collegeName')} placeholder="College name" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Course
                        <input type="text" {...register('course')} placeholder="Course" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Department
                        <input type="text" {...register('department')} placeholder="Department" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Semester
                        <input type="text" {...register('semester')} placeholder="Semester" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Section
                        <input type="text" {...register('section')} placeholder="Section" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Academic session
                        <input type="text" {...register('academicSession')} placeholder="2025-26" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Admission date
                        <input type="date" {...register('admissionDate')} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        University Roll No.
                        <input type="text" {...register('universityRollNo')} placeholder="University roll number" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                      </label>
                    </div>
                  </section>
                  <section className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Personal details</h3>
                      <p className="text-sm text-slate-500">Student identity and admission info.</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2 text-sm text-slate-700">
                        First name
                        <input type="text" {...register('firstName', { required: 'First name is required' })} placeholder="First name" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                        {errors.firstName && <p className="text-xs text-rose-500">{errors.firstName.message}</p>}
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Last name
                        <input type="text" {...register('lastName')} placeholder="Last name" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Admission number
                        <input type="text" {...register('admissionNo', { required: 'Admission number is required' })} placeholder="Admission number" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                        {errors.admissionNo && <p className="text-xs text-rose-500">{errors.admissionNo.message}</p>}
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Date of birth
                        <input type="date" {...register('dateOfBirth')} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Gender
                        <select {...register('gender')} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border">
                          <option value="">Select gender</option>
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                          <option value="O">Other</option>
                        </select>
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Status
                        <select {...register('status')} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border">
                          <option value="Active">Active</option>
                          <option value="Alumni">Alumni</option>
                          <option value="Withdrawn">Withdrawn</option>
                        </select>
                      </label>
                    </div>
                  </section>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <section className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Contact & address</h3>
                      <p className="text-sm text-slate-500">Phone, email and mailing address.</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2 text-sm text-slate-700">
                        Email
                        <input type="email" {...register('email', { required: 'Email is required' })} placeholder="Email" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                        {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Mobile
                        <input type="tel" {...register('phone', { required: 'Phone is required' })} placeholder="Mobile" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                        {errors.phone && <p className="text-xs text-rose-500">{errors.phone.message}</p>}
                      </label>
                      <label className="sm:col-span-2 space-y-2 text-sm text-slate-700">
                        Address
                        <textarea {...register('address')} rows="3" placeholder="Address" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                      </label>
                      <label className="sm:col-span-2 space-y-2 text-sm text-slate-700">
                        Emergency contact
                        <input type="text" {...register('emergencyContact')} placeholder="Emergency contact" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                      </label>
                    </div>
                  </section>

                  <section className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Family & accounting</h3>
                      <p className="text-sm text-slate-500">Parent details with fee and mentor fields.</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2 text-sm text-slate-700">
                        Father name
                        <input type="text" {...register('fatherName')} placeholder="Father name" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Mother name
                        <input type="text" {...register('motherName')} placeholder="Mother name" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Guardian name
                        <input type="text" {...register('guardianName')} placeholder="Guardian name" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Relationship
                        <select {...register('guardianRelationship')} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border">
                          <option value="Guardian">Guardian</option>
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Sibling">Sibling</option>
                        </select>
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Guardian phone
                        <input type="tel" {...register('guardianMobile')} placeholder="Guardian phone" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Guardian email
                        <input type="email" {...register('guardianEmail')} placeholder="Guardian email" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                      </label>
                      <label className="sm:col-span-2 space-y-2 text-sm text-slate-700">
                        Guardian address
                        <textarea {...register('guardianAddress')} rows="3" placeholder="Guardian address" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Total fee
                        <input type="number" {...register('totalFee')} step="0.01" min="0" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Scholarship
                        <input type="number" {...register('scholarship')} step="0.01" min="0" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Fine
                        <input type="number" {...register('fine')} step="0.01" min="0" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Installments
                        <input type="number" {...register('installments')} step="1" min="1" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        GPA
                        <input type="text" {...register('gpa')} placeholder="GPA" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        CGPA
                        <input type="text" {...register('cgpa')} placeholder="CGPA" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                      </label>
                      <label className="sm:col-span-2 space-y-2 text-sm text-slate-700">
                        Mentor
                        <input type="text" {...register('mentor')} placeholder="Mentor" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none hover-gradient-border" />
                      </label>
                    </div>
                  </section>
                </div>
              </div>
              <div className="border-t border-slate-200 bg-white px-6 py-4">
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <button type="button" onClick={closeForm} className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 hover-gradient-border">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60 hover-gradient-border">{selectedStudent ? 'Save changes' : 'Create student'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

        {showSetFormatModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
            <div className="mx-auto w-full max-w-4xl rounded-lg bg-white p-6 shadow-lg">
              <h3 className="text-xl font-semibold">Set Student Format Data</h3>
              <div className="mt-4 flex flex-col gap-4">
                <div className="space-y-2">
                  <label className="block text-sm text-slate-700">Select Format</label>
                  <select value={formatOption} onChange={(e) => setFormatOption(e.target.value)} className={SELECT_FIELD}>
                    {ALL_FORMAT_OPTIONS.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                  </select>
                  {formatError && <div className="text-rose-500 text-xs">{formatError}</div>}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm text-slate-700">Select Fields</label>
                  <div className="max-h-80 overflow-y-auto rounded-md border p-2">
                    <div className="flex flex-col">
                      {FORMAT_FIELDS.map((field) => (
                        <label key={field} className="flex items-center gap-2 py-1 text-sm">
                          <input type="checkbox" checked={selectedFormatFields.has(field)} onChange={() => toggleFormatField(field)} className="h-4 w-4" />
                          <span>{field}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {fieldsError && <div className="text-rose-500 text-xs">{fieldsError}</div>}
                </div>

                <div className="mt-2 text-sm text-slate-500">Selected students: <strong>{selectedIds.length}</strong> — Selected fields: <strong>{selectedFormatFields.size}</strong></div>
                <div className="mt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => { setShowSetFormatModal(false); setSelectedFormatFields(new Set()); setFormatError(''); setFieldsError(''); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700">Cancel</button>
                  <button type="button" onClick={applySetFormat} className="rounded-2xl bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white hover-gradient-border">Set Data →</button>
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
