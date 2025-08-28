import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    css: true, // ✅ هذا يسمح بتحميل CSS بدون مشاكل
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    server: {
      deps: {
        inline: ['ws', 'buffer']
      }
    }},
  define: {
    global: 'globalThis',
    'Buffer': ['buffer', 'Buffer'], // أضف هذا السطر
  },
  base: "/", // تأكد أنها "/" وليس "/Ummbatin-Website"
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
        entryFileNames: 'assets/[name].[hash].js'
      }
    }
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      ws: false,
      '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
    }
  }
});