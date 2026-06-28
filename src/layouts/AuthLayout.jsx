import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_80%)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl rounded-[32px] border border-slate-200/70 bg-white shadow-[0_35px_80px_rgba(15,23,42,0.1)] p-6">
        <Outlet />
      </div>
    </div>
  );
}
