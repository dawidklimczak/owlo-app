import { apiFetch } from './client';

export interface User {
  id: string;
  email: string;
  language: string;
  default_frequency_days: number;
  created_at: string;
}

export interface MagicLinkRequest {
  email: string;
}

export interface VerifyTokenRequest {
  token: string;
}

export interface AuthResponse {
  user: User;
}

export async function sendMagicLink(email: string): Promise<void> {
  await apiFetch('/auth/magic-link', {
    method: 'POST',
    body: { email } satisfies MagicLinkRequest
  });
}

export async function verifyMagicLink(token: string): Promise<User> {
  const data = await apiFetch<AuthResponse>('/auth/verify', {
    method: 'POST',
    body: { token } satisfies VerifyTokenRequest
  });
  return data.user;
}

export async function loginWithGoogle(code: string): Promise<User> {
  const data = await apiFetch<AuthResponse>('/auth/google', {
    method: 'POST',
    body: { code }
  });
  return data.user;
}

export async function getMe(): Promise<User> {
  return apiFetch<User>('/auth/me');
}

export async function logout(): Promise<void> {
  await apiFetch('/auth/logout', { method: 'POST' });
}
