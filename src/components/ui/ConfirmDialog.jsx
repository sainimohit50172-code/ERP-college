import { useEffect } from 'react';

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onCancel, onConfirm }) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape' && open) {
        onCancel?.();
      }
    }
    if (open) window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-3 text-sm text-slate-500">{description}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="btn btn-secondary w-full sm:w-auto">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className="btn btn-primary w-full sm:w-auto">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
