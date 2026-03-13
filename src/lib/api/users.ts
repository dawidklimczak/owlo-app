import { apiFetch } from './client';

export interface UserSettings {
  language: string;
  default_frequency_days: number;
}

export interface CreditUsage {
  id: string;
  action: string;
  amount: number;
  created_at: string;
  topic_title?: string;
}

export interface Credits {
  balance: number;
  history: CreditUsage[];
}

export interface Notification {
  id: string;
  message: string;
  topic_id: string | null;
  topic_title: string | null;
  read: boolean;
  created_at: string;
}

export async function getUserSettings(): Promise<UserSettings> {
  return apiFetch<UserSettings>('/users/settings');
}

export async function updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  return apiFetch<UserSettings>('/users/settings', {
    method: 'PATCH',
    body: settings
  });
}

export async function getCredits(): Promise<Credits> {
  return apiFetch<Credits>('/users/credits');
}

export async function getNotifications(): Promise<Notification[]> {
  return apiFetch<Notification[]>('/notifications');
}

export async function markNotificationsRead(ids?: string[]): Promise<void> {
  await apiFetch('/notifications/mark-read', {
    method: 'POST',
    body: ids ? { ids } : {}
  });
}
