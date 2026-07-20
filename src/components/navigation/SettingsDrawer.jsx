import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Bell, MoonStar, ShieldCheck, Sparkles } from 'lucide-react';

export default function SettingsDrawer({ isOpen = false, onClose = () => {} }) {
  const navigate = useNavigate();
  const [compactMode, setCompactMode] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40">
      <div className="h-full w-full max-w-md border-l border-slate-200/70 bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between hover-gradient-border">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Settings</p>
            <h3 className="text-lg font-semibold text-slate-950">Preferences</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl p-2 text-slate-600 hover:bg-slate-100 hover-gradient-border">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6 space-y-3 text-sm text-slate-600">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between hover-gradient-border">
              <div>
                <p className="font-semibold text-slate-900">Compact mode</p>
                <p className="mt-1 text-sm text-slate-500">Reduce spacing for a more dense workspace view.</p>
              </div>
              <button type="button" onClick={() => setCompactMode((value) => !value)} className={`relative h-6 w-11 rounded-full transition ${compactMode ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${compactMode ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
          <button type="button" onClick={() => { onClose(); navigate('/notifications'); }} className="flex w-full items-center justify-between rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-left text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50">
            <span className="flex items-center gap-2 hover-gradient-border"><Bell className="h-4 w-4 text-emerald-600" /> Notifications</span>
            <span className="text-sm text-slate-400">Manage</span>
          </button>
          <button type="button" onClick={() => { onClose(); navigate('/change-password'); }} className="flex w-full items-center justify-between rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-left text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50">
            <span className="flex items-center gap-2 hover-gradient-border"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Security</span>
            <span className="text-sm text-slate-400">Update</span>
          </button>
          <button type="button" onClick={() => { onClose(); navigate('/settings'); }} className="flex w-full items-center justify-between rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-left text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50">
            <span className="flex items-center gap-2 hover-gradient-border"><MoonStar className="h-4 w-4 text-emerald-600" /> Appearance</span>
            <span className="text-sm text-slate-400">Theme</span>
          </button>
          <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 p-4 text-emerald-900">
            <div className="flex items-center gap-2 hover-gradient-border">
              <Sparkles className="h-4 w-4" />
              <p className="font-semibold">Workspace status</p>
            </div>
            <p className="mt-2 text-sm">Your dashboard, navigation, and profile shortcuts are now routed to the most relevant pages.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
