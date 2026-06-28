import React, { useMemo, useState } from 'react';
import { usePermissions } from '../services/permissionHelpers.js';
import { useForm } from 'react-hook-form';
import { useResourceList, useCreateResource, useUpdateResource } from '../hooks/useResourceHooks';

function ExaminationAttendancePage() {
  const perms = usePermissions();
  const { data: attendanceData = {}, isLoading, refetch } = useResourceList('examinationAttendance', { page: 1, pageSize: 1000 });
  const { data: studentsData = {} } = useResourceList('students', { page: 1, pageSize: 1000 });
  const { data: examinationsData = {} } = useResourceList('examinations', { page: 1, pageSize: 1000 });
  const attendanceList = attendanceData.items || [];
  const students = studentsData.items || [];
  const examinations = examinationsData.items || [];
  const createAttendance = useCreateResource('examinationAttendance');
  const updateAttendance = useUpdateResource('examinationAttendance');
  const [selectedExam, setSelectedExam] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lockedExamId, setLockedExamId] = useState(null);

  const filteredAttendance = useMemo(() => {
    return attendanceList
      .filter((item) => (selectedExam ? item.examId === selectedExam : true))
      .filter((item) => {
        if (statusFilter === 'all') return true;
        return item.status === statusFilter;
      });
  }, [attendanceList, selectedExam, statusFilter]);

  const examOptions = useMemo(
    () => examinations.map((exam) => ({ value: exam.id, label: exam.name || exam.title || `Exam ${exam.id}` })),
    [examinations]
  );

  const { register, handleSubmit, reset, watch } = useForm({ defaultValues: { studentId: '', examId: '', status: 'present', notes: '' } });
  const watchExamId = watch('examId');

  const onSubmit = async (values) => {
    if (lockedExamId && values.examId === lockedExamId) {
      alert('Attendance for this exam is locked and cannot be changed.');
      return;
    }

    await createAttendance.mutateAsync({
      ...values,
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    reset({ studentId: '', examId: watchExamId || '', status: 'present', notes: '' });
    refetch();
  };

  const toggleLock = (examId) => {
    if (lockedExamId === examId) {
      setLockedExamId(null);
      return;
    }
    setLockedExamId(examId);
  };

  const markAll = async (status) => {
    const examItems = filteredAttendance.filter((item) => item.examId === selectedExam || !selectedExam);
    await Promise.all(examItems.map((item) => updateAttendance.mutateAsync({ id: item.id, status })));
    refetch();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Examination Attendance</h1>
          <p className="text-sm text-slate-500">Record and review exam attendance, lock final attendance sheets, and export summaries.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => toggleLock(watchExamId)} className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
            {lockedExamId === watchExamId ? 'Unlock Attendance' : 'Lock Attendance'}
          </button>
          <button type="button" onClick={() => markAll('present')} className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700">
            Mark All Present
          </button>
          <button type="button" onClick={() => markAll('absent')} className="rounded-md bg-rose-600 px-4 py-2 text-sm text-white hover:bg-rose-700">
            Mark All Absent
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Attendance Summary</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Total Records</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{attendanceList.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Present</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-600">{attendanceList.filter((item) => item.status === 'present').length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Absent</p>
              <p className="mt-2 text-2xl font-semibold text-rose-600">{attendanceList.filter((item) => item.status === 'absent').length}</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Filters</h2>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="text-sm text-slate-600">Exam</span>
              <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none">
                <option value="">All exams</option>
                {examOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-slate-600">Status</span>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none">
                <option value="all">All statuses</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>
            </label>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Add Attendance Record</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm text-slate-600">Student</span>
            <select {...register('studentId', { required: true })} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none">
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-slate-600">Exam</span>
            <select {...register('examId', { required: true })} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none">
              <option value="">Select exam</option>
              {examOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-slate-600">Status</span>
            <select {...register('status', { required: true })} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none">
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm text-slate-600">Notes</span>
            <textarea {...register('notes')} rows="3" className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none" />
          </label>

          <button type="submit" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 sm:col-span-2">
            Save Attendance
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Attendance Records</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Student</th>
                <th className="px-3 py-3">Exam</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Notes</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-3 py-4 text-center text-sm text-slate-500">Loading attendance records…</td>
                </tr>
              ) : filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-3 py-4 text-center text-sm text-slate-500">No attendance records found.</td>
                </tr>
              ) : (
                filteredAttendance.map((record) => {
                  const student = students.find((s) => s.id === record.studentId) || {};
                  const exam = examinations.find((e) => e.id === record.examId) || {};
                  return (
                    <tr key={record.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-700">{new Date(record.date).toLocaleDateString()}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-700">{student.name || record.studentId}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-700">{exam.name || exam.title || record.examId}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-700">{record.status}</td>
                      <td className="px-3 py-4 text-slate-700">{record.notes || '—'}</td>
                      <td className="px-3 py-4 text-slate-700">
                        <button type="button" onClick={() => updateAttendance.mutateAsync({ id: record.id, status: record.status === 'present' ? 'absent' : 'present' }).then(refetch)} className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50">
                          Toggle
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default ExaminationAttendancePage;
