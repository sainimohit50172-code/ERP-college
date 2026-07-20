import { useMemo } from 'react';
import { useERP } from '../services/ERPContext.jsx';
import { CheckCircle2, BellRing, Clock3 } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, markAllNotificationsAsRead, markNotificationAsRead } = useERP();

  const summary = useMemo(() => ({
    unread: notifications.filter((notification) => !notification.read).length,
    total: notifications.length,
  }), [notifications]);

  return (
    <div className="space-y-4 rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-600">Communications</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">Notifications</h1>
          <p className="mt-2 text-sm text-slate-500">Track the latest academic, attendance, and finance alerts in one place.</p>
        </div>
        <button type="button" onClick={markAllNotificationsAsRead} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">
          <BellRing className="h-4 w-4" /> Mark all read
        </button>
      </div>
      <div className="grid gap-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Unread</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">{summary.unread}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Total alerts</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{summary.total}</p>
        </div>
      </div>
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">No notifications yet. Activity from admissions, attendance, and payroll will appear here.</div>
        ) : notifications.map((notification) => (
          <button key={notification.id} type="button" onClick={() => markNotificationAsRead(notification.id)} className={`flex w-full items-start justify-between gap-4 rounded-[24px] border px-4 py-4 text-left transition ${notification.read ? 'border-slate-200 bg-white' : 'border-emerald-200 bg-emerald-50 shadow-sm'}`}>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {notification.read ? <Clock3 className="h-4 w-4 text-slate-400" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                <p className="text-sm font-semibold text-slate-950">{notification.title}</p>
              </div>
              <p className="mt-2 text-sm text-slate-600">{notification.details}</p>
            </div>
            <span className="text-xs uppercase tracking-[0.22em] text-slate-400">{notification.date}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
