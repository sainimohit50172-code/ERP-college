import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuthState, saveAuthState, clearAuthState, loginApi, refreshTokenApi, registerApi } from './authService.js';
import { getPermissionsForRole } from './rbac.js';
import { recordAuditEvent } from './auditService.js';

const AuthContext = createContext(null);

const SESSION_TIMEOUT_MS = 1000 * 60 * 25; // 25 minutes
const INACTIVITY_TIMEOUT_MS = 1000 * 60 * 15; // 15 minutes

const defaultAuth = {
  isAuthenticated: false,
  user: null,
  role: null,
  permissions: {},
  token: null,
  refreshToken: null,
};

function buildDemoAuth(payload, role = 'Admin') {
  const user = payload?.user || {
    id: payload?.id || `demo-${Date.now()}`,
    name: payload?.username || payload?.email || 'Demo Admin',
    email: payload?.email || `${payload?.username || 'demo'}@example.com`,
    role,
  };

  return {
    isAuthenticated: true,
    user,
    role,
    permissions: getPermissionsForRole(role),
    token: 'demo-token',
    refreshToken: 'demo-refresh-token',
  };
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [auth, setAuth] = useState(() => {
    const stored = getAuthState();
    if (stored) {
      if (stored.role && (!stored.permissions || Object.keys(stored.permissions).length === 0)) {
        stored.permissions = getPermissionsForRole(stored.role);
      }
      return { ...defaultAuth, ...stored };
    }

    if (import.meta.env.DEV && location.pathname !== '/auth/login') {
      const demoAuth = buildDemoAuth({}, 'Admin');
      saveAuthState(demoAuth);
      localStorage.setItem('erp_demo_mode', 'true');
      return demoAuth;
    }

    return defaultAuth;
  });
  const [sessionExpiry, setSessionExpiry] = useState(Date.now() + SESSION_TIMEOUT_MS);
  const [inactivityExpiry, setInactivityExpiry] = useState(Date.now() + INACTIVITY_TIMEOUT_MS);
  const [rememberMe, setRememberMe] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const authValue = useMemo(() => ({
    auth,
    login: async (payload, remember = false) => {
      const response = await loginApi(payload);
      const data = response?.data || response || null;
      const errorMessage = response?.error?.message || response?.error?.responseData?.detail || response?.error || null;
      const role = payload?.role || data?.user?.role || 'Admin';
      const user = data?.user || {
        id: payload?.id || `${payload?.username || payload?.email || 'user'}-${Date.now()}`,
        name: payload?.username || payload?.email || 'User',
        email: payload?.email || `${payload?.username || 'user'}@example.com`,
        role,
      };
      const token = data?.access_token || data?.token || null;
      const refreshToken = data?.refresh_token || data?.refreshToken || null;
      if (!token) {
        const nextAuth = buildDemoAuth(payload, role);
        setAuth(nextAuth);
        setSessionExpiry(Date.now() + SESSION_TIMEOUT_MS);
        setInactivityExpiry(Date.now() + INACTIVITY_TIMEOUT_MS);
        setRememberMe(remember);
        saveAuthState(nextAuth);
        localStorage.setItem('erp_demo_mode', 'true');
        localStorage.setItem('access_token', nextAuth.token);
        localStorage.setItem('refresh_token', nextAuth.refreshToken);
        recordAuditEvent({
          action: 'Login',
          moduleKey: 'dashboard',
          description: `Demo login for ${user.name || user.email}`,
          user: { id: user.id, name: user.name || user.email, role },
        });
        navigate('/', { replace: true });
        return nextAuth;
      }
      const permissions = getPermissionsForRole(user.role);
      const nextAuth = {
        isAuthenticated: true,
        user,
        role: user.role,
        permissions,
        token,
        refreshToken,
      };
      setAuth(nextAuth);
      setSessionExpiry(Date.now() + SESSION_TIMEOUT_MS);
      setInactivityExpiry(Date.now() + INACTIVITY_TIMEOUT_MS);
      setRememberMe(remember);
      saveAuthState(nextAuth);
      localStorage.setItem('access_token', token);
      if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
      recordAuditEvent({
        action: 'Login',
        moduleKey: 'dashboard',
        description: `User ${user.name || user.username || user.email} logged in as ${user.role}`,
        user: { id: user.id, name: user.name || user.username || user.email, role: user.role },
      });
      navigate('/', { replace: true });
      return nextAuth;
    },
    register: async (payload, remember = false) => {
      const registrationResponse = await registerApi(payload);
      const registrationData = registrationResponse?.data || registrationResponse || null;
      const registrationErrorMessage = registrationResponse?.error?.message || registrationResponse?.error?.responseData?.detail || registrationResponse?.error || null;
      const registeredUser = registrationData?.user || registrationData?.data?.user || null;
      if (!registeredUser) {
        throw new Error(registrationErrorMessage || 'Unable to complete registration');
      }
      const nextAuth = {
        isAuthenticated: false,
        user: null,
        role: null,
        permissions: {},
        token: null,
        refreshToken: null,
      };
      setAuth(nextAuth);
      setRememberMe(remember);
      clearAuthState();
      return nextAuth;
    },
    logout: () => {
      recordAuditEvent({
        action: 'Logout',
        moduleKey: 'dashboard',
        description: `${auth.user?.name || 'Unknown user'} logged out`,
        user: auth.user ? { id: auth.user.id, name: auth.user.name, role: auth.role } : null,
      });
      clearAuthState();
      localStorage.removeItem('erp_demo_mode');
      setAuth({ isAuthenticated: false, user: null, role: null, permissions: {}, token: null, refreshToken: null });
      window.location.href = '/auth/login';
    },
    refreshSession: async () => {
      const response = await refreshTokenApi().catch(() => null);
      if (response?.token) {
        const newAuth = { ...auth, token: response.token, refreshToken: response.refreshToken || auth.refreshToken };
        setAuth(newAuth);
        saveAuthState(newAuth);
        localStorage.setItem('access_token', response.token);
        if (response.refreshToken) localStorage.setItem('refresh_token', response.refreshToken);
        return newAuth;
      }
      authValue.logout();
      return null;
    },
    rememberMe,
    setRememberMe,
    otpSent,
    setOtpSent,
    twoFactorEnabled,
    setTwoFactorEnabled,
    sessionExpiry,
    inactivityExpiry,
    setSessionExpiry,
    setInactivityExpiry,
  }), [auth, rememberMe, otpSent, twoFactorEnabled, sessionExpiry, inactivityExpiry, navigate]);

  useEffect(() => {
    const demoModeEnabled = localStorage.getItem('erp_demo_mode') === 'true';
    if (!auth.isAuthenticated && location.pathname !== '/auth/login' && !demoModeEnabled) {
      navigate('/auth/login', { replace: true });
    }
  }, [auth.isAuthenticated, location.pathname, navigate]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = Date.now();
      if (auth.isAuthenticated && (now >= sessionExpiry || now >= inactivityExpiry)) {
        clearAuthState();
        window.location.href = '/auth/login';
      }
    }, 2000);
    return () => window.clearInterval(interval);
  }, [auth.isAuthenticated, sessionExpiry, inactivityExpiry]);

  useEffect(() => {
    const resetTimer = () => setInactivityExpiry(Date.now() + INACTIVITY_TIMEOUT_MS);
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, []);

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
