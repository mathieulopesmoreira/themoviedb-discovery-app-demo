import { defineConfig } from 'vitest/config';
import packageJson from './package.json' with { type: 'json' };
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  test: {
    include: ['src/back-end/**/*.test.ts'],
  },
});
