<script lang="ts">
  import type { Fact } from '$lib/api/topics';
  import { formatDate } from '$lib/utils/dates';
  import { t } from '$lib/i18n';

  interface Props {
    fact: Fact;
  }

  let { fact }: Props = $props();
</script>

<article
  class="relative pl-5 pb-5 border-l border-[var(--border)]
         {fact.is_new ? 'border-l-[var(--pulse)]' : ''}"
  class:is-new={fact.is_new}
>
  <!-- Timeline dot -->
  <span
    class="absolute left-0 top-1 -translate-x-1/2 w-2 h-2 rounded-full border-2
           {fact.is_initial
      ? 'bg-[var(--surface-1)] border-[var(--accent)]'
      : fact.is_new
        ? 'bg-[var(--pulse)] border-[var(--pulse)]'
        : 'bg-[var(--surface-1)] border-[var(--border-strong)]'}"
    aria-hidden="true"
  ></span>

  <!-- Meta row -->
  <div class="flex items-center gap-2 mb-1 flex-wrap">
    <time class="text-mono text-[var(--text-3)]" datetime={fact.discovered_at}>
      {formatDate(fact.discovered_at)}
    </time>

    {#if fact.is_initial}
      <span class="badge badge-initial">{t('topic.initial_facts')}</span>
    {/if}
    {#if fact.is_new}
      <span class="badge badge-new">{t('dashboard.new_facts')}</span>
    {/if}
  </div>

  <!-- Fact content -->
  <p class="text-[var(--text-1)] text-sm leading-relaxed">
    {fact.content}
  </p>

  <!-- Source link -->
  {#if fact.source_url}
    <a
      href={fact.source_url}
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-1 mt-1.5 text-xs text-[var(--text-3)]
             hover:text-[var(--accent-light)] transition-colors underline underline-offset-2"
    >
      {t('topic.original_article')}
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </a>
  {/if}
</article>
