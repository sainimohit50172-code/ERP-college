import { motion } from 'framer-motion';
import { BookOpen, BookOpenCheck, CalendarDays, ClipboardList, FileText, Globe2, Library, ListTree, Map, Settings2, Tags, UserRound, UsersRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const libraryCards = [
  { title: 'Library Setup', subtitle: 'Configure core library settings', icon: Library, route: '/library/setup' },
  { title: 'Library Vendor', subtitle: 'Manage book suppliers and vendors', icon: UsersRound, route: '/library/vendors' },
  { title: 'Library Book Rack', subtitle: 'Organize racks and shelf locations', icon: Map, route: '/library/racks' },
  { title: 'Category', subtitle: 'Library master category', icon: Tags, route: '/library/categories' },
  { title: 'Language', subtitle: 'Library master language', icon: Globe2, route: '/library/languages' },
  { title: 'Availability', subtitle: 'Library master availability', icon: CheckCircleIcon, route: '/library/availability' },
  { title: 'SubCategory', subtitle: 'Library master subcategory', icon: ListTree, route: '/library/subcategories' },
  { title: 'Subject', subtitle: 'Library master subject', icon: BookOpenCheck, route: '/library/subjects' },
  { title: 'Library Book', subtitle: 'Library book setup', icon: BookOpen, route: '/library/books' },
  { title: 'Library Issue Type', subtitle: 'Library issue setup', icon: ClipboardList, route: '/library/issue-types' },
  { title: 'Library Return Dates', subtitle: 'Configure return date rules', icon: CalendarDays, route: '/library/return-dates' },
  { title: 'Library Member Id', subtitle: 'Library membership setup', icon: UserRound, route: '/library/member-id' },
  { title: 'Library Membership', subtitle: 'Manage membership rules', icon: UsersRound, route: '/library/membership' },
  { title: 'Receipt Id Counter', subtitle: 'Receipt id counter setup', icon: FileText, route: '/library/receipt-id-counter' },
];

function CheckCircleIcon(props) {
  return <Settings2 {...props} />;
}

export default function LibrarySetupPage() {
  const navigate = useNavigate();

  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#eff6ff_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-5 border-b border-slate-200/80 pb-5">
          <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Settings', to: '/settings' }, { label: 'Library Setup' }]} />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-600">Library setup</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Configure your library workspace</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-[15px]">Set up books, members, circulation rules, catalog structure, and receipt controls from one focused library hub.</p>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">14 library modules available</div>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {libraryCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.title}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.035 }}
                whileHover={{ y: -5, scale: 1.01 }}
                onClick={() => navigate(card.route)}
                className="group flex min-h-[190px] flex-col items-center justify-center rounded-[18px] border border-slate-200 bg-white p-5 text-center shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all duration-200 hover:border-sky-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)] focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                <div className="mb-4 flex h-[58px] w-[58px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sky-700 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-sky-200 group-hover:bg-sky-50">
                  <Icon className="h-7 w-7" />
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
