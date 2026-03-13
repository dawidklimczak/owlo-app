<script lang="ts">
  interface Props {
    count: number;
  }

  let { count }: Props = $props();
</script>

{#if count > 0}
  <span
    class="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full
           bg-[var(--accent)] text-white font-mono text-[10px] font-bold
           animate-pulse-dot"
    aria-label="{count} unread notifications"
  >
    {count > 99 ? '99+' : count}
  </span>
{/if}
