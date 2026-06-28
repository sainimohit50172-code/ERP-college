import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { useResourceList, useCreateResource, useUpdateResource, useDeleteResource } from '../hooks/useResourceHooks';
import uploadService from '../api/uploadService';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaPrint,
  FaUserGraduate,
  FaFileImport,
  FaSort,
  FaFileInvoiceDollar,
  FaIdCard,
  FaUsers,
  FaBook,
  FaMoneyBill,
  FaUpload,
  FaDownload,
  FaClipboardCheck,
  FaShieldAlt,
} from 'react-icons/fa';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import FormField from '../components/forms/FormField.jsx';
import Modal from '../components/ui/Modal.jsx';
import { usePermissions } from '../services/permissionHelpers.js';
import WithPermission from '../components/auth/WithPermission.jsx';
import ExportButton from '../components/ui/ExportButton.jsx';

const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Closed', label: 'Closed' },
];

const feeStatusOptions = [
  { value: 'All', label: 'All fee statuses' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Partial', label: 'Partial' },
  { value: 'Pending', label: 'Pending' },
];

const documentTypes = [
  { key: 'aadhaar', label: 'Aadhaar' },
  { key: 'tenthMarksheet', label: '10th Marksheet' },
  { key: 'twelfthMarksheet', label: '12th Marksheet' },
  { key: 'transferCertificate', label: 'Transfer Certificate' },
  { key: 'migrationCertificate', label: 'Migration Certificate' },
  { key: 'characterCertificate', label: 'Character Certificate' },
  { key: 'categoryCertificate', label: 'Category Certificate' },
  { key: 'passportPhoto', label: 'Passport Photo' },
  { key: 'signature', label: 'Signature' },
];

const defaultFormValues = {
  name: '',
  email: '',
  rollNo: '',
  enrollmentNo: '',
  admissionNo: '',
  phone: '',
  admissionDate: '',
  academicSession: '',
  courseId: '',
  departmentId: '',
  semesterId: '',
  sectionId: '',
  status: 'Active',
  fatherName: '',
  motherName: '',
  guardianName: '',
  guardianRelationship: 'Guardian',
  guardianOccupation: '',
  guardianMobile: '',
  guardianEmail: '',
  guardianAddress: '',
  emergencyContact: '',
  totalFee: '0',
  scholarship: '0',
  fine: '0',
  installments: '1',
  gpa: '',
  cgpa: '',
  mentor: '',
  address: '',
};

export default function StudentManagementPage() {
  const queryClient = useQueryClient();
  const perms = usePermissions();
  const {
    data: studentsData,
    isLoading: isStudentsLoading,
    isError: isStudentsError,
    error: studentsError,
  } = useResourceList('students', { page: 1, pageSize: 200 });
  const students = studentsData?.items || [];

  const {
    data: coursesData,
    isLoading: isCoursesLoading,
    isError: isCoursesError,
    error: coursesError,
  } = useResourceList('courses', { page: 1, pageSize: 200 });
  const courses = coursesData?.items || [];

  const {
    data: semestersData,
    isLoading: isSemestersLoading,
    isError: isSemestersError,
    error: semestersError,
  } = useResourceList('semesters', { page: 1, pageSize: 200 });
  const semesters = semestersData?.items || [];

  const {
    data: sectionsData,
    isLoading: isSectionsLoading,
    isError: isSectionsError,
    error: sectionsError,
  } = useResourceList('sections', { page: 1, pageSize: 200 });
  const sections = sectionsData?.items || [];

  const {
    data: departmentsData,
    isLoading: isDepartmentsLoading,
    isError: isDepartmentsError,
    error: departmentsError,
  } = useResourceList('departments', { page: 1, pageSize: 200 });
  const departments = departmentsData?.items || [];

  const {
    data: subjectsData,
    isLoading: isSubjectsLoading,
    isError: isSubjectsError,
    error: subjectsError,
  } = useResourceList('subjects', { page: 1, pageSize: 200 });
  const subjects = subjectsData?.items || [];

  const {
    data: subjectAssignmentsData,
    isLoading: isSubjectAssignmentsLoading,
    isError: isSubjectAssignmentsError,
    error: subjectAssignmentsError,
  } = useResourceList('subjectAssignments', { page: 1, pageSize: 200 });
  const subjectAssignments = subjectAssignmentsData?.items || [];

  const {
    data: feePaymentsData,
    isLoading: isFeePaymentsLoading,
    isError: isFeePaymentsError,
    error: feePaymentsError,
  } = useResourceList('feePayments', { page: 1, pageSize: 200 });
  const feePayments = feePaymentsData?.items || [];

  const {
    data: internalMarksData,
    isLoading: isInternalMarksLoading,
    isError: isInternalMarksError,
    error: internalMarksError,
  } = useResourceList('internalMarks', { page: 1, pageSize: 200 });
  const internalMarks = internalMarksData?.items || [];

  const {
    data: practicalMarksData,
    isLoading: isPracticalMarksLoading,
    isError: isPracticalMarksError,
    error: practicalMarksError,
  } = useResourceList('practicalMarks', { page: 1, pageSize: 200 });
  const practicalMarks = practicalMarksData?.items || [];

  const {
    data: promotionsData,
    isLoading: isPromotionsLoading,
    isError: isPromotionsError,
    error: promotionsError,
  } = useResourceList('promotions', { page: 1, pageSize: 200 });
  const promotions = promotionsData?.items || [];

  const {
    data: attendanceData,
    isLoading: isAttendanceLoading,
    isError: isAttendanceError,
    error: attendanceError,
  } = useResourceList('studentAttendance', { page: 1, pageSize: 200 });
  const attendanceRecords = attendanceData?.items || [];

  const {
    data: resultsData,
    isLoading: isResultsLoading,
    isError: isResultsError,
    error: resultsError,
  } = useResourceList('results', { page: 1, pageSize: 200 });
  const results = resultsData?.items || [];

  const isLoadingData = isStudentsLoading || isCoursesLoading || isSemestersLoading || isSectionsLoading || isDepartmentsLoading || isSubjectsLoading || isSubjectAssignmentsLoading || isFeePaymentsLoading || isInternalMarksLoading || isPracticalMarksLoading || isPromotionsLoading || isAttendanceLoading || isResultsLoading;
  const isError = isStudentsError || isCoursesError || isSemestersError || isSectionsError || isDepartmentsError || isSubjectsError || isSubjectAssignmentsError || isFeePaymentsError || isInternalMarksError || isPracticalMarksError || isPromotionsError || isAttendanceError || isResultsError;
  const loadingError = studentsError || coursesError || semestersError || sectionsError || departmentsError || subjectsError || subjectAssignmentsError || feePaymentsError || internalMarksError || practicalMarksError || promotionsError || attendanceError || resultsError;

  const createStudent = useCreateResource('students');
  const updateStudent = useUpdateResource('students');
  const deleteStudent = useDeleteResource('students');
  const createSubjectAssignment = useCreateResource('subjectAssignments');
  const createFeePayment = useCreateResource('feePayments');
  const createPromotion = useCreateResource('promotions');
  const createAttendance = useCreateResource('studentAttendance');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [page, setPage] = useState(1);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [bulkSelected, setBulkSelected] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const importInputRef = useRef(null);
  const pageSize = 6;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: defaultFormValues });

  const {
    register: registerPayment,
    handleSubmit: handleSubmitPayment,
    reset: resetPayment,
    formState: { errors: errorsPayment, isSubmitting: isSubmittingPayment },
  } = useForm({ defaultValues: { amount: '', date: new Date().toISOString().slice(0, 10), method: 'Cash', remarks: '' } });

  const {
    register: registerSubject,
    handleSubmit: handleSubmitSubject,
    reset: resetSubject,
    formState: { errors: errorsSubject, isSubmitting: isSubmittingSubject },
  } = useForm({ defaultValues: { subjectId: '', credits: '3', teacherName: '', notes: '' } });

  const {
    register: registerPromotion,
    handleSubmit: handleSubmitPromotion,
    reset: resetPromotion,
    formState: { errors: errorsPromotion, isSubmitting: isSubmittingPromotion },
  } = useForm({ defaultValues: { newSemesterId: '', remarks: '' } });

  const {
    register: registerAttendance,
    handleSubmit: handleSubmitAttendance,
    reset: resetAttendance,
    formState: { errors: errorsAttendance, isSubmitting: isSubmittingAttendance },
  } = useForm({ defaultValues: { date: new Date().toISOString().slice(0, 10), status: 'Present', remarks: '' } });

  useEffect(() => {
    if (!selectedStudentId && filteredStudents.length) {
      setSelectedStudentId(filteredStudents[0].id);
    }
  }, [filteredStudents, selectedStudentId]);

  useEffect(() => {
    if (!isModalOpen && courses.length && semesters.length && sections.length && departments.length) {
      reset({
        ...defaultFormValues,
        courseId: courses[0].id,
        semesterId: semesters[0].id,
        sectionId: sections[0].id,
        departmentId: departments[0].id,
        admissionDate: new Date().toISOString().slice(0, 10),
      });
    }
  }, [courses, semesters, sections, departments, reset, isModalOpen]);

  const getLabel = (list, id, property = 'name') => list.find((item) => item.id === id)?.[property] || id || 'N/A';
  const formatCurrency = (value) => {
    const amount = typeof value === 'number' ? value : Number(value || 0);
    return Number.isNaN(amount) ? '$0.00' : `$${amount.toFixed(2)}`;
  };

  const allDepartments = [{ value: 'All', label: 'All departments' }, ...departments.map((department) => ({ value: department.name, label: department.name }))];

  const selectedStudent = useMemo(() => students.find((student) => student.id === selectedStudentId) || filteredStudents[0] || null, [students, selectedStudentId, filteredStudents]);

  const openCreateModal = () => {
    setSelectedStudentId(null);
    setIsModalOpen(true);
    if (courses.length && semesters.length && sections.length && departments.length) {
      reset({
        ...defaultFormValues,
        courseId: courses[0].id,
        semesterId: semesters[0].id,
        sectionId: sections[0].id,
        departmentId: departments[0].id,
        admissionDate: new Date().toISOString().slice(0, 10),
      });
    }
  };

  const openEditModal = (student) => {
    setSelectedStudentId(student.id);
    setIsModalOpen(true);
    reset({
      name: student.name || '',
      email: student.email || '',
      rollNo: student.rollNo || '',
      enrollmentNo: student.enrollmentNo || '',
      admissionNo: student.admissionNo || '',
      phone: student.phone || '',
      admissionDate: student.admissionDate || new Date().toISOString().slice(0, 10),
      academicSession: student.academicSession || '',
      courseId: student.courseId || courses[0]?.id || '',
      departmentId: student.departmentId || departments[0]?.id || '',
      semesterId: student.semesterId || semesters[0]?.id || '',
      sectionId: student.sectionId || sections[0]?.id || '',
      status: student.status || 'Active',
      fatherName: student.fatherName || '',
      motherName: student.motherName || '',
      guardianName: student.guardianName || '',
      guardianRelationship: student.guardianRelationship || 'Guardian',
      guardianOccupation: student.guardianOccupation || '',
      guardianMobile: student.guardianMobile || student.guardianPhone || '',
      guardianEmail: student.guardianEmail || '',
      guardianAddress: student.guardianAddress || student.address || '',
      emergencyContact: student.emergencyContact || '',
      totalFee: student.totalFee?.toString?.() || student.feeTotal?.toString?.() || '0',
      scholarship: student.scholarship?.toString?.() || '0',
      fine: student.fine?.toString?.() || '0',
      installments: student.installments?.toString?.() || '1',
      gpa: student.gpa || '',
      cgpa: student.cgpa || '',
      mentor: student.mentor || '',
      address: student.address || '',
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudentId(null);
    reset({
      ...defaultFormValues,
      courseId: courses[0]?.id || '',
      semesterId: semesters[0]?.id || '',
      sectionId: sections[0]?.id || '',
      departmentId: departments[0]?.id || '',
      admissionDate: new Date().toISOString().slice(0, 10),
    });
  };

  const sortValue = (student) => {
    const courseName = getLabel(courses, student.courseId, 'title');
    const semesterName = getLabel(semesters, student.semesterId, 'name');
    const sectionName = getLabel(sections, student.sectionId, 'name');
    const departmentName = getLabel(departments, student.departmentId, 'name');

    switch (sortBy) {
      case 'course':
        return courseName;
      case 'semester':
        return semesterName;
      case 'section':
        return sectionName;
      case 'department':
        return departmentName;
      case 'rollNo':
        return student.rollNo || '';
      case 'admissionNo':
        return student.admissionNo || '';
      case 'balance':
        return Number(student.balance || 0);
      default:
        return student[sortBy] || '';
    }
  };

  const filteredStudents = useMemo(() => {
    return students
      .filter((student) => {
        const searchTerm = search.toLowerCase();
        const courseName = getLabel(courses, student.courseId, 'title');
        const semesterName = getLabel(semesters, student.semesterId, 'name');
        const sectionName = getLabel(sections, student.sectionId, 'name');
        const departmentName = getLabel(departments, student.departmentId, 'name');
        const fields = [
          student.name,
          student.email,
          student.rollNo,
          student.enrollmentNo,
          student.admissionNo,
          student.phone,
          student.fatherName,
          student.motherName,
          student.guardianName,
          student.guardianMobile,
          student.guardianEmail,
          student.guardianAddress,
          student.emergencyContact,
          student.address,
          courseName,
          semesterName,
          sectionName,
          departmentName,
          student.status,
          student.feeStatus,
          student.totalFee,
        ];
        const matchesSearch = fields
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(searchTerm));
        const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
        const matchesDepartment = departmentFilter === 'All' || departmentName === departmentFilter;
        return matchesSearch && matchesStatus && matchesDepartment;
      })
      .sort((a, b) => {
        const valueA = String(sortValue(a)).toLowerCase();
        const valueB = String(sortValue(b)).toLowerCase();
        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [students, search, statusFilter, departmentFilter, courses, semesters, sections, departments, sortBy, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const displayedStudents = filteredStudents.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [pageCount, page]);

  const openStudent = (student) => {
    setSelectedStudentId(student.id);
  };

  const handleBulkToggle = (studentId) => {
    setBulkSelected((current) =>
      current.includes(studentId) ? current.filter((id) => id !== studentId) : [...current, studentId],
    );
  };

  const handleToggleAll = () => {
    const displayedIds = displayedStudents.map((student) => student.id);
    const allSelected = displayedIds.every((id) => bulkSelected.includes(id));
    setBulkSelected(allSelected ? [] : displayedIds);
  };

  const handleDeleteSelected = () => {
    if (!bulkSelected.length) return;
    if (!window.confirm(`Delete ${bulkSelected.length} selected student profiles?`)) return;
    bulkSelected.forEach((id) => deleteStudent.mutate(id));
    setBulkSelected([]);
  };

  const onSubmit = (formValues) => {
    const payload = {
      name: formValues.name,
      email: formValues.email,
      rollNo: formValues.rollNo,
      enrollmentNo: formValues.enrollmentNo,
      admissionNo: formValues.admissionNo,
      phone: formValues.phone,
      admissionDate: formValues.admissionDate,
      academicSession: formValues.academicSession,
      courseId: formValues.courseId,
      departmentId: formValues.departmentId,
      semesterId: formValues.semesterId,
      sectionId: formValues.sectionId,
      status: formValues.status,
      fatherName: formValues.fatherName,
      motherName: formValues.motherName,
      guardianName: formValues.guardianName,
      guardianRelationship: formValues.guardianRelationship,
      guardianOccupation: formValues.guardianOccupation,
      guardianMobile: formValues.guardianMobile,
      guardianEmail: formValues.guardianEmail,
      guardianAddress: formValues.guardianAddress,
      emergencyContact: formValues.emergencyContact,
      totalFee: Number(formValues.totalFee || 0),
      scholarship: Number(formValues.scholarship || 0),
      fine: Number(formValues.fine || 0),
      installments: Number(formValues.installments || 1),
      gpa: formValues.gpa,
      cgpa: formValues.cgpa,
      mentor: formValues.mentor,
      address: formValues.address,
    };

    if (selectedStudent) {
      updateStudent.mutate({ id: selectedStudent.id, payload }, {
        onSuccess: () => {
          closeModal();
          setPage(1);
        },
      });
      return;
    }

    createStudent.mutate(payload, {
      onSuccess: () => {
        closeModal();
        setPage(1);
      },
    });
  };

  const handleDelete = (student) => {
    if (!window.confirm(`Delete student profile for ${student.name}?`)) return;
    deleteStudent.mutate(student.id);
  };

  const handleDocumentUpload = async (documentType, file) => {
    if (!selectedStudent || !file) return;
    setUploadingDocument(documentType);
    setUploadStatus(`Uploading ${documentType}�`);
    try {
      const formData = new FormData();
      formData.append('studentId', selectedStudent.id);
      formData.append('documentType', documentType);
      formData.append('file', file);
      await uploadService.upload('students', formData);
      queryClient.invalidateQueries(['students']);
      setUploadStatus(`${documentType} uploaded successfully.`);
    } catch (error) {
      setUploadStatus(`Failed to upload ${documentType}.`);
    } finally {
      setUploadingDocument('');
    }
  };

  const handleExportCsv = () => {
    const rows = filteredStudents.map((student) => {
      const courseName = getLabel(courses, student.courseId, 'title');
      const semesterName = getLabel(semesters, student.semesterId, 'name');
      const sectionName = getLabel(sections, student.sectionId, 'name');
      const departmentName = getLabel(departments, student.departmentId, 'name');
      return [
        student.name,
        student.enrollmentNo,
        student.admissionNo,
        student.rollNo,
        student.email,
        student.phone,
        courseName,
        departmentName,
        semesterName,
        sectionName,
        student.academicSession,
        student.status,
        student.fatherName,
        student.motherName,
        student.guardianName,
        student.guardianRelationship,
        student.guardianOccupation,
        student.guardianMobile,
        student.guardianEmail,
        student.guardianAddress,
        student.emergencyContact,
        student.totalFee,
        student.scholarship,
        student.fine,
        student.installments,
        student.admissionDate,
      ];
    });
    const header = [
      'Name',
      'Enrollment No',
      'Admission No',
      'Roll No',
      'Email',
      'Phone',
      'Course',
      'Department',
      'Semester',
      'Section',
      'Academic Session',
      'Status',
      'Father',
      'Mother',
      'Guardian',
      'Guardian Relationship',
      'Guardian Occupation',
      'Guardian Mobile',
      'Guardian Email',
      'Guardian Address',
      'Emergency Contact',
      'Total Fee',
      'Scholarship',
      'Fine',
      'Installments',
      'Admission Date',
    ];
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value || '').replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'students.csv';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const parseCsv = (csvText) => csvText
    .split(/\r?\n/)
    .map((line) => {
      const values = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
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
      return values;
    })
    .filter((row) => row.some((cell) => cell.trim() !== ''));

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setImportStatus('Reading CSV file�');
      setImporting(true);
      const text = await file.text();
      const rows = parseCsv(text);
      const headers = rows.shift()?.map((header) => header.trim().toLowerCase()) || [];
      const requiredHeaders = ['name', 'email', 'course', 'semester', 'section', 'department', 'admissiondate'];
      const missingHeader = requiredHeaders.find((field) => !headers.includes(field));
      if (missingHeader) {
        setImportStatus(`CSV header is missing required field: ${missingHeader}`);
        return;
      }

      let successCount = 0;
      let failureCount = 0;

      for (const row of rows) {
        const getCell = (field) => row[headers.indexOf(field)]?.trim() || '';
        const studentName = getCell('name');
        const studentEmail = getCell('email');
        if (!studentName || !studentEmail) {
          failureCount += 1;
          continue;
        }

        const courseId = courses.find((course) => course.title?.toLowerCase() === getCell('course').toLowerCase())?.id || getCell('course');
        const semesterId = semesters.find((semester) => semester.name?.toLowerCase() === getCell('semester').toLowerCase())?.id || getCell('semester');
        const sectionId = sections.find((section) => section.name?.toLowerCase() === getCell('section').toLowerCase())?.id || getCell('section');
        const departmentId = departments.find((department) => department.name?.toLowerCase() === getCell('department').toLowerCase())?.id || getCell('department');

        try {
          await createStudent.mutateAsync({
            name: studentName,
            email: studentEmail,
            rollNo: getCell('roll no'),
            enrollmentNo: getCell('enrollment no'),
            admissionNo: getCell('admission no'),
            phone: getCell('phone'),
            fatherName: getCell('father'),
            motherName: getCell('mother'),
            guardianName: getCell('guardian'),
            guardianRelationship: getCell('guardian relationship'),
            guardianOccupation: getCell('guardian occupation'),
            guardianMobile: getCell('guardian mobile'),
            guardianEmail: getCell('guardian email'),
            guardianAddress: getCell('guardian address'),
            emergencyContact: getCell('emergency contact'),
            address: getCell('address'),
            courseId,
            semesterId,
            sectionId,
            departmentId,
            academicSession: getCell('academic session'),
            status: getCell('status') || 'Active',
            feeStatus: getCell('fee status') || 'Paid',
            totalFee: Number(getCell('total fee') || 0),
            scholarship: Number(getCell('scholarship') || 0),
            fine: Number(getCell('fine') || 0),
            installments: Number(getCell('installments') || 1),
            admissionDate: getCell('admissiondate'),
          });
          successCount += 1;
        } catch {
          failureCount += 1;
        }
      }

      setImportStatus(`Imported ${successCount} students${failureCount ? `, ${failureCount} failed` : ''}.`);
      setPage(1);
    } finally {
      setImporting(false);
      if (importInputRef.current) {
        importInputRef.current.value = '';
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedStudentPayments = selectedStudent ? feePayments.filter((payment) => payment.studentId === selectedStudent.id) : [];
  const selectedAttendance = selectedStudent ? attendanceRecords.filter((entry) => entry.studentId === selectedStudent.id) : [];
  const selectedInternalMarks = selectedStudent ? internalMarks.filter((mark) => mark.studentId === selectedStudent.id) : [];
  const selectedPracticalMarks = selectedStudent ? practicalMarks.filter((mark) => mark.studentId === selectedStudent.id) : [];
  const selectedSubjectAssignments = selectedStudent ? subjectAssignments.filter((assignment) => assignment.studentId === selectedStudent.id) : [];
  const selectedPromotions = selectedStudent ? promotions.filter((promotion) => promotion.studentId === selectedStudent.id) : [];
  const selectedResults = selectedStudent ? results.filter((result) => result.studentId === selectedStudent.id) : [];

  const studentCourse = selectedStudent ? getLabel(courses, selectedStudent.courseId, 'title') : 'N/A';
  const studentDepartment = selectedStudent ? getLabel(departments, selectedStudent.departmentId, 'name') : 'N/A';
  const studentSemester = selectedStudent ? getLabel(semesters, selectedStudent.semesterId, 'name') : 'N/A';
  const studentSection = selectedStudent ? getLabel(sections, selectedStudent.sectionId, 'name') : 'N/A';
  const studentSession = selectedStudent?.academicSession || '2025-2026';

  const totalPaid = selectedStudentPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
  const totalFee = Number(selectedStudent?.totalFee || selectedStudent?.feeTotal || 0);
  const scholarship = Number(selectedStudent?.scholarship || 0);
  const fine = Number(selectedStudent?.fine || 0);
  const installments = selectedStudent?.installments || selectedStudentPayments.length || 1;
  const dueAmount = Math.max(0, totalFee - totalPaid - scholarship + fine);

  const attendancePercent = selectedAttendance.length
    ? ((selectedAttendance.filter((entry) => entry.status === 'Present').length / selectedAttendance.length) * 100).toFixed(1)
    : 'N/A';

  const internalAverage = selectedInternalMarks.length
    ? (selectedInternalMarks.reduce((sum, mark) => sum + (Number(mark.score) || 0), 0) / selectedInternalMarks.length).toFixed(1)
    : 'N/A';
  const practicalAverage = selectedPracticalMarks.length
    ? (selectedPracticalMarks.reduce((sum, mark) => sum + (Number(mark.score) || 0), 0) / selectedPracticalMarks.length).toFixed(1)
    : 'N/A';

  const assignedSubjects = selectedSubjectAssignments.map((assignment) => ({
    subjectName: getLabel(subjects, assignment.subjectId, 'title'),
    credits: assignment.credits || 0,
    teacherName: assignment.teacherName || assignment.teacher || 'Unassigned',
  }));
  const totalCredits = assignedSubjects.reduce((sum, assignment) => sum + Number(assignment.credits || 0), 0);
  const mentor = selectedStudent?.mentor || assignedSubjects[0]?.teacherName || 'Unassigned';

  const studentDocuments = documentTypes.map((doc) => ({
    ...doc,
    url: selectedStudent?.documents?.find((item) => item.type === doc.key)?.url || selectedStudent?.[`${doc.key}Url`] || '',
  }));

  const studentInitials = selectedStudent?.name
    ? selectedStudent.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
    : 'ST';

  const timelineEvents = [
    selectedStudent?.admissionDate && {
      date: selectedStudent.admissionDate,
      title: 'Admission',
      description: `Student admitted to ${studentCourse} (${studentDepartment}) on ${selectedStudent.admissionDate}.`,
      icon: FaShieldAlt,
    },
    ...selectedStudentPayments.slice(-4).map((payment) => ({
      date: payment.date || payment.createdAt || '',
      title: 'Fee payment',
      description: `${formatCurrency(payment.amount)} received via ${payment.method || 'Unknown'}.`,
      icon: FaMoneyBill,
    })),
    ...selectedAttendance.slice(-3).map((entry) => ({
      date: entry.date || entry.createdAt || '',
      title: `Attendance ${entry.status}`,
      description: entry.remarks || `Marked ${entry.status}.`,
      icon: FaClipboardCheck,
    })),
    ...selectedResults.slice(-2).map((result) => ({
      date: result.updatedAt || result.date || '',
      title: 'Result updated',
      description: `Result posted for ${getLabel(subjects, result.subjectId, 'title')} with ${result.grade || result.percentage || 'N/A'}.`,
      icon: FaBook,
    })),
    ...selectedPromotions.slice(-2).map((promotion) => ({
      date: promotion.date || promotion.createdAt || '',
      title: 'Promotion',
      description: `Moved to ${getLabel(semesters, promotion.newSemesterId, 'name')} (${promotion.remarks || 'Promotion confirmed'}).`,
      icon: FaUsers,
    })),
    ...studentDocuments.filter((doc) => doc.url).map((doc) => ({
      date: selectedStudent?.updatedAt || selectedStudent?.admissionDate || '',
      title: `Document uploaded: ${doc.label}`,
      description: doc.url ? `Uploaded ${doc.label}.` : `Pending upload for ${doc.label}.`,
      icon: FaUpload,
    })),
  ]
    .filter(Boolean)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleNewPayment = (formValues) => {
    if (!selectedStudent) return;
    createFeePayment.mutate(
      {
        studentId: selectedStudent.id,
        amount: Number(formValues.amount || 0),
        date: formValues.date,
        method: formValues.method,
        remarks: formValues.remarks,
      },
      {
        onSuccess: () => {
          resetPayment({ amount: '', date: new Date().toISOString().slice(0, 10), method: 'Cash', remarks: '' });
          setIsPaymentModalOpen(false);
        },
      },
    );
  };

  const handleSubjectAssignment = (formValues) => {
    if (!selectedStudent) return;
    createSubjectAssignment.mutate(
      {
        studentId: selectedStudent.id,
        subjectId: formValues.subjectId,
        credits: Number(formValues.credits || 0),
        teacherName: formValues.teacherName,
        notes: formValues.notes,
      },
      {
        onSuccess: () => {
          resetSubject({ subjectId: '', credits: '3', teacherName: '', notes: '' });
          setIsSubjectModalOpen(false);
        },
      },
    );
  };

  const handlePromotion = (formValues) => {
    if (!selectedStudent) return;
    createPromotion.mutate(
      {
        studentId: selectedStudent.id,
        newSemesterId: formValues.newSemesterId,
        remarks: formValues.remarks,
      },
      {
        onSuccess: () => {
          resetPromotion({ newSemesterId: '', remarks: '' });
          setIsPromotionModalOpen(false);
        },
      },
    );
  };

  const handleAttendance = (formValues) => {
    if (!selectedStudent) return;
    createAttendance.mutate(
      {
        studentId: selectedStudent.id,
        date: formValues.date,
        status: formValues.status,
        remarks: formValues.remarks,
      },
      {
        onSuccess: () => {
          resetAttendance({ date: new Date().toISOString().slice(0, 10), status: 'Present', remarks: '' });
          setIsAttendanceModalOpen(false);
        },
      },
    );
  };

  const sectionRefs = {
    profile: useRef(null),
    academic: useRef(null),
    fee: useRef(null),
    documents: useRef(null),
    timeline: useRef(null),
  };

  const scrollToSection = (section) => {
    sectionRefs[section]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const enrichedRows = displayedStudents.map((student) => {
    const courseName = getLabel(courses, student.courseId, 'title');
    const semesterName = getLabel(semesters, student.semesterId, 'name');
    const sectionName = getLabel(sections, student.sectionId, 'name');
    const departmentName = getLabel(departments, student.departmentId, 'name');
    const isSelected = bulkSelected.includes(student.id);
    return [
      <input
        key={`${student.id}-checkbox`}
        type="checkbox"
        checked={isSelected}
        onChange={() => handleBulkToggle(student.id)}
        className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-sky-400"
      />,
      <button type="button" onClick={() => openStudent(student)} className="text-left">
        <div className="space-y-1">
          <p className="font-semibold text-white">{student.name}</p>
          <p className="text-sm text-slate-400">{student.email}</p>
        </div>
      </button>,
      student.rollNo || '-',
      courseName,
      semesterName,
      sectionName,
      departmentName,
      <StatusBadge key={`${student.id}-status`} status={student.status} />,
      <div className="space-y-1">
        <p className="text-sm text-slate-200">{student.feeStatus || 'Paid'}</p>
        <p className="text-xs text-slate-500">{formatCurrency(student.totalFee || student.balance || 0)}</p>
      </div>,
      <div className="inline-flex flex-wrap gap-2">
        <WithPermission moduleKey="students" action="edit">
          <button
            type="button"
            onClick={() => openEditModal(student)}
            className="rounded-3xl bg-slate-800/80 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
          >
            <FaEdit className="mr-2 inline-block" /> Edit
          </button>
        </WithPermission>
        <WithPermission moduleKey="students" action="delete">
          <button
            type="button"
            onClick={() => handleDelete(student)}
            className="rounded-3xl bg-rose-500/15 px-3 py-2 text-sm text-rose-300 transition hover:bg-rose-500/20"
          >
            <FaTrash className="mr-2 inline-block" /> Delete
          </button>
        </WithPermission>
      </div>,
    ];
  });

  return (
    <div className="space-y-8">
      <SectionHeader title="Student management" subtitle="Enterprise student profiles, admissions, academics, fees, documents and timeline." />

      {isLoadingData ? (
        <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-10 text-center text-slate-300">Loading student records�</div>
      ) : isError ? (
        <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-10 text-center text-slate-300">Unable to load student data. {loadingError?.message || 'Please try again later.'}</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Total students</p>
                <p className="mt-4 text-3xl font-semibold text-white">{students.length}</p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Students with due fee</p>
                <p className="mt-4 text-3xl font-semibold text-white">{students.filter((student) => Number(student.balance || student.totalFee || 0) > 0).length}</p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Active students</p>
                <p className="mt-4 text-3xl font-semibold text-white">{students.filter((student) => student.status === 'Active').length}</p>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Student roster</h2>
                  <p className="text-sm text-slate-400">Search learners, manage enrollment, and review profile activity.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {bulkSelected.length > 0 && (
                    <WithPermission moduleKey="students" action="delete">
                      <button
                        type="button"
                        onClick={handleDeleteSelected}
                        className="inline-flex items-center gap-2 rounded-3xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200 transition hover:bg-rose-500/20"
                      >
                        <FaTrash /> Delete selected ({bulkSelected.length})
                      </button>
                    </WithPermission>
                  )}
                  <WithPermission moduleKey="students" action="create">
                    <button
                      type="button"
                      onClick={openCreateModal}
                      className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
                    >
                      <FaPlus /> Add student
                    </button>
                  </WithPermission>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-3xl border border-white/10 bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700">
                    <FaFileImport /> Import CSV
                    <input type="file" accept=".csv" ref={importInputRef} onChange={handleImportFile} className="hidden" disabled={importing} />
                  </label>
                  <ExportButton onExcel={handleExportCsv} onPdf={handlePrint} onPrint={handlePrint} />
                </div>
              </div>

              {importStatus && <div className="mt-3 rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">{importStatus}</div>}

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
                <SearchFilter search={search} onSearch={setSearch} filter={statusFilter} onFilter={setStatusFilter} options={statusOptions} />
                <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 shadow-sm">
                  <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Department</label>
                  <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none">
                    {allDepartments.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/70 p-3">
                <FaSort className="h-4 w-4 text-slate-300" />
                <label className="text-sm text-slate-400">Sort by</label>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="min-w-[140px] rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400">
                  <option value="name">Name</option>
                  <option value="admissionNo">Admission No</option>
                  <option value="rollNo">Roll No</option>
                  <option value="course">Course</option>
                  <option value="semester">Semester</option>
                  <option value="department">Department</option>
                  <option value="balance">Fee Balance</option>
                </select>
                <button type="button" onClick={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))} className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 transition hover:bg-slate-800">{sortDirection === 'asc' ? 'Ascending' : 'Descending'}</button>
              </div>

              <div className="mt-6 overflow-x-auto">
                {filteredStudents.length === 0 ? (
                  <div className="rounded-[28px] border border-white/10 bg-slate-950/80 p-8 text-center text-slate-300">No matching students. Adjust the search, filter or sort options to display results.</div>
                ) : (
                  <DataTable columns={['Select', 'Student', 'Roll No', 'Course', 'Semester', 'Section', 'Department', 'Status', 'Fee', 'Actions']} rows={enrichedRows} />
                )}
              </div>

              <div className="mt-6">
                <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft" ref={sectionRefs.profile}>
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Profile summary</p>
                  <h2 className="text-xl font-semibold text-white">{selectedStudent?.name || 'Select a student'}</h2>
                </div>
                <div className="grid gap-3 sm:auto-cols-min sm:grid-flow-col">
                  <button type="button" onClick={() => selectedStudent && openEditModal(selectedStudent)} disabled={!selectedStudent} className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"><FaEdit /> Edit Profile</button>
                  <button type="button" onClick={() => setIsSubjectModalOpen(true)} disabled={!selectedStudent} className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:opacity-50"><FaBook /> Assign Subjects</button>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-[1fr_0.9fr]">
                <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-400/10 text-sky-300 text-2xl font-semibold">{studentInitials}</div>
                    <div>
                      <p className="text-sm text-slate-400">Enrollment number</p>
                      <p className="text-lg font-semibold text-white">{selectedStudent?.enrollmentNo || selectedStudent?.admissionNo || selectedStudent?.rollNo || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 text-sm text-slate-400">
                    <div className="grid grid-cols-[0.9fr_1.1fr] gap-4"><span className="font-medium text-slate-300">Admission no</span><span className="text-slate-200">{selectedStudent?.admissionNo || 'N/A'}</span></div>
                    <div className="grid grid-cols-[0.9fr_1.1fr] gap-4"><span className="font-medium text-slate-300">Course</span><span className="text-slate-200">{studentCourse}</span></div>
                    <div className="grid grid-cols-[0.9fr_1.1fr] gap-4"><span className="font-medium text-slate-300">Department</span><span className="text-slate-200">{studentDepartment}</span></div>
                    <div className="grid grid-cols-[0.9fr_1.1fr] gap-4"><span className="font-medium text-slate-300">Semester</span><span className="text-slate-200">{studentSemester}</span></div>
                    <div className="grid grid-cols-[0.9fr_1.1fr] gap-4"><span className="font-medium text-slate-300">Section</span><span className="text-slate-200">{studentSection}</span></div>
                    <div className="grid grid-cols-[0.9fr_1.1fr] gap-4"><span className="font-medium text-slate-300">Academic session</span><span className="text-slate-200">{studentSession}</span></div>
                    <div className="grid grid-cols-[0.9fr_1.1fr] gap-4"><span className="font-medium text-slate-300">Current status</span><span className="text-slate-200">{selectedStudent?.status || 'N/A'}</span></div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Quick actions</p>
                  <div className="mt-5 grid gap-3">
                    <button type="button" onClick={() => selectedStudent && openEditModal(selectedStudent)} disabled={!selectedStudent} className="inline-flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"><span>Edit student</span><FaEdit className="h-4 w-4" /></button>
                    <button type="button" onClick={() => setIsSubjectModalOpen(true)} disabled={!selectedStudent} className="inline-flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"><span>Assign subjects</span><FaBook className="h-4 w-4" /></button>
                    <button type="button" onClick={() => setIsAttendanceModalOpen(true)} disabled={!selectedStudent} className="inline-flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"><span>Mark attendance</span><FaClipboardCheck className="h-4 w-4" /></button>
                    <button type="button" onClick={() => setIsPaymentModalOpen(true)} disabled={!selectedStudent} className="inline-flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"><span>Collect fee</span><FaMoneyBill className="h-4 w-4" /></button>
                    <button type="button" onClick={handlePrint} className="inline-flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-800"><span>Print ID Card</span><FaIdCard className="h-4 w-4" /></button>
                    <button type="button" onClick={handlePrint} className="inline-flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-800"><span>Print fee receipt</span><FaFileInvoiceDollar className="h-4 w-4" /></button>
                    <button type="button" onClick={() => setIsPromotionModalOpen(true)} disabled={!selectedStudent} className="inline-flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"><span>Promote student</span><FaUsers className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft" ref={sectionRefs.academic}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Academic information</p>
                    <h3 className="text-xl font-semibold text-white">Subject allocations & performance</h3>
                  </div>
                  <span className="text-sm text-slate-400">Mentor: {mentor}</span>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5"><p className="text-sm text-slate-400">Allocated subjects</p><p className="mt-3 text-3xl font-semibold text-white">{assignedSubjects.length}</p></div>
                  <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5"><p className="text-sm text-slate-400">Total credits</p><p className="mt-3 text-3xl font-semibold text-white">{totalCredits}</p></div>
                  <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5"><p className="text-sm text-slate-400">Attendance</p><p className="mt-3 text-3xl font-semibold text-white">{attendancePercent}%</p></div>
                  <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5"><p className="text-sm text-slate-400">Current GPA/CGPA</p><p className="mt-3 text-3xl font-semibold text-white">{selectedStudent?.cgpa || selectedStudent?.gpa || 'Awaiting'}</p></div>
                </div>

                <div className="mt-6 overflow-x-auto rounded-[28px] border border-white/10 bg-slate-950/70">
                  <div className="grid grid-cols-[1.5fr_0.8fr_0.8fr] gap-4 px-5 py-4 text-sm uppercase tracking-[0.18em] text-slate-500"><span>Subject</span><span>Credits</span><span>Mentor</span></div>
                  <div className="divide-y divide-slate-900/70">
                    {assignedSubjects.length === 0 ? (<div className="px-5 py-6 text-sm text-slate-400">No subjects assigned yet.</div>) : (assignedSubjects.map((assignment, index) => (<div key={`${assignment.subjectName}-${index}`} className="grid grid-cols-[1.5fr_0.8fr_0.8fr] gap-4 px-5 py-4 text-sm text-slate-200"><span>{assignment.subjectName}</span><span>{assignment.credits}</span><span>{assignment.teacherName}</span></div>)))}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5"><p className="text-sm text-slate-400">Internal marks average</p><p className="mt-3 text-3xl font-semibold text-white">{internalAverage}</p></div>
                  <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5"><p className="text-sm text-slate-400">Practical marks average</p><p className="mt-3 text-3xl font-semibold text-white">{practicalAverage}</p></div>
                </div>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft" ref={sectionRefs.fee}>
                <div className="flex items-center justify-between gap-3">
                  <div><p className="text-sm uppercase tracking-[0.24em] text-slate-400">Fee summary</p><h3 className="text-xl font-semibold text-white">Account overview</h3></div>
                  <button type="button" onClick={() => setIsPaymentModalOpen(true)} disabled={!selectedStudent} className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:opacity-50"><FaMoneyBill /> New payment</button>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5"><p className="text-sm text-slate-400">Total fee</p><p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(totalFee)}</p></div>
                  <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5"><p className="text-sm text-slate-400">Paid</p><p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(totalPaid)}</p></div>
                  <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5"><p className="text-sm text-slate-400">Due</p><p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(dueAmount)}</p></div>
                  <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5"><p className="text-sm text-slate-400">Scholarship</p><p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(scholarship)}</p></div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5"><p className="text-sm text-slate-400">Fine</p><p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(fine)}</p></div>
                  <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5"><p className="text-sm text-slate-400">Installments</p><p className="mt-3 text-3xl font-semibold text-white">{installments}</p></div>
                </div>

                <div className="mt-6 overflow-x-auto rounded-[28px] border border-white/10 bg-slate-950/70">
                  <div className="grid gap-0 px-5 py-4 text-sm uppercase tracking-[0.18em] text-slate-500 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]"><span>Date</span><span>Amount</span><span>Method</span><span>Status</span></div>
                  <div className="divide-y divide-slate-900/70">
                    {selectedStudentPayments.length === 0 ? (<div className="px-5 py-6 text-sm text-slate-400">No payments logged yet.</div>) : (selectedStudentPayments.map((payment) => (<div key={payment.id} className="grid gap-0 px-5 py-4 text-sm text-slate-200 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]"><span>{payment.date || payment.createdAt || '�'}</span><span>{formatCurrency(payment.amount)}</span><span>{payment.method || '�'}</span><span>{payment.status || 'Completed'}</span></div>)))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft" ref={sectionRefs.documents}>
                <div className="flex items-center justify-between gap-3"><div><p className="text-sm uppercase tracking-[0.24em] text-slate-400">Documents</p><h3 className="text-xl font-semibold text-white">Verify student files</h3></div><div className="text-sm text-slate-400">Upload documents with the central upload service.</div></div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {studentDocuments.map((doc) => (
                    <div key={doc.key} className="rounded-[28px] border border-white/10 bg-slate-950/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div><p className="text-sm text-slate-400">{doc.label}</p><p className="mt-2 text-sm text-slate-200">{doc.url ? 'Uploaded' : 'Pending upload'}</p></div>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-3xl border border-white/10 bg-slate-800/80 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700 disabled:opacity-50">
                          {doc.url ? <FaDownload /> : <FaUpload />} {doc.url ? 'Replace' : 'Upload'}
                          <input type="file" accept=".jpg,.jpeg,.png,.pdf" hidden disabled={!selectedStudent || uploadingDocument === doc.key} onChange={(event) => handleDocumentUpload(doc.key, event.target.files?.[0])} />
                        </label>
                      </div>
                      {doc.url && (<a href={doc.url} target="_blank" rel="noreferrer" className="mt-4 block text-sm text-sky-300 underline">View file</a>)}
                    </div>
                  ))}
                </div>
                {uploadStatus && (<div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">{uploadStatus}</div>)}
              </div>

              <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft" ref={sectionRefs.timeline}>
                <div className="flex items-center justify-between gap-3"><div><p className="text-sm uppercase tracking-[0.24em] text-slate-400">Student timeline</p><h3 className="text-xl font-semibold text-white">Recent activity</h3></div><button type="button" onClick={handlePrint} className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700"><FaPrint /> Print timeline</button></div>
                <div className="mt-6 space-y-4">
                  {timelineEvents.length === 0 ? (<div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 text-sm text-slate-400">No timeline activity available for this student yet.</div>) : timelineEvents.map((event, index) => (<div key={`${event.title}-${index}`} className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5"><div className="flex items-center gap-3 text-sm text-slate-400"><event.icon className="h-4 w-4 text-sky-300" /><span>{event.date || 'Unknown date'}</span></div><h4 className="mt-3 text-lg font-semibold text-white">{event.title}</h4><p className="mt-2 text-sm text-slate-200">{event.description}</p></div>))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
