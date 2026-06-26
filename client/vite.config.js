import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://documind-ai-api.onrender.com",
        changeOrigin: true,
      },
      "/uploads": {
        target: "https://documind-ai-api.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
