import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Bell, Sparkles, Settings2, UserCircle2, Zap, SunMedium, MoonStar, ChevronDown, LogOut } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown.jsx';
import GlobalSearch from '../ui/GlobalSearch.jsx';
import SettingsDrawer from './SettingsDrawer.jsx';
import { useERP } from '../../services/ERPContext.jsx';
import { useAuth } from '../../services/AuthContext.jsx';

const formatBreadcrumb = (segment) =>
  segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

function NavDropdown({ label, items }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
      >
        <span>{label}</span>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div className="absolute left-0 z-30 mt-2 min-w-[180px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function Topbar({ onToggleSidebar }) {
  const location = useLocation();
  const { notifications, theme, setTheme } = useERP();
  const { auth, logout } = useAuth();
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = useMemo(
    () => ['Dashboard', ...pathSegments.map(formatBreadcrumb)],
    [pathSegments]
  );

  useEffect(() => {
    const applyTheme = (selectedTheme) => {
      document.documentElement.classList.toggle('dark', selectedTheme === 'dark');
      document.documentElement.setAttribute('data-theme', selectedTheme);
      localStorage.setItem('erp-theme', selectedTheme);
    };
    applyTheme(theme || 'light');
  }, [theme]);

  

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const roleLabel = auth?.role || 'Guest';

  

  const handleThemeToggle = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 px-3 py-2.5 shadow-sm backdrop-blur-xl sm:px-4 md:px-6 lg:px-8 xl:px-10">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="inline-flex items-center justify-center rounded-xl p-2 text-slate-700 hover:bg-slate-100 md:hidden"
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
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/70 px-2.5 py-1.5 text-xs text-emerald-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Smart analytics enabled
            </div>
          </div>
        </div>

        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="hidden md:flex flex-wrap items-center gap-2">
            <NavDropdown label="Fees" items={[{ label: 'Fees', to: '/fees' }]} />
            <NavDropdown label="Finance" items={[{ label: 'Finance', to: '/finance-accounting' }]} />
            <NavDropdown label="Admissions" items={[{ label: 'Admissions', to: '/admissions' }]} />
            <NavDropdown label="Analytics" items={[{ label: 'Analytics', to: '/reports' }]} />
          </div>
          <div className="sm:w-[170px] lg:w-[210px]">
            <GlobalSearch />
          </div>
          <div className="relative flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:inline-flex"
              aria-label="Quick actions"
            >
              <Zap className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setNotificationsOpen((open) => !open)}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              aria-label="Open notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((open) => !open)}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <UserCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="hidden sm:inline">{auth?.user?.name ?? roleLabel}</span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>
              {isProfileMenuOpen ? (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                  <button type="button" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
                    <UserCircle2 className="h-4 w-4" />
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              aria-label="Open settings"
            >
              <Settings2 className="h-4 w-4" />
            </button>
            <NotificationDropdown open={isNotificationsOpen} onClose={() => setNotificationsOpen(false)} />
          </div>
        </div>
      </div>
      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  );
}
