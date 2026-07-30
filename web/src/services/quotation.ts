import { request } from '@umijs/max';

export interface Quotation {
  id: string;
  quotationNo: string;
  customerId: string;
  customer?: { id: string; name: string };
  status: string;
  totalAmount: number;
  currency?: string;
  validUntil?: string;
  items?: any;
  createdAt: string;
}

export interface QuotationListResult {
  list: Quotation[];
  total: number;
  page: number;
  pageSize: number;
}

export interface QuotationQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  customerId?: string;
}

export async function getQuotations(params: QuotationQuery) {
  return request<QuotationListResult>('/api/quotations', { params });
}

export async function createQuotation(data: any) {
  return request('/api/quotations', { method: 'POST', data });
}

export async function updateQuotation(id: string, data: any) {
  return request(`/api/quotations/${id}`, { method: 'PATCH', data });
}

export async function deleteQuotation(id: string) {
  return request(`/api/quotations/${id}`, { method: 'DELETE' });
}
