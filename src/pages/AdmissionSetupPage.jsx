import { ClipboardList, Workflow } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const MotionLink = motion.create(Link);

const cards = [
  {
    title: 'Admission Master',
    subtitle: 'Admission Master Setup',
    icon: ClipboardList,
    route: '/admission/admissionMaster',
  },
  {
    title: 'Stages Setup',
    subtitle: 'Admission Stages Setup',
    icon: Workflow,
    route: '/admission/stagesSetup',
  },
];

export default function AdmissionSetupPage() {
  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-8">
          <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Institute Setup', to: '/settings/institute' }, { label: 'Admission Setup' }]} />
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Institute Setup</span>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Admission Setup</h1>
            <p className="max-w-2xl text-sm text-slate-500">Select an admission configuration area.</p>
          </div>
        </div>

          <section className="grid gap-4 sm:grid-cols-2">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <MotionLink
                to={card.route}
                key={card.title}
                aria-label={`${card.title}: ${card.subtitle}`}
                className="group flex h-full min-h-[220px] max-h-[240px] flex-col justify-between overflow-hidden rounded-[18px] border border-slate-200 bg-white p-7 text-left shadow-sm transition duration-300 ease-out hover:-translate-y-2.5 hover:scale-[1.02] hover:border-emerald-500 hover:shadow-[0_24px_55px_rgba(15,23,42,0.12)] focus:outline-none focus:ring-2 focus:ring-emerald-300"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.36, delay: index * 0.05 }}
              >
                <div className="w-fit rounded-full bg-[#F5F8FC] p-3 text-emerald-600 transition duration-300 group-hover:bg-emerald-600 group-hover:text-white">
                  <Icon size={46} aria-hidden="true" />
                </div>
                <div className="mt-8 flex flex-1 flex-col justify-center gap-3">
                  <h2 className="text-xl font-semibold text-slate-900 transition duration-300 group-hover:text-emerald-600">{card.title}</h2>
                  <p className="text-sm leading-6 text-slate-500 transition duration-300 group-hover:text-slate-700">{card.subtitle}</p>
                </div>
              </MotionLink>
            );
          })}
        </section>
      </div>
    </div>
  );
}
