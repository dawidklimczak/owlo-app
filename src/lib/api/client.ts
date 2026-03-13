import { PUBLIC_API_URL } from '$env/static/public';
import { browser } from '$app/environment';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class AuthError extends ApiError {
  constructor() {
    super(401, 'Unauthorized');
    this.name = 'AuthError';
  }
}

export class CreditsError extends ApiError {
  constructor() {
    super(403, 'Insufficient credits');
    this.name = 'CreditsError';
  }
}

export class RateLimitError extends ApiError {
  constructor() {
    super(429, 'Too many requests — please wait');
    this.name = 'RateLimitError';
  }
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';

interface FetchOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiFetch<T = void>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const init: RequestInit = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const response = await fetch(`${PUBLIC_API_URL}${path}`, init);

  if (response.status === 401) {
    if (browser) {
      const redirect = encodeURIComponent(window.location.pathname);
      window.location.href = redirect !== '%2Flogin' ? `/login?redirect=${redirect}` : '/login';
    }
    throw new AuthError();
  }

  if (response.status === 403) {
    throw new CreditsError();
  }

  if (response.status === 429) {
    throw new RateLimitError();
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      if (data?.detail) message = data.detail;
      else if (data?.message) message = data.message;
    } catch {
      // ignore parse error
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
