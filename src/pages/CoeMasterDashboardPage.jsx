import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CalendarDays, ClipboardCheck, WalletCards, BadgeCheck, Clock3, Hash, Boxes, Settings2, FileDigit } from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const MotionLink = motion.create(Link);

const coeModules = [
  {
    title: 'Exam Calendar',
    subtitle: 'Exam Calendar Setup',
    icon: CalendarDays,
    route: '/coe/datesheet',
  },
  {
    title: 'Exam Form Preferences',
    subtitle: 'Exam Form Preferences Setup',
    icon: ClipboardCheck,
    route: '/coe/configuration',
  },
  {
    title: 'Exam Fee Setup',
    subtitle: 'Exam Fee Configuration',
    icon: WalletCards,
    route: '/coe/exam-fee-setup',
  },
  {
    title: 'Admit Card Preferences',
    subtitle: 'Admit Card Preferences',
    icon: BadgeCheck,
    route: '/coe/admit-card',
  },
  {
    title: 'Exam Shift Master',
    subtitle: 'Manage Examination Shifts',
    icon: Clock3,
    route: '/coe/exam-master',
  },
  {
    title: 'Masking Number Dashboard',
    subtitle: 'Manage Masking Number modules',
    icon: Hash,
    route: '/coe/masking-number-dashboard',
  },
  {
    title: 'Masking Number Setup',
    subtitle: 'Masking Number Configuration',
    icon: Hash,
    route: '/coe/masking-number-setup',
  },
  {
    title: 'Masking Number Management',
    subtitle: 'Masking Number Operations',
    icon: Hash,
    route: '/coe/masking-number-management',
  },
  {
    title: 'Manage Bundles',
    subtitle: 'Bundle Management',
    icon: Boxes,
    route: '/coe/manage-bundles',
  },
  {
    title: 'COE Preference',
    subtitle: 'COE Global Preferences',
    icon: Settings2,
    route: '/coe/preferences',
  },
  {
    title: 'DMC Number Setup',
    subtitle: 'Manage DMC Number Series',
    icon: FileDigit,
    route: '/coe/dmc-number-setup',
  },
  {
    title: 'DMC Student App',
    subtitle: 'Student DMC Management',
    icon: FileDigit,
    route: '/coe/student-dmc',
  },
  {
    title: 'Exam Fee Receipt',
    subtitle: 'Receipt Configuration',
    icon: WalletCards,
    route: '/coe/exam-fee-setup/receipt',
  },
  {
    title: 'Fee Head Configuration',
    subtitle: 'Fee Head Setup',
    icon: WalletCards,
    route: '/coe/exam-fee-setup/fee-head',
  },
];

export default function CoeMasterDashboardPage() {
  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-8">
          <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'COE Master' }]} />
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Dashboard</span>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">COE Master</h1>
            <p className="max-w-2xl text-sm text-slate-500">Centralized Examination Management</p>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {coeModules.map((module, index) => {
            const Icon = module.icon;
            return (
              <MotionLink
                to={module.route}
                key={module.title}
                aria-label={`${module.title}: ${module.subtitle}`}
                className="group flex h-full min-h-[220px] max-h-[240px] flex-col justify-between overflow-hidden rounded-[18px] border border-slate-200 bg-white p-7 shadow-sm transition duration-300 ease-out hover:-translate-y-2.5 hover:scale-[1.02] hover:border-emerald-500 hover:shadow-[0_24px_55px_rgba(15,23,42,0.12)] focus:outline-none focus:ring-2 focus:ring-emerald-300"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.36, delay: index * 0.05 }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="rounded-full bg-[#F5F8FC] p-3 text-emerald-600 transition duration-300 group-hover:bg-emerald-600 group-hover:text-white">
                    <Icon size={46} aria-hidden="true" />
                  </div>
                </div>
                <div className="mt-8 flex flex-1 flex-col justify-center gap-3 text-left">
                  <h2 className="text-xl font-semibold text-slate-900 transition duration-300 group-hover:text-emerald-600">
                    {module.title}
                  </h2>
                  <p className="text-sm leading-6 text-slate-500 transition duration-300 group-hover:text-slate-700">
                    {module.subtitle}
                  </p>
                </div>
              </MotionLink>
            );
          })}
        </section>
      </div>
    </div>
  );
}
