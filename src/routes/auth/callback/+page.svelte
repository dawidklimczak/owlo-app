<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { loginWithGoogle } from '$lib/api/auth';
  import { authStore } from '$lib/stores/auth.svelte';
  import { t } from '$lib/i18n';

  let status = $state<'processing' | 'error'>('processing');
  let errorMsg = $state('');

  onMount(async () => {
    const code = $page.url.searchParams.get('code');
    const state = $page.url.searchParams.get('state') ?? '/';
    const errorParam = $page.url.searchParams.get('error');

    if (errorParam) {
      status = 'error';
      errorMsg = t('errors.generic');
      return;
    }

    if (!code) {
      status = 'error';
      errorMsg = t('auth.verify_error');
      return;
    }

    try {
      const user = await loginWithGoogle(code);
      authStore.setUser(user);
      authStore.setLoading(false);
      goto(state.startsWith('/') ? state : '/');
    } catch {
      status = 'error';
      errorMsg = t('errors.generic');
    }
  });
</script>

<svelte:head>
  <title>Signing in — owlo</title>
</svelte:head>

<div class="min-h-dvh flex items-center justify-center px-4" style="background: var(--bg);">
  <div class="w-full max-w-sm text-center animate-fade-in">
    {#if status === 'processing'}
      <div class="space-y-4">
        <div
          class="w-12 h-12 rounded-full border-2 border-[var(--accent)] border-t-transparent
                 animate-spin-slow mx-auto"
          role="status"
          aria-label={t('auth.verifying')}
        ></div>
        <p class="text-[var(--text-2)] text-sm">{t('auth.verifying')}</p>
      </div>
    {:else}
      <div class="card p-6 space-y-4">
        <p class="text-[var(--text-1)]">{errorMsg}</p>
        <a href="/login" class="btn btn-ghost w-full">{t('auth.back_to_login')}</a>
      </div>
    {/if}
  </div>
</div>
