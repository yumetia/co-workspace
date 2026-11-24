import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

// Les variables sont lues dans le fichier .env à la racine du dépôt (partagé avec le backend).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '..', '')
  const apiUrl = `http://localhost:${env.SERVER_PORT || '8080'}`

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: Number(env.FRONTEND_PORT || 5173),
      strictPort: true,
      // En développement, les appels /api sont redirigés vers le backend Spring Boot.
      proxy: {
        '/api': apiUrl,
        '/actuator': apiUrl,
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: false,
    },
  }
})
