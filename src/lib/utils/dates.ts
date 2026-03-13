import { getLang } from '$lib/i18n';

export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  const lang = getLang();
  return date.toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function formatDateShort(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  const lang = getLang();
  return date.toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-US', {
    day: 'numeric',
    month: 'short'
  });
}

export function formatRelative(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffD = Math.floor(diffMs / 86_400_000);

  const lang = getLang();
  const isPl = lang === 'pl';

  if (diffMin < 2) return isPl ? 'przed chwilą' : 'just now';
  if (diffMin < 60) return isPl ? `${diffMin} min temu` : `${diffMin}m ago`;
  if (diffH < 24) return isPl ? `${diffH}h temu` : `${diffH}h ago`;
  if (diffD === 1) return isPl ? 'wczoraj' : 'yesterday';
  if (diffD < 7) return isPl ? `${diffD} dni temu` : `${diffD}d ago`;
  if (diffD < 30) return isPl ? `${Math.floor(diffD / 7)} tyg. temu` : `${Math.floor(diffD / 7)}w ago`;
  return formatDateShort(iso);
}

export function frequencyLabel(days: number): string {
  const lang = getLang();
  const isPl = lang === 'pl';
  if (days <= 3) return isPl ? 'co 3 dni' : 'every 3 days';
  if (days <= 7) return isPl ? 'co tydzień' : 'weekly';
  if (days <= 14) return isPl ? 'co 2 tygodnie' : 'fortnightly';
  return isPl ? 'co miesiąc' : 'monthly';
}
