import { request } from '@umijs/max';

export interface Customer {
  id: string;
  customerNo: string;
  name: string;
  type: string;
  industry?: string;
  address?: string;
  phone?: string;
  email?: string;
  creditCode?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListResult {
  list: Customer[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CustomerQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  type?: string;
  status?: string;
}

export async function getCustomers(params: CustomerQuery) {
  return request<CustomerListResult>('/api/customers', { params });
}

export async function getCustomer(id: string) {
  return request<Customer>(`/api/customers/${id}`);
}

export async function createCustomer(data: Partial<Customer>) {
  return request<Customer>('/api/customers', { method: 'POST', data });
}

export async function updateCustomer(id: string, data: Partial<Customer>) {
  return request<Customer>(`/api/customers/${id}`, { method: 'PATCH', data });
}

export async function deleteCustomer(id: string) {
  return request(`/api/customers/${id}`, { method: 'DELETE' });
}
