import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dns from 'node:dns'

dns.setDefaultResultOrder('ipv4first')

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/deepseek': {
        target: 'https://api.deepseek.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/deepseek/, '')
      }
    }
  }
})