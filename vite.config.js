import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    proxy: {
      // Avoid CORS in dev: frontend calls /api/*, Vite proxies to Laravel.
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.js'],
  },
})