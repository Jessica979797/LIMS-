import { request } from '@umijs/max';

export interface Equipment {
  id: string;
  code: string;
  name: string;
  model?: string;
  serialNo?: string;
  manufacturer?: string;
  status: string;
  calibrateDate?: string;
  calibrateDue?: string;
  createdAt: string;
}

export interface EquipmentListResult {
  list: Equipment[];
  total: number;
  page: number;
  pageSize: number;
}

export interface EquipmentQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
}

export async function getEquipment(params: EquipmentQuery) {
  return request<EquipmentListResult>('/api/equipment', { params });
}

export async function createEquipment(data: any) {
  return request('/api/equipment', { method: 'POST', data });
}

export async function updateEquipment(id: string, data: any) {
  return request(`/api/equipment/${id}`, { method: 'PATCH', data });
}

export async function deleteEquipment(id: string) {
  return request(`/api/equipment/${id}`, { method: 'DELETE' });
}
