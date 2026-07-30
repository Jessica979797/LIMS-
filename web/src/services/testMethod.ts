import { request } from '@umijs/max';

export interface TestMethod {
  id: string;
  code: string;
  name: string;
  standard?: string;
  scope?: string;
  testItemId: string;
  testItem?: { id: string; name: string; code: string };
  createdAt: string;
}

export interface TestMethodListResult {
  list: TestMethod[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TestMethodQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  testItemId?: string;
}

export async function getTestMethods(params: TestMethodQuery) {
  return request<TestMethodListResult>('/api/test-methods', { params });
}

export async function createTestMethod(data: any) {
  return request('/api/test-methods', { method: 'POST', data });
}

export async function updateTestMethod(id: string, data: any) {
  return request(`/api/test-methods/${id}`, { method: 'PATCH', data });
}

export async function deleteTestMethod(id: string) {
  return request(`/api/test-methods/${id}`, { method: 'DELETE' });
}
