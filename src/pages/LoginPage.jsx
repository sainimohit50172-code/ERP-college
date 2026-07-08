import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUniversity, FaLock, FaUser } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../services/AuthContext.jsx';
import { ROLES } from '../services/rbac.js';

const roles = ROLES;
const highlights = [
  'Unified academic and administrative portal',
  'Role-based dashboards for staff, students and operations',
  'Secure access backed by single sign-on patterns',
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('Super Admin');
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onTouched' });

  const onSubmit = async (data) => {
    try {
      if (typeof login === 'function') {
        // attempt to call login with common shapes; tolerate different implementations
        try {
          await login(data.username, data.password, selectedRole);
        } catch (e) {
          await login({ username: data.username, password: data.password, role: selectedRole });
        }
      }
      navigate('/');
    } catch (err) {
      toast.error((err && err.message) || 'Login failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-2rem)] bg-gradient-to-b from-slate-900 to-slate-800 px-2 py-3 sm:px-4 sm:py-6 lg:px-6 lg:py-10">
      <div className="mx-auto flex max-w-6xl flex-col-reverse gap-4 rounded-[24px] border border-slate-800/80 bg-transparent p-1 shadow-2xl sm:gap-6 sm:rounded-[32px] lg:flex-row">
        <div
          className="hidden lg:block w-3/5 rounded-[32px] bg-cover bg-center p-10 lg:rounded-r-none lg:border-r lg:border-slate-800"
          style={{ background: 'linear-gradient(135deg, #0a2540 0%, #1a4a2e 50%, #0d3b1e 100%)' }}
        >
          <div className="space-y-6 text-slate-100">
            <div className="inline-flex items-center gap-3 rounded-full bg-sky-900/40 px-4 py-2 text-sm text-sky-200 ring-1 ring-white/10">
              <FaUniversity /> University ERP & Campus Operations
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-white">Welcome back to the campus command center.</h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-200">Sign in to manage admissions, attendance, academics, finance, library, transport, hostel and student lifecycle workflows from one unified ERP.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {highlights.map((item) => (
                <div key={item} className="rounded-[24px] border border-white/10 bg-slate-900/30 p-4 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full rounded-[24px] bg-white p-4 sm:p-6 md:p-8 lg:w-2/5 lg:rounded-l-none lg:p-10">
          <div className="mb-8 text-slate-900">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-400/90">Sign in</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">Secure campus login</h2>
            <p className="mt-3 text-sm text-slate-600">Enter your credentials and authenticate as the selected campus role.</p>
          </div>

          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Choose your access</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {roles.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`rounded-2xl border px-4 py-4 text-left text-sm transition ${selectedRole === role ? 'border-sky-400 bg-sky-50 text-slate-900 shadow-sm' : 'border-gray-100 bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50'}`}
                >
                  <div className="font-semibold">{role}</div>
                  <div className="mt-1 text-xs text-slate-500">Portal access</div>
                </button>
              ))}
            </div>
          </div>

          <form className="space-y-5 text-slate-900" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Username</label>
              <div className="flex items-center gap-3 rounded-3xl border border-gray-200 bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-sky-500/20">
                <FaUser className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                  {...register('username', { required: 'Username is required' })}
                />
              </div>
              {errors.username && <p className="text-sm text-rose-400">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="flex items-center gap-3 rounded-3xl border border-gray-200 bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-sky-500/20">
                <FaLock className="text-slate-400" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                  {...register('password', { required: 'Password is required' })}
                />
              </div>
              {errors.password && <p className="text-sm text-rose-400">{errors.password.message}</p>}
            </div>

            <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:items-center">
              <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" {...register('remember')} className="h-4 w-4 rounded border-gray-300 bg-white text-sky-400" />
                Remember me
              </label>
              <button type="button" className="text-right text-sm text-sky-600 transition hover:text-sky-800">Forgot password?</button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-3xl bg-[#00c896] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Sign in as {selectedRole}
            </button>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" theme="light" />
    </div>
  );
}
  
