import { forwardRef } from 'react';

const baseClassName = 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-60';

const variantClassName = {
  default: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
  primary: 'text-sky-700 hover:bg-sky-50 hover:text-sky-800',
  success: 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800',
  danger: 'text-rose-700 hover:bg-rose-50 hover:text-rose-800',
};

const IconActionButton = forwardRef(function IconActionButton({ icon: Icon, title, ariaLabel, className = '', variant = 'default', ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      title={title}
      aria-label={ariaLabel || title}
      className={`${baseClassName} ${variantClassName[variant] || variantClassName.default} ${className}`}
      style={{ '--hover-gradient-radius': '9999px' }}
      {...props}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
    </button>
  );
});

export default IconActionButton;
