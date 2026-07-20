import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2 } from 'lucide-react';
import { useERP } from '../../services/ERPContext.jsx';

const defaultTargets = [
  { label: 'Students', path: '/students' },
  { label: 'Faculty', path: '/teachers' },
  { label: 'Courses', path: '/courses' },
  { label: 'Departments', path: '/departments' },
  { label: 'Inventory', path: '/inventory' },
  { label: 'Transport', path: '/transport' },
];

export default function NotificationDropdown({ open, onClose }) {
  const { notifications, markAllNotificationsAsRead, markNotificationAsRead } = useERP();
  const navigate = useNavigate();
  const panelRef = useRef(null);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (open && panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div ref={panelRef} className="absolute right-0 top-full z-50 mt-3 w-full max-w-sm rounded-[22px] border border-slate-200/80 bg-white shadow-soft">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 px-4 py-3 hover-gradient-border">
        <div className="flex items-center gap-2 text-slate-900 hover-gradient-border">
          <Bell className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-slate-500">{unreadCount} unread</p>
          </div>
        </div>
        <button type="button" onClick={markAllNotificationsAsRead} className="text-sm font-semibold text-emerald-600 transition hover:text-emerald-700 hover-gradient-border">
          Mark all read
        </button>
      </div>
      <div className="max-h-72 space-y-1 overflow-y-auto px-3 py-2">
        {notifications.length === 0 ? (
          <div className="rounded-3xl bg-slate-50 p-4 text-center text-sm text-slate-500">No notifications available.</div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => {
                markNotificationAsRead(notification.id);
                onClose();
              }}
              className={`w-full rounded-3xl border px-4 py-3 text-left transition ${notification.read ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-emerald-100 bg-emerald-50 text-slate-900 shadow-sm'}`}
            >
              <div className="flex items-center justify-between gap-2 hover-gradient-border">
                <p className="text-sm font-semibold">{notification.title}</p>
                {!notification.read ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : null}
              </div>
              <p className="mt-1 text-sm text-slate-500">{notification.details}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-400">{notification.date}</p>
            </button>
          ))
        )}
      </div>
      <div className="grid gap-2 border-t border-slate-200/70 px-4 py-3">
        <p className="text-sm font-semibold text-slate-950">Quick actions</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {defaultTargets.map((target) => (
            <button
              key={target.label}
              type="button"
              onClick={() => {
                onClose();
                navigate(target.path);
              }}
              className="rounded-2xl border border-slate-200/70 bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {target.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
