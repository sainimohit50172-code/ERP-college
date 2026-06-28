import { X } from 'lucide-react';

export default function Modal({ title, children, isOpen, onClose, footer }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-3xl rounded-[32px] border border-slate-200/70 bg-white shadow-[0_35px_80px_rgba(15,23,42,0.16)] p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-6">{children}</div>
        {footer && <div className="mt-6 flex justify-end">{footer}</div>}
      </div>
    </div>
  );
}
