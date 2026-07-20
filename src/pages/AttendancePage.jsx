import { FaCalendarAlt, FaChalkboardTeacher, FaClipboardList, FaUserGraduate, FaUserShield } from 'react-icons/fa';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import InfoCard from '../components/ui/InfoCard.jsx';
import { Link } from 'react-router-dom';
const attendanceModules = [
  { title: 'Student attendance', description: 'Track daily presence, absences and attendance trends for students.', to: '/attendance/students', icon: FaUserGraduate, color: 'bg-sky-500/10 text-sky-300' },
  { title: 'Teacher attendance', description: 'Monitor faculty check-ins, leaves and lecture attendance.', to: '/attendance/teachers', icon: FaChalkboardTeacher, color: 'bg-emerald-500/10 text-emerald-300' },
  { title: 'Employee attendance', description: 'Manage non-academic employee attendance, shifts and punctuality.', to: '/attendance/employees', icon: FaClipboardList, color: 'bg-indigo-500/10 text-indigo-300' },
  { title: 'Security attendance', description: 'Review guard duty logs and gate coverage across posts.', to: '/attendance/security', icon: FaUserShield, color: 'bg-amber-500/10 text-amber-300' },
  { title: 'Timetable', description: 'View and schedule course timetables, classroom assignments and room utilization.', to: '/attendance/timetable', icon: FaCalendarAlt, color: 'bg-fuchsia-500/10 text-fuchsia-300' },
];
export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Attendance hub" subtitle="Unified hub for all attendance, scheduling and roster tracking." />
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="no-hover-border rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3">
            <InfoCard title="Total attendance logs" value="5,832" />
            <InfoCard title="Late records" value="132" />
            <InfoCard title="Compliance" value="98.2%" />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {attendanceModules.map((module) => {
              const Icon = module.icon;
              return (
                <Link key={module.title} to={module.to} className="group hover-gradient-border rounded-[24px] border border-white/10 bg-slate-950/70 p-4 transition hover:-translate-y-0.5 hover:shadow-lg hover:border-sky-400 hover:bg-slate-900/90 cursor-pointer">
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${module.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-white group-hover:text-sky-200">{module.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-400">{module.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-white">Attendance insights</h3>
          <p className="mt-2 text-sm text-slate-400">Take action on attendance exceptions and align schedules with staffing requirements.</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-[22px] border border-white/10 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Peak absence day</p>
              <p className="mt-2 text-xl font-semibold text-white">Wednesday</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Room conflicts</p>
              <p className="mt-2 text-xl font-semibold text-white">2 active</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Late policy alerts</p>
              <p className="mt-2 text-xl font-semibold text-white">5 flagged</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}