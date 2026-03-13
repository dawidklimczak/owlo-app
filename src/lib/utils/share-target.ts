/**
 * Extract a URL from Web Share Target query parameters.
 * The share_target manifest entry sends: url, title, text.
 * The URL might come as the `url` param, or be embedded inside `text`.
 */
export function extractSharedUrl(searchParams: URLSearchParams): string | null {
  const directUrl = searchParams.get('url');
  if (directUrl && isValidUrl(directUrl)) return directUrl;

  const text = searchParams.get('text');
  if (text) {
    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    if (urlMatch && isValidUrl(urlMatch[0])) return urlMatch[0];
  }

  return null;
}

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

const SESSION_KEY = 'owlo-pending-share-url';

export function savePendingUrl(url: string): void {
  sessionStorage.setItem(SESSION_KEY, url);
}

export function consumePendingUrl(): string | null {
  const url = sessionStorage.getItem(SESSION_KEY);
  if (url) sessionStorage.removeItem(SESSION_KEY);
  return url;
}
