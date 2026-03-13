import type { Notification } from '$lib/api/users';

class NotificationsStore {
  list = $state<Notification[]>([]);
  loading = $state(false);

  get unreadCount(): number {
    return this.list.filter((n) => !n.read).length;
  }

  setNotifications(notifications: Notification[]): void {
    this.list = notifications;
  }

  markRead(ids?: string[]): void {
    this.list = this.list.map((n) => {
      if (!ids || ids.includes(n.id)) {
        return { ...n, read: true };
      }
      return n;
    });
  }

  setLoading(loading: boolean): void {
    this.loading = loading;
  }
}

export const notificationsStore = new NotificationsStore();
