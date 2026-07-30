import { request } from '@umijs/max';

export interface TestTask {
  id: string;
  taskNo: string;
  sampleId: string;
  sample?: { id: string; sampleNo: string; name: string };
  applicationId: string;
  testItemId: string;
  testItem?: { id: string; name: string; code: string };
  assignedToId?: string;
  assignedTo?: { id: string; name: string };
  status: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface TestTaskListResult {
  list: TestTask[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TestTaskQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  sampleId?: string;
  assignedToId?: string;
}

export async function getTestTasks(params: TestTaskQuery) {
  return request<TestTaskListResult>('/api/test-tasks', { params });
}

export async function getTestTask(id: string) {
  return request<TestTask>(`/api/test-tasks/${id}`);
}

export async function createTestTask(data: any) {
  return request('/api/test-tasks', { method: 'POST', data });
}

export async function updateTestTask(id: string, data: any) {
  return request(`/api/test-tasks/${id}`, { method: 'PATCH', data });
}

export async function deleteTestTask(id: string) {
  return request(`/api/test-tasks/${id}`, { method: 'DELETE' });
}

export async function advanceTestTask(id: string) {
  return request(`/api/test-tasks/${id}/advance`, { method: 'POST' });
}
