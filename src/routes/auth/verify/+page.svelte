<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { verifyMagicLink } from '$lib/api/auth';
  import { authStore } from '$lib/stores/auth.svelte';
  import { t } from '$lib/i18n';

  let status = $state<'verifying' | 'error'>('verifying');
  let errorMsg = $state('');

  onMount(async () => {
    const token = $page.url.searchParams.get('token');
    if (!token) {
      status = 'error';
      errorMsg = t('auth.verify_error');
      return;
    }

    try {
      const user = await verifyMagicLink(token);
      authStore.setUser(user);
      authStore.setLoading(false);
      const redirect = $page.url.searchParams.get('redirect') ?? '/';
      goto(redirect);
    } catch {
      status = 'error';
      errorMsg = t('auth.verify_error');
    }
  });
</script>

<svelte:head>
  <title>Signing in — owlo</title>
</svelte:head>

<div class="min-h-dvh flex items-center justify-center px-4" style="background: var(--bg);">
  <div class="w-full max-w-sm text-center animate-fade-in">
    {#if status === 'verifying'}
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
        <div
          class="w-12 h-12 rounded-full bg-red-900/20 flex items-center justify-center mx-auto"
          aria-hidden="true"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--error, #f87171)"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <p class="text-[var(--text-1)]">{errorMsg}</p>
        <a href="/login" class="btn btn-ghost w-full">{t('auth.back_to_login')}</a>
      </div>
    {/if}
  </div>
</div>
