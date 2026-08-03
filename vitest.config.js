import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['tests/**/*.mjs', 'src/**/*.test.js'],
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setupTests.js',
  },
});
