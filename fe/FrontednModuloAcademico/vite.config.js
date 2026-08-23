import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Carga las variables de entorno basadas en el modo (desarrollo/producción)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          // Usa la variable del .env o un valor por defecto
          target: env.DB_TARGET_URL || 'http://localhost:8000',
          changeOrigin: true,
        }
      }
    }
  }
})