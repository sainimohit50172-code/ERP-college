import { useEffect, useState } from 'react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUniversity, FaLock, FaUser, FaUserPlus, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../services/AuthContext.jsx';
import { ROLES } from '../services/rbac.js';
import { completeRegistrationApi, sendOtpApi, verifyOtpApi } from '../services/authService';

const roles = ROLES;
const highlights = [
  'Unified academic and administrative portal',
  'Role-based dashboards for staff, students and operations',
  'Secure access backed by single sign-on patterns',
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('Super Admin');
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpDemoCode, setOtpDemoCode] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [registrationPending, setRegistrationPending] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onTouched' });

  const passwordValue = watch('password', '');
  const mobileNumberValue = watch('mobileNumber', '');
  const otpValue = watch('otpCode', '');
  const confirmPasswordValue = watch('confirmPassword', '');

  const passwordHint = useMemo(() => {
    if (mode !== 'login') return '';
    if (!passwordValue) return '';
    if (passwordValue.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(passwordValue)) return 'Password must include an uppercase letter.';
    if (!/[a-z]/.test(passwordValue)) return 'Password must include a lowercase letter.';
    if (!/\d/.test(passwordValue)) return 'Password must include a number.';
    if (!/[^A-Za-z0-9]/.test(passwordValue)) return 'Password must include a special character.';
    return '';
  }, [mode, passwordValue]);

  useEffect(() => {
    if (otpCooldown <= 0) return undefined;
    const timer = window.setInterval(() => {
      setOtpCooldown((value) => value - 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [otpCooldown]);

  const resetRegistrationFlow = () => {
    setRegistrationStep(1);
    setOtpSent(false);
    setOtpCooldown(0);
    setOtpDemoCode('');
    setRegistrationError('');
    setRegistrationPending(false);
  };

  const onSubmit = async (data) => {
    try {
      if (mode === 'register') {
        const message = 'Please complete the mobile OTP registration steps first.';
        toast.error(message);
        setRegistrationError(message);
        return;
      }

      await login({ username: data.username, email: data.username, password: data.password, role: selectedRole }, false);
      toast.success('Signed in successfully.');
      navigate('/');
    } catch (err) {
      const message = err?.message || 'Login failed';
      toast.error(message);
    }
  };

  const handleSendOtp = async () => {
    setRegistrationError('');
    setRegistrationPending(true);
    const payload = {
      fullName: getValues('fullName') || '',
      username: getValues('username') || '',
      email: getValues('email') || '',
      mobile_number: getValues('mobileNumber') || '',
      role_name: selectedRole,
    };

    const result = await sendOtpApi(payload);
    setRegistrationPending(false);

    if (result?.error) {
      setRegistrationError(result.error.message || 'Unable to send OTP.');
      return;
    }

    setOtpSent(true);
    setRegistrationStep(2);
    setOtpDemoCode(result?.data?.otp_code || '');
    setOtpCooldown(30);
    toast.success('OTP sent successfully.');
  };

  const handleVerifyOtp = async () => {
    setRegistrationError('');
    setRegistrationPending(true);
    const result = await verifyOtpApi({ mobile_number: getValues('mobileNumber'), otp_code: otpValue });
    setRegistrationPending(false);

    if (result?.error) {
      setRegistrationError(result.error.message || 'Invalid or expired OTP. Please try again.');
      return;
    }

    setRegistrationStep(3);
    toast.success('OTP verified successfully.');
  };

  const handleCompleteRegistration = async () => {
    setRegistrationError('');
    setRegistrationPending(true);
    const result = await completeRegistrationApi({
      mobile_number: getValues('mobileNumber'),
      password: getValues('password'),
      confirm_password: getValues('confirmPassword'),
    });
    setRegistrationPending(false);

    if (result?.error) {
      setRegistrationError(result.error.message || 'Unable to complete registration.');
      return;
    }

    toast.success('Registration Successful! You can now login.');
    setMode('login');
    resetRegistrationFlow();
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-sky-400/90 font-medium">{mode === 'login' ? 'Sign in' : 'Create account'}</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">{mode === 'login' ? 'Secure campus login' : 'Register for campus access'}</h2>
              </div>
              <button type="button" onClick={() => {
                if (mode === 'login') {
                  resetRegistrationFlow();
                  setMode('register');
                } else {
                  setMode('login');
                  resetRegistrationFlow();
                }
              }} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-sky-300 hover:text-sky-700">
                {mode === 'login' ? <FaUserPlus /> : <FaUser />} {mode === 'login' ? 'Register' : 'Login'}
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-600">{mode === 'login' ? 'Enter your credentials and authenticate as the selected campus role.' : 'Create a role-based account with a strong password and secure access.'}</p>
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
          {mode === 'login' ? (
            <form className="space-y-4 text-slate-900" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700 uppercase">Username or email</label>
                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-sky-500/20">
                  <FaUser className="text-slate-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Enter your username or email"
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 hover-gradient-border"
                    {...register('username', { required: 'Username is required' })}
                  />
                </div>
                {errors.username && <p className="text-xs text-rose-500">{errors.username.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700 uppercase">Password</label>
                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-sky-500/20">
                  <FaLock className="text-slate-400 text-xs" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 hover-gradient-border"
                    {...register('password', { required: 'Password is required' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-slate-400 transition hover:text-slate-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-rose-500">{errors.password.message}</p>}
                {!errors.password && passwordHint && <p className="text-xs text-amber-600">{passwordHint}</p>}
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="inline-flex items-center gap-2 text-slate-600">
                  <input
                    type="checkbox"
                    {...register('remember')}
                    className="h-2.5 w-2.5 rounded-sm border-gray-300 bg-white accent-sky-500 hover-gradient-border"
                  />
                  Remember me
                </label>
                <button type="button" onClick={() => navigate('/auth/forgot-password')} className="text-sky-600 transition hover:text-sky-800 font-medium hover-gradient-border">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 rounded-2xl bg-[#00c896] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 hover-gradient-border"
              >
                Sign in as {selectedRole}
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-slate-900">
              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-3 text-sm text-sky-700">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em]">
                  <span>Step {registrationStep} of 3</span>
                  <span>{registrationStep === 1 ? 'Mobile' : registrationStep === 2 ? 'OTP' : 'Password'}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-sky-100">
                  <div className="h-2 rounded-full bg-sky-500 transition-all" style={{ width: `${registrationStep * 33.33}%` }} />
                </div>
              </div>

              {registrationError && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">{registrationError}</p>}

              {registrationStep === 1 && (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-700 uppercase">Full name</label>
                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-sky-500/20">
                      <FaUser className="text-slate-400 text-xs" />
                      <input type="text" placeholder="Enter your full name" className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 hover-gradient-border" {...register('fullName', { required: 'Full name is required' })} />
                    </div>
                    {errors.fullName && <p className="text-xs text-rose-500">{errors.fullName.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-700 uppercase">Username</label>
                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-sky-500/20">
                      <FaUser className="text-slate-400 text-xs" />
                      <input type="text" placeholder="Choose a username" className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 hover-gradient-border" {...register('username', { required: 'Username is required' })} />
                    </div>
                    {errors.username && <p className="text-xs text-rose-500">{errors.username.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-700 uppercase">Email</label>
                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-sky-500/20">
                      <FaUser className="text-slate-400 text-xs" />
                      <input type="email" placeholder="Enter your email" className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 hover-gradient-border" {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })} />
                    </div>
                    {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-700 uppercase">Mobile number</label>
                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-sky-500/20">
                      <FaUser className="text-slate-400 text-xs" />
                      <input type="tel" placeholder="Enter 10-digit mobile number" className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 hover-gradient-border" {...register('mobileNumber', { required: 'Mobile number is required', pattern: { value: /^\d{10}$/, message: 'Enter a valid 10-digit mobile number' } })} />
                    </div>
                    {errors.mobileNumber && <p className="text-xs text-rose-500">{errors.mobileNumber.message}</p>}
                  </div>

                  <button type="button" onClick={handleSendOtp} disabled={registrationPending || !mobileNumberValue || mobileNumberValue.length !== 10} className="w-full rounded-2xl bg-[#00c896] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
                    {registrationPending ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </>
              )}

              {registrationStep === 2 && (
                <>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                    <p>We sent a 6-digit OTP to <span className="font-semibold text-slate-900">{mobileNumberValue}</span>.</p>
                    {otpDemoCode && <p className="mt-2 text-xs text-slate-500">Demo OTP for testing: <span className="font-semibold text-slate-900">{otpDemoCode}</span></p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-700 uppercase">Enter OTP</label>
                    <input type="text" inputMode="numeric" maxLength="6" placeholder="Enter 6-digit OTP" className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus-within:ring-2 focus-within:ring-sky-500/20" {...register('otpCode', { required: 'OTP is required', pattern: { value: /^\d{6}$/, message: 'Enter a valid 6-digit OTP' } })} />
                    {errors.otpCode && <p className="text-xs text-rose-500">{errors.otpCode.message}</p>}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <button type="button" onClick={handleVerifyOtp} disabled={registrationPending || !otpValue || otpValue.length !== 6} className="flex-1 rounded-2xl bg-[#00c896] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
                      {registrationPending ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    <button type="button" onClick={handleSendOtp} disabled={registrationPending || otpCooldown > 0} className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
                      {otpCooldown > 0 ? `Resend (${otpCooldown}s)` : 'Resend OTP'}
                    </button>
                  </div>
                  {otpSent && <p className="text-xs text-slate-500">OTP expires in 5 minutes.</p>}
                </>
              )}

              {registrationStep === 3 && (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-700 uppercase">Set password</label>
                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-sky-500/20">
                      <FaLock className="text-slate-400 text-xs" />
                      <input type={showPassword ? 'text' : 'password'} placeholder="Create a password" className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 hover-gradient-border" {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })} />
                      <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="text-slate-400 transition hover:text-slate-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                        {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-rose-500">{errors.password.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-700 uppercase">Confirm password</label>
                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-sky-500/20">
                      <FaLock className="text-slate-400 text-xs" />
                      <input type={showPassword ? 'text' : 'password'} placeholder="Confirm your password" className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 hover-gradient-border" {...register('confirmPassword', { required: 'Please confirm your password', validate: (value) => value === passwordValue || 'Passwords must match' })} />
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-rose-500">{errors.confirmPassword.message}</p>}
                  </div>

                  <button type="button" onClick={handleCompleteRegistration} disabled={registrationPending || !passwordValue || !confirmPasswordValue || passwordValue.length < 6} className="w-full rounded-2xl bg-[#00c896] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
                    {registrationPending ? 'Creating account...' : 'Create account'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <ToastContainer position="top-right" theme="light" />
    </div>
  );
}
  
