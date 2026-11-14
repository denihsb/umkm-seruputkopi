import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), '');
  const supabaseOrigin = env.VITE_SUPABASE_URL ? new URL(env.VITE_SUPABASE_URL).origin : null;
  const escapedSupabaseOrigin = supabaseOrigin?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Data pengguna dan pesanan tidak boleh tersimpan di cache, sehingga auth, RPC,
  // orders, profiles, dan semua permintaan selain GET tidak memiliki aturan cache.
  const runtimeCaching = [
    ...(supabaseOrigin
      ? [
          {
            urlPattern: new RegExp(
              `^${escapedSupabaseOrigin}/rest/v1/(categories|menus|variant_groups|menu_variants)(?:/|$)`,
            ),
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'seruput-katalog',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 86400,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ]
      : []),
    {
      urlPattern: ({ request }) => request.method === 'GET' && request.destination === 'image',
      handler: 'CacheFirst',
      options: {
        cacheName: 'seruput-gambar',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 604800,
        },
      },
    },
  ];

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'prompt',
        cleanupOutdatedCaches: true,
        devOptions: {
          enabled: false,
        },
        includeAssets: ['icon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
        manifest: {
          name: 'Seruput Kopi & Cerita',
          short_name: 'Seruput',
          description: 'Pesan kopi favoritmu dari Seruput Kopi Medan.',
          lang: 'id',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          theme_color: '#6F4E37',
          background_color: '#F6EFE6',
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
          navigateFallback: '/index.html',
          runtimeCaching,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
    },
  };
});
