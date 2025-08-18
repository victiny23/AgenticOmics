import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 12000,
    strictPort: true,
    cors: true,
    allowedHosts: [
      'work-1-bwktzeajbmgslino.prod-runtime.all-hands.dev',
      'localhost',
      '0.0.0.0'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:12001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify('https://work-2-bwktzeajbmgslino.prod-runtime.all-hands.dev')
  }
})
