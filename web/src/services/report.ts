import { request } from '@umijs/max';
import { auth } from '@/utils/auth';

export interface Report {
  id: string;
  reportNo: string;
  applicationId: string;
  application?: { id: string; applicationNo: string };
  templateId?: string;
  status: string;
  type: string;
  version: number;
  conclusion?: string;
  fileUrl?: string;
  preparedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
  issuedAt?: string;
  createdAt: string;
}

export interface ReportListResult {
  list: Report[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ReportQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  applicationId?: string;
}

export async function getReports(params: ReportQuery) {
  return request<ReportListResult>('/api/reports', { params });
}

export async function getReport(id: string) {
  return request(`/api/reports/${id}`);
}

export async function createReport(data: any) {
  return request('/api/reports', { method: 'POST', data });
}

export async function updateReport(id: string, data: any) {
  return request(`/api/reports/${id}`, { method: 'PATCH', data });
}

export async function deleteReport(id: string) {
  return request(`/api/reports/${id}`, { method: 'DELETE' });
}

// 三级签发
export async function prepareReport(id: string, data?: any) {
  return request(`/api/reports/${id}/prepare`, { method: 'POST', data: data || {} });
}

export async function reviewReport(id: string, data?: any) {
  return request(`/api/reports/${id}/review`, { method: 'POST', data: data || {} });
}

export async function approveReport(id: string, data?: any) {
  return request(`/api/reports/${id}/approve`, { method: 'POST', data: data || {} });
}

// 生成 PDF（HTML 模板 + Puppeteer，同步）
export async function generateReport(id: string) {
  return request(`/api/reports/${id}/generate`, { method: 'POST' });
}

// 预览报告 HTML（弹框预览，不生成 PDF）
export async function previewReport(id: string) {
  return request<{ html: string }>(`/api/reports/${id}/preview`);
}

// 下载已生成的 PDF（带 token，blob 触发浏览器下载）
export async function downloadReport(id: string) {
  const token = auth.getToken();
  const res = await fetch(`/api/reports/${id}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('下载失败');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `report-${id}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 查询生成状态（前端轮询用）
export async function getGenerationStatus(id: string, jobId: string) {
  return request<{ state: string; fileUrl?: string; reportStatus: string }>(
    `/api/reports/${id}/generation-status`,
    { params: { jobId } },
  );
}
