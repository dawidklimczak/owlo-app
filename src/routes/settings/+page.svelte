<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth.svelte';
  import { getUserSettings, updateUserSettings, getCredits } from '$lib/api/users';
  import { logout } from '$lib/api/auth';
  import { goto } from '$app/navigation';
  import type { UserSettings, Credits } from '$lib/api/users';
  import { t, availableLanguages, setLanguage, getLang } from '$lib/i18n';
  import { formatDate } from '$lib/utils/dates';
  import CreditsDisplay from '$lib/components/CreditsDisplay.svelte';

  let settings = $state<UserSettings | null>(null);
  let credits = $state<Credits | null>(null);
  let loadingSettings = $state(true);
  let loadingCredits = $state(true);
  let saving = $state(false);
  let saved = $state(false);
  let error = $state('');
  let signingOut = $state(false);

  const FREQUENCIES = [
    { value: 3, label: () => t('settings.frequency_3') },
    { value: 7, label: () => t('settings.frequency_7') },
    { value: 14, label: () => t('settings.frequency_14') },
    { value: 30, label: () => t('settings.frequency_30') }
  ];

  onMount(async () => {
    try {
      const [s, c] = await Promise.all([getUserSettings(), getCredits()]);
      settings = s;
      credits = c;
    } catch (err) {
      error = err instanceof Error ? err.message : t('errors.generic');
    } finally {
      loadingSettings = false;
      loadingCredits = false;
    }
  });

  async function handleSave() {
    if (!settings) return;
    saving = true;
    saved = false;
    error = '';
    try {
      const updated = await updateUserSettings({
        language: settings.language,
        default_frequency_days: settings.default_frequency_days
      });
      settings = updated;
      saved = true;
      if (updated.language !== getLang()) {
        setLanguage(updated.language);
      }
      setTimeout(() => (saved = false), 2000);
    } catch (err) {
      error = err instanceof Error ? err.message : t('errors.generic');
    } finally {
      saving = false;
    }
  }

  async function handleLogout() {
    signingOut = true;
    try {
      await logout();
    } finally {
      authStore.logout();
      goto('/login');
    }
  }
</script>

<svelte:head>
  <title>{t('settings.title')} — owlo</title>
</svelte:head>

<div class="page-container py-6 animate-fade-in max-w-2xl">
  <h1 class="font-display text-3xl font-medium text-[var(--text-1)] mb-8">
    {t('settings.title')}
  </h1>

  {#if error}
    <p class="text-danger text-sm mb-4" role="alert">{error}</p>
  {/if}

  {#if loadingSettings}
    <div class="space-y-3">
      {#each Array(4) as _}
        <div class="skeleton h-14 rounded-lg"></div>
      {/each}
    </div>
  {:else if settings}
    <form onsubmit={(e) => { e.preventDefault(); handleSave(); }} class="space-y-6">

      <!-- Language -->
      <div class="card p-4">
        <label for="language" class="block text-sm font-medium text-[var(--text-1)] mb-2">
          {t('settings.language')}
        </label>
        <select
          id="language"
          bind:value={settings.language}
          class="input"
        >
          {#each availableLanguages as lang}
            <option value={lang.code}>{lang.label}</option>
          {/each}
        </select>
      </div>

      <!-- Default frequency -->
      <div class="card p-4">
        <span class="block text-sm font-medium text-[var(--text-1)] mb-3">
          {t('settings.default_frequency')}
        </span>
        <div class="flex flex-wrap gap-2">
          {#each FREQUENCIES as freq}
            <button
              type="button"
              onclick={() => settings && (settings.default_frequency_days = freq.value)}
              class="btn py-1.5 px-3 text-sm
                     {settings.default_frequency_days === freq.value ? 'btn-primary' : 'btn-ghost'}"
            >
              {freq.label()}
            </button>
          {/each}
        </div>
      </div>

      <!-- Save button -->
      <button
        type="submit"
        class="btn btn-primary w-full sm:w-auto"
        disabled={saving}
      >
        {saved ? t('settings.saved') : saving ? '...' : t('settings.save')}
      </button>
    </form>
  {/if}

  <hr class="divider my-8" />

  <!-- Credits -->
  <section aria-labelledby="credits-heading">
    <h2 id="credits-heading" class="font-display text-xl font-medium text-[var(--text-1)] mb-4">
      {t('settings.credits')}
    </h2>

    {#if loadingCredits}
      <div class="skeleton h-12 w-32 rounded"></div>
    {:else if credits}
      <div class="card p-4 mb-4">
        <p class="text-xs text-[var(--text-3)] font-mono uppercase tracking-widest mb-1">
          {t('settings.credits_balance')}
        </p>
        <CreditsDisplay balance={credits.balance} />
      </div>

      <!-- Credit history -->
      {#if credits.history.length > 0}
        <div>
          <h3 class="text-sm font-medium text-[var(--text-2)] mb-3">
            {t('settings.credits_history')}
          </h3>
          <div class="space-y-1">
            {#each credits.history as entry (entry.id)}
              <div class="flex items-start justify-between py-2 border-b border-[var(--border)] gap-3">
                <div class="min-w-0">
                  <span class="text-sm text-[var(--text-1)]">{entry.action}</span>
                  {#if entry.topic_title}
                    <span class="text-xs text-[var(--text-3)] ml-2 block sm:inline truncate">{entry.topic_title}</span>
                  {/if}
                </div>
                <div class="flex items-center gap-3 shrink-0">
                  <span class="text-mono text-sm text-danger">-{entry.amount}</span>
                  <time class="text-mono text-xs text-[var(--text-3)]">
                    {formatDate(entry.created_at)}
                  </time>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {:else}
        <p class="text-[var(--text-3)] text-sm">{t('settings.credits_empty')}</p>
      {/if}
    {/if}
  </section>

  <hr class="divider my-8" />

  <!-- Account -->
  <section aria-labelledby="account-heading">
    <h2 id="account-heading" class="font-display text-xl font-medium text-[var(--text-1)] mb-4">
      {t('settings.account')}
    </h2>

    {#if authStore.user}
      <div class="card p-4 mb-4">
        <p class="text-xs text-[var(--text-3)] font-mono uppercase tracking-widest mb-1">
          {t('settings.email')}
        </p>
        <p class="text-[var(--text-1)]">{authStore.user.email}</p>
      </div>
    {/if}

    <div class="flex flex-wrap gap-3">
      <button onclick={handleLogout} class="btn btn-ghost" disabled={signingOut}>
        {signingOut ? '...' : t('nav.logout')}
      </button>
    </div>
  </section>
</div>
