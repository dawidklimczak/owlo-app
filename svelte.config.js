import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      $lib: './src/lib'
    },
    // Disable SvelteKit's native SW registration — @vite-pwa/sveltekit handles it
    serviceWorker: {
      register: false
    }
  }
};

export default config;
