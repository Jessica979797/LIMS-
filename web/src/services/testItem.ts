import { request } from '@umijs/max';

export interface TestItem {
  id: string;
  code: string;
  name: string;
  category?: string;
  unit?: string;
}

export async function getTestItems() {
  return request<TestItem[]>('/api/test-items');
}

export async function createTestItem(data: any) {
  return request('/api/test-items', { method: 'POST', data });
}

export async function updateTestItem(id: string, data: any) {
  return request(`/api/test-items/${id}`, { method: 'PATCH', data });
}

export async function deleteTestItem(id: string) {
  return request(`/api/test-items/${id}`, { method: 'DELETE' });
}
