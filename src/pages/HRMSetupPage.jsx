import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  DollarSign,
  Users,
  Briefcase,
  UmbrellaOff,
  Calendar,
  Repeat,
  Banknote,
  FileText,
  MapPinCheck,
  Sliders,
  FolderKanban,
  Building,
} from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const hrmCards = [
  { title: 'Department Setting', subtitle: 'HR department master setup', icon: Building2, route: '/settings/hrm/department' },
  { title: 'Social Category Master', subtitle: 'Social category classifications', icon: Users, route: '/settings/hrm/social-category' },
  { title: 'Designation Master', subtitle: 'Designation and job levels', icon: Briefcase, route: '/settings/hrm/designations' },
  { title: 'HRM Holiday Master', subtitle: 'Holiday calendar management', icon: UmbrellaOff, route: '/leave-management' },
  { title: 'Leave Management', subtitle: 'Employee leave workflows and approval setup', icon: UmbrellaOff, route: '/leave-management' },
  { title: 'HRM Leave Group Master', subtitle: 'Leave policy groups', icon: Calendar, route: '/settings/hrm/leave-group' },
  { title: 'HRM Leave Cycle Master', subtitle: 'Leave cycle configuration', icon: Repeat, route: '/settings/hrm/leave-cycle' },
  { title: 'Leave Preference Master', subtitle: 'Employee leave preferences', icon: Sliders, route: '/settings/hrm/leave-preference' },
  { title: 'Payroll Setting', subtitle: 'Payroll master and pay cycles', icon: DollarSign, route: '/payroll-management' },
  { title: 'Payroll Master', subtitle: 'Payroll processing and approvals', icon: Banknote, route: '/payroll-management' },
  { title: 'Employee Id Setup', subtitle: 'Employee master and profiles', icon: FileText, route: '/employees' },
  { title: 'Organization Management', subtitle: 'Entity and branch locations', icon: Building, route: '/organizations' },
  { title: 'Entity Locations', subtitle: 'Location and office mapping', icon: MapPinCheck, route: '/organizations' },
  { title: 'HR Documents', subtitle: 'Employee document tracking', icon: FolderKanban, route: '/hr-documents' },
];

export default function HRMSetupPage() {
  const navigate = useNavigate();

  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-8">
          <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Institute Setup', to: '/settings/institute' }, { label: 'HRM Master' }]} />
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Dashboard</span>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">HRM Master Setup</h1>
            <p className="max-w-2xl text-sm text-slate-500">Manage HR master data, employee setup, payroll configuration, and leave management from one comprehensive dashboard.</p>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {hrmCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: index * 0.03 }}
                whileHover={{ y: -6, scale: 1.01, boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)' }}
                onClick={() => navigate(card.route)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(card.route)}
                role="button"
                tabIndex={0}
                aria-label={`${card.title}: ${card.subtitle}`}
                className="group flex h-[220px] flex-col items-center justify-center rounded-[18px] border border-slate-200 bg-white p-5 text-center shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all duration-200 hover:border-emerald-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)] hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                <div className="mb-4 flex h-[62px] w-[62px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-emerald-600 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:text-emerald-700">
                  <Icon className="h-[34px] w-[34px]" />
                </div>
                <h2 className="text-[22px] font-semibold leading-tight text-slate-900 transition-colors duration-200 group-hover:text-emerald-700">
                  {card.title}
                </h2>
                <p className="mt-2 max-w-[180px] text-[14px] leading-5 text-slate-500">
                  {card.subtitle}
                </p>
              </motion.article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
