import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="erp-content-wrapper grid min-h-[70vh] place-items-center py-10">
      <div className="max-w-xl rounded-[32px] border border-rose-200/40 bg-white px-10 py-14 text-center shadow-[0_35px_80px_rgba(15,23,42,0.08)]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h1 className="mt-8 text-3xl font-semibold text-slate-950">Access denied</h1>
        <p className="mt-4 text-sm text-slate-500">You do not have permission to view this module. Please contact your administrator if you believe this is an error.</p>
        <div className="mt-8">
          <Link to="/" className="rounded-3xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">Go to dashboard</Link>
        </div>
      </div>
    </div>
  );
}
