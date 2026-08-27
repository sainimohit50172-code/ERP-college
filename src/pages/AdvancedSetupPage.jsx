import { motion } from 'framer-motion';
import { Award, ClipboardCheck, FileText, Lightbulb, Tags, UsersRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const advancedCards = [
  { title: 'Specialisation', subtitle: 'Specialisation', icon: Award, route: '/settings/advanced/specialisation' },
  { title: 'Event Type', subtitle: 'Event Type Setting', icon: Lightbulb, route: '/settings/advanced/event-type' },
  { title: 'Event Group', subtitle: 'Event Group Setting', icon: UsersRound, route: '/settings/advanced/event-group' },
  { title: 'Feedback Parameter', subtitle: 'Feedback Parameter Setting', icon: ClipboardCheck, route: '/settings/advanced/feedback-parameter' },
  { title: 'Criteria Master', subtitle: 'Criteria Master Setting', icon: Tags, route: '/settings/advanced/criteria-master' },
  { title: 'Submission Category', subtitle: 'Submission Category Setting', icon: FileText, route: '/settings/advanced/submission-category' },
];

export default function AdvancedSetupPage() {
  const navigate = useNavigate();

  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#eff6ff_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-5 border-b border-slate-200/80 pb-5">
          <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Settings', to: '/settings' }, { label: 'Advanced Setup' }]} />
        </div>
      <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {advancedCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.title}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
              whileHover={{ y: -5, scale: 1.01 }}
              onClick={() => navigate(card.route)}
              className="group flex min-h-[190px] flex-col items-center justify-center rounded-[18px] border border-slate-200 bg-white p-5 text-center shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all duration-200 hover:border-sky-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)] focus:outline-none focus:ring-2 focus:ring-sky-300"
            >
              <div className="mb-4 flex h-[58px] w-[58px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sky-700 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-sky-200 group-hover:bg-sky-50">
                <Icon className="h-7 w-7" strokeWidth={1.6} />
              </div>
              <h2 className="text-lg font-semibold leading-tight text-slate-900 transition-colors group-hover:text-sky-700">{card.title}</h2>
              <p className="mt-2 max-w-[190px] text-sm leading-5 text-slate-500">{card.subtitle}</p>
            </motion.button>
          );
        })}
      </div>
      </div>
    </div>
  );
}