import { apiFetch } from './client';

export type TopicStatus = 'active' | 'paused' | 'archived';

export interface Topic {
  id: string;
  title: string;
  description: string;
  source_url: string;
  status: TopicStatus;
  check_frequency_days: number;
  last_checked_at: string | null;
  next_check_at: string | null;
  has_update: boolean;
  facts_count: number;
  new_facts_count: number;
  created_at: string;
}

export interface Fact {
  id: string;
  content: string;
  discovered_at: string;
  source_url: string | null;
  is_initial: boolean;
  is_new: boolean;
}

export interface CheckRun {
  id: string;
  ran_at: string;
  new_facts_count: number;
  status: 'success' | 'no_updates' | 'error';
  error_message?: string;
}

export interface TopicDetail extends Topic {
  facts: Fact[];
  check_history: CheckRun[];
}

export interface TopicProposal {
  id: string;
  title: string;
  description: string;
}

export interface SubmitUrlResponse {
  proposals: TopicProposal[];
}

export interface ConfirmTopicRequest {
  url: string;
  proposal_index: number;
  check_interval_days?: number;
}

export interface UpdateTopicRequest {
  status?: TopicStatus;
  check_frequency_days?: number;
}

export async function getTopics(): Promise<Topic[]> {
  return apiFetch<Topic[]>('/topics');
}

export async function getTopicById(id: string): Promise<TopicDetail> {
  return apiFetch<TopicDetail>(`/topics/${id}`);
}

export async function submitUrl(url: string): Promise<SubmitUrlResponse> {
  return apiFetch<SubmitUrlResponse>('/topics', {
    method: 'POST',
    body: { url }
  });
}

export async function confirmTopic(request: ConfirmTopicRequest): Promise<Topic> {
  return apiFetch<Topic>('/topics/confirm', {
    method: 'POST',
    body: request
  });
}

export async function updateTopic(id: string, updates: UpdateTopicRequest): Promise<Topic> {
  return apiFetch<Topic>(`/topics/${id}`, {
    method: 'PATCH',
    body: updates
  });
}

export async function deleteTopic(id: string): Promise<void> {
  await apiFetch(`/topics/${id}`, { method: 'DELETE' });
}

export async function checkTopicNow(id: string): Promise<Topic> {
  return apiFetch<Topic>(`/topics/${id}/check`, { method: 'POST' });
}

export async function markTopicRead(id: string): Promise<void> {
  await apiFetch(`/topics/${id}/mark-read`, { method: 'POST' });
}
