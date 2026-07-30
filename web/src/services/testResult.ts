import { request } from '@umijs/max';

export interface TestResult {
  id: string;
  taskId: string;
  task?: {
    id: string;
    taskNo: string;
    testItem?: { id: string; name: string };
  };
  value?: string;
  unit?: string;
  limit?: string;
  conclusion: string;
  rawData?: any;
  remark?: string;
  enteredById?: string;
  enteredAt?: string;
  createdAt: string;
}

export interface TestResultListResult {
  list: TestResult[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TestResultQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  conclusion?: string;
  taskId?: string;
}

export async function getTestResults(params: TestResultQuery) {
  return request<TestResultListResult>('/api/test-results', { params });
}

export async function getTestResult(id: string) {
  return request<TestResult>(`/api/test-results/${id}`);
}

export async function createTestResult(data: any) {
  return request('/api/test-results', { method: 'POST', data });
}

export async function updateTestResult(id: string, data: any) {
  return request(`/api/test-results/${id}`, { method: 'PATCH', data });
}

export async function deleteTestResult(id: string) {
  return request(`/api/test-results/${id}`, { method: 'DELETE' });
}
