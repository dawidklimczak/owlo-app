<script lang="ts">
  import type { Fact } from '$lib/api/topics';
  import FactItem from './FactItem.svelte';
  import { t } from '$lib/i18n';

  interface Props {
    facts?: Fact[];
  }

  let { facts = [] }: Props = $props();

  let initialFacts = $derived(facts.filter((f) => f.is_initial));
  let discoveredFacts = $derived(
    facts
      .filter((f) => !f.is_initial)
      .sort((a, b) => new Date(b.discovered_at).getTime() - new Date(a.discovered_at).getTime())
  );
</script>

<section aria-label={t('topic.facts_timeline')}>
  {#if facts.length === 0}
    <p class="text-[var(--text-3)] text-sm py-4">{t('topic.no_facts')}</p>
  {:else}
    <!-- Discovered facts -->
    {#if discoveredFacts.length > 0}
      <div class="mb-6">
        <h3 class="text-mono text-[var(--text-3)] uppercase tracking-widest mb-4 text-xs">
          {t('topic.discovered')}
        </h3>
        <div>
          {#each discoveredFacts as fact (fact.id)}
            <FactItem {fact} />
          {/each}
        </div>
      </div>
    {/if}

    <!-- Initial facts section -->
    {#if initialFacts.length > 0}
      <div>
        <h3 class="text-mono text-[var(--text-3)] uppercase tracking-widest mb-4 text-xs">
          {t('topic.initial_facts')}
        </h3>
        <div>
          {#each initialFacts as fact (fact.id)}
            <FactItem {fact} />
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</section>
