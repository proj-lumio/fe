import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@ui": path.resolve(__dirname, "./ui_components"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://178.215.237.216",
        changeOrigin: true,
        ws: true,
        rewrite: (path) => `/guest${path}`,
      },
    },
  },
})
