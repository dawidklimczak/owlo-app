<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  import type { TopicDetail } from '$lib/api/topics';
  import {
    getTopicById,
    updateTopic,
    deleteTopic,
    checkTopicNow,
    markTopicRead
  } from '$lib/api/topics';
  import { topicsStore } from '$lib/stores/topics.svelte';
  import TopicTimeline from '$lib/components/TopicTimeline.svelte';
  import { t } from '$lib/i18n';
  import { formatRelative, formatDate, frequencyLabel } from '$lib/utils/dates';
  import { CreditsError } from '$lib/api/client';

  interface Props { data: PageData }
  let { data }: Props = $props();

  let topic = $state<TopicDetail | null>(null);
  let loading = $state(true);
  let error = $state('');
  let checkingNow = $state(false);
  let showHistory = $state(false);
  let showDeleteConfirm = $state(false);
  let actionError = $state('');

  const FREQUENCIES = [3, 7, 14, 30];

  async function load() {
    loading = true;
    error = '';
    try {
      topic = await getTopicById(data.id);
      // Mark as read when opening
      if (topic.has_update) {
        await markTopicRead(data.id).catch(() => {});
        topicsStore.updateTopic(data.id, { has_update: false, new_facts_count: 0 });
      }
    } catch (err) {
      error = err instanceof Error ? err.message : t('errors.generic');
    } finally {
      loading = false;
    }
  }

  async function handleCheckNow() {
    if (!topic) return;
    checkingNow = true;
    actionError = '';
    try {
      const updated = await checkTopicNow(data.id);
      topicsStore.updateTopic(data.id, updated);
      // Reload full detail to get new facts
      await load();
    } catch (err) {
      if (err instanceof CreditsError) {
        actionError = t('errors.no_credits');
      } else {
        actionError = err instanceof Error ? err.message : t('errors.generic');
      }
    } finally {
      checkingNow = false;
    }
  }

  async function handleTogglePause() {
    if (!topic) return;
    actionError = '';
    const newStatus = topic.status === 'active' ? 'paused' : 'active';
    try {
      const updated = await updateTopic(data.id, { status: newStatus });
      topic = { ...topic, ...updated };
      topicsStore.updateTopic(data.id, updated);
    } catch (err) {
      actionError = err instanceof Error ? err.message : t('errors.generic');
    }
  }

  async function handleFrequencyChange(days: number) {
    if (!topic) return;
    actionError = '';
    try {
      const updated = await updateTopic(data.id, { check_frequency_days: days });
      topic = { ...topic, ...updated };
      topicsStore.updateTopic(data.id, updated);
    } catch (err) {
      actionError = err instanceof Error ? err.message : t('errors.generic');
    }
  }

  async function handleDelete() {
    actionError = '';
    try {
      await deleteTopic(data.id);
      topicsStore.removeTopic(data.id);
      goto('/');
    } catch (err) {
      actionError = err instanceof Error ? err.message : t('errors.generic');
      showDeleteConfirm = false;
    }
  }

  onMount(load);
</script>

<svelte:head>
  <title>{topic ? topic.title : 'Topic'} — owlo</title>
</svelte:head>

<div class="page-container py-6 animate-fade-in">

  <!-- Back -->
  <button
    onclick={() => goto('/')}
    class="flex items-center gap-1.5 text-sm text-[var(--text-3)] hover:text-[var(--text-2)]
           transition-colors mb-6"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
    {t('topic.back')}
  </button>

  <!-- Loading -->
  {#if loading}
    <div class="space-y-4">
      <div class="skeleton h-8 w-3/4 rounded"></div>
      <div class="skeleton h-4 w-full rounded"></div>
      <div class="skeleton h-4 w-2/3 rounded"></div>
    </div>

  <!-- Error -->
  {:else if error}
    <div class="card p-6 text-center space-y-3">
      <p class="text-[var(--text-2)]">{error}</p>
      <button onclick={load} class="btn btn-ghost">{t('errors.retry')}</button>
    </div>

  {:else if topic}
    <!-- Title + status -->
    <div class="mb-6">
      <div class="flex items-start gap-3 mb-2">
        <h1 class="font-display text-3xl font-medium text-[var(--text-1)] leading-tight flex-1">
          {topic.title}
        </h1>
        <span
          class="badge shrink-0 mt-1
                 {topic.status === 'active' ? 'badge-active' : topic.status === 'paused' ? 'badge-paused' : ''}"
        >
          {topic.status === 'active'
            ? t('topic.status_active')
            : topic.status === 'paused'
              ? t('topic.status_paused')
              : t('topic.status_archived')}
        </span>
      </div>

      {#if topic.description}
        <p class="text-[var(--text-2)] leading-relaxed">{topic.description}</p>
      {/if}
    </div>

    <!-- Meta bar -->
    <div
      class="flex flex-wrap gap-x-4 gap-y-1 text-mono text-[var(--text-3)] mb-6 pb-6 border-b border-[var(--border)]"
    >
      {#if topic.last_checked_at}
        <span>{t('dashboard.last_checked')} {formatRelative(topic.last_checked_at)}</span>
      {/if}
      <span>{frequencyLabel(topic.check_frequency_days)}</span>
      <span>{topic.facts_count} {t('dashboard.facts')}</span>

      <a
        href={topic.source_url}
        target="_blank"
        rel="noopener noreferrer"
        class="hover:text-[var(--accent-light)] transition-colors underline underline-offset-2 ml-auto"
      >
        {t('topic.original_article')} →
      </a>
    </div>

    <!-- Action error -->
    {#if actionError}
      <p class="text-danger text-sm mb-4" role="alert">{actionError}</p>
    {/if}

    <!-- Actions -->
    <div class="flex flex-wrap gap-2 mb-8">
      <button
        onclick={handleCheckNow}
        class="btn btn-primary"
        disabled={checkingNow || topic.status !== 'active'}
      >
        {#if checkingNow}
          <svg class="animate-spin-slow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
        {/if}
        {t('topic.check_now_cost')}
      </button>

      <button
        onclick={handleTogglePause}
        class="btn btn-ghost"
        disabled={topic.status === 'archived'}
      >
        {topic.status === 'paused' ? t('topic.resume') : t('topic.pause')}
      </button>
    </div>

    <!-- Timeline -->
    <div class="mb-8">
      <h2 class="font-display text-xl font-medium text-[var(--text-1)] mb-4">
        {t('topic.facts_timeline')}
      </h2>
      <TopicTimeline facts={topic.facts} />
    </div>

    <!-- Settings section -->
    <div class="card p-4 mb-6">
      <h2 class="font-display text-base font-medium text-[var(--text-1)] mb-4">
        {t('topic.frequency')}
      </h2>
      <div class="flex flex-wrap gap-2">
        {#each FREQUENCIES as days (days)}
          <button
            onclick={() => handleFrequencyChange(days)}
            class="btn py-1.5 px-3 text-sm
                   {topic.check_frequency_days === days ? 'btn-primary' : 'btn-ghost'}"
          >
            {frequencyLabel(days)}
          </button>
        {/each}
      </div>
    </div>

    <!-- Check history (collapsible) -->
    {#if topic.check_history?.length > 0}
      <div class="mb-6">
        <button
          onclick={() => (showHistory = !showHistory)}
          class="flex items-center gap-2 text-sm text-[var(--text-2)] hover:text-[var(--text-1)]
                 transition-colors w-full text-left"
          aria-expanded={showHistory}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="transition-transform {showHistory ? 'rotate-90' : ''}"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          {t('topic.check_history')} ({topic.check_history.length})
        </button>

        {#if showHistory}
          <div class="mt-3 space-y-1 pl-4 border-l border-[var(--border)] animate-slide-up">
            {#each topic.check_history as run (run.id)}
              <div class="flex items-center justify-between text-sm py-1.5">
                <time class="text-mono text-[var(--text-3)]">{formatDate(run.ran_at)}</time>
                <span
                  class="{run.status === 'success'
                    ? 'text-[var(--pulse)]'
                    : run.status === 'no_updates'
                      ? 'text-[var(--text-3)]'
                      : 'text-danger'} text-mono"
                >
                  {run.status === 'success'
                    ? `+${run.new_facts_count}`
                    : run.status === 'no_updates'
                      ? '—'
                      : '!'}
                </span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    <!-- Danger zone -->
    <div class="border-t border-[var(--border)] pt-6">
      {#if showDeleteConfirm}
        <div class="card p-4 space-y-3 animate-slide-up border-danger/20">
          <p class="text-sm text-[var(--text-1)]">{t('topic.delete_confirm')}</p>
          <div class="flex gap-2">
            <button onclick={handleDelete} class="btn btn-danger flex-1">
              {t('topic.delete')}
            </button>
            <button onclick={() => (showDeleteConfirm = false)} class="btn btn-ghost flex-1">
              Cancel
            </button>
          </div>
        </div>
      {:else}
        <button
          onclick={() => (showDeleteConfirm = true)}
          class="btn btn-danger text-sm"
        >
          {t('topic.delete')}
        </button>
      {/if}
    </div>
  {/if}
</div>
