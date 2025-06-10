import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(),    tailwindcss(),

  ],
  base:"/",
  server: {
    port: 5173,
  strictPort: true // If 5173 is taken, Vite will throw an error instead of switching
  }
})
