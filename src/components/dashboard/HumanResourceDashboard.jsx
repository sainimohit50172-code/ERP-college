import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { CalendarCheck, Users, Gift, Clock3, CheckCircle2, User, Briefcase, PieChart as PieChartIcon } from 'lucide-react';
import DataTable from '../ui/DataTable.jsx';

const EMPLOYEE_TYPES = [
  { type: 'Teaching', count: 78, male: 48, female: 30 },
  { type: 'Non Teaching', count: 60, male: 30, female: 30 },
  { type: 'Guest Faculty', count: 12, male: 6, female: 6 },
  { type: 'Contract', count: 18, male: 12, female: 6 },
  { type: 'Visiting Faculty', count: 10, male: 4, female: 6 },
];

const DEPARTMENTS = [
  { name: 'Computer Science', count: 28, color: '#3b82f6' },
  { name: 'Management', count: 22, color: '#10b981' },
  { name: 'Pharmacy', count: 18, color: '#f97316' },
  { name: 'Agriculture', count: 10, color: '#7c3aed' },
  { name: 'Civil', count: 8, color: '#06b6d4' },
  { name: 'Mechanical', count: 8, color: '#f59e0b' },
  { name: 'Admission', count: 6, color: '#ef4444' },
  { name: 'Accounts', count: 6, color: '#06b6d4' },
];

const BIRTHDAYS = [
  { id: 1, name: 'Himanshu Verma', designation: 'Trainer', dept: 'Computer Science', date: '10/07/2002' },
  { id: 2, name: 'Shalini Sharma', designation: 'Assistant Professor', dept: 'Pharmacy', date: '05/07/1983' },
  { id: 3, name: 'Chetna Singh', designation: 'Lecturer', dept: 'Management', date: '22/07/1990' },
];

const COLORS = ['#3b82f6', '#10b981', '#f97316', '#7c3aed', '#06b6d4', '#f59e0b', '#ef4444'];

const leaveRows = [
  { employee: 'Amit Sagar', type: 'Sick Leave', start: '01 Jul 2026', end: '03 Jul 2026', reason: 'Fever', status: 'Pending' },
  { employee: 'Dharna Panwar', type: 'Casual', start: '10 Jul 2026', end: '10 Jul 2026', reason: 'Personal', status: 'Approved' },
  { employee: 'Priya Nanda', type: 'Privilege Leave', start: '14 Jul 2026', end: '16 Jul 2026', reason: 'Wedding', status: 'Pending' },
  { employee: 'Rajesh Kumar', type: 'Casual', start: '18 Jul 2026', end: '18 Jul 2026', reason: 'Urgent Work', status: 'Approved' },
  { employee: 'Neha Joshi', type: 'Sick Leave', start: '19 Jul 2026', end: '20 Jul 2026', reason: 'Cold', status: 'Rejected' },
  { employee: 'Sahil Verma', type: 'Casual', start: '21 Jul 2026', end: '21 Jul 2026', reason: 'Appointment', status: 'Pending' },
  { employee: 'Ritu Sharma', type: 'Privilege Leave', start: '22 Jul 2026', end: '25 Jul 2026', reason: 'Family', status: 'Approved' },
  { employee: 'Anil Singh', type: 'Sick Leave', start: '25 Jul 2026', end: '26 Jul 2026', reason: 'Fever', status: 'Pending' },
];

const taskRows = [
  { task: 'Submit payroll', assignedBy: 'HR Admin', assignedTo: 'Amit Sagar', priority: 'High', due: '15 Jul 2026', status: 'Pending', progress: '20%' },
  { task: 'Complete joining formalities', assignedBy: 'HR Admin', assignedTo: 'New Join', priority: 'Medium', due: '20 Jul 2026', status: 'In Progress', progress: '60%' },
  { task: 'Confirm interview schedule', assignedBy: 'HR Admin', assignedTo: 'Ritu Sharma', priority: 'Low', due: '17 Jul 2026', status: 'Completed', progress: '100%' },
  { task: 'Update employee records', assignedBy: 'HR Admin', assignedTo: 'Sahil Verma', priority: 'Medium', due: '18 Jul 2026', status: 'Pending', progress: '40%' },
  { task: 'Approve leave requests', assignedBy: 'HR Admin', assignedTo: 'Neha Joshi', priority: 'High', due: '19 Jul 2026', status: 'In Progress', progress: '55%' },
  { task: 'Organize training session', assignedBy: 'HR Admin', assignedTo: 'Priya Nanda', priority: 'Medium', due: '21 Jul 2026', status: 'Pending', progress: '25%' },
  { task: 'Review performance appraisal', assignedBy: 'HR Admin', assignedTo: 'Ritu Sharma', priority: 'High', due: '22 Jul 2026', status: 'Pending', progress: '10%' },
  { task: 'Process new joiner formals', assignedBy: 'HR Admin', assignedTo: 'Anil Singh', priority: 'Low', due: '23 Jul 2026', status: 'Completed', progress: '100%' },
];

const attendanceRows = Array.from({ length: 8 }).map((_, i) => ({
  name: ['Chetna Singh', 'Himanshu Verma', 'Shalini Sharma', 'Dharna Panwar', 'Amit Sagar', 'Rita Kumar', 'Suresh B', 'Pooja M'][i],
  id: `HU${100 + i}`,
  department: ['Pharmacy', 'Computer Science', 'Pharmacy', 'Management', 'Admin', 'HR', 'Accounts', 'Library'][i],
  designation: ['Lecturer', 'Assistant Professor', 'Assistant Professor', 'Assistant Professor', 'Computer Operator', 'HR Manager', 'Accountant', 'Librarian'][i],
  type: ['Teaching', 'Teaching', 'Teaching', 'Teaching', 'Non Teaching', 'Non Teaching', 'Non Teaching', 'Non Teaching'][i],
  status: 'No Punch',
  inTime: '-',
  outTime: '-',
  workingHours: '-',
  lateMins: '-',
}));

export default function HumanResourceDashboard() {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);

  const totalEmployees = useMemo(() => EMPLOYEE_TYPES.reduce((s, e) => s + e.count, 0), []);

  const barData = EMPLOYEE_TYPES.map((t) => ({ name: t.type, count: t.count, male: t.male, female: t.female }));

  const handleBarClick = (data) => {
    if (!data) return;
    setSelectedType(data.payload);
  };

  const pieData = DEPARTMENTS.map((d) => ({ name: d.name, value: d.count, color: d.color }));

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_45%,#f0fdf4_100%)] p-0">
      <div className="m-2.5 rounded-[22px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_22px_70px_-24px_rgba(2,8,23,0.35)] backdrop-blur sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Human Resource</h1>
          </div>
          <div className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-yellow-50 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            <CalendarCheck className="mr-2 h-4 w-4 text-amber-600" />
            HR Session 2026-27 Odd
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          {/* Section 1 */}
          <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.28)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-base font-semibold uppercase tracking-[0.24em] text-slate-500">Employee Statistics (Employee Type Wise)</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Employee Statistics</h2>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="col-span-2 rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                <div className="h-[360px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 13 }} />
                      <YAxis tick={{ fill: '#475569', fontSize: 13 }} />
                      <Tooltip formatter={(value, name) => [value, name === 'count' ? 'Employees' : name]} contentStyle={{ borderRadius: 12 }} />
                      <Bar dataKey="count" name="Employees" radius={[12, 12, 0, 0]} onClick={handleBarClick} fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[18px] border border-slate-200 bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5">
                  <div className="text-sm text-slate-500">Employee Headcount</div>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-slate-900">{totalEmployees}</div>
                      <div className="mt-1 text-sm text-slate-600">Total Employees</div>
                    </div>
                    <div className="text-sm text-slate-600">
                      <div className="font-semibold">Male: {EMPLOYEE_TYPES.reduce((s, e) => s + e.male, 0)}</div>
                      <div className="font-semibold">Female: {EMPLOYEE_TYPES.reduce((s, e) => s + e.female, 0)}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[18px] border border-slate-200 bg-gradient-to-br from-teal-50 to-teal-100 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5">
                  <div className="text-sm text-slate-500">New Joinings</div>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-slate-900">0</div>
                      <div className="mt-1 text-sm text-slate-600">This Month</div>
                    </div>
                    <div className="text-sm text-slate-600">
                      <div className="font-semibold">Male: -</div>
                      <div className="font-semibold">Female: -</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-base font-semibold uppercase tracking-[0.24em] text-slate-500">Employee Statistics (Department Wise)</p>
              <div className="mt-4 flex flex-col gap-4 lg:flex-row">
                <div className="min-h-[224px] w-full lg:w-[60%]">
                  <ResponsiveContainer width="100%" height={224}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4} onClick={(d) => setSelectedDept(d?.payload)}>
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend layout="vertical" verticalAlign="middle" align="left" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex w-full flex-col gap-2 lg:w-[40%]">
                  <div className="grid gap-2">
                    {DEPARTMENTS.map((d) => (
                      <div key={d.name} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="h-3 w-3 rounded-full" style={{ background: d.color }} />
                          <div className="min-w-0 truncate text-sm font-semibold text-slate-900">{d.name}</div>
                        </div>
                        <div className="shrink-0 text-sm text-slate-700">{d.count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-base font-semibold uppercase tracking-[0.24em] text-slate-500">Current Month Birthday(s) And Anniversaries</p>
              <div className="mt-4 max-h-[280px] overflow-y-auto pr-1 space-y-3">
                {BIRTHDAYS.map((b) => (
                  <div key={b.id} className="rounded-2xl border border-slate-100 p-3 flex items-center justify-between hover:shadow-sm transition">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{b.name}</div>
                      <div className="text-xs text-slate-500">{b.designation} • {b.dept}</div>
                      <div className="text-xs text-slate-500">{b.date}</div>
                    </div>
                    <div>
                      <button className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 text-sm">Birthday</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Metrics grid */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => document.getElementById('todays-attendance')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-left w-full rounded-[18px] border border-slate-100 bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 shadow-sm cursor-pointer hover:shadow-md transition"
            >
              <p className="text-sm text-slate-600">Yesterday's Attendance</p>
              <div className="mt-4 text-3xl font-bold text-slate-900">0</div>
            </button>

            <button
              type="button"
              onClick={() => document.getElementById('todays-attendance')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-left w-full rounded-[18px] border border-slate-100 bg-gradient-to-br from-blue-50 to-blue-100 p-4 shadow-sm cursor-pointer hover:shadow-md transition"
            >
              <p className="text-sm text-slate-600">Employees Punched In Today</p>
              <div className="mt-4 text-3xl font-bold text-slate-900">0</div>
            </button>

            <button
              type="button"
              onClick={() => document.getElementById('task-list')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-left w-full rounded-[18px] border border-slate-100 bg-gradient-to-br from-amber-50 to-amber-100 p-4 shadow-sm cursor-pointer hover:shadow-md transition"
            >
              <p className="text-sm text-slate-600">Attendance Regularization</p>
              <div className="mt-4 text-3xl font-bold text-slate-900">0</div>
            </button>

            <button
              type="button"
              onClick={() => document.getElementById('leave-requests')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-left w-full rounded-[18px] border border-slate-100 bg-gradient-to-br from-rose-50 to-rose-100 p-4 shadow-sm cursor-pointer hover:shadow-md transition"
            >
              <p className="text-sm text-slate-600">Leaves</p>
              <div className="mt-4 text-3xl font-bold text-slate-900">0</div>
            </button>
          </div>

          {/* Section 4: Tables and Attendance List */}
          <div className="grid gap-4 lg:grid-cols-2">
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
                ]}
                rows={leaveRows}
                initialPageSize={5}
                tableMaxHeight="340px"
                headerClassName="bg-slate-900 text-white"
              />
            </div>

            <div id="task-list">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Task List</h3>
              </div>
              <DataTable
                columns={[
                  { label: 'Task', key: 'task' },
                  { label: 'Assigned By', key: 'assignedBy' },
                  { label: 'Assigned To', key: 'assignedTo' },
                  { label: 'Priority', key: 'priority' },
                  { label: 'Due Date', key: 'due' },
                  { label: 'Status', key: 'status' },
                  { label: 'Progress', key: 'progress' },
                ]}
                rows={taskRows}
                initialPageSize={5}
                tableMaxHeight="340px"
                headerClassName="bg-slate-900 text-white"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_0.85fr]">
            <div id="todays-attendance">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Today's Employee Attendance</h3>
              </div>
              <DataTable
                columns={[
                  { label: 'Employee Name', key: 'name' },
                  { label: 'Employee Id', key: 'id' },
                  { label: 'Department', key: 'department' },
                  { label: 'Designation', key: 'designation' },
                  { label: 'Employee Type', key: 'type' },
                  { label: 'Status', key: 'status' },
                  { label: 'In Time', key: 'inTime' },
                  { label: 'Out Time', key: 'outTime' },
                ]}
                rows={attendanceRows}
                initialPageSize={8}
                headerClassName="bg-slate-900 text-white"
                tableMaxHeight="420px"
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm text-slate-900">
                <div className="absolute right-4 top-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
                  <PieChartIcon className="h-6 w-6" />
                </div>
                <div className="relative">
                  <h3 className="text-2xl font-semibold">Overview</h3>
                  <p className="mt-2 text-sm text-slate-500">Quick employee insights</p>
                </div>
                <div className="mt-8 rounded-[24px] bg-slate-900 p-5 shadow-sm">
                  <div className="text-5xl font-bold leading-none text-white">9</div>
                  <div className="mt-2 text-sm text-slate-300">Staff App Login Count</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
