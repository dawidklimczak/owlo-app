<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';
  import { page } from '$app/stores';
  import Navbar from '$lib/components/Navbar.svelte';
  import { authStore } from '$lib/stores/auth.svelte';
  import { initI18n } from '$lib/i18n';
  import '../app.css';

  interface Props {
    data: LayoutData;
    children: Snippet;
  }

  let { data, children }: Props = $props();

  const PUBLIC_PATHS = ['/login', '/auth/', '/share-target'];

  // Sync auth store with layout data
  $effect(() => {
    if (data.user !== undefined) {
      authStore.setUser(data.user ?? null);
      authStore.setLoading(false);
      if (data.user?.language) {
        initI18n(data.user.language);
      } else {
        initI18n();
      }
    }
  });

  let isPublicPath = $derived(PUBLIC_PATHS.some((p) => $page.url.pathname.startsWith(p)));
  let showNav = $derived(!isPublicPath && authStore.isAuthenticated);

  // Theme is applied before first paint via the inline script in app.html.
  // Subsequent changes are handled by Navbar's toggleTheme().
</script>

<div class="min-h-dvh bg-[var(--bg)] text-[var(--text-1)] font-sans">
  {#if showNav}
    <Navbar />
  {/if}

  <main
    class="pb-safe {showNav ? 'pt-[var(--nav-offset)] pb-[var(--bottom-offset)] md:pb-8' : ''}"
    style="min-height: 100dvh;"
  >
    {@render children()}
  </main>
</div>
