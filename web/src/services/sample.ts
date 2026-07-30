import { request } from '@umijs/max';

export interface Sample {
  id: string;
  sampleNo: string;
  applicationId: string;
  application?: { id: string; applicationNo: string };
  name: string;
  type?: string;
  model?: string;
  batchNo?: string;
  manufacturer?: string;
  quantity: number;
  unit?: string;
  status: string;
  receivedAt: string;
  storageLocation?: string;
  retainQty?: number;
  createdAt: string;
}

export interface SampleListResult {
  list: Sample[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SampleQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  applicationId?: string;
}

export async function getSamples(params: SampleQuery) {
  return request<SampleListResult>('/api/samples', { params });
}

export async function getSample(id: string) {
  return request<Sample>(`/api/samples/${id}`);
}

export async function createSample(data: any) {
  return request('/api/samples', { method: 'POST', data });
}

export async function updateSample(id: string, data: any) {
  return request(`/api/samples/${id}`, { method: 'PATCH', data });
}

export async function deleteSample(id: string) {
  return request(`/api/samples/${id}`, { method: 'DELETE' });
}
