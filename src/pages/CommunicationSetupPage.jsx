import { motion } from 'framer-motion';
import { BellRing, CalendarDays, FileBarChart2, FileText, Megaphone, MessageCircle, MessageSquareText, Radio, Send, Smartphone, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const communicationModules = [
  { title: 'Send Text SMS', subtitle: 'Send targeted SMS to students, staff and guardians', icon: Smartphone, route: '/communication/send-text-sms', tone: 'teal' },
  { title: 'Send WhatsApp Message', subtitle: 'Reach contacts through approved WhatsApp communication', icon: MessageCircle, route: '/communication/send-whatsapp-message', tone: 'emerald' },
  { title: 'Employee Announcement', subtitle: 'Publish important updates for employees and faculty', icon: Megaphone, route: '/communication/employee-announcement', tone: 'amber' },
  { title: 'Notifications', subtitle: 'Review alerts generated across ERP modules', icon: BellRing, route: '/notifications', tone: 'sky' },
  { title: 'Circulars', subtitle: 'Manage official circulars and institutional notices', icon: FileText, route: '/notifications/circular', tone: 'indigo' },
  { title: 'Notices', subtitle: 'Share notices with the right campus audience', icon: Radio, route: '/notifications/notice', tone: 'rose' },
  { title: 'Communication Report', subtitle: 'Track delivery, reach and communication activity', icon: FileBarChart2, route: '/communication/report', tone: 'violet' },
  { title: 'Date Sheet', subtitle: 'Publish date sheets and academic schedules', icon: CalendarDays, route: '/notifications/date-sheet', tone: 'cyan' },
];

const toneStyles = {
  teal: 'bg-teal-50 text-teal-700 group-hover:border-teal-300 group-hover:bg-teal-100',
  emerald: 'bg-emerald-50 text-emerald-700 group-hover:border-emerald-300 group-hover:bg-emerald-100',
  amber: 'bg-amber-50 text-amber-700 group-hover:border-amber-300 group-hover:bg-amber-100',
  sky: 'bg-sky-50 text-sky-700 group-hover:border-sky-300 group-hover:bg-sky-100',
  indigo: 'bg-indigo-50 text-indigo-700 group-hover:border-indigo-300 group-hover:bg-indigo-100',
  rose: 'bg-rose-50 text-rose-700 group-hover:border-rose-300 group-hover:bg-rose-100',
  violet: 'bg-violet-50 text-violet-700 group-hover:border-violet-300 group-hover:bg-violet-100',
  cyan: 'bg-cyan-50 text-cyan-700 group-hover:border-cyan-300 group-hover:bg-cyan-100',
};

export default function CommunicationSetupPage() {
  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f0fdfa_0%,#ffffff_48%,#eef6ff_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/95 p-3 shadow-inner sm:p-5">
        <div className="mb-6 flex flex-col gap-5 border-b border-slate-200/80 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Settings', to: '/settings' }, { label: 'Communication' }]} />
            <div className="mt-5 flex items-start gap-3">
              <div className="rounded-2xl bg-[#102a43] p-3 text-white shadow-lg shadow-slate-200"><MessageSquareText className="h-6 w-6" /></div>
              <div><p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-600">Communication center</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Connect your campus</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Send announcements, publish notices and monitor institutional communication from one focused workspace.</p></div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm"><Send className="h-4 w-4" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Communication hub</p><p className="mt-1 text-sm text-teal-900">8 workflows available</p></div></div>
        </div>

        <section className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {communicationModules.map((module, index) => {
            const Icon = module.icon;
            return <motion.div key={module.title} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: index * 0.04 }} whileHover={{ y: -5, scale: 1.01 }}>
              <Link to={module.route} className="group flex min-h-[198px] h-full flex-col justify-between rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all duration-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.11)] focus:outline-none focus:ring-2 focus:ring-teal-300">
                <div className="flex items-start justify-between"><div className={`rounded-2xl border border-transparent p-3 transition-colors ${toneStyles[module.tone]}`}><Icon className="h-7 w-7" /></div><span className="text-slate-300 transition-colors group-hover:text-teal-500">-&gt;</span></div>
                <div><h2 className="text-lg font-semibold leading-tight text-slate-900 transition-colors group-hover:text-teal-700">{module.title}</h2><p className="mt-2 max-w-[220px] text-sm leading-5 text-slate-500">{module.subtitle}</p></div>
              </Link>
            </motion.div>;
          })}
        </section>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-200/80 pt-4 text-xs text-slate-500"><span className="inline-flex items-center gap-2"><UsersRound className="h-4 w-4 text-teal-600" /> Students, staff and guardians</span><span className="inline-flex items-center gap-2"><Send className="h-4 w-4 text-sky-600" /> Centralised delivery workflows</span><span className="inline-flex items-center gap-2"><FileBarChart2 className="h-4 w-4 text-indigo-600" /> Reports and traceability</span></div>
      </div>
    </div>
  );
}