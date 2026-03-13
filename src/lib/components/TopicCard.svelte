<script lang="ts">
  import type { Topic } from '$lib/api/topics';
  import { formatRelative, frequencyLabel } from '$lib/utils/dates';
  import { t } from '$lib/i18n';
  import { goto } from '$app/navigation';

  interface Props {
    topic: Topic;
  }

  let { topic }: Props = $props();

  let statusLabel = $derived(
    topic.status === 'paused'
      ? t('topic.status_paused')
      : topic.status === 'archived'
        ? t('topic.status_archived')
        : t('topic.status_active')
  );
</script>

<article
  class="card has-update-{topic.has_update} p-4 cursor-pointer select-none
         transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0
         {topic.has_update ? 'has-update' : ''}"
  onclick={() => goto(`/topic/${topic.id}`)}
  onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && goto(`/topic/${topic.id}`)}
  role="link"
  tabindex="0"
  aria-label={topic.title}
>
  <!-- Top row: title + update dot -->
  <div class="flex items-start justify-between gap-3 mb-2">
    <h2 class="font-display text-lg font-medium text-[var(--text-1)] leading-snug flex-1 min-w-0">
      {topic.title}
    </h2>
    {#if topic.has_update}
      <span
        class="mt-1 shrink-0 w-2 h-2 rounded-full bg-[var(--pulse)] animate-pulse-dot"
        aria-label="Has new updates"
      ></span>
    {/if}
  </div>

  <!-- Description snippet -->
  {#if topic.description}
    <p class="text-sm text-[var(--text-2)] line-clamp-2 mb-3 leading-relaxed">
      {topic.description}
    </p>
  {/if}

  <!-- Bottom meta row -->
  <div class="flex items-center gap-3 flex-wrap">
    <!-- Fact count -->
    <span class="text-mono text-[var(--text-3)]">
      {topic.facts_count}
      {t('dashboard.facts')}
      {#if topic.new_facts_count > 0}
        <span class="badge badge-new ml-1">
          +{topic.new_facts_count} {t('dashboard.new_facts')}
        </span>
      {/if}
    </span>

    <!-- Frequency -->
    <span class="text-mono text-[var(--text-3)]">
      {frequencyLabel(topic.check_frequency_days)}
    </span>

    <!-- Last checked -->
    {#if topic.last_checked_at}
      <span class="text-mono text-[var(--text-3)]">
        {t('dashboard.last_checked')} {formatRelative(topic.last_checked_at)}
      </span>
    {/if}

    <!-- Status badge (only if not active) -->
    {#if topic.status !== 'active'}
      <span class="badge {topic.status === 'paused' ? 'badge-paused' : ''} ml-auto">
        {statusLabel}
      </span>
    {/if}
  </div>
</article>
