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
  const {   login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onTouched' });

  const onSubmit = async (data) => {
    try {
      if (typeof login === 'function') {
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
    <div className="login-page-wrapper">
      {/* Left Section: Image/Branding - 65% on desktop */}
      <div className="login-image-section hidden md:flex" style={{ position: 'relative' }}>
        {/* Background image element to ensure perfect object-fit coverage */}
        <img
          src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=800&fit=crop"
          alt="Campus"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
        {/* Subtle dark overlay for premium look */}
        <div className="absolute inset-0 bg-slate-900/10" aria-hidden="true" />

        <div className="login-image-content relative z-10 p-6">
          <div className="space-y-6 text-slate-100">
            <div className="inline-flex items-center gap-3 rounded-full bg-sky-900/40 px-4 py-2 text-sm text-sky-200 ring-1 ring-white/10">
              <FaUniversity /> University ERP & Campus Operations
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-white">Welcome back to the campus command center.</h1>
              <p className="text-sm leading-6 text-slate-200">Sign in to manage admissions, attendance, academics, finance, library, transport, hostel and student lifecycle workflows from one unified ERP.</p>
            </div>
            <div className="grid gap-3 grid-cols-2">
              {highlights.map((item) => (
                <div key={item} className="rounded-[24px] border border-white/10 bg-slate-900/30 p-4 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Section: Login Form - 35% on desktop */}
      <div className="login-form-section">
        <div>
          {/* Header */}
          <div className="mb-8 text-slate-900">
            <p className="text-xs uppercase tracking-[0.24em] text-sky-400/90 font-medium">Sign in</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">Secure campus login</h2>
            <p className="mt-3 text-sm text-slate-600">Enter your credentials and authenticate as the selected campus role.</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500 font-medium">Choose your access</p>
            <div className="mt-4 grid gap-2 grid-cols-2">
              {roles.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`rounded-lg border px-3 py-3 text-left text-xs font-medium transition ${
                    selectedRole === role
                      ? 'border-sky-400 bg-sky-50 text-slate-900 shadow-sm'
                      : 'border-gray-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-semibold text-sm">{role}</div>
                  <div className="mt-1 text-xs text-slate-500">Portal access</div>
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form className="space-y-4 text-slate-900" onSubmit={handleSubmit(onSubmit)}>
            {/* Username */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 uppercase">Username</label>
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-sky-500/20">
                <FaUser className="text-slate-400 text-xs" />
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  {...register('username', { required: 'Username is required' })}
                />
              </div>
              {errors.username && <p className="text-xs text-rose-500">{errors.username.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 uppercase">Password</label>
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-sky-500/20">
                <FaLock className="text-slate-400 text-xs" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  {...register('password', { required: 'Password is required' })}
                />
              </div>
              {errors.password && <p className="text-xs text-rose-500">{errors.password.message}</p>}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-xs">
              <label className="inline-flex items-center gap-2 text-slate-600">
                  <input
                    type="checkbox"
                    {...register('remember')}
                    className="h-2.5 w-2.5 rounded-sm border-gray-300 bg-white accent-sky-500"
                  />
                  Remember me
                </label>
              <button type="button" className="text-sky-600 transition hover:text-sky-800 font-medium">
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 rounded-2xl bg-[#00c896] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
  
