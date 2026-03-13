/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope;

// Injected by vite-plugin-pwa at build time
const manifest = (
  self as ServiceWorkerGlobalScope & { __WB_MANIFEST: { url: string; revision: string | null }[] }
).__WB_MANIFEST;

cleanupOutdatedCaches();
precacheAndRoute(manifest);

// Navigation routes — serve app shell (SPA mode, ssr: false)
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'owlo-navigation',
      networkTimeoutSeconds: 3
    })
  )
);

// API requests — network only, never cache auth/data
registerRoute(
  ({ url }) => url.hostname === 'api.owlo.cc',
  new NetworkFirst({ cacheName: 'owlo-api', networkTimeoutSeconds: 5 })
);

// Google Fonts stylesheets
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({ cacheName: 'google-fonts-stylesheets' })
);

// Google Fonts files (long-lived, cache-first)
registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({ cacheName: 'google-fonts-webfonts' })
);
