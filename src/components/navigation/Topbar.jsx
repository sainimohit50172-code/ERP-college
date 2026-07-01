import { useMemo, useState } from 'react';
import { Menu, Bell, Sparkles, UserCircle2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown.jsx';
import GlobalSearch from '../ui/GlobalSearch.jsx';
import { useERP } from '../../services/ERPContext.jsx';
import { useAuth } from '../../services/AuthContext.jsx';

const formatBreadcrumb = (segment) =>
  segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function Topbar({ onToggleSidebar }) {
  const location = useLocation();
  const { notifications } = useERP();
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = useMemo(
    () => ['Dashboard', ...pathSegments.map(formatBreadcrumb)],
    [pathSegments]
  );

  const { auth } = useAuth();
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const roleLabel = auth?.role || 'Guest';

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 px-3 py-3 shadow-sm backdrop-blur-xl sm:px-4 md:px-6 lg:px-8 xl:px-10">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="inline-flex items-center justify-center rounded-2xl p-2 text-slate-700 hover:bg-slate-100 md:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-slate-500 sm:text-xs">
              {breadcrumbs.map((crumb, index) => (
                <span key={`${crumb}-${index}`} className="inline-flex items-center gap-2">
                  {index > 0 && <span className="text-slate-300">/</span>}
                  <span>{crumb}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-slate-950 sm:text-2xl">Executive dashboard</h1>
              <p className="text-sm text-slate-500">Premium operations overview for the university leadership team.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/70 px-3 py-2 text-sm text-emerald-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Smart analytics enabled
            </div>
          </div>
        </div>

        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="sm:w-[260px] lg:w-[320px]">
            <GlobalSearch />
          </div>
          <div className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={() => setNotificationsOpen((open) => !open)}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:h-11 sm:w-11"
              aria-label="Open notifications"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </button>
            <button className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:h-11">
              <UserCircle2 className="h-4 w-4 text-emerald-600 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">{auth?.user?.name ?? roleLabel}</span>
            </button>
            <NotificationDropdown open={isNotificationsOpen} onClose={() => setNotificationsOpen(false)} />
          </div>
        </div>
      </div>
    </header>
  );
}
