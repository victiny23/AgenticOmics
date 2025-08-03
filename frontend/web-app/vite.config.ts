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
      'agentic.omics',
      'localhost',
      '0.0.0.0',
      '.ngrok-free.app'
    ]
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify('https://api.agentic.omics')
  }
})
