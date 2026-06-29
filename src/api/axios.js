import axios from 'axios';
import { toast } from '../utils/toast';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor: attach token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// Response interceptor: global error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      return Promise.reject(err);
    }
    const { status } = err.response;
    if (status === 401) {
      toast.error('Unauthorized. Please login.');
    } else if (status === 403) {
      toast.error('Forbidden. Insufficient permissions.');
    } else if (status === 404) {
      // Keep the UI resilient in local/offline mode instead of surfacing a noisy error for every missing endpoint.
      return Promise.reject(err);
    } else if (status >= 500) {
      toast.error('Server error. Try again later.');
    }
    return Promise.reject(err);
  }
);

export default api;
