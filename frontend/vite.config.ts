// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsx: 'automatic'
  },
  server: {
    host: true, // ensures Vite listens on all interfaces
    allowedHosts: [
      'xcelbot-latest.onrender.com',
      'xcelbot-latest-r3m7.onrender.com',
      'excelbot-frontend.onrender.com', // Add the new domain here
      'localhost'
    ]
  }
});
