import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, Download, Settings2, Bell, UserCircle2, X } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown.jsx';
import { useAuth } from '../../services/AuthContext.jsx';
import { useERP } from '../../services/ERPContext.jsx';

const navLinks = [
  { label: 'Fee', to: '/fees' },
  { label: 'Admission', to: '/admissions' },
  { label: 'Attendance', to: '/attendance/students' },
  { label: 'Examination', to: '/examination' },
  { label: 'Human Resource', to: '/employees' },
];

const quickActions = [
  { title: 'Institute Setup', subtitle: 'Informative Details', route: '/settings/institute', icon: '🏛️', color: '#3b82f6' },
  { title: 'Fee Structure', subtitle: 'Fee Details', route: '/fees/structure', icon: '💰', color: '#8b5cf6' },
  { title: 'Academics', subtitle: 'Academic Setup', route: '/academic-calendar', icon: '🎓', color: '#10b981' },
  { title: 'Library Setup', subtitle: 'Library Details', route: '/library', icon: '📚', color: '#f59e0b' },
  { title: 'Advanced Setup', subtitle: 'Advanced Settings', route: '/settings', icon: '⚙️', color: '#6366f1' },
  { title: 'Admission Setup', subtitle: 'Admission Details', route: '/admissions', icon: '🎯', color: '#ec4899' },
  { title: 'HRM Setup', subtitle: 'HRM Settings', route: '/employees', icon: '👥', color: '#14b8a6' },
  { title: 'Analytics Setup', subtitle: 'Analytics Details', route: '/reports', icon: '📊', color: '#f97316' },
  { title: 'Communication', subtitle: 'Communication Setting', route: '/notifications', icon: '💬', color: '#06b6d4' },
  { title: 'COE Master', subtitle: 'COE Master Setup', route: '/settings/coe', icon: '🏫', color: '#ef4444' },
];

const exportItems = [
  { label: 'Export Students CSV' },
  { label: 'Export Employees CSV' },
  { label: 'Export Fee Report' },
];

const isActiveLink = (pathname, to) => pathname === to || pathname.startsWith(`${to}/`);

export default function Topbar({ onToggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications } = useERP();
  const { auth, logout } = useAuth();
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isExportOpen, setExportOpen] = useState(false);
  const [isQuickActionsOpen, setQuickActionsOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const exportRef = useRef(null);
  const quickActionsRef = useRef(null);
  const profileRef = useRef(null);

  const userName = auth?.user?.name || 'Admin';
  const displayName = userName.split(' ')[0];
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSearchOpen && searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
      if (isExportOpen && exportRef.current && !exportRef.current.contains(event.target)) {
        setExportOpen(false);
      }
      if (isQuickActionsOpen && quickActionsRef.current && !quickActionsRef.current.contains(event.target)) {
        setQuickActionsOpen(false);
      }
      if (isProfileMenuOpen && profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen, isExportOpen, isQuickActionsOpen, isProfileMenuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200 bg-white px-3 md:left-[200px] md:w-[calc(100%-200px)]" style={{ height: 72 }}>
      <div className="flex h-full flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          {/* desktop sidebar collapse control removed (sidebar is fixed) */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 md:hidden"
            aria-label="Open sidebar drawer"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700">C</div>
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate text-[14px] font-semibold text-slate-900">College ERP</span>
              <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-medium text-slate-600">2026-27</span>
            </div>
          </div>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const active = isActiveLink(location.pathname, link.to);
            return (
              <button
                key={link.label}
                type="button"
                onClick={() => navigate(link.to)}
                className={`text-[13px] font-medium transition ${active ? 'text-[#00c896] border-b-2 border-[#00c896]' : 'text-[#475569] hover:text-[#00c896]'}`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        <div className="flex flex-wrap items-center justify-end gap-2 pr-0 md:pr-4" style={{ flexShrink: 0 }}>
          <div className="relative" ref={searchRef}>
            <button
              type="button"
              onClick={() => {
                setSearchOpen((open) => !open);
                setExportOpen(false);
                setQuickActionsOpen(false);
                setProfileMenuOpen(false);
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              aria-label="Open search"
            >
              <Search className="h-4 w-4" />
            </button>
            {isSearchOpen ? (
              <div className="absolute right-0 top-full z-20 mt-2 w-[280px] rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
                <input
                  type="search"
                  placeholder="Search students, fees, exams..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#00c896] focus:ring-2 focus:ring-[#00c896]/20"
                  autoFocus
                />
              </div>
            ) : null}
          </div>

          <div className="relative" ref={exportRef}>
            <button
              type="button"
              onClick={() => {
                setExportOpen((open) => !open);
                setSearchOpen(false);
                setQuickActionsOpen(false);
                setProfileMenuOpen(false);
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              aria-label="Open export menu"
            >
              <Download className="h-4 w-4" />
            </button>
            {isExportOpen ? (
              <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-lg">
                {exportItems.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setExportOpen(false)}
                    className="w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative" ref={quickActionsRef}>
            <button
              type="button"
              onClick={() => {
                setQuickActionsOpen((open) => !open);
                setSearchOpen(false);
                setExportOpen(false);
                setProfileMenuOpen(false);
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              aria-label="Open quick actions"
            >
              <Settings2 className="h-4 w-4" />
            </button>
            {isQuickActionsOpen ? (
              <div className="fixed inset-0 z-40 flex items-start justify-end bg-black/20">
                <div className="relative h-full w-[320px] bg-white p-5 shadow-2xl">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-base font-semibold text-slate-900">User Quick Actions</p>
                    <button type="button" onClick={() => setQuickActionsOpen(false)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {quickActions.map((action) => (
                      <button
                        key={action.title}
                        type="button"
                        onClick={() => {
                          navigate(action.route);
                          setQuickActionsOpen(false);
                        }}
                        className="group rounded-[10px] border border-[#e2e8f0] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                      >
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl text-base" style={{ backgroundColor: `${action.color}26`, color: action.color }}>
                          {action.icon}
                        </div>
                        <p className="text-[13px] font-semibold text-slate-950">{action.title}</p>
                        <p className="mt-1 text-[11px] text-slate-500">{action.subtitle}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => {
              setNotificationsOpen((open) => !open);
              setSearchOpen(false);
              setExportOpen(false);
              setQuickActionsOpen(false);
              setProfileMenuOpen(false);
            }}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            aria-label="Open notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            ) : null}
          </button>

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setProfileMenuOpen((open) => !open);
                setSearchOpen(false);
                setExportOpen(false);
                setQuickActionsOpen(false);
              }}
              className="inline-flex min-w-0 items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 text-left sm:min-w-[210px]"
              style={{ whiteSpace: 'nowrap', marginRight: 8, flexShrink: 0 }}
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-slate-900">Hello, {displayName}</p>
                <p className="truncate text-[11px] text-slate-500">Nice to have you back!</p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <UserCircle2 className="h-5 w-5" />
              </div>
            </button>
            {isProfileMenuOpen ? (
              <div className="absolute right-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    navigate('/settings');
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <UserCircle2 className="h-4 w-4" />
                  Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    navigate('/change-password');
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Settings2 className="h-4 w-4" />
                  Change password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <NotificationDropdown open={isNotificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </header>
  );
}
