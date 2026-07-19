import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import DataTableAdvanced from '../components/ui/DataTableAdvanced.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useResourceList, useUpdateResource } from '../hooks/useResourceHooks';

export default function UpdateRollNumberPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [sortBy, setSortBy] = useState('first_name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryParams = useMemo(() => ({ page, pageSize, sortBy, sortOrder: sortDirection, search: search || undefined }), [page, pageSize, sortBy, sortDirection, search]);

  const { data: studentsData = {}, isLoading } = useResourceList('students', queryParams);
  const students = studentsData?.items || [];

  // Local sample data to show the table when backend is unavailable or returns no rows.
  const sampleStudents = [
    { id: 's-101', firstName: 'Aarav', lastName: 'Patel', admissionNo: 'ADM101', meta: { universityRollNo: 'U2023-101', fatherName: 'Ramesh Patel', collegeName: 'Science College', course: 'BSc', section: 'A', semester: '3', photoUrl: '' } },
    { id: 's-102', firstName: 'Meera', lastName: 'Sharma', admissionNo: 'ADM102', meta: { universityRollNo: 'U2023-102', fatherName: 'Suresh Sharma', collegeName: 'Arts College', course: 'BA', section: 'B', semester: '2', photoUrl: '' } },
    { id: 's-103', firstName: 'Rohan', lastName: 'Kumar', admissionNo: 'ADM103', meta: { universityRollNo: 'U2023-103', fatherName: 'Anil Kumar', collegeName: 'Engineering College', course: 'BTech', section: 'C', semester: '5', photoUrl: '' } },
    { id: 's-104', firstName: 'Ananya', lastName: 'Singh', admissionNo: 'ADM104', meta: { universityRollNo: 'U2023-104', fatherName: 'Deepak Singh', collegeName: 'Commerce College', course: 'BCom', section: 'A', semester: '4', photoUrl: '' } },
    { id: 's-105', firstName: 'Kabir', lastName: 'Rao', admissionNo: 'ADM105', meta: { universityRollNo: 'U2023-105', fatherName: 'Vikram Rao', collegeName: 'Management College', course: 'BBA', section: 'B', semester: '1', photoUrl: '' } },
    { id: 's-106', firstName: 'Nisha', lastName: 'Verma', admissionNo: 'ADM106', meta: { universityRollNo: 'U2023-106', fatherName: 'Rajesh Verma', collegeName: 'Computer Science College', course: 'BCA', section: 'C', semester: '3', photoUrl: '' } },
  ];

  const updateStudent = useUpdateResource('students');

  const columns = [
    { key: 'sno', label: 'S.No' },
    { key: 'photo', label: 'Student Photo', render: (val, row) => ((row.photo || row.photoUrl) ? <img src={row.photo || row.photoUrl} alt="photo" className="h-9 w-9 rounded-full object-cover" /> : <div className="h-9 w-9 rounded-full bg-slate-200" />) },
    { key: 'name', label: 'Student Name' },
    { key: 'rollNumber', label: 'Roll Number' },
    { key: 'universityRollNumber', label: 'University Roll Number' },
    { key: 'fatherName', label: 'Father Name' },
    { key: 'college', label: 'College' },
    { key: 'courseSection', label: 'Course-Section' },
    { key: 'semester', label: 'Semester' },
    { key: 'action', label: 'Action', render: (_, row) => (
      <button type="button" onClick={() => openModal(row)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold">Edit</button>
    ) },
  ];

  const sourceStudents = students.length > 0 ? students : sampleStudents;

  const rows = sourceStudents.map((student, idx) => ({
    id: student.id,
    sno: (page - 1) * pageSize + idx + 1,
    photo: student.meta?.photoUrl || student.photoUrl || student.photo || '',
    name: `${student.firstName || student.name || ''} ${student.lastName || ''}`.trim(),
    rollNumber: student.admissionNo || student.admission_number || '',
    universityRollNumber: student.meta?.universityRollNo || '',
    fatherName: student.meta?.fatherName || '',
    college: student.meta?.collegeName || '',
    courseSection: `${student.meta?.course || ''}-${student.meta?.section || ''}`.trim(),
    semester: student.meta?.semester || '',
    raw: student,
  }));

  const { register, handleSubmit, reset } = useForm({ defaultValues: { newRoll: '', newUniversityRoll: '' } });

  const openModal = (row) => {
    setSelectedStudent(row.raw);
    reset({ newRoll: row.rollNumber || '', newUniversityRoll: row.universityRollNumber || '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedStudent(null);
    setIsModalOpen(false);
  };

  const onSave = (values) => {
    if (!selectedStudent) return;
    const payload = {
      admission_number: values.newRoll || selectedStudent.admission_number || selectedStudent.admissionNo,
      meta: { ...selectedStudent.meta, universityRollNo: values.newUniversityRoll || '' },
    };
    updateStudent.mutate({ id: selectedStudent.id, payload }, {
      onSuccess: () => {
        toast.success('Roll numbers updated');
        closeModal();
      },
      onError: (err) => toast.error(err?.message || 'Unable to update roll number'),
    });
  };

  return (
    <div className="mt-[10px]">
      <div className="space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <h1 className="text-2xl font-semibold">Update Roll Number</h1>
          <p className="text-sm text-slate-600">Update admission and university roll numbers for students in bulk or individually.</p>
        </div>

        <DataTableAdvanced
          columns={columns}
          rows={rows}
          loading={isLoading}
          placeholder="Search students by name, roll, college..."
          initialPageSize={pageSize}
        />

        <Modal title="Update Roll Number" isOpen={isModalOpen} onClose={closeModal} footer={(
          <div>
            <button type="button" onClick={closeModal} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold mr-2">Cancel</button>
            <button type="button" onClick={handleSubmit(onSave)} className="rounded-2xl bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white">Save</button>
          </div>
        )}>
          {selectedStudent ? (
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Current Roll Number</label>
                  <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{selectedStudent.admissionNo || selectedStudent.admission_number || ''}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">New Roll Number</label>
                  <input type="text" {...register('newRoll')} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Current University Roll Number</label>
                  <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{selectedStudent.meta?.universityRollNo || ''}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">New University Roll Number</label>
                  <input type="text" {...register('newUniversityRoll')} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900" />
                </div>
              </div>
            </form>
          ) : null}
        </Modal>
      </div>
    </div>
  );
}
