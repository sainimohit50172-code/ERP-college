import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Prefer an explicit proxy target or VITE_API_BASE_URL; fall back to the local backend only for dev.
const backendTarget = process.env.VITE_API_PROXY_TARGET || process.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'spa-fallback',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';
          const isApiRequest = url.startsWith('/api');
          const isViteInternal = url.startsWith('/@') || url.startsWith('/__vite_ping');
          const isStaticFile = url.includes('.');
          if (!isApiRequest && !isViteInternal && !isStaticFile) {
            req.url = '/index.html';
          }
          next();
        });
      },
    },
  ],
  optimizeDeps: {
    include: ['exceljs'],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Enable the dev proxy with a safe local fallback so the login page can reach the backend during development.
    // Rewrite `/api/*` -> `/api/v1/*` so unversioned frontend calls continue to work
    // while the backend exposes versioned routes under `API_V1_STR`.
    proxy: {
      '/api/v1': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/v1/, '/api/v1'),
      },
      '/api': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('xlsx')) {
              return 'xlsx';
            }
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }
            if (id.includes('jspdf') || id.includes('jspdf-autotable')) {
              return 'pdf';
            }
            if (id.includes('react-router-dom') || id.includes('react-router')) {
              return 'router';
            }
            if (id.includes('chart.js') || id.includes('react-chartjs-2') || id.includes('recharts')) {
              return 'charts';
            }
            if (id.includes('react-hook-form') || id.includes('@tanstack/react-query')) {
              return 'data';
            }
            if (id.includes('lucide-react') || id.includes('react-icons')) {
              return 'icons';
            }
            if (id.includes('sweetalert2')) {
              return 'alerts';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});
