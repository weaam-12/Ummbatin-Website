// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/setupTests.js'],
        css: true,
        server: {
            deps: {
                inline: ['ws', 'buffer']
            }
        }
    },
    resolve: {
        alias: {
            buffer: 'buffer',
            ws: false
        }
    }
});