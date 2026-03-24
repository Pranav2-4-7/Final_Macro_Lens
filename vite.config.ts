import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      manifest: {
        name: 'MacroLens Calorie Tracker',
        short_name: 'MacroLens',
        description: 'Track your daily calorie intake and nutrition easily with AI.',
        theme_color: '#0f172a',
        background_color: '#f8fafc',
        display: 'standalone',
        icons: [
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/anthropic/, ''),
        headers: {
          'origin': 'https://api.anthropic.com',
        },
      },
    },
  },
})
