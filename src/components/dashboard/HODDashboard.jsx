import { useState, useMemo } from 'react';
import { Users, Gift, Clock, CalendarCheck, FileText, Download, Filter } from 'lucide-react';
import DataTable from '../ui/DataTable.jsx';
import Modal from '../ui/Modal.jsx';
import EmptyState from '../ui/EmptyState.jsx';

const demoEmployees = [
  { id: 'E101', name: 'Dr. Asha Rao', dept: 'Computer Science', designation: 'Associate Professor', photo: null },
  { id: 'E102', name: 'Mr. Rakesh Kumar', dept: 'Management', designation: 'Assistant Professor', photo: null },
  { id: 'E103', name: 'Ms. Nisha Patel', dept: 'Pharmacy', designation: 'Lecturer', photo: null },
  { id: 'E104', name: 'Mr. Sunil Sharma', dept: 'Civil', designation: 'Lab Instructor', photo: null },
];

const demoBirthdays = [
  { id: 1, name: 'Dr. Asha Rao', dept: 'Computer Science', designation: 'Associate Professor', date: '10/07/1980' },
  { id: 2, name: 'Mr. Rakesh Kumar', dept: 'Management', designation: 'Assistant Professor', date: '05/07/1985' },
];

const leaveRequests = [
  { employee: 'Dr. Asha Rao', type: 'Sick Leave', start: '01 Jul 2026', end: '03 Jul 2026', reason: 'Fever', status: 'Pending' },
  { employee: 'Mr. Rakesh Kumar', type: 'Casual', start: '10 Jul 2026', end: '10 Jul 2026', reason: 'Personal', status: 'Approved' },
  { employee: 'Ms. Nisha Patel', type: 'Privilege', start: '15 Jul 2026', end: '18 Jul 2026', reason: 'Wedding', status: 'Pending' },
  { employee: 'Mr. Sunil Sharma', type: 'Sick Leave', start: '20 Jul 2026', end: '21 Jul 2026', reason: 'Medical', status: 'Rejected' },
];

const tasks = [
  { task: 'Submit attendance report', assignedBy: 'HOD', assignedTo: 'Ms. Nisha Patel', priority: 'High', due: '18 Jul 2026', status: 'Pending', progress: '30%' },
  { task: 'Prepare marksheet', assignedBy: 'HOD', assignedTo: 'Mr. Rakesh Kumar', priority: 'Medium', due: '22 Jul 2026', status: 'In Progress', progress: '60%' },
];

const attendanceRows = Array.from({ length: 12 }).map((_, i) => ({
  name: demoEmployees[i % demoEmployees.length].name,
  id: `E10${i + 1}`,
  department: demoEmployees[i % demoEmployees.length].dept,
  designation: demoEmployees[i % demoEmployees.length].designation,
  type: i % 3 === 0 ? 'Non Teaching' : 'Teaching',
  status: ['Present', 'Absent', 'Late', 'Leave'][i % 4],
  inTime: i % 4 === 0 ? '09:05' : '-',
  outTime: '-',
  workingHours: '-',
}));

export default function HODDashboard() {
  const [empModal, setEmpModal] = useState(null);
  const [joiningModalOpen, setJoiningModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [attendanceModal, setAttendanceModal] = useState(null);

  const totalEmployees = useMemo(() => demoEmployees.length, []);

  return (
    <div className="min-h-[calc(100vh-120px)] overflow-x-hidden bg-transparent p-2">
      <div className="m-2 rounded-[22px] border border-slate-200/70 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between hover-gradient-border">
          <div>
            <h1 className="text-2xl font-semibold">HOD Dashboard</h1>
            <div className="mt-1 text-sm text-slate-600">Overview and quick actions</div>
          </div>
          <div className="inline-flex items-center gap-3 hover-gradient-border">
            <div className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">Academic Session 2026-27 Odd</div>
          </div>
        </div>

        {/* Section 1 */}
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="space-y-4">
            <div className="p-[1px] rounded-[18px]" style={{ background: 'linear-gradient(90deg,#f97316 0%,#3b82f6 33%,#7c3aed 66%,#10b981 100%)' }}>
              <div className="rounded-[17px] bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between hover-gradient-border">
                  <h3 className="text-base font-semibold">Employee Statistics <span className="text-xs font-normal text-slate-500">(Employee Type Wise)</span></h3>
                </div>

                <div className="mt-4 space-y-3">
                  <button onClick={() => setEmpModal({ type: 'headcount' })} className="w-full rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 text-left hover:shadow-md transition">
                    <div className="text-sm text-slate-600">Employee Headcount</div>
                    <div className="mt-2 text-2xl font-bold">Total : {totalEmployees}</div>
                    <div className="mt-3 flex items-center gap-6 text-sm text-slate-700 hover-gradient-border">
                      <div>Male: -</div>
                      <div>Female: -</div>
                      <div>Others: -</div>
                    </div>
                  </button>

                  <button onClick={() => setJoiningModalOpen(true)} className="w-full rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 p-4 text-left hover:shadow-md transition">
                    <div className="text-sm text-slate-600">New Joinings</div>
                    <div className="mt-2 text-2xl font-bold">Today's Joining</div>
                    <div className="mt-3 flex items-center gap-6 text-sm text-slate-700 hover-gradient-border">
                      <div>Male: -</div>
                      <div>Female: -</div>
                      <div>Others: -</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-[1px] rounded-[22px]" style={{ background: 'linear-gradient(90deg,#ec4899 0%,#7c3aed 33%,#3b82f6 66%,#10b981 100%)' }}>
            <div className="rounded-[21px] bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold">Current Month Birthday(s) And Anniversaries</h3>
              <div className="mt-4 max-h-[280px] overflow-y-auto pr-2 space-y-3">
                {demoBirthdays.length === 0 ? (
                  <div className="py-12">
                    <EmptyState title="No Data Found" description="We couldn't find your data." />
                  </div>
                ) : (
                  demoBirthdays.map((b) => (
                    <div key={b.id} onClick={() => setEmpModal(b)} className="cursor-pointer rounded-2xl border border-slate-100 p-3 hover:shadow-sm transition flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{b.name}</div>
                        <div className="text-xs text-slate-500">{b.designation} • {b.dept}</div>
                        <div className="text-xs text-slate-500">{b.date}</div>
                      </div>
                      <div>
                        <button className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 text-sm hover-gradient-border">Birthday</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="p-[1px] rounded-[22px]" style={{ background: 'linear-gradient(90deg,#06b6d4 0%,#3b82f6 33%,#7c3aed 66%,#f97316 100%)' }}>
            <div className="rounded-[21px] bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold">Yesterday's Attendance</h3>
              <div className="mt-4 flex items-center justify-center p-6 hover-gradient-border">
                <div className="text-center">
                  <div className="text-3xl font-bold">Present: 0</div>
                  <div className="mt-1 text-sm text-slate-500">Absent: 0 • Late: 0 • Half Day: 0</div>
                  <div className="mt-3">
                    <button onClick={() => setAttendanceModal({})} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                      <Users className="h-4 w-4" /> View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <button onClick={() => setLeaveModalOpen(true)} className="p-[1px] rounded-[18px]" style={{ background: 'linear-gradient(90deg,#06b6d4,#3b82f6,#7c3aed)' }}>
            <div className="rounded-[17px] bg-white p-4 shadow-sm hover:-translate-y-1 transition">
              <div className="text-sm text-slate-600">Attendance Regularization</div>
              <div className="mt-2 text-xl font-bold">Total : 0</div>
            </div>
          </button>

          <button onClick={() => setLeaveModalOpen(true)} className="p-[1px] rounded-[18px]" style={{ background: 'linear-gradient(90deg,#f97316,#10b981,#3b82f6)' }}>
            <div className="rounded-[17px] bg-white p-4 shadow-sm hover:-translate-y-1 transition">
              <div className="text-sm text-slate-600">Leaves</div>
              <div className="mt-2 text-xl font-bold">Total : 0</div>
            </div>
          </button>

          <button onClick={() => setTaskModalOpen(true)} className="p-[1px] rounded-[18px]" style={{ background: 'linear-gradient(90deg,#7c3aed,#3b82f6,#06b6d4)' }}>
            <div className="rounded-[17px] bg-white p-4 shadow-sm hover:-translate-y-1 transition">
              <div className="text-sm text-slate-600">Late Arrival Count</div>
              <div className="mt-2 text-xl font-bold">Total : 0</div>
            </div>
          </button>

          <button className="p-[1px] rounded-[18px] hover-gradient-border" style={{ background: 'linear-gradient(90deg,#ec4899,#f97316,#10b981)' }}>
            <div className="rounded-[17px] bg-white p-4 shadow-sm hover:-translate-y-1 transition">
              <div className="text-sm text-slate-600">OD Count</div>
              <div className="mt-2 text-xl font-bold">Total : 0</div>
            </div>
          </button>
        </div>

        {/* Section 3 */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div id="leave-requests">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Leave Request</h3>
            </div>
            <DataTable
              columns={[
                { label: 'Employee', key: 'employee' },
                { label: 'Leave Type', key: 'type' },
                { label: 'Start Date', key: 'start' },
                { label: 'End Date', key: 'end' },
                { label: 'Reason', key: 'reason' },
                { label: 'Status', key: 'status' },
                { label: 'Action', key: 'action' },
              ]}
              rows={leaveRequests}
              initialPageSize={5}
              tableMaxHeight="360px"
              headerClassName="bg-slate-900 text-white"
              onRowClick={(r) => setEmpModal({ type: 'leave', data: r })}
            />
          </div>

          <div id="todays-attendance">
            <div className="mb-4 flex items-center justify-between hover-gradient-border">
              <h3 className="text-lg font-semibold">Today's Employee Attendance</h3>
              <div className="flex items-center gap-2 hover-gradient-border">
                <input placeholder="Search..." className="rounded-3xl border border-slate-200/80 bg-slate-50 px-3 py-1 text-xs hover-gradient-border" />
                <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 hover-gradient-border"><Download className="h-4 w-4"/> Export</button>
                <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 hover-gradient-border"><Filter className="h-4 w-4"/> Filter</button>
              </div>
            </div>

            <DataTable
              columns={[
                { label: 'Employee Name', key: 'name' },
                { label: 'Employee ID', key: 'id' },
                { label: 'Department', key: 'department' },
                { label: 'Designation', key: 'designation' },
                { label: 'Employee Type', key: 'type' },
                { label: 'Attendance Status', key: 'status' },
                { label: 'In Time', key: 'inTime' },
                { label: 'Out Time', key: 'outTime' },
              ]}
              rows={attendanceRows}
              initialPageSize={6}
              tableMaxHeight="420px"
              headerClassName="bg-slate-900 text-white"
              onRowClick={(r) => setAttendanceModal(r)}
            />
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">© 2026 HARIDWAR UNIVERSITY - Campus Automation Partner</div>
      </div>

      <Modal title={empModal?.type === 'headcount' ? 'Employee Headcount' : empModal?.name || 'Employee Details'} isOpen={!!empModal} onClose={() => setEmpModal(null)}>
        {empModal?.type === 'headcount' ? (
          <div>
            <p className="text-sm">Total Employees: {totalEmployees}</p>
          </div>
        ) : empModal?.type === 'leave' ? (
          <div>
            <p className="text-sm">Leave details for {empModal?.data?.employee}</p>
            <pre className="mt-2 text-xs">{JSON.stringify(empModal?.data, null, 2)}</pre>
          </div>
        ) : (
          <div>
            <p className="text-sm">Profile details</p>
            <p className="mt-2 text-sm">Name: {empModal?.name}</p>
            <p className="text-sm">Dept: {empModal?.dept}</p>
            <p className="text-sm">Designation: {empModal?.designation}</p>
          </div>
        )}
      </Modal>

      <Modal title="Joining Details" isOpen={joiningModalOpen} onClose={() => setJoiningModalOpen(false)}>
        <p className="text-sm">No joinings for today.</p>
      </Modal>

      <Modal title="Leaves" isOpen={leaveModalOpen} onClose={() => setLeaveModalOpen(false)}>
        <p className="text-sm">No leave data available.</p>
      </Modal>

      <Modal title="Tasks" isOpen={taskModalOpen} onClose={() => setTaskModalOpen(false)}>
        <p className="text-sm">Task overview</p>
      </Modal>

      <Modal title="Attendance Details" isOpen={!!attendanceModal} onClose={() => setAttendanceModal(null)}>
        {attendanceModal ? (
          <div>
            <p className="text-sm">Name: {attendanceModal.name}</p>
            <p className="text-sm">Status: {attendanceModal.status}</p>
            <p className="text-sm">In: {attendanceModal.inTime} Out: {attendanceModal.outTime}</p>
          </div>
        ) : (
          <div>
            <p className="text-sm">No data</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
