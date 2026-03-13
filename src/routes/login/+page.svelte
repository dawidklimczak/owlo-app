<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { PUBLIC_API_URL, PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';
  import { sendMagicLink } from '$lib/api/auth';
  import { t } from '$lib/i18n';

  let email = $state('');
  let loading = $state(false);
  let sent = $state(false);
  let error = $state('');

  let redirectTo = $derived($page.url.searchParams.get('redirect') ?? '/');

  async function handleMagicLink(e: SubmitEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    loading = true;
    error = '';
    try {
      await sendMagicLink(email.trim());
      sent = true;
    } catch (err) {
      error = err instanceof Error ? err.message : t('errors.generic');
    } finally {
      loading = false;
    }
  }

  function handleGoogleLogin() {
    const params = new URLSearchParams({
      client_id: PUBLIC_GOOGLE_CLIENT_ID,
      redirect_uri: `${window.location.origin}/auth/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      state: redirectTo
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }
</script>

<svelte:head>
  <title>{t('auth.login_title')} — owlo</title>
</svelte:head>

<div
  class="min-h-dvh flex items-center justify-center px-4 py-16"
  style="background: var(--bg);"
>
  <div class="w-full max-w-sm animate-fade-in">

    <!-- Header -->
    <div class="mb-10 text-center">
      <h1 class="font-display text-4xl font-medium text-[var(--text-1)] mb-2">
        owlo
      </h1>
      <p class="text-[var(--text-2)] text-sm">
        {t('auth.login_subtitle')}
      </p>
    </div>

    {#if sent}
      <!-- Magic link sent state -->
      <div
        class="card p-6 text-center animate-slide-up"
        role="status"
      >
        <div
          class="w-12 h-12 rounded-full bg-[var(--pulse-dim)] flex items-center justify-center mx-auto mb-4"
          aria-hidden="true"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--pulse)"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <h2 class="font-display text-xl font-medium text-[var(--text-1)] mb-2">
          {t('auth.link_sent')}
        </h2>
        <p class="text-[var(--text-2)] text-sm">
          {t('auth.link_sent_body', { email })}
        </p>
        <button
          onclick={() => { sent = false; error = ''; }}
          class="mt-5 text-sm text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors underline underline-offset-2"
        >
          {t('auth.back_to_login')}
        </button>
      </div>
    {:else}
      <!-- Login form -->
      <div class="card p-6 space-y-4">

        <!-- Google -->
        <button
          onclick={handleGoogleLogin}
          class="btn btn-ghost w-full gap-3 py-3"
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {t('auth.google')}
        </button>

        <!-- Divider -->
        <div class="flex items-center gap-3">
          <div class="flex-1 h-px bg-[var(--border)]"></div>
          <span class="text-xs text-[var(--text-3)] font-mono">or</span>
          <div class="flex-1 h-px bg-[var(--border)]"></div>
        </div>

        <!-- Magic link -->
        <form onsubmit={handleMagicLink} class="space-y-3">
          <div>
            <label for="email" class="sr-only">{t('auth.email_placeholder')}</label>
            <input
              id="email"
              type="email"
              autocomplete="email"
              bind:value={email}
              placeholder={t('auth.email_placeholder')}
              class="input"
              required
              disabled={loading}
            />
          </div>

          {#if error}
            <p class="text-danger text-sm" role="alert">{error}</p>
          {/if}

          <button
            type="submit"
            class="btn btn-primary w-full py-3"
            disabled={loading || !email.trim()}
          >
            {#if loading}
              <svg
                class="animate-spin-slow"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
            {/if}
            {loading ? '...' : t('auth.send_link')}
          </button>
        </form>
      </div>
    {/if}
  </div>
</div>
