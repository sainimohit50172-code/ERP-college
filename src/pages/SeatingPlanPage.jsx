import { useMemo, useState } from 'react';
import { useResourceList, useCreateResource } from '../hooks/useResourceHooks';
function SeatingPlanPage() {
  const { data: seatingPlansData = {}, isLoading, refetch } = useResourceList('seatingPlans', { page: 1, pageSize: 1000 });
  const { data: classroomsData = {} } = useResourceList('classrooms', { page: 1, pageSize: 1000 });
  const { data: examinationsData = {} } = useResourceList('examinations', { page: 1, pageSize: 1000 });
  const seatingPlans = seatingPlansData.items || [];
  const classrooms = classroomsData.items || [];
  const examinations = examinationsData.items || [];
  const createSeatingPlan = useCreateResource('seatingPlans');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const roomOptions = useMemo(() => classrooms.map((room) => ({ value: room.id, label: room.name || room.code || `Room ${room.id}` })), [classrooms]);
  const examOptions = useMemo(() => examinations.map((exam) => ({ value: exam.id, label: exam.name || exam.title || `Exam ${exam.id}` })), [examinations]);
  const filteredPlans = useMemo(() => seatingPlans.filter((plan) => {
    if (selectedExam && plan.examId !== selectedExam) return false;
    if (selectedRoom && plan.roomId !== selectedRoom) return false;
    return true;
  }), [seatingPlans, selectedExam, selectedRoom]);
  const addPlan = async (event) => {
    event.preventDefault();
    const form = event.target;
    const examId = form.examId.value;
    const roomId = form.roomId.value;
    const benches = Number(form.benches.value);
    const seatsPerBench = Number(form.seatsPerBench.value);
    if (!examId || !roomId || benches < 1 || seatsPerBench < 1) {
      alert('Please select exam, room, and valid seating dimensions.');
      return;
    }
    const seatAssignments = Array.from({ length: benches }, (_, benchIndex) => ({
      bench: benchIndex + 1,
      seats: Array.from({ length: seatsPerBench }, (_, seatIndex) => ({
        seat: seatIndex + 1,
        studentId: null,
      })),
    }));
    await createSeatingPlan.mutateAsync({ examId, roomId, benches, seatsPerBench, seatAssignments });
    refetch();
    form.reset();
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Seating Plan</h1>
          <p className="text-sm text-slate-500">Build exam seating layouts, manage room allocation, and export printable arrangements.</p>
        </div>
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Create Seating Plan</h2>
        <form onSubmit={addPlan} className="mt-4 grid gap-4 sm:grid-cols-2">
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
            <span className="text-sm text-slate-600">Room</span>
            <select name="roomId" className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none hover-gradient-border">
              <option value="">Select room</option>
              {roomOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">Benches</span>
            <input name="benches" type="number" min="1" defaultValue="5" className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none hover-gradient-border" />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">Seats per Bench</span>
            <input name="seatsPerBench" type="number" min="1" defaultValue="4" className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none hover-gradient-border" />
          </label>
          <button type="submit" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 sm:col-span-2 hover-gradient-border">
            Save Seating Plan
          </button>
        </form>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold">Saved Seating Plans</h2>
          <div className="flex flex-wrap gap-3">
            <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none">
              <option value="">All exams</option>
              {examOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none">
              <option value="">All rooms</option>
              {roomOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3">Exam</th>
                <th className="px-3 py-3">Room</th>
                <th className="px-3 py-3">Benches</th>
                <th className="px-3 py-3">Seats/Bench</th>
                <th className="px-3 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-3 py-4 text-center text-sm text-slate-500">Loading seating plans…</td>
                </tr>
              ) : filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-3 py-4 text-center text-sm text-slate-500">No seating plans available.</td>
                </tr>
              ) : (
                filteredPlans.map((plan) => {
                  const exam = examinations.find((e) => e.id === plan.examId) || {};
                  const room = classrooms.find((r) => r.id === plan.roomId) || {};
                  return (
                    <tr key={plan.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-700">{exam.name || exam.title || plan.examId}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-700">{room.name || room.code || plan.roomId}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-700">{plan.benches}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-700">{plan.seatsPerBench}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-700">{new Date(plan.createdAt || plan.dateCreated || Date.now()).toLocaleDateString()}</td>
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
export default SeatingPlanPage;