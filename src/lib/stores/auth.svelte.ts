import type { User } from '$lib/api/auth';

class AuthStore {
  user = $state<User | null>(null);
  loading = $state(true);

  get isAuthenticated(): boolean {
    return this.user !== null;
  }

  setUser(user: User | null): void {
    this.user = user;
  }

  setLoading(loading: boolean): void {
    this.loading = loading;
  }

  logout(): void {
    this.user = null;
    this.loading = false;
  }
}

export const authStore = new AuthStore();
