import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],

  server: {
    host: "127.0.0.1",
    port: 3000,
    open: true,

    proxy: {
      "/api": {
        target: "http://127.0.0.1:5039",
        changeOrigin: true,
      },

      "/uploads": {
        target: "http://127.0.0.1:5039",
        changeOrigin: true,
      },
    },
  },
});