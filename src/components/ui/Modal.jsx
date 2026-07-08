import { X } from 'lucide-react';

export default function Modal({ title, children, isOpen, onClose, footer }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-2 py-3 backdrop-blur-sm transition-opacity sm:px-4">
      <div className="max-h-[90vh] w-full max-w-[95vw] sm:max-w-4xl overflow-hidden rounded-[20px] border border-slate-200/70 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
        <div className="flex flex-col gap-3 items-start justify-between border-b border-slate-200/70 px-4 py-4 sm:flex-row sm:px-5 md:px-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-4 py-4 sm:px-5 md:px-6">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200/70 px-4 py-4 sm:px-5 md:px-6">{footer}</div>}
      </div>
    </div>
  );
}
