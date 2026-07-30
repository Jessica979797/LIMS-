import { request } from '@umijs/max';

export interface Role {
  id: string;
  name: string;
  code: string;
  module: string;
  createdAt: string;
}

export interface RoleListResult {
  list: Role[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RoleQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

export async function getRoles(params: RoleQuery) {
  return request<RoleListResult>('/api/roles', { params });
}

export async function createRole(data: any) {
  return request('/api/roles', { method: 'POST', data });
}

export async function updateRole(id: string, data: any) {
  return request(`/api/roles/${id}`, { method: 'PATCH', data });
}

export async function deleteRole(id: string) {
  return request(`/api/roles/${id}`, { method: 'DELETE' });
}
