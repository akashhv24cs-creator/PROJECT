import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

function razorpayDevPlugin() {
  return {
    name: 'razorpay-dev-plugin',
    configureServer(server) {
      server.middlewares.use('/api/create-razorpay-order', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const keyId = 'rzp_test_TkJEQUzenf22NF';
            const keySecret = 'gZ6kS3JPNoBnJJP6mUa2nhC5';
            const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
            const amountInPaise = Math.round(Number(data.amount || 0) * 100);

            const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${auth}`,
              },
              body: JSON.stringify({
                amount: amountInPaise,
                currency: data.currency || 'INR',
                receipt: String(data.bookingId || 'booking').slice(-40),
                notes: {
                  bookingId: String(data.bookingId || ''),
                },
              }),
            });

            const rzpData = await rzpResponse.json();
            if (!rzpResponse.ok) {
              res.statusCode = rzpResponse.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: rzpData?.error?.description || 'Razorpay order creation failed' }));
              return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                status: 'success',
                message: 'Razorpay order created',
                orderId: rzpData.id,
                amount: data.amount,
                amountInPaise: rzpData.amount,
                currency: rzpData.currency,
                keyId: keyId,
              })
            );
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    razorpayDevPlugin(),
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
            // NEVER cache Razorpay payment endpoints
            urlPattern: /https:\/\/(.*\.razorpay\.com|checkout\.razorpay\.com|api\.razorpay\.com)/,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
});
