<script lang="ts">
  import { onMount } from 'svelte';
  import { topicsStore } from '$lib/stores/topics.svelte';
  import { getTopics } from '$lib/api/topics';
  import type { TopicStatus } from '$lib/api/topics';
  import AddTopicModal from '$lib/components/AddTopicModal.svelte';
  import TopicCard from '$lib/components/TopicCard.svelte';
  import { t } from '$lib/i18n';
  import { consumePendingUrl } from '$lib/utils/share-target';
  import { formatRelative, frequencyLabel } from '$lib/utils/dates';
  import { goto } from '$app/navigation';

  let showModal = $state(false);
  let pendingUrl = $state('');
  let refreshing = $state(false);
  let searchQuery = $state('');
  let statusFilter = $state<'all' | TopicStatus>('all');

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
    const shared = consumePendingUrl();
    if (shared) {
      pendingUrl = shared;
      showModal = true;
    }
  });

  let filtered = $derived(() => {
    let list = topicsStore.sorted;
    if (statusFilter !== 'all') {
      list = list.filter((t) => t.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }
    return list;
  });

  const statusFilters: { value: 'all' | TopicStatus; label: string }[] = [
    { value: 'all', label: t('dashboard.filter_all') },
    { value: 'active', label: t('dashboard.filter_active') },
    { value: 'paused', label: t('dashboard.filter_paused') },
    { value: 'archived', label: t('dashboard.filter_archived') }
  ];
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
    <div class="space-y-2" aria-hidden="true">
      {#each Array(5) as _, i}
        <div class="flex items-center gap-4 px-4 py-3 rounded-lg bg-[var(--surface-1)]">
          <div class="skeleton h-4 w-2/5 rounded"></div>
          <div class="skeleton h-4 w-16 rounded ml-auto"></div>
          <div class="skeleton h-4 w-12 rounded"></div>
          <div class="skeleton h-4 w-20 rounded hidden sm:block"></div>
          <div class="skeleton h-4 w-24 rounded hidden md:block"></div>
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

  <!-- Table view -->
  {:else}
    <!-- Search + filter bar -->
    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <div class="relative flex-1">
        <svg
          class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)] pointer-events-none"
          width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          bind:value={searchQuery}
          placeholder={t('dashboard.search_placeholder')}
          class="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--surface-1)] border border-[var(--border)]
                 text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)]
                 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]
                 transition-colors duration-150"
        />
      </div>

      <!-- Status filter tabs -->
      <div class="flex gap-1 bg-[var(--surface-1)] rounded-lg p-1 border border-[var(--border)] self-start sm:self-auto overflow-x-auto shrink-0">
        {#each statusFilters as f}
          <button
            onclick={() => (statusFilter = f.value)}
            class="px-3 py-1 rounded-md text-xs font-medium transition-colors duration-150
                   {statusFilter === f.value
                     ? 'bg-[var(--accent)] text-white'
                     : 'text-[var(--text-2)] hover:text-[var(--text-1)]'}"
          >
            {f.label}
          </button>
        {/each}
      </div>
    </div>

    <!-- Results -->
    {#if filtered().length === 0}
      <p class="text-center text-[var(--text-3)] py-12 text-sm">{t('dashboard.no_results')}</p>
    {:else}
      <!-- Mobile: card list -->
      <div class="sm:hidden space-y-2">
        {#each filtered() as topic (topic.id)}
          <TopicCard {topic} />
        {/each}
      </div>

      <!-- Desktop: table -->
      <div class="hidden sm:block rounded-lg border border-[var(--border)]">
        <table class="w-full table-fixed text-sm border-collapse">
          <thead>
            <tr class="border-b border-[var(--border)] bg-[var(--surface-1)]">
              <th class="text-left px-4 py-2.5 text-xs font-medium text-[var(--text-3)] uppercase tracking-wider">
                {t('dashboard.col_topic')}
              </th>
              <th class="text-left px-4 py-2.5 text-xs font-medium text-[var(--text-3)] uppercase tracking-wider w-24">
                {t('dashboard.col_status')}
              </th>
              <th class="text-right px-4 py-2.5 text-xs font-medium text-[var(--text-3)] uppercase tracking-wider w-20">
                {t('dashboard.col_facts')}
              </th>
              <th class="text-left px-4 py-2.5 text-xs font-medium text-[var(--text-3)] uppercase tracking-wider w-32">
                {t('dashboard.col_frequency')}
              </th>
              <th class="text-left px-4 py-2.5 text-xs font-medium text-[var(--text-3)] uppercase tracking-wider w-36 hidden md:table-cell">
                {t('dashboard.col_last_checked')}
              </th>
            </tr>
          </thead>
          <tbody>
            {#each filtered() as topic (topic.id)}
              <tr
                class="border-b border-[var(--border)] last:border-0
                       cursor-pointer transition-colors duration-100
                       hover:bg-[var(--surface-1)] active:bg-[var(--surface-2)]
                       {topic.has_update ? 'bg-[color-mix(in_srgb,var(--pulse)_4%,transparent)]' : 'bg-transparent'}"
                onclick={() => goto(`/topic/${topic.id}`)}
                onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && goto(`/topic/${topic.id}`)}
                role="link"
                tabindex="0"
                aria-label={topic.title}
              >
                <!-- Topic title + description -->
                <td class="px-4 py-3 min-w-0">
                  <div class="flex items-center gap-2 min-w-0">
                    {#if topic.has_update}
                      <span
                        class="shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--pulse)] animate-pulse-dot"
                        aria-label="Has new updates"
                      ></span>
                    {/if}
                    <div class="min-w-0 overflow-hidden">
                      <p class="font-medium text-[var(--text-1)] truncate leading-snug">
                        {topic.title}
                      </p>
                      {#if topic.description}
                        <p class="text-xs text-[var(--text-3)] truncate mt-0.5 leading-relaxed">
                          {topic.description}
                        </p>
                      {/if}
                    </div>
                  </div>
                </td>

                <!-- Status -->
                <td class="px-4 py-3 whitespace-nowrap">
                  {#if topic.status === 'active'}
                    <span class="inline-flex items-center gap-1 text-[var(--accent-light)] text-xs">
                      <span class="w-1.5 h-1.5 rounded-full bg-[var(--accent-light)] inline-block"></span>
                      {t('topic.status_active')}
                    </span>
                  {:else if topic.status === 'paused'}
                    <span class="badge badge-paused text-xs">{t('topic.status_paused')}</span>
                  {:else}
                    <span class="text-[var(--text-3)] text-xs">{t('topic.status_archived')}</span>
                  {/if}
                </td>

                <!-- Facts -->
                <td class="px-4 py-3 whitespace-nowrap text-right text-mono text-[var(--text-2)]">
                  {topic.facts_count}
                  {#if topic.new_facts_count > 0}
                    <span class="badge badge-new ml-1">+{topic.new_facts_count}</span>
                  {/if}
                </td>

                <!-- Frequency -->
                <td class="px-4 py-3 whitespace-nowrap text-mono text-[var(--text-3)]">
                  {frequencyLabel(topic.check_frequency_days)}
                </td>

                <!-- Last checked -->
                <td class="px-4 py-3 whitespace-nowrap text-mono text-[var(--text-3)] hidden md:table-cell">
                  {formatRelative(topic.last_checked_at)}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
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
