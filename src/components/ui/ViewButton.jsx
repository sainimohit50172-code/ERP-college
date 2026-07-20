import { Eye } from 'lucide-react';

export default function ViewButton({ title = 'View', ariaLabel, className = '', ...props }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={ariaLabel || title}
      className={`hover-gradient-border inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 ${className}`}
      style={{ '--hover-gradient-radius': '9999px' }}
      {...props}
    >
      <Eye className="h-4 w-4" />
    </button>
  );
}
