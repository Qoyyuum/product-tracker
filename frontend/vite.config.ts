import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Product Tracker - Verify Authenticity',
        short_name: 'Product Tracker',
        description: 'Verify product authenticity with QR codes using blockchain technology',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'https://api.iconify.design/mdi/qrcode-scan.svg?color=%2310b981&width=192&height=192',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'https://api.iconify.design/mdi/qrcode-scan.svg?color=%2310b981&width=512&height=512',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'https://api.iconify.design/mdi/qrcode-scan.svg?color=%2310b981&width=192&height=192',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\..*\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    host: true // Listen on all addresses including LAN
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
