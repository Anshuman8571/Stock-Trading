import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
    },
    host: true, 
    strictPort: true,
    port: 5173,
    // Add Proxy to redirect /api calls to the backend container
    proxy: {
      '/api': {
        target: 'http://backend:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})