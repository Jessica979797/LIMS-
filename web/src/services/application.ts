import { request } from '@umijs/max';

export interface ApplicationItem {
  id?: string;
  testItemId: string;
  remark?: string;
  testItem?: { id: string; name: string; code: string };
}

export interface Application {
  id: string;
  applicationNo: string;
  customerId: string;
  customer?: { id: string; name: string; customerNo: string };
  status: string;
  category?: string;
  contractNo?: string;
  expectedDate?: string | null;
  reportCopies?: number;
  reportForm?: string;
  remark?: string;
  items: ApplicationItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationListResult {
  list: Application[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApplicationQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  customerId?: string;
}

export async function getApplications(params: ApplicationQuery) {
  return request<ApplicationListResult>('/api/applications', { params });
}

export async function getApplication(id: string) {
  return request<Application>(`/api/applications/${id}`);
}

export async function createApplication(data: any) {
  return request('/api/applications', { method: 'POST', data });
}

export async function updateApplication(id: string, data: any) {
  return request(`/api/applications/${id}`, { method: 'PATCH', data });
}

export async function deleteApplication(id: string) {
  return request(`/api/applications/${id}`, { method: 'DELETE' });
}

export async function advanceApplication(id: string) {
  return request(`/api/applications/${id}/advance`, { method: 'POST' });
}
