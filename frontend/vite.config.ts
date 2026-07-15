import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Forward all /api/* calls to the backend
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      // Forward redirect requests /:username/:alias to backend
      // (these are two-segment paths that are NOT frontend routes)
      // We handle this via a custom rewrite regex so only
      // paths that look like /word/word are proxied.
      // Note: the backend handles /:username/:alias at root level.
    },
  },
});

