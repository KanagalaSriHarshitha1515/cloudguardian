import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { "/api": "http://localhost:5000" },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react-dom")) return "vendor.react-dom";
          if (id.includes("node_modules/react-router-dom")) return "vendor.router";
          if (id.includes("node_modules/react/")) return "vendor.react";
          if (id.includes("node_modules/@mui/")) return "vendor.mui";
          if (id.includes("node_modules/axios/")) return "vendor.axios";
          if (id.includes("node_modules/lucide-react/")) return "vendor.icons";
          return undefined;
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
    coverage: {
      provider: "c8",
      reporter: ["text", "json", "html"],
      all: true,
      include: ["src/**/*.{js,jsx}"],
    },
  },
});
