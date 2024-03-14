import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

console.log('vite config loaded...')
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define:{
      'process.env': env
    },
    plugins: [react()],
    server: {
      // proxy: {
      //   'localhost:3000': {
      //     target: 'http://localhost:3000',
      //     changeOrigin: true,
      //     rewrite: (path) => path.replace(/^\/api/, ''),
      //   },
      // },
      host: '0.0.0.0',
      proxy: {
        '/socket.io/': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      }
    },
  }
})
