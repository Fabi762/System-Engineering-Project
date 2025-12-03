import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/upload': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      },
      '/parse-pdf': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      },
      '/contents': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
