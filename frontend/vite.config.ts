import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

console.log('vite config loaded...')
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      'localhost:3000': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
