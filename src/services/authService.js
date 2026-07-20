import api from '../api/axios';

const AUTH_STORAGE_KEY = 'erp_auth';

function extractErrorMessage(error) {
  const responseData = error?.response?.data;
  if (typeof responseData === 'string') return responseData;
  if (responseData && typeof responseData === 'object') {
    if (typeof responseData.detail === 'string') return responseData.detail;
    if (typeof responseData.message === 'string') return responseData.message;
    if (Array.isArray(responseData.data)) {
      return responseData.data.map((item) => item?.msg || item?.message || item?.detail).filter(Boolean).join(', ');
    }
  }
  return error?.message || 'Request failed';
}

function logAuthError(context, error) {
  const payload = {
    context,
    message: error?.message || 'Request failed',
    status: error?.response?.status || null,
    responseData: error?.response?.data || null,
    requestMade: Boolean(error?.request),
    config: {
      url: error?.config?.url || null,
      method: error?.config?.method || null,
      baseURL: error?.config?.baseURL || null,
    },
  };
  console.error(`[auth-service] ${context} failed`, payload, error);
  return payload;
}

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
  const body = {
    email: payload.email || payload.username || '',
    password: payload.password || '',
  };
  const response = await api.post('/auth/login', body).catch((error) => {
    const errorDetails = logAuthError('login', error);
    errorDetails.message = extractErrorMessage(error);
    return { data: null, error: errorDetails };
  });
  return response?.data?.data ? response.data : response;
}

export async function registerApi(payload) {
  const body = {
    email: payload.email || '',
    username: payload.username || '',
    password: payload.password || '',
    full_name: payload.fullName || payload.full_name || payload.name || '',
    role_name: payload.role_name || payload.role || 'Admin',
  };
  const response = await api.post('/auth/register', body).catch((error) => {
    const errorDetails = logAuthError('register', error);
    errorDetails.message = extractErrorMessage(error);
    return { data: null, error: errorDetails };
  });
  return response?.data?.data ? response.data : response;
}

export async function logoutApi() {
  await api.post('/auth/logout').catch(() => null);
}

export async function sendOtpApi(payload) {
  const body = {
    full_name: payload.fullName || payload.full_name || '',
    username: payload.username || '',
    email: payload.email || '',
    mobile_number: payload.mobile_number || payload.mobile || '',
    role_name: payload.role_name || payload.role || 'Admin',
  };
  const response = await api.post('/auth/register/send-otp', body).catch((error) => {
    const errorDetails = logAuthError('send-otp', error);
    errorDetails.message = extractErrorMessage(error);
    return { data: null, error: errorDetails };
  });
  return response?.data?.data ? response.data : response;
}

export async function verifyOtpApi(payload) {
  const body = {
    mobile_number: payload.mobile_number || payload.mobile || '',
    otp_code: payload.otp_code || payload.otp || '',
  };
  const response = await api.post('/auth/register/verify-otp', body).catch((error) => {
    const errorDetails = logAuthError('verify-otp', error);
    errorDetails.message = extractErrorMessage(error);
    return { data: null, error: errorDetails };
  });
  return response?.data?.data ? response.data : response;
}

export async function completeRegistrationApi(payload) {
  const body = {
    mobile_number: payload.mobile_number || payload.mobile || '',
    password: payload.password || '',
    confirm_password: payload.confirm_password || payload.confirmPassword || '',
  };
  const response = await api.post('/auth/register/complete', body).catch((error) => {
    const errorDetails = logAuthError('complete-registration', error);
    errorDetails.message = extractErrorMessage(error);
    return { data: null, error: errorDetails };
  });
  return response?.data?.data ? response.data : response;
}

export async function forgotPasswordApi(email) {
  const response = await api.post('/auth/forgot-password', { email }).catch((error) => {
    const errorDetails = logAuthError('forgot-password', error);
    errorDetails.message = extractErrorMessage(error);
    return { data: null, error: errorDetails };
  });
  return response?.data?.data ? response.data : response;
}

export async function resetPasswordApi(token, password) {
  const response = await api.post('/auth/reset-password', { token, new_password: password }).catch((error) => {
    const errorDetails = logAuthError('reset-password', error);
    errorDetails.message = extractErrorMessage(error);
    return { data: null, error: errorDetails };
  });
  return response?.data?.data ? response.data : response;
}

export async function refreshTokenApi() {
  const refreshToken = localStorage.getItem('refresh_token');
  const response = await api.post('/auth/refresh', { refresh_token: refreshToken }).catch(() => ({ data: null }));
  return response.data || null;
}

export function logout() {
  clearAuthState();
  window.location.href = '/auth/login';
}
