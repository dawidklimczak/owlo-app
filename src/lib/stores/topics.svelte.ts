import type { Topic } from '$lib/api/topics';

class TopicsStore {
  list = $state<Topic[]>([]);
  loading = $state(false);
  error = $state<string | null>(null);

  get sorted(): Topic[] {
    return [...this.list].sort((a, b) => {
      if (a.has_update && !b.has_update) return -1;
      if (!a.has_update && b.has_update) return 1;
      const da = a.last_checked_at ? new Date(a.last_checked_at).getTime() : 0;
      const db = b.last_checked_at ? new Date(b.last_checked_at).getTime() : 0;
      return db - da;
    });
  }

  get hasUpdates(): boolean {
    return this.list.some((t) => t.has_update);
  }

  setTopics(topics: Topic[]): void {
    this.list = topics;
  }

  addTopic(topic: Topic): void {
    this.list = [topic, ...this.list];
  }

  updateTopic(id: string, updates: Partial<Topic>): void {
    this.list = this.list.map((t) => (t.id === id ? { ...t, ...updates } : t));
  }

  removeTopic(id: string): void {
    this.list = this.list.filter((t) => t.id !== id);
  }

  setLoading(loading: boolean): void {
    this.loading = loading;
  }

  setError(error: string | null): void {
    this.error = error;
  }
}

export const topicsStore = new TopicsStore();
