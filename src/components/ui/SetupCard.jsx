import { ArrowRight } from 'lucide-react';

export default function SetupCard({
  icon: Icon,
  title,
  subtitle,
  onClick,
  ariaLabel,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || `${title} module`}
      className="group relative w-full overflow-hidden rounded-[18px] border border-slate-200 bg-white p-5 text-left shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all duration-350 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:border-emerald-300 hover:shadow-[0_22px_44px_rgba(15,23,42,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(16,185,129,0.06),rgba(255,255,255,0.95),rgba(15,23,42,0.02))] opacity-0 transition-opacity duration-350 group-hover:opacity-100" />

      <div className="relative flex h-[190px] flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-slate-200 bg-slate-50 text-emerald-600 transition-all duration-350 group-hover:-rotate-6 group-hover:border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white">
            <Icon className="h-7 w-7" />
          </div>

          <span className="inline-flex h-9 w-9 -translate-x-2 items-center justify-center rounded-full bg-slate-50 text-slate-500 opacity-0 transition-all duration-350 group-hover:translate-x-0 group-hover:opacity-100 group-hover:bg-emerald-50 group-hover:text-emerald-700">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>

        <div>
          <h2 className="text-[18px] font-semibold leading-6 text-slate-900 transition-colors duration-350 group-hover:text-emerald-700">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-5 text-slate-500">{subtitle}</p>
        </div>
      </div>
    </button>
  );
}
