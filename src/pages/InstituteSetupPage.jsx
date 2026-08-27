import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BadgeCheck,
  BookOpen,
  Building,
  Building2,
  Bus,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  FileCog,
  Globe,
  GraduationCap,
  Monitor,
  MessageSquareMore,
  ScrollText,
  Settings2,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';

const setupCards = [
  { title: 'Institute Profile', description: 'Informative Details', icon: Building2, route: '/settings/institute/profile' },
  { title: 'Sessions', description: 'Academic Session', icon: CalendarDays, route: '/settings/institute/sessions' },
  { title: 'Academics', description: 'Academic configuration and setup', icon: BookOpen, route: '/settings/institute/academics' },
  { title: 'Courses', description: 'Courses and Streams', icon: Monitor, route: '/settings/institute/courses' },
  { title: 'Transport', description: 'Transport Section', icon: Bus, route: '/settings/institute/transport' },
  { title: 'Hostel', description: 'Hostel Section', icon: Building, route: '/settings/institute/hostel' },
  { title: 'Attendance', description: 'Attendance Section', icon: CalendarCheck, route: '/settings/institute/attendance' },
  { title: 'Institute Preference', description: 'Preference Section', icon: Settings2, route: '/settings/institute/preferences' },
  { title: 'Student Fields', description: 'Preference Section', icon: UsersRound, route: '/settings/institute/student-fields' },
  { title: 'Student Master Setup', description: 'Student Master Setup', icon: GraduationCap, route: '/settings/institute/student-master' },
  { title: 'Template Preference', description: 'Template Preference Section', icon: FileCog, route: '/settings/institute/preferences' },
  { title: 'Permission Groups', description: 'Permission Group Section', icon: ShieldCheck, route: '/permissions' },
  { title: 'Student Session Management', description: 'Student Session Management', icon: CalendarClock, route: '/students/session' },
  { title: 'Web Tabs', description: 'Web Tabs', icon: Globe, route: '/settings/institute/web-tabs' },
  { title: 'Compliance Certificate Names', description: 'Compliance Certificate Names Setup', icon: BadgeCheck, route: '/settings/institute/compliance-certificate-names' },
  { title: 'Compliance Certificate', description: 'Compliance Certificate', icon: ScrollText, route: '/settings/institute/compliance-certificate' },
  { title: 'Feedback From Student', description: 'Feedback From Student', icon: MessageSquareMore, route: '/feedback' },
];

export default function InstituteSetupPage() {
  const navigate = useNavigate();
  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-4 flex flex-col gap-3 border-b border-slate-200/80 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-600">Institute setup</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Configure your institution workspace</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-[15px]">
              Manage academic, administrative, and compliance essentials from one premium setup hub.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            16 setup modules available
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {setupCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: index * 0.03 }}
                whileHover={{ y: -5, scale: 1.01 }}
                className={"group hover-gradient-border flex min-h-[190px] flex-col items-center justify-center rounded-[18px] border border-slate-200 bg-white p-5 text-center shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all duration-200 hover:border-sky-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)] " + (card.route ? 'cursor-pointer' : '')}
                onClick={() => card.route && navigate(card.route)}
                onKeyDown={(e) => card.route && (e.key === 'Enter' || e.key === ' ') && navigate(card.route)}
                role={card.route ? 'button' : undefined}
                tabIndex={card.route ? 0 : undefined}
              >
                <div className="mb-4 flex h-[58px] w-[58px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sky-700 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-sky-200 group-hover:bg-sky-50">
                  <Icon className="h-7 w-7" />
                </div>
                <h2 className="text-lg font-semibold leading-tight text-slate-900 transition-colors duration-200 group-hover:text-sky-700">
                  {card.title}
                </h2>
                <p className="mt-2 max-w-[190px] text-sm leading-5 text-slate-500">
                  {card.description}
                </p>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/settings/institute/page-2')}
            className="inline-flex h-[42px] w-[95px] items-center justify-center rounded-[999px] bg-emerald-600 px-4 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(16,185,129,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
