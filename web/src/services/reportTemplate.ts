import { request } from '@umijs/max';

export interface ReportTemplate {
  id: string;
  name: string;
  category: string;
  fileUrl: string;
  status: string;
}

export async function getReportTemplates() {
  return request<ReportTemplate[]>('/api/report-templates');
}

export async function createReportTemplate(data: any) {
  return request('/api/report-templates', { method: 'POST', data });
}
