// @ts-nocheck
import { redirect } from '@sveltejs/kit';
import { PUBLIC_API_URL } from '$env/static/public';
import type { LayoutLoad } from './$types';
import type { User } from '$lib/api/auth';

export const ssr = false;

const PUBLIC_PATHS = ['/login', '/auth/', '/share-target'];

export const load = async ({ url, fetch }: Parameters<LayoutLoad>[0]) => {
  const isPublic = PUBLIC_PATHS.some((p) => url.pathname.startsWith(p));

  if (isPublic) {
    return { user: null as User | null };
  }

  try {
    const res = await fetch(`${PUBLIC_API_URL}/auth/me`, {
      credentials: 'include'
    });

    if (!res.ok) {
      const dest =
        url.pathname !== '/'
          ? `/login?redirect=${encodeURIComponent(url.pathname)}`
          : '/login';
      throw redirect(302, dest);
    }

    const user: User = await res.json();
    return { user };
  } catch (e) {
    // Re-throw SvelteKit redirects/errors
    if (e && typeof e === 'object' && 'status' in e) throw e;
    throw redirect(302, '/login');
  }
};
