import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  // "/" in dev, "/smart-placement-tracker/" for GitHub Pages production build
  base: mode === "production" ? "/smart-placement-tracker/" : "/",
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },
}));
