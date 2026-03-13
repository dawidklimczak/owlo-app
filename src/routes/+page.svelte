<script lang="ts">
  import { onMount } from 'svelte';
  import { topicsStore } from '$lib/stores/topics.svelte';
  import { getTopics } from '$lib/api/topics';
  import TopicCard from '$lib/components/TopicCard.svelte';
  import AddTopicModal from '$lib/components/AddTopicModal.svelte';
  import { t } from '$lib/i18n';
  import { consumePendingUrl } from '$lib/utils/share-target';

  let showModal = $state(false);
  let pendingUrl = $state('');
  let refreshing = $state(false);

  // Pull-to-refresh
  let touchStartY = 0;
  function onTouchStart(e: TouchEvent) {
    touchStartY = e.touches[0].clientY;
  }
  function onTouchEnd(e: TouchEvent) {
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (dy > 72 && window.scrollY === 0 && !refreshing) {
      refreshing = true;
      loadTopics().finally(() => (refreshing = false));
    }
  }

  async function loadTopics() {
    topicsStore.setLoading(true);
    topicsStore.setError(null);
    try {
      const topics = await getTopics();
      topicsStore.setTopics(topics);
    } catch (err) {
      topicsStore.setError(err instanceof Error ? err.message : t('errors.generic'));
    } finally {
      topicsStore.setLoading(false);
    }
  }

  onMount(() => {
    loadTopics();
    // Handle URL shared via Web Share Target
    const shared = consumePendingUrl();
    if (shared) {
      pendingUrl = shared;
      showModal = true;
    }
  });
</script>

<svelte:head>
  <title>owlo</title>
</svelte:head>

<div
  class="page-container py-6 animate-fade-in"
  ontouchstart={onTouchStart}
  ontouchend={onTouchEnd}
>
  <!-- Pull-to-refresh indicator -->
  {#if refreshing}
    <div class="flex justify-center mb-4">
      <svg
        class="animate-spin-slow text-[var(--accent)]"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-label={t('dashboard.refresh')}
      >
        <path d="M21 12a9 9 0 11-6.219-8.56" />
      </svg>
    </div>
  {/if}

  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <h1 class="font-display text-3xl font-medium text-[var(--text-1)]">
      {t('dashboard.title')}
    </h1>

    <!-- Add button (desktop) -->
    <button
      onclick={() => (showModal = true)}
      class="btn btn-primary hidden sm:inline-flex"
      aria-label={t('dashboard.add_topic')}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      {t('dashboard.add_topic')}
    </button>
  </div>

  <!-- Loading skeletons -->
  {#if topicsStore.loading && topicsStore.list.length === 0}
    <div class="space-y-3">
      {#each Array(3) as _, i}
        <div class="card p-4 space-y-2" aria-hidden="true">
          <div class="skeleton h-5 w-3/4 rounded"></div>
          <div class="skeleton h-4 w-full rounded"></div>
          <div class="skeleton h-4 w-1/2 rounded"></div>
        </div>
      {/each}
    </div>

  <!-- Error state -->
  {:else if topicsStore.error}
    <div class="card p-6 text-center space-y-3">
      <p class="text-[var(--text-2)]">{topicsStore.error}</p>
      <button onclick={loadTopics} class="btn btn-ghost">{t('errors.retry')}</button>
    </div>

  <!-- Empty state -->
  {:else if topicsStore.list.length === 0}
    <div class="card p-8 text-center space-y-4 animate-fade-in">
      <div
        class="w-14 h-14 rounded-full bg-[var(--surface-2)] flex items-center justify-center mx-auto"
        aria-hidden="true"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" stroke-width="1.5" stroke-linecap="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="11" x2="12" y2="17" />
          <line x1="9" y1="14" x2="15" y2="14" />
        </svg>
      </div>
      <div>
        <h2 class="font-display text-xl font-medium text-[var(--text-1)] mb-1">
          {t('dashboard.empty_title')}
        </h2>
        <p class="text-[var(--text-2)] text-sm max-w-xs mx-auto">
          {t('dashboard.empty_body')}
        </p>
      </div>
      <button onclick={() => (showModal = true)} class="btn btn-primary">
        {t('dashboard.add_topic')}
      </button>
    </div>

  <!-- Topic list -->
  {:else}
    <div class="space-y-3 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0 lg:grid-cols-3">
      {#each topicsStore.sorted as topic (topic.id)}
        <div class="animate-slide-up">
          <TopicCard {topic} />
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Floating action button (mobile) -->
{#if !topicsStore.loading}
  <button
    onclick={() => (showModal = true)}
    class="fixed bottom-[calc(var(--bottom-nav-h)+1rem)] right-4 md:hidden
           w-14 h-14 rounded-full bg-[var(--accent)] text-white shadow-lg
           flex items-center justify-center
           transition-transform duration-200 hover:scale-105 active:scale-95
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-light)]"
    aria-label={t('dashboard.add_topic')}
    style="box-shadow: 0 4px 24px var(--accent-dim);"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  </button>
{/if}

<!-- Modal -->
{#if showModal}
  <AddTopicModal
    initialUrl={pendingUrl}
    onClose={() => { showModal = false; pendingUrl = ''; }}
  />
{/if}
