import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUniversity, FaLock, FaUser } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../services/AuthContext.jsx';
import { ROLES } from '../services/rbac.js';

const roles = ROLES;

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('Super Admin');
  const { register, handleSubmit, formState } = useForm({ mode: 'onTouched' });
  const { errors, isSubmitting } = formState;
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (data) => {
    try {
      await login({
        username: data.username,
        password: data.password,
        role: selectedRole,
      }, data.remember);
      toast.success(`Welcome back, ${data.username}!`);
      navigate('/', { replace: true });
    } catch {
      toast.error('Login failed. Please verify your credentials.');
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] items-center">
      <section className="space-y-6 rounded-[28px] border border-white/10 bg-slate-900/80 p-10 shadow-soft backdrop-blur-xl">
        <div>
          <span className="inline-flex items-center gap-3 rounded-full bg-slate-800/80 px-4 py-2 text-sm text-sky-200 ring-1 ring-white/10">
            <FaUniversity /> Enterprise College ERP + LMS + CRM
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white">Secure access for every role.</h1>
          <p className="mt-3 max-w-xl text-slate-400">Login to your portal and access dashboards, attendance, admissions, classes, leads, and all student lifecycle workflows.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRole(role)}
              className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${selectedRole === role ? 'border-sky-400 bg-slate-800 text-sky-200' : 'border-white/10 bg-slate-950 text-slate-300 hover:border-slate-200/10 hover:bg-slate-900'}`}
            >
              <span className="block font-semibold">{role}</span>
              <span className="text-xs text-slate-500">Portal access</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-slate-950/90 p-10 shadow-soft backdrop-blur-xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase text-sky-300/90">Login</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Sign in to continue</h2>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Username</label>
            <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 focus-within:border-sky-400">
              <FaUser className="text-slate-400" />
              <input
                type="text"
                placeholder="Enter your username"
                className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
                {...register('username', { required: 'Username is required' })}
              />
            </div>
            {errors.username && <p className="text-sm text-rose-400">{errors.username.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Password</label>
            <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 focus-within:border-sky-400">
              <FaLock className="text-slate-400" />
              <input
                type="password"
                placeholder="Create a strong password"
                className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
                {...register('password', { required: 'Password is required' })}
              />
            </div>
            {errors.password && <p className="text-sm text-rose-400">{errors.password.message}</p>}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-slate-400">
              <input type="checkbox" {...register('remember')} className="h-4 w-4 rounded border-white/10 bg-slate-900 text-sky-400" />
              Remember me
            </label>
            <button type="button" className="text-sm text-sky-300 hover:text-white">Forgot password?</button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sign in as {selectedRole}
          </button>
        </form>
      </section>

      <ToastContainer position="top-right" theme="dark" />
    </div>
  );
}
