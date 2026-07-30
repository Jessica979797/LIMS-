import { request } from '@umijs/max';

export interface UserOption {
  id: string;
  username: string;
  name: string;
  status: string;
}

export async function getUsers() {
  return request<UserOption[]>('/api/users');
}

export async function createUser(data: any) {
  return request('/api/users', { method: 'POST', data });
}

export async function updateUser(id: string, data: any) {
  return request(`/api/users/${id}`, { method: 'PATCH', data });
}

export async function deleteUser(id: string) {
  return request(`/api/users/${id}`, { method: 'DELETE' });
}
