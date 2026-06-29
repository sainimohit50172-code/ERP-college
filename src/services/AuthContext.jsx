import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuthState, saveAuthState, clearAuthState, loginApi, refreshTokenApi } from './authService.js';
import { getPermissionsForRole } from './rbac.js';

const AuthContext = createContext(null);

const SESSION_TIMEOUT_MS = 1000 * 60 * 25; // 25 minutes
const INACTIVITY_TIMEOUT_MS = 1000 * 60 * 15; // 15 minutes

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [auth, setAuth] = useState(() => getAuthState() || {
    isAuthenticated: false,
    user: null,
    role: null,
    permissions: {},
    token: null,
    refreshToken: null,
  });
  const [sessionExpiry, setSessionExpiry] = useState(Date.now() + SESSION_TIMEOUT_MS);
  const [inactivityExpiry, setInactivityExpiry] = useState(Date.now() + INACTIVITY_TIMEOUT_MS);
  const [rememberMe, setRememberMe] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const authValue = useMemo(() => ({
    auth,
    login: async (payload, remember = false) => {
      const response = await loginApi(payload).catch(() => null);
      const user = response?.user || {
        id: `${payload.username}-${Date.now()}`,
        name: payload.username,
        email: `${payload.username}@example.com`,
        role: payload.role || 'Super Admin',
      };
      const token = response?.token || 'fake-jwt-token';
      const refreshToken = response?.refreshToken || 'fake-refresh-token';
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
      localStorage.setItem('refresh_token', refreshToken);
      navigate('/', { replace: true });
      return nextAuth;
    },
    logout: () => {
      clearAuthState();
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
    if (!auth.isAuthenticated && location.pathname !== '/auth/login') {
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
