import { useEffect } from 'react';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';
import { ArrowRight, CalendarClock, Sparkles } from 'lucide-react';

export default function AcademicPlaceholderPage({ title, description }) {
  useEffect(() => {
    document.title = `${title} - Institute Setup - Academics`;
  }, [title]);

  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <Breadcrumb
          items={[
            { label: 'Dashboard', to: '/' },
            { label: 'Institute Setup', to: '/settings/institute' },
            { label: 'Academics', to: '/settings/institute/academics' },
            { label: title },
          ]}
        />

        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-2xl rounded-[24px] border border-slate-200 bg-slate-50/80 p-8 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-emerald-50 text-emerald-600">
              <Sparkles className="h-8 w-8" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
            <p className="mt-3 text-sm text-slate-600 sm:text-[15px]">{description}</p>

            <div className="mt-6 rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-left">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <CalendarClock className="h-4 w-4" />
                Coming Soon
              </div>
              <p className="mt-2 text-sm text-emerald-800/90">
                This academic module is in active development and will be available in the ERP workflow soon.
              </p>
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Continue with the Academics setup flow
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
