import api from '../api/axios';

const AUTH_STORAGE_KEY = 'erp_auth';

export function getAuthState() {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function saveAuthState(state) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
}

export function clearAuthState() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export async function loginApi(payload) {
  // Placeholder for real login endpoint
  const response = await api.post('/auth/login', payload).catch(() => ({ data: null }));
  return response.data || null;
}

export async function logoutApi() {
  await api.post('/auth/logout').catch(() => null);
}

export async function refreshTokenApi() {
  const refreshToken = localStorage.getItem('refresh_token');
  const response = await api.post('/auth/refresh', { refreshToken }).catch(() => ({ data: null }));
  return response.data || null;
}

export function logout() {
  clearAuthState();
  window.location.href = '/auth/login';
}
