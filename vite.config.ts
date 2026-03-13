import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
  server: {
    proxy: {
      // In dev, proxy /api/* → https://api.owlo.cc/*
      // This bypasses CORS. Set PUBLIC_API_URL=/api in .env for local dev.
      '/api': {
        target: 'https://api.owlo.cc',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true,
        // Forward cookies back to localhost
        cookieDomainRewrite: 'localhost'
      }
    }
  },
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.ts',
      injectManifest: {
        injectionPoint: 'self.__WB_MANIFEST'
      },
      manifest: {
        name: 'owlo',
        short_name: 'owlo',
        description: 'Track news stories as they develop',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0d0d1c',
        theme_color: '#1a1a2e',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        share_target: {
          action: '/share-target',
          method: 'GET',
          params: {
            url: 'url',
            title: 'title',
            text: 'text'
          }
        }
      },
      devOptions: {
        enabled: true,
        type: 'module',
        /* In dev the SW uses generateSW internally so __WB_MANIFEST
           is replaced with an empty array — no build step needed */
        suppressWarnings: true
      }
    })
  ]
});
