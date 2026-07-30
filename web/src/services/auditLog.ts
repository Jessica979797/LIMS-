import { request } from '@umijs/max';

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  before?: any;
  after?: any;
  ip?: string;
  createdAt: string;
}

export interface AuditLogListResult {
  list: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuditLogQuery {
  page?: number;
  pageSize?: number;
  userId?: string;
  entity?: string;
  keyword?: string;
}

export async function getAuditLogs(params: AuditLogQuery) {
  return request<AuditLogListResult>('/api/audit-logs', { params });
}
