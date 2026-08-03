import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App.jsx';
import { ERPProvider } from './services/ERPContext.jsx';
import { AuthProvider } from './services/AuthContext.jsx';
import './styles/index.css';

// Dev-only: log resolved API base URL and token status to aid debugging. Removed in production.
if (typeof import.meta !== 'undefined' && import.meta.env && !import.meta.env.PROD) {
  try {
    // Lazy import to avoid circular deps during build
    import('./api/apiConfig.js').then((mod) => {
      const base = mod.getApiBaseUrl ? mod.getApiBaseUrl() : null;
      console.debug('[runtime-debug] Resolved API base URL:', base);
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('access_token') : null;
      console.debug('[runtime-debug] Access token present:', Boolean(token));
    }).catch(() => {});
  } catch (e) {
    // ignore
  }
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <ERPProvider>
            <App />
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="light" newestOnTop />
          </ERPProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
