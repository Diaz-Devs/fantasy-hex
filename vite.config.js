import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/fantasy-catan/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:4177',
    },
  },
})
