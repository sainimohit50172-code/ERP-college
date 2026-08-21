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
                  <h2 className="text-xl font-semibold text-slate-900 transition duration-300 group-hover:text-emerald-600">{module.title}</h2>
                  <p className="text-sm leading-6 text-slate-500 transition duration-300 group-hover:text-slate-700">{module.subtitle}</p>
                </div>
              </Card>
            );
          })}
        </section>
      </div>
    </div>
  );
}
