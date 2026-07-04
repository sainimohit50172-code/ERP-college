import { X } from 'lucide-react';

export default function SettingsDrawer({ isOpen = false, onClose = () => {} }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40">
      <div className="h-full w-full max-w-md border-l border-slate-200/70 bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Settings</p>
            <h3 className="text-lg font-semibold text-slate-950">Preferences</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl p-2 text-slate-600 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6 space-y-3 text-sm text-slate-600">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">The app shell is restored to its last working state.</div>
        </div>
      </div>
    </div>
  );
}
