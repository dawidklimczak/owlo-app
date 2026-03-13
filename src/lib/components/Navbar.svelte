<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.svelte';
  import { logout } from '$lib/api/auth';
  import { t } from '$lib/i18n';

  let signingOut = $state(false);
  let isDark = $state(true);

  onMount(() => {
    isDark = document.documentElement.classList.contains('dark');
  });

  function toggleTheme() {
    isDark = !isDark;
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
      html.classList.remove('light');
      localStorage.setItem('owlo-theme', 'dark');
    } else {
      html.classList.remove('dark');
      html.classList.add('light');
      localStorage.setItem('owlo-theme', 'light');
    }
  }

  async function handleLogout() {
    signingOut = true;
    try {
      await logout();
    } finally {
      authStore.logout();
      goto('/login');
    }
  }

  let currentPath = $derived($page.url.pathname);
</script>

<!-- Desktop top navbar -->
<header
  class="fixed top-0 inset-x-0 z-30 h-[var(--nav-h)] hidden md:flex items-center
         border-b border-[var(--border)]"
  style="background: var(--surface-1);"
>
  <div class="page-container w-full flex items-center justify-between">

    <!-- Left: logo + nav links -->
    <div class="flex items-center gap-6">
      <a
        href="/"
        class="font-display text-xl font-medium tracking-tight text-[var(--text-1)]"
      >
        owlo
      </a>

      <nav class="flex items-center gap-1" aria-label="Main">
        <a
          href="/"
          class="px-3 py-1.5 rounded-md text-sm transition-colors
                 {currentPath === '/'
            ? 'text-[var(--text-1)] bg-[var(--surface-2)]'
            : 'text-[var(--text-2)] hover:text-[var(--text-1)]'}"
          aria-current={currentPath === '/' ? 'page' : undefined}
        >
          {t('nav.topics')}
        </a>
        <a
          href="/settings"
          class="px-3 py-1.5 rounded-md text-sm transition-colors
                 {currentPath === '/settings'
            ? 'text-[var(--text-1)] bg-[var(--surface-2)]'
            : 'text-[var(--text-2)] hover:text-[var(--text-1)]'}"
          aria-current={currentPath === '/settings' ? 'page' : undefined}
        >
          {t('nav.settings')}
        </a>
      </nav>
    </div>

    <!-- Right: theme toggle + logout -->
    <div class="flex items-center gap-1">

      <!-- Theme toggle -->
      <button
        onclick={toggleTheme}
        class="w-8 h-8 flex items-center justify-center rounded-md
               text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)]
               transition-colors"
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {#if isDark}
          <!-- Sun: currently dark, click for light -->
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            aria-hidden="true">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        {:else}
          <!-- Moon: currently light, click for dark -->
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        {/if}
      </button>

      <!-- Logout -->
      <button
        onclick={handleLogout}
        disabled={signingOut}
        class="w-8 h-8 flex items-center justify-center rounded-md
               text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)]
               transition-colors disabled:opacity-40"
        title={t('nav.logout')}
        aria-label={t('nav.logout')}
      >
        {#if signingOut}
          <svg class="animate-spin-slow" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
        {:else}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            aria-hidden="true">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        {/if}
      </button>

    </div>
  </div>
</header>

<!-- Mobile bottom navigation -->
<nav
  class="fixed bottom-0 inset-x-0 z-30 h-[var(--bottom-nav-h)] flex md:hidden
         border-t border-[var(--border)] safe-bottom"
  style="background: var(--surface-1);"
  aria-label="Main navigation"
>
  <a
    href="/"
    class="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors
           {currentPath === '/' ? 'text-[var(--accent)]' : 'text-[var(--text-3)]'}"
    aria-current={currentPath === '/' ? 'page' : undefined}
  >
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
    <span class="text-[10px] font-medium">{t('nav.topics')}</span>
  </a>

  <!-- Theme toggle (mobile) -->
  <button
    onclick={toggleTheme}
    class="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors
           text-[var(--text-3)] hover:text-[var(--text-2)]"
    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
  >
    {#if isDark}
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    {:else}
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    {/if}
    <span class="text-[10px] font-medium">{isDark ? 'Light' : 'Dark'}</span>
  </button>

  <a
    href="/settings"
    class="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors
           {currentPath === '/settings' ? 'text-[var(--accent)]' : 'text-[var(--text-3)]'}"
    aria-current={currentPath === '/settings' ? 'page' : undefined}
  >
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
    <span class="text-[10px] font-medium">{t('nav.settings')}</span>
  </a>
</nav>
