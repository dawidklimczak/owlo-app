<script lang="ts">
  import type { TopicProposal } from '$lib/api/topics';
  import { t } from '$lib/i18n';

  interface Props {
    proposals: TopicProposal[];
    onSelect: (proposal: TopicProposal) => void;
  }

  let { proposals, onSelect }: Props = $props();

  let selected = $state<string | null>(null);

  function choose(proposal: TopicProposal) {
    selected = proposal.id;
    onSelect(proposal);
  }
</script>

<div class="space-y-3">
  <p class="text-sm text-[var(--text-2)]">{t('add_topic.choose_instruction')}</p>

  {#each proposals as proposal (proposal.id)}
    <button
      onclick={() => choose(proposal)}
      class="w-full text-left card p-4 transition-all duration-150
             {selected === proposal.id
        ? 'border-[var(--accent)] bg-[var(--accent-dim)]'
        : 'hover:border-[var(--border-strong)]'}"
      aria-pressed={selected === proposal.id}
    >
      <h3 class="font-display text-base font-medium text-[var(--text-1)] mb-1 leading-snug">
        {proposal.title}
      </h3>
      <p class="text-sm text-[var(--text-2)] leading-relaxed">
        {proposal.description}
      </p>
    </button>
  {/each}
</div>
