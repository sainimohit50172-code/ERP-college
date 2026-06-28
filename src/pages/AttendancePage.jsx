import { FaCalendarAlt, FaChalkboardTeacher, FaClipboardList, FaUserGraduate, FaUserShield } from 'react-icons/fa';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import InfoCard from '../components/ui/InfoCard.jsx';
import { Link } from 'react-router-dom';
import { usePermissions } from '../services/permissionHelpers.js';

const attendanceModules = [
  { title: 'Student attendance', description: 'Track daily presence, absences and attendance trends for students.', to: '/attendance/students', icon: FaUserGraduate, color: 'bg-sky-500/10 text-sky-300' },
  { title: 'Teacher attendance', description: 'Monitor faculty check-ins, leaves and lecture attendance.', to: '/attendance/teachers', icon: FaChalkboardTeacher, color: 'bg-emerald-500/10 text-emerald-300' },
  { title: 'Employee attendance', description: 'Manage non-academic employee attendance, shifts and punctuality.', to: '/attendance/employees', icon: FaClipboardList, color: 'bg-indigo-500/10 text-indigo-300' },
  { title: 'Security attendance', description: 'Review guard duty logs and gate coverage across posts.', to: '/attendance/security', icon: FaUserShield, color: 'bg-amber-500/10 text-amber-300' },
  { title: 'Timetable', description: 'View and schedule course timetables, classroom assignments and room utilization.', to: '/attendance/timetable', icon: FaCalendarAlt, color: 'bg-fuchsia-500/10 text-fuchsia-300' },
];

export default function AttendancePage() {
  const perms = usePermissions();
  return (
    <div className="space-y-8">
      <SectionHeader title="Attendance hub" subtitle="Unified hub for all attendance, scheduling and roster tracking." />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-8 shadow-soft">
          <div className="grid gap-6 md:grid-cols-3">
            <InfoCard title="Total attendance logs" value="5,832" />
            <InfoCard title="Late records" value="132" />
            <InfoCard title="Compliance" value="98.2%" />
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {attendanceModules.map((module) => {
              const Icon = module.icon;
              return (
                <Link key={module.title} to={module.to} className="group rounded-[28px] border border-white/10 bg-slate-950/70 p-6 transition hover:border-sky-400 hover:bg-slate-900/90">
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-3xl ${module.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-sky-200">{module.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{module.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-8 shadow-soft">
          <h3 className="text-xl font-semibold text-white">Attendance insights</h3>
          <p className="mt-3 text-sm text-slate-400">Take action on attendance exceptions and align schedules with staffing requirements.</p>
          <div className="mt-7 space-y-5">
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Peak absence day</p>
              <p className="mt-3 text-2xl font-semibold text-white">Wednesday</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Room conflicts</p>
              <p className="mt-3 text-2xl font-semibold text-white">2 active</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Late policy alerts</p>
              <p className="mt-3 text-2xl font-semibold text-white">5 flagged</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
