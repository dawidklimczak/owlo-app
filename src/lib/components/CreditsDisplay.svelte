<script lang="ts">
  import { t } from '$lib/i18n';

  interface Props {
    balance: number;
    compact?: boolean;
  }

  let { balance, compact = false }: Props = $props();
</script>

{#if compact}
  <span
    class="font-mono text-sm text-[var(--text-2)]"
    title="{balance} {t('settings.credits')}"
  >
    {balance}cr
  </span>
{:else}
  <div class="flex items-center gap-2">
    <span class="text-2xl font-display font-medium text-[var(--text-1)]">{balance}</span>
    <span class="text-sm text-[var(--text-2)]">{t('settings.credits')}</span>
  </div>
{/if}
