import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png', 'maskable-icon-512x512.png'],
      manifest: {
        name: 'Zenera Trips — Outstation Group Travel',
        short_name: 'Zenera',
        description: 'Book reliable outstation trips with Zenera Trips. Tempo Travellers, Buses, SUVs & Sedans with live GPS tracking.',
        theme_color: '#1A1A1A',
        background_color: '#1A1A1A',
        display: 'standalone',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,json}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/__/, /^\/api/],
        runtimeCaching: [
          {
            // Google Fonts stylesheets
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            // Google Fonts webfont files
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // NEVER cache Firebase APIs, Auth tokens, Firestore, or Cloud Functions
            urlPattern: /https:\/\/(.*\.cloudfunctions\.net|firestore\.googleapis\.com|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com)/,
            handler: 'NetworkOnly',
          },
          {
            // NEVER cache Cashfree payment endpoints
            urlPattern: /https:\/\/(.*\.cashfree\.com|sdk\.cashfree\.com)/,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
});
