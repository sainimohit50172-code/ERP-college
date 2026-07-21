import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="erp-content-wrapper flex min-h-[70vh] flex-col items-center justify-center gap-6 py-24 text-center text-slate-200">
      <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">Page not found</p>
      <h1 className="text-6xl font-semibold text-white">404</h1>
      <p className="max-w-xl text-lg text-slate-400">The page you are looking for does not exist or has been moved. Return to the dashboard to continue working.</p>

    </div>
  );
}
