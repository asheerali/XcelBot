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
      'xcelbot-latest-r3m7.onrender.com', // Render's domain
      'localhost',
      "13.60.27.209",
      "http://13.60.27.209"
    ]
  }
});
