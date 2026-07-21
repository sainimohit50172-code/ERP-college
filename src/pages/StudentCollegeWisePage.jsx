

import DataTable from '../components/ui/DataTable.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useResourceList, useCreateResource } from '../hooks/useResourceHooks';
import { useUpdateResource, useDeleteResource } from '../hooks/useResourceHooks';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import CircleAvatar from '../components/ui/CircleAvatar.jsx';
import IconActionButton from '../components/ui/IconActionButton.jsx';
import { UserPlus, Filter, Printer, Download } from 'lucide-react';

const NAVY_BTN = 'inline-flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900';
const OUTLINE_BTN = 'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50';

const defaultFormValues = {
  instituteCollege: '',
  college: '',
  rollNumber: '',
  course: '',
  semester: '',
  section: '',
  admissionCategory: '',
  feeCategory: '',
  branchId: '',
  studentName: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  dateOfBirthWords: '',
  gender: 'Male',
  aadharNo: '',
  apaarId: '',
  nationality: '',
  religion: '',
  socialCategory: '',
  admissionDate: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  district: '',
  country: '',
  pinCode: '',
  correspondenceAddress: '',
  correspondenceCity: '',
  correspondenceState: '',
  correspondenceCountry: '',
  correspondencePinCode: '',
  correspondenceDistrict: '',
  officialEmail: '',
  fatherName: '',
  fatherMobileNo: '',
  fatherQualification: '',
  fatherOccupation: '',
  motherName: '',
  motherMobileNo: '',
  motherQualification: '',
  motherOccupation: '',
  studentLedgerMaster: '',
  studentLedgerGroupMaster: '',
  accountHolderName: '',
  ifsc: '',
  accountNumber: '',
  bankName: '',
  bankBranch: '',
  tenthSchoolName: '',
  tenthBoardName: '',
  tenthPassingYear: '',
  tenthPercentage: '',
  twelfthSchoolName: '',
  twelfthBoardName: '',
  twelfthPassingYear: '',
  twelfthPercentage: '',
  diplomaInstituteName: '',
  diplomaBoardUniversity: '',
  diplomaPassingYear: '',
  diplomaPercentage: '',
  courseName: '',
  qualifyingExamRank1: '',
  qualifyingExamRank2: '',
  partnerInstituteName: '',
  ugInstituteName: '',
  universityName: '',
  ugPassingYear: '',
  ugPercentage: '',
  qualifyingSubject1Name: '',
  qualifyingSubject1TotalMarks: '',
  qualifyingSubject1ObtainedMarks: '',
  qualifyingSubject2Name: '',
  qualifyingSubject2TotalMarks: '',
  qualifyingSubject2ObtainedMarks: '',
  qualifyingSubject3Name: '',
  qualifyingSubject3TotalMarks: '',
  qualifyingSubject3ObtainedMarks: '',
  qualifyingSubject4Name: '',
  qualifyingSubject4TotalMarks: '',
  qualifyingSubject4ObtainedMarks: '',
  qualifyingSubject5Name: '',
  qualifyingSubject5TotalMarks: '',
  qualifyingSubject5ObtainedMarks: '',
};

const demoStudents = [
  {
    firstName: 'Aditya',
    lastName: 'Sharma',
    admissionNo: 'STU-1001',
    rollNo: '101',
    fatherName: 'Rajesh Sharma',
    motherName: 'Sunita Sharma',
    dob: '2005-08-12',
    gender: 'Male',
    phone: '9876543210',
    email: 'aditya.sharma@example.com',
    college: 'Roorkee College of Engineering',
    course: 'B.Tech. CSE',
    section: 'A',
    semester: '5',
    status: 'Active',
  },
  {
    firstName: 'Priya',
    lastName: 'Verma',
    admissionNo: 'STU-1002',
    rollNo: '102',
    fatherName: 'Amit Verma',
    motherName: 'Rekha Verma',
    dob: '2005-11-05',
    gender: 'Female',
    phone: '9123456780',
    email: 'priya.verma@example.com',
    college: 'Roorkee College of Engineering',
    course: 'B.Sc. Nursing',
    section: 'B',
    semester: '3',
    status: 'Active',
  },
  {
    firstName: 'Rahul',
    lastName: 'Kumar',
    admissionNo: 'STU-1003',
    rollNo: '103',
    fatherName: 'Sunil Kumar',
    motherName: 'Neetu Kumar',
    dob: '2004-03-22',
    gender: 'Male',
    phone: '9988776655',
    email: 'rahul.kumar@example.com',
    college: 'Roorkee College of Smart Computing',
    course: 'BCA Cyber Security',
    section: 'C',
    semester: '4',
    status: 'Active',
  },
  {
    firstName: 'Sneha',
    lastName: 'Joshi',
    admissionNo: 'STU-1004',
    rollNo: '104',
    fatherName: 'Vinod Joshi',
    motherName: 'Anjali Joshi',
    dob: '2006-02-17',
    gender: 'Female',
    phone: '9012345678',
    email: 'sneha.joshi@example.com',
    college: 'Roorkee College of Allied Health Sciences',
    course: 'B.Sc. Nursing',
    section: 'A',
    semester: '1',
    status: 'Active',
  },
  {
    firstName: 'Karan',
    lastName: 'Mehta',
    admissionNo: 'STU-1005',
    rollNo: '105',
    fatherName: 'Rakesh Mehta',
    motherName: 'Pooja Mehta',
    dob: '2004-07-29',
    gender: 'Male',
    phone: '9345678901',
    email: 'karan.mehta@example.com',
    college: 'Roorkee College of Business Studies',
    course: 'B.Com',
    section: 'D',
    semester: '6',
    status: 'Active',
  },
  {
    firstName: 'Nisha',
    lastName: 'Patel',
    admissionNo: 'STU-1006',
    rollNo: '106',
    fatherName: 'Jitendra Patel',
    motherName: 'Himani Patel',
    dob: '2005-01-09',
    gender: 'Female',
    phone: '8765432109',
    email: 'nisha.patel@example.com',
    college: 'Roorkee College of Engineering',
    course: 'B.Tech. Civil',
    section: 'B',
    semester: '2',
    status: 'Active',
  },
  {
    firstName: 'Vikram',
    lastName: 'Yadav',
    admissionNo: 'STU-1007',
    rollNo: '107',
    fatherName: 'Rajesh Yadav',
    motherName: 'Sita Yadav',
    dob: '2004-04-11',
    gender: 'Male',
    phone: '9456123780',
    email: 'vikram.yadav@example.com',
    college: 'Roorkee College of Smart Computing',
    course: 'B.Tech. AI & ML',
    section: 'A',
    semester: '7',
    status: 'Active',
  },
  {
    firstName: 'Anjali',
    lastName: 'Rao',
    admissionNo: 'STU-1008',
    rollNo: '108',
    fatherName: 'Manoj Rao',
    motherName: 'Savita Rao',
    dob: '2005-06-15',
    gender: 'Female',
    phone: '9023456781',
    email: 'anjali.rao@example.com',
    college: 'Roorkee College of Engineering',
    course: 'B.Tech. ECE',
    section: 'C',
    semester: '5',
    status: 'Active',
  },
  {
    firstName: 'Sameer',
    lastName: 'Singh',
    admissionNo: 'STU-1009',
    rollNo: '109',
    fatherName: 'Ashok Singh',
    motherName: 'Meena Singh',
    dob: '2004-10-02',
    gender: 'Male',
    phone: '9234567890',
    email: 'sameer.singh@example.com',
    college: 'Roorkee College of Business Studies',
    course: 'BBA',
    section: 'B',
    semester: '4',
    status: 'Active',
  },
  {
    firstName: 'Ritika',
    lastName: 'Gupta',
    admissionNo: 'STU-1010',
    rollNo: '110',
    fatherName: 'Sunil Gupta',
    motherName: 'Kavita Gupta',
    dob: '2006-09-20',
    gender: 'Female',
    phone: '9123456792',
    email: 'ritika.gupta@example.com',
    college: 'Roorkee College of Smart Computing',
    course: 'BCA Data Science',
    section: 'D',
    semester: '2',
    status: 'Active',
  },
];

function mapStudentsToRows(students) {
  if (!students || !Array.isArray(students)) return [];
  
  return students.map((s, idx) => {
    // Optimized field access with fallbacks
    const fullName = s.name || `${(s.firstName || '').trim()} ${(s.lastName || '').trim()}`.trim();
    
    return {
      checkbox: false,
      sno: idx + 1,
      photo: s.photo || null,
      name: fullName,
      admissionNo: s.admissionNo || s.admission_no || '-',
      rollNo: s.rollNo || s.roll_no || '-',
      fatherName: s.fatherName || s.father_name || '-',
      motherName: s.motherName || s.mother_name || '-',
      dob: s.dob || s.date_of_birth || '-',
      gender: s.gender || '-',
      phone: s.phone || s.contact?.phone || '-',
      email: s.email || s.contact?.email || '-',
      college: s.college || '-',
      course: s.courseSection || s.course || '-',
      section: s.section || '-',
      semester: s.semester || '-',
      status: s.status || 'Active',
      raw: s,
    };
  });
}

export default function StudentCollegeWisePage() {
  const [queryParams, setQueryParams] = useState({ page: 1, pageSize: 15 });
  const { data: studentsData, isLoading, isError, error } = useResourceList('students', queryParams);
  
  // Use demo data immediately as fallback, merge with API data when available
  const students = useMemo(() => {
    if (studentsData?.items?.length) {
      return studentsData.items;
    }
    // Use demo data immediately while loading
    return demoStudents;
  }, [studentsData]);

  const rows = useMemo(() => mapStudentsToRows(students), [students]);

  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const createStudent = useCreateResource('students');
  const updateStudent = useUpdateResource('students');
  const deleteStudent = useDeleteResource('students');

  const { register, handleSubmit, reset } = useForm({ defaultValues: defaultFormValues });

  useEffect(() => { reset(defaultFormValues); }, [reset]);

  // Cached filter options - only recalculate when students changes
  const filterOptions = useMemo(() => ({
    colleges: [...new Set(students.map(s => s.college).filter(Boolean))],
    courses: [...new Set(students.map(s => s.course || s.courseSection).filter(Boolean))],
    semesters: [...new Set(students.map(s => s.semester).filter(Boolean))],
    sections: [...new Set(students.map(s => s.section).filter(Boolean))],
  }), [students]);

  const columns = [
    { label: '', key: 'checkbox', sortable: false, render: (val) => <input type="checkbox" className="h-3 w-3 cursor-pointer hover-gradient-border" /> },
    { label: 'S.No', key: 'sno', sortable: true },
    { label: 'Photo', key: 'photo', sortable: false, render: (val, row) => (
      <div className="flex justify-center">
        <CircleAvatar src={val} alt={row?.name || 'student-photo'} name={row?.name || 'Student'} sizeClass="h-8 w-8" />
      </div>
    ) },
    { label: 'Name', key: 'name', sortable: true },
    { label: 'Admission No', key: 'admissionNo', sortable: true },
    { label: 'Roll No', key: 'rollNo', sortable: true },
    { label: 'Father Name', key: 'fatherName', sortable: true },
    { label: 'Mother Name', key: 'motherName', sortable: true },
    { label: 'DOB', key: 'dob', sortable: true },
    { label: 'Gender', key: 'gender', sortable: true },
    { label: 'Mobile No', key: 'phone', sortable: true },
    { label: 'Email', key: 'email', sortable: true },
    { label: 'College', key: 'college', sortable: true },
    { label: 'Course', key: 'course', sortable: true },
    { label: 'Section', key: 'section', sortable: true },
    { label: 'Semester', key: 'semester', sortable: true },
    { label: 'Status', key: 'status', sortable: true, render: (val) => <StatusBadge status={val} /> },
    { label: 'Actions', key: 'actions', sortable: false, render: (v, row) => (
      <div className="inline-flex gap-2">
        <IconActionButton
          icon={Edit3}
          title="Edit student"
          ariaLabel="Edit student"
          variant="primary"
          className="h-8 w-8"
          onClick={() => {
            const raw = row.raw || row;
            setEditingStudent(raw);
            reset({ ...defaultFormValues, ...raw });
            setShowModal(true);
          }}
        />
        <IconActionButton
          icon={Trash2}
          title="Delete student"
          ariaLabel="Delete student"
          variant="danger"
          className="h-8 w-8"
          onClick={async () => {
            const raw = row.raw || row;
            if (!window.confirm(`Delete student ${raw.name || raw.firstName || raw.admissionNo || ''}?`)) return;
            try {
              await deleteStudent.mutateAsync(raw.id || raw.admissionNo || raw.admission_no);
              toast.success('Student deleted');
            } catch (err) {
              toast.error(err?.message || 'Could not delete student');
            }
          }}
        />
      </div>
    ) },
  ];

  const onSubmit = async (data) => {
    try {
      if (editingStudent) {
        const id = editingStudent.id || editingStudent.admissionNo || editingStudent.admission_no;
        await updateStudent.mutateAsync({ id, payload: data });
        toast.success('Student updated successfully.');
      } else {
        await createStudent.mutateAsync(data);
        toast.success('Student record created successfully.');
      }
      reset(defaultFormValues);
      setShowModal(false);
      setEditingStudent(null);
    } catch (error) {
      toast.error(error?.message || 'Failed to save student.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] text-slate-900 overflow-x-hidden">
      <div className="w-full max-w-full pb-10 pt-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Dashboard &gt; Student List College Wise</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">Student List College Wise</h1>
              <p className="mt-1 text-sm text-slate-500">List of Students College Wise</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className={`hover-gradient-border OUTLINE_BTN`} onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print All ID Cards
              </button>
              <button type="button" className={OUTLINE_BTN}>
                <Filter className="h-4 w-4" /> Filter
              </button>
              <button type="button" className={`hover-gradient-border NAVY_BTN`} onClick={() => setShowModal(true)}>
                <UserPlus className="h-4 w-4" /> New Student
              </button>
              <button type="button" className={`hover-gradient-border NAVY_BTN`} onClick={() => { /* DataTable export already available */ }}>
                <Download className="h-4 w-4" /> Export To Excel
              </button>
              <button type="button" className={`hover-gradient-border NAVY_BTN`} onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <DataTable columns={columns} rows={rows} loading={isLoading} initialPageSize={20} placeholder="Search students" />
        </div>
      </div>

      {showModal && (
        <Modal isOpen={true} onClose={() => setShowModal(false)} title="Add Student">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">Institute Info</h2>
                <div className="grid gap-3">
                  <input {...register('instituteCollege')} placeholder="Institute / College" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('college')} placeholder="College" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('rollNumber')} placeholder="Roll Number" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('course')} placeholder="Course" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('semester')} placeholder="Semester" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('section')} placeholder="Section" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('admissionCategory')} placeholder="Admission Category" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('feeCategory')} placeholder="Fee Category" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('branchId')} placeholder="Branch Id" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                </div>
              </div>
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">Personal Details</h2>
                <div className="grid gap-3">
                  <input {...register('studentName')} placeholder="Student Name" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('firstName')} placeholder="Student First Name" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('lastName')} placeholder="Student Last Name" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('dateOfBirth')} placeholder="Date of Birth" type="date" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('dateOfBirthWords')} placeholder="Date of Birth In Words" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <select {...register('gender')} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <input {...register('aadharNo')} placeholder="Aadhar No." className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('apaarId')} placeholder="APAAR ID" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('nationality')} placeholder="Nationality" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('religion')} placeholder="Religion" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('socialCategory')} placeholder="Social Category" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                </div>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">Contact Details</h2>
                <div className="grid gap-3">
                  <input {...register('admissionDate')} placeholder="Admission Date" type="date" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('phone')} placeholder="Phone No." className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('email')} placeholder="Email" type="email" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('officialEmail')} placeholder="Official Email" type="email" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('address')} placeholder="Address" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('city')} placeholder="City" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('state')} placeholder="State" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('district')} placeholder="District" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('country')} placeholder="Country" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('pinCode')} placeholder="Pin Code" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                </div>
              </div>
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">Correspondence Address</h2>
                <div className="grid gap-3">
                  <input {...register('correspondenceAddress')} placeholder="Correspondence Address" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('correspondenceCity')} placeholder="Correspondence City" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('correspondenceState')} placeholder="Correspondence State" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('correspondenceCountry')} placeholder="Correspondence Country" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('correspondencePinCode')} placeholder="Correspondence Pin Code" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('correspondenceDistrict')} placeholder="Correspondence District" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                </div>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">Parent Details</h2>
                <div className="grid gap-3">
                  <input {...register('fatherName')} placeholder="Father Name" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('fatherMobileNo')} placeholder="Father Mobile No." className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('fatherQualification')} placeholder="Father Qualification" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('fatherOccupation')} placeholder="Father Occupation" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('motherName')} placeholder="Mother Name" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('motherMobileNo')} placeholder="Mother Mobile No" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('motherQualification')} placeholder="Mother Qualification" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('motherOccupation')} placeholder="Mother Occupation" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                </div>
              </div>
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">Accounting & Bank</h2>
                <div className="grid gap-3">
                  <input {...register('studentLedgerMaster')} placeholder="Student Ledger Master" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('studentLedgerGroupMaster')} placeholder="Student Ledger Group Master" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('accountHolderName')} placeholder="Account Holder Name" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('ifsc')} placeholder="IFSC" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('accountNumber')} placeholder="Account Number" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('bankName')} placeholder="Bank Name" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('bankBranch')} placeholder="Bank Branch" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                </div>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">Academic Details</h2>
                <div className="grid gap-3">
                  <input {...register('tenthSchoolName')} placeholder="10th School Name" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('tenthBoardName')} placeholder="10th Board Name" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('tenthPassingYear')} placeholder="10th Passing Year" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('tenthPercentage')} placeholder="10th Percentage Achieved" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('twelfthSchoolName')} placeholder="12th School Name" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('twelfthBoardName')} placeholder="12th Board Name" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('twelfthPassingYear')} placeholder="12th Passing Year" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('twelfthPercentage')} placeholder="12th Percentage Achieved" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                </div>
              </div>
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">Additional Qualifications</h2>
                <div className="grid gap-3">
                  <input {...register('diplomaInstituteName')} placeholder="Diploma Institute Name" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('diplomaBoardUniversity')} placeholder="Board / University" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('diplomaPassingYear')} placeholder="Passing Year" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('diplomaPercentage')} placeholder="Percentage Achieved" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('courseName')} placeholder="Course Name" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('qualifyingExamRank1')} placeholder="Qualifying Exam Rank1" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('qualifyingExamRank2')} placeholder="Qualifying Exam Rank2" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('partnerInstituteName')} placeholder="Partner Institute Name" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                </div>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">Undergraduate Details</h2>
                <div className="grid gap-3">
                  <input {...register('ugInstituteName')} placeholder="UG Institute Name" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('universityName')} placeholder="University Name" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('ugPassingYear')} placeholder="Passing Year" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('ugPercentage')} placeholder="Percentage Achieved" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                </div>
              </div>
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">Qualifying Subjects</h2>
                <div className="grid gap-3">
                  <input {...register('qualifyingSubject1Name')} placeholder="Qualifying Subject1 Name" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('qualifyingSubject1TotalMarks')} placeholder="Qualifying Subject1 Total Marks" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('qualifyingSubject1ObtainedMarks')} placeholder="Qualifying Subject1 Obtained Marks" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('qualifyingSubject2Name')} placeholder="Qualifying Subject2 Name" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('qualifyingSubject2TotalMarks')} placeholder="Qualifying Subject2 Total Marks" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('qualifyingSubject2ObtainedMarks')} placeholder="Qualifying Subject2 Obtained Marks" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('qualifyingSubject3Name')} placeholder="Qualifying Subject3 Name" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('qualifyingSubject3TotalMarks')} placeholder="Qualifying Subject3 Total Marks" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('qualifyingSubject3ObtainedMarks')} placeholder="Qualifying Subject3 Obtained Marks" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('qualifyingSubject4Name')} placeholder="Qualifying Subject4 Name" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('qualifyingSubject4TotalMarks')} placeholder="Qualifying Subject4 Total Marks" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('qualifyingSubject4ObtainedMarks')} placeholder="Qualifying Subject4 Obtained Marks" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('qualifyingSubject5Name')} placeholder="Qualifying Subject5 Name" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('qualifyingSubject5TotalMarks')} placeholder="Qualifying Subject5 Total Marks" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                  <input {...register('qualifyingSubject5ObtainedMarks')} placeholder="Qualifying Subject5 Obtained Marks" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover-gradient-border" />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-2xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700">Cancel</button>
              <button type="submit" className="rounded-2xl bg-[#1e3a5f] px-6 py-2 text-sm font-semibold text-white hover-gradient-border">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
