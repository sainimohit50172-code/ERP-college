import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = () => setSubmitted(true);

  return (
    <div className="grid min-h-[70vh] place-items-center py-10">
      <div className="w-full max-w-2xl rounded-[32px] border border-slate-200/80 bg-white p-10 shadow-[0_35px_80px_rgba(15,23,42,0.08)]">
        <div className="flex items-center gap-3 text-slate-700">
          <ShieldCheck className="h-7 w-7 text-emerald-600" />
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Forgot password</h1>
            <p className="text-sm text-slate-500">Enter your email to receive reset instructions and OTP verification placeholder.</p>
          </div>
        </div>
        {submitted ? (
          <div className="mt-8 rounded-[24px] bg-emerald-50 p-6 text-emerald-900">
            <p className="font-semibold">Request received</p>
            <p className="mt-2 text-sm">If the email exists, you will receive password reset instructions shortly.</p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
              <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-400">
                <Mail className="h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  {...register('email', { required: 'Email is required' })}
                  className="w-full bg-transparent text-slate-900 outline-none"
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-rose-500">{errors.email.message}</p>}
            </div>
            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
              Send reset link
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
