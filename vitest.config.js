import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/**/*.test.js'],
    exclude: [
      'src/api/apiConfig.test.js',
      'src/api/startupReadiness.test.js',
      'src/services/repositoryProvider.test.js',
    ],
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setupTests.js',
  },
});
