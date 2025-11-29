import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'sitemap.xml'],
      // Désactiver en mode Capacitor
      disabled: process.env.CAPACITOR === 'true',
      manifest: {
        name: 'KapKurtar - Anti-Gaspi',
        short_name: 'KapKurtar',
        description: 'Yakınındaki indirimli yemek fırsatlarını keşfet ve rezerve et',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F7F2E7',
        theme_color: '#00A690',
        categories: ['food', 'shopping', 'lifestyle'],
        lang: 'tr',
        icons: [
          {
            src: '/icons/icon-72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Augmenter la limite de taille pour les gros bundles JS
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        // Ne pas cacher les pages d'authentification
        navigateFallbackDenylist: [
          /^\/auth/,
          /^\/api/,
          /^\/\.well-known/,
        ],
        // Exclure les fichiers source maps
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // Configuration du cache runtime
        runtimeCaching: [
          {
            // Supabase API - toujours réseau d'abord
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            // Mapbox API - toujours réseau d'abord
            urlPattern: /^https:\/\/api\.mapbox\.com\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'mapbox-api',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 heures
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            // Mapbox Tiles - cache first pour performance
            urlPattern: /^https:\/\/.*\.mapbox\.com\/.*\.(png|jpg|jpeg|webp|pbf)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'mapbox-tiles',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
              },
            },
          },
          {
            // Images Supabase Storage - cache first
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-storage',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 jours
              },
            },
          },
          {
            // Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 an
              },
            },
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
