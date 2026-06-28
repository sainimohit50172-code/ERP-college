import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Key, ShieldCheck, Lock } from 'lucide-react';

export default function ResetPasswordPage() {
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password', '');

  const onSubmit = () => setSuccess(true);
  const strength = password.length > 12 ? 'Strong' : password.length > 8 ? 'Medium' : 'Weak';
  const strengthColor = strength === 'Strong' ? 'bg-emerald-500' : strength === 'Medium' ? 'bg-amber-400' : 'bg-rose-500';

  return (
    <div className="grid min-h-[70vh] place-items-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-[32px] border border-slate-200/80 bg-white p-10 shadow-[0_35px_80px_rgba(15,23,42,0.08)]">
        <div className="flex items-center gap-3 text-slate-700">
          <Lock className="h-7 w-7 text-emerald-600" />
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Reset password</h1>
            <p className="text-sm text-slate-500">Create a new password and complete OTP / 2FA placeholder flow.</p>
          </div>
        </div>
        {success ? (
          <div className="mt-8 rounded-[24px] bg-emerald-50 p-6 text-emerald-900">
            <p className="font-semibold">Password reset successful</p>
            <p className="mt-2 text-sm">Your account is now protected with a new password.</p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">New password</label>
              <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-400">
                <Key className="h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="New password"
                  {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
                  className="w-full bg-transparent text-slate-900 outline-none"
                />
              </div>
              {errors.password && <p className="mt-2 text-sm text-rose-500">{errors.password.message}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Confirm password</label>
              <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-400">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="Confirm password"
                  {...register('confirmPassword', { required: 'Confirmation is required', validate: (value) => value === password || 'Passwords must match' })}
                  className="w-full bg-transparent text-slate-900 outline-none"
                />
              </div>
              {errors.confirmPassword && <p className="mt-2 text-sm text-rose-500">{errors.confirmPassword.message}</p>}
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">Password strength: <span className="font-semibold text-slate-900">{strength}</span></p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div className={`${strengthColor} h-2 rounded-full`} style={{ width: `${Math.min(100, password.length * 7)}%` }} />
              </div>
            </div>
            <button type="submit" className="inline-flex w-full items-center justify-center rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
              Update password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
