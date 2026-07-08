import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_80%)] px-3 py-4 sm:px-4 sm:py-8 lg:px-6 lg:py-10">
      <div className="w-full max-w-4xl rounded-[24px] border border-slate-200/70 bg-white p-4 shadow-[0_35px_80px_rgba(15,23,42,0.1)] sm:rounded-[32px] sm:p-6 lg:p-8">
        <Outlet />
      </div>
    </div>
  );
}
