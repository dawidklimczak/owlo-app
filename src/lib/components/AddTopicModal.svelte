<script lang="ts">
  import type { TopicProposal } from '$lib/api/topics';
  import { submitUrl, submitQuery, confirmTopic } from '$lib/api/topics';
  import { topicsStore } from '$lib/stores/topics.svelte';
  import { t } from '$lib/i18n';
  import TopicChoiceStep from './TopicChoiceStep.svelte';

  interface Props {
    onClose: () => void;
    initialUrl?: string;
  }

  let { onClose, initialUrl = '' }: Props = $props();

  type Step = 'url' | 'choose' | 'confirm';

  let step = $state<Step>('url');
  let url = $state(initialUrl);
  let loading = $state(false);
  let error = $state('');
  let proposals = $state<TopicProposal[]>([]);
  let confirmedTitle = $state('');
  let confirmedFrequency = $state(7);

  function isUrl(value: string): boolean {
    return value.startsWith('http://') || value.startsWith('https://');
  }

  function isValidInput(value: string): boolean {
    const v = value.trim();
    if (!v) return false;
    return isUrl(v) ? true : v.length >= 3;
  }

  async function handleSubmitUrl(e: SubmitEvent) {
    e.preventDefault();
    const value = url.trim();
    if (!isValidInput(value)) return;
    loading = true;
    error = '';
    try {
      const result = isUrl(value)
        ? await submitUrl(value)
        : await submitQuery(value);
      proposals = result.proposals;

      if (proposals.length === 1) {
        // Auto-select if only one proposal
        await handleSelectProposal(proposals[0]);
      } else {
        step = 'choose';
      }
    } catch (err) {
      error = err instanceof Error ? err.message : t('errors.generic');
    } finally {
      loading = false;
    }
  }

  async function handleSelectProposal(proposal: TopicProposal) {
    loading = true;
    error = '';
    try {
      const proposal_index = proposals.indexOf(proposal);
      const topic = await confirmTopic({
        source: url.trim(),
        proposal_index,
        check_interval_days: confirmedFrequency
      });
      topicsStore.addTopic(topic);
      confirmedTitle = topic.title;
      confirmedFrequency = topic.check_frequency_days;
      step = 'confirm';
    } catch (err) {
      error = err instanceof Error ? err.message : t('errors.generic');
    } finally {
      loading = false;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }
</script>

<svelte:window onkeydown={handleKeyDown} />

<!-- Backdrop -->
<div
  class="modal-backdrop"
  onclick={handleBackdropClick}
  role="dialog"
  aria-modal="true"
  aria-label={t('add_topic.title')}
>
  <!-- Panel -->
  <div class="modal-panel">

    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <h2 class="font-display text-xl font-medium text-[var(--text-1)]">
        {#if step === 'url'}{t('add_topic.step_url')}
        {:else if step === 'choose'}{t('add_topic.step_choose')}
        {:else}{t('add_topic.step_confirm')}{/if}
      </h2>
      <button
        onclick={onClose}
        class="w-8 h-8 flex items-center justify-center rounded-md text-[var(--text-3)]
               hover:text-[var(--text-1)] hover:bg-[var(--surface-2)] transition-colors"
        aria-label="Close"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <!-- Step: URL input -->
    {#if step === 'url'}
      <form onsubmit={handleSubmitUrl} class="space-y-3">
        <label for="article-url" class="sr-only">{t('add_topic.url_placeholder')}</label>
        <input
          id="article-url"
          type="text"
          bind:value={url}
          placeholder={t('add_topic.url_placeholder')}
          class="input"
          disabled={loading}
          autofocus
        />

        {#if error}
          <p class="text-danger text-sm" role="alert">{error}</p>
        {/if}

        <button
          type="submit"
          class="btn btn-primary w-full py-3"
          disabled={loading || !isValidInput(url)}
        >
          {#if loading}
            <svg class="animate-spin-slow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            {t('add_topic.loading')}
          {:else}
            {t('add_topic.url_submit')}
          {/if}
        </button>
      </form>

    <!-- Step: Choose proposal -->
    {:else if step === 'choose'}
      {#if loading}
        <div class="flex items-center justify-center py-10 gap-3 text-[var(--text-2)]">
          <svg class="animate-spin-slow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
          <span class="text-sm">{t('add_topic.loading')}</span>
        </div>
      {:else}
        <TopicChoiceStep {proposals} onSelect={handleSelectProposal} />
        {#if error}
          <p class="text-danger text-sm mt-3" role="alert">{error}</p>
        {/if}
      {/if}

    <!-- Step: Confirm -->
    {:else if step === 'confirm'}
      <div class="text-center space-y-4 py-2 animate-slide-up">
        <div
          class="w-12 h-12 rounded-full bg-[var(--pulse-dim)] flex items-center justify-center mx-auto"
          aria-hidden="true"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--pulse)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <div>
          <h3 class="font-display text-lg font-medium text-[var(--text-1)] mb-1">
            {confirmedTitle}
          </h3>
          <p class="text-sm text-[var(--text-2)]">
            {t('add_topic.confirm_message', { days: String(confirmedFrequency) })}
          </p>
        </div>

        <div class="flex gap-2 pt-2">
          <button onclick={onClose} class="btn btn-primary flex-1 py-3">
            {t('add_topic.confirm_back')}
          </button>
          <button
            onclick={() => { step = 'url'; url = ''; proposals = []; error = ''; }}
            class="btn btn-ghost flex-1 py-3"
          >
            {t('add_topic.add_another')}
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
