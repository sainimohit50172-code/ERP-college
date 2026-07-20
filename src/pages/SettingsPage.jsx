import { Link } from 'react-router-dom';
import { Bell, ShieldCheck, MoonStar, SlidersHorizontal, KeyRound, Building } from 'lucide-react';

const cards = [
  { title: 'Security', description: 'Manage sign-in preferences, MFA reminders, and access policies.', href: '/change-password', icon: ShieldCheck },
  { title: 'Notifications', description: 'Control how alerts are delivered across admissions, attendance, and finance.', href: '/notifications', icon: Bell },
  { title: 'Institute Setup', description: 'Configure your institution modules, academic settings, and fee structure.', href: '/settings/institute', icon: Building },
  { title: 'Appearance', description: 'Switch between light and dark themes for the workspace.', href: '/settings', icon: MoonStar },
  { title: 'Preferences', description: 'Tune the dashboard experience and default module views.', href: '/settings', icon: SlidersHorizontal },
];

export default function SettingsPage() {
  return (
    <div className="no-hover-border rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-600">Workspace settings</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">Preferences and security</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Keep the ERP aligned with your institution’s daily operations, security needs, and communication flow.</p>
        </div>
        <Link to="/change-password" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500">
          <KeyRound className="h-4 w-4" /> Change password
        </Link>
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={card.href} className="hover-gradient-border rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:border-emerald-200 hover:bg-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-950">{card.title}</p>
                  <p className="mt-2 text-sm text-slate-500">{card.description}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
