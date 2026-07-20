import { useMemo, useState } from 'react';
import { useResourceList, useCreateResource } from '../hooks/useResourceHooks';
function InvigilatorAssignmentPage() {
  const { data: assignmentsData = {}, isLoading, refetch } = useResourceList('invigilatorAssignments', { page: 1, pageSize: 1000 });
  const { data: teachersData = {} } = useResourceList('teachers', { page: 1, pageSize: 1000 });
  const { data: classroomsData = {} } = useResourceList('classrooms', { page: 1, pageSize: 1000 });
  const { data: examinationsData = {} } = useResourceList('examinations', { page: 1, pageSize: 1000 });
  const assignments = assignmentsData.items || [];
  const teachers = teachersData.items || [];
  const classrooms = classroomsData.items || [];
  const examinations = examinationsData.items || [];
  const createAssignment = useCreateResource('invigilatorAssignments');
  const [selectedExam, _setSelectedExam] = useState('');
  const [selectedTeacher, _setSelectedTeacher] = useState('');
  const [selectedRoom, _setSelectedRoom] = useState('');
  const examOptions = useMemo(() => examinations.map((exam) => ({ value: exam.id, label: exam.name || exam.title || `Exam ${exam.id}` })), [examinations]);
  const teacherOptions = useMemo(() => teachers.map((teacher) => ({ value: teacher.id, label: teacher.name })), [teachers]);
  const roomOptions = useMemo(() => classrooms.map((room) => ({ value: room.id, label: room.name || room.code || `Room ${room.id}` })), [classrooms]);
  const filteredAssignments = useMemo(() => assignments.filter((assignment) => {
    if (selectedExam && assignment.examId !== selectedExam) return false;
    if (selectedTeacher && assignment.teacherId !== selectedTeacher) return false;
    if (selectedRoom && assignment.roomId !== selectedRoom) return false;
    return true;
  }), [assignments, selectedExam, selectedTeacher, selectedRoom]);
  const addAssignment = async (event) => {
    event.preventDefault();
    const form = event.target;
    const examId = form.examId.value;
    const teacherId = form.teacherId.value;
    const roomId = form.roomId.value;
    const session = form.session.value;
    const startTime = form.startTime.value;
    const endTime = form.endTime.value;
    if (!examId || !teacherId || !roomId || !session || !startTime || !endTime) {
      alert('Please complete all invigilator assignment fields.');
      return;
    }
    await createAssignment.mutateAsync({ examId, teacherId, roomId, session, startTime, endTime, status: 'assigned' });
    refetch();
    form.reset();
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Invigilator Assignment</h1>
          <p className="text-sm text-slate-500">Schedule invigilators by exam, room, and shift while tracking conflict warnings.</p>
        </div>
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Assign Invigilator</h2>
        <form onSubmit={addAssignment} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm text-slate-600">Exam</span>
            <select name="examId" className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none hover-gradient-border">
              <option value="">Select exam</option>
              {examOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">Teacher</span>
            <select name="teacherId" className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none hover-gradient-border">
              <option value="">Select teacher</option>
              {teacherOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">Room</span>
            <select name="roomId" className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none hover-gradient-border">
              <option value="">Select room</option>
              {roomOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">Session</span>
            <input name="session" type="text" placeholder="Morning / Afternoon" className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none hover-gradient-border" />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">Start Time</span>
            <input name="startTime" type="time" className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none hover-gradient-border" />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">End Time</span>
            <input name="endTime" type="time" className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none hover-gradient-border" />
          </label>
          <button type="submit" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 sm:col-span-2 hover-gradient-border">
            Create Assignment
          </button>
        </form>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Active Invigilator Assignments</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3">Exam</th>
                <th className="px-3 py-3">Teacher</th>
                <th className="px-3 py-3">Room</th>
                <th className="px-3 py-3">Session</th>
                <th className="px-3 py-3">Time</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-3 py-4 text-center text-sm text-slate-500">Loading assignments…</td>
                </tr>
              ) : filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-3 py-4 text-center text-sm text-slate-500">No assignments created yet.</td>
                </tr>
              ) : (
                filteredAssignments.map((assignment) => {
                  const exam = examinations.find((e) => e.id === assignment.examId) || {};
                  const teacher = teachers.find((t) => t.id === assignment.teacherId) || {};
                  const room = classrooms.find((r) => r.id === assignment.roomId) || {};
                  return (
                    <tr key={assignment.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-700">{exam.name || exam.title || assignment.examId}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-700">{teacher.name || assignment.teacherId}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-700">{room.name || room.code || assignment.roomId}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-700">{assignment.session}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-700">{assignment.startTime} - {assignment.endTime}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-700">{assignment.status}</td>
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
export default InvigilatorAssignmentPage;