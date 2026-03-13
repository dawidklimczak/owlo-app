<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authStore } from '$lib/stores/auth.svelte';
  import { extractSharedUrl, savePendingUrl } from '$lib/utils/share-target';
  import AddTopicModal from '$lib/components/AddTopicModal.svelte';
  import { t } from '$lib/i18n';

  let sharedUrl = $state('');
  let showModal = $state(false);
  let status = $state<'loading' | 'ready' | 'no-url'>('loading');

  onMount(() => {
    const url = extractSharedUrl($page.url.searchParams);

    if (!url) {
      status = 'no-url';
      setTimeout(() => goto('/'), 2000);
      return;
    }

    sharedUrl = url;

    if (!authStore.isAuthenticated && !authStore.loading) {
      savePendingUrl(url);
      goto(`/login?redirect=/`);
      return;
    }

    status = 'ready';
    showModal = true;
  });
</script>

<svelte:head>
  <title>{t('share_target.processing')} — owlo</title>
</svelte:head>

<div class="min-h-dvh flex items-center justify-center px-4" style="background: var(--bg);">
  {#if status === 'loading' || status === 'no-url'}
    <div class="text-center space-y-4 animate-fade-in">
      {#if status === 'loading'}
        <div
          class="w-10 h-10 rounded-full border-2 border-[var(--accent)] border-t-transparent
                 animate-spin-slow mx-auto"
          role="status"
          aria-label={t('share_target.processing')}
        ></div>
        <p class="text-[var(--text-2)] text-sm">{t('share_target.processing')}</p>
      {:else}
        <p class="text-[var(--text-2)] text-sm">{t('errors.not_found')}</p>
      {/if}
    </div>
  {/if}
</div>

{#if showModal && sharedUrl}
  <AddTopicModal
    initialUrl={sharedUrl}
    onClose={() => goto('/')}
  />
{/if}
