import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path'; // أضف هذه السطر

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/Ummbatin-Website",
  server: {
    port: 5173,
    strictPort: true
  },
  resolve: {
    alias: {
      // أضف هذه الـ alias لحل مشاكل المسارات
      '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "~bootstrap/scss/bootstrap";`
      }
    }
  }
});