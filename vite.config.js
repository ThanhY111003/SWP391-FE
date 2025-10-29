import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Proxy tất cả request bắt đầu bằng /api sang backend để tránh CORS khi dev
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        // Giữ nguyên đường dẫn /api/... khi forward
        // Nếu backend không có prefix /api, có thể dùng rewrite để loại bỏ
        // rewrite: (path) => path.replace(/^\/api/, '')
        configure: (proxy) => {
          // Loại bỏ header 'origin' để Spring không kích hoạt CORS check khi đi qua proxy
          proxy.on("proxyReq", (proxyReq) => {
            try {
              proxyReq.removeHeader("origin");
            } catch {
              // ignore
            }
          });
        },
      },
    },
  },
});
