import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  GitBranch,
  ReceiptText,
  Network,
  Tags,
  Radio,
  Armchair,
  UserRoundCog,
  Copy,
  Settings2,
  PhoneCall,
  UserRoundPlus,
  RefreshCw,
} from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const MotionLink = motion.create(Link);

const admissionModules = [
  {
    title: 'Application Number Setup',
    subtitle: 'Application Number',
    icon: ClipboardList,
    route: '/admission/admissionMaster/application-number',
  },
  {
    title: 'Stages Master Setup',
    subtitle: 'Admission Stages Master Setup',
    icon: GitBranch,
    route: '/admission/stagesSetup',
  },
  {
    title: 'Transaction Receipt Setup',
    subtitle: 'Admission Transaction Receipt Master Setup',
    icon: ReceiptText,
    route: '/admission/admissionMaster/transaction-receipt',
  },
  {
    title: 'Admission Heads',
    subtitle: 'Admission Head Master Setup',
    icon: Network,
    route: '/admission/admissionMaster/heads',
  },
  {
    title: 'Admission Tags',
    subtitle: 'Admission Tags Master Setup',
    icon: Tags,
    route: '/admission/admissionMaster/tags',
  },
  {
    title: 'Admission Source',
    subtitle: 'Admission Source Master Setup',
    icon: Radio,
    route: '/admission/admissionMaster/source',
  },
  {
    title: 'Source Group',
    subtitle: 'Admission Source Group Master Setup',
    icon: Network,
    route: '/admission/admissionMaster/source-group',
  },
  {
    title: 'Admission Seats',
    subtitle: 'Admission Seats Master Setup',
    icon: Armchair,
    route: '/admission/admissionMaster/seats',
  },
  {
    title: 'Counselor Mapper',
    subtitle: 'Counselor Master Setup',
    icon: UserRoundCog,
    route: '/admission/admissionMaster/counselor-mapper',
  },
  {
    title: 'Duplicate Fields Master',
    subtitle: 'Duplicate Fields Master',
    icon: Copy,
    route: '/admission/admissionMaster/duplicate-fields',
  },
  {
    title: 'My Operator Config',
    subtitle: 'My Operator Config Master',
    icon: Settings2,
    route: '/admission/admissionMaster/operator-config',
  },
  {
    title: 'IVR Outbound Call Config',
    subtitle: 'IVR Outbound Call Config Master',
    icon: PhoneCall,
    route: '/admission/admissionMaster/ivr-outbound-call',
  },
  {
    title: 'Admission Teams',
    subtitle: 'Admission Teams Master Setup',
    icon: UserRoundPlus,
    route: '/admission/admissionMaster/teams',
  },
  {
    title: 'Counselor Round Robin',
    subtitle: 'Counselor Round Robin',
    icon: RefreshCw,
    route: '/admission/admissionMaster/counselor-round-robin',
  },
];

export default function AdmissionMasterDashboardPage() {
  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-8">
          <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Institute Setup', to: '/settings/institute' }, { label: 'Admission Setup', to: '/admission/setup' }, { label: 'Admission Master' }]} />
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Admission Setup</span>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Admission Master</h1>
            <p className="max-w-2xl text-sm text-slate-500">Centralized Admission Management</p>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {admissionModules.map((module, index) => {
            const Icon = module.icon;
            const Card = module.route ? MotionLink : motion.div;
            return (
              <Card
                {...(module.route ? { to: module.route } : {})}
                key={module.title}
                aria-label={`${module.title}: ${module.subtitle}`}
                className="group flex min-h-[190px] flex-col items-center justify-center overflow-hidden rounded-[18px] border border-slate-200 bg-white p-5 text-center shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:border-sky-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)] focus:outline-none focus:ring-2 focus:ring-sky-300"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.36, delay: index * 0.05 }}
              >
                <div className="mb-4 flex h-[58px] w-[58px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sky-700 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-sky-200 group-hover:bg-sky-50">
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </div>
                <div className="flex flex-col items-center justify-center">
                  <h2 className="text-lg font-semibold leading-tight text-slate-900 transition-colors group-hover:text-sky-700">{module.title}</h2>
                  <p className="mt-2 max-w-[190px] text-sm leading-5 text-slate-500">{module.subtitle}</p>
                </div>
              </Card>
            );
          })}
        </section>
      </div>
    </div>
  );
}
