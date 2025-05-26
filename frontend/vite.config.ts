// vite.config.ts
import { build, defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsx: "automatic",
  },
  server: {
    host: true, // ensures Vite listens on all interfaces
    allowedHosts: [
      "xcelbot-latest-r3m7.onrender.com", // Render's domain
      "localhost",
    ],
  },

  build: {
    outDir: "dist_fe", // output directory for the build
  },
});
