import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Popconfirm, message, Tag, Space } from 'antd';
import { useRef } from 'react';
import { useAccess, useIntl } from '@umijs/max';
import {
  getReports,
  reviewReport,
  approveReport,
  type Report,
} from '@/services/report';
import PageShell from '@/components/PageShell';

const STATUS_MAP: Record<string, { labelId: string; color: string }> = {
  DRAFT: { labelId: 'status.report.DRAFT', color: 'default' },
  REVIEW: { labelId: 'status.report.REVIEW', color: 'gold' },
  APPROVED: { labelId: 'status.report.APPROVED', color: 'blue' },
  ISSUED: { labelId: 'status.report.ISSUED', color: 'green' },
  VOID: { labelId: 'status.report.VOID', color: 'red' },
  REVISED: { labelId: 'status.report.REVISED', color: 'cyan' },
};

export default function Approval() {
  const { formatMessage } = useIntl();
  const actionRef = useRef<ActionType>();
  const access = useAccess();

  const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(([value, v]) => ({
    label: formatMessage({ id: v.labelId }),
    value,
  }));

  const handleReview = async (id: string) => {
    try {
      await reviewReport(id);
      message.success(formatMessage({ id: 'approval.reviewSuccess' }));
      actionRef.current?.reload();
    } catch {
      message.error(formatMessage({ id: 'common.opFail' }));
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveReport(id);
      message.success(formatMessage({ id: 'approval.approveSuccess' }));
      actionRef.current?.reload();
    } catch {
      message.error(formatMessage({ id: 'common.opFail' }));
    }
  };

  const columns: ProColumns<Report>[] = [
    { title: formatMessage({ id: 'report.col.reportNo' }), dataIndex: 'reportNo', width: 130 },
    {
      title: formatMessage({ id: 'report.col.appNo' }),
      dataIndex: 'appNo',
      hideInSearch: true,
      render: (_, r) => r.application?.applicationNo ?? '-',
    },
    { title: formatMessage({ id: 'report.col.version' }), dataIndex: 'version', width: 60, hideInSearch: true },
    {
      title: formatMessage({ id: 'report.col.conclusion' }),
      dataIndex: 'conclusion',
      hideInSearch: true,
      render: (_, r) => r.conclusion ?? '-',
    },
    {
      title: formatMessage({ id: 'report.col.status' }),
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      fieldProps: { options: STATUS_OPTIONS },
      render: (_, r) => {
        const s = STATUS_MAP[r.status];
        return s ? <Tag color={s.color}>{formatMessage({ id: s.labelId })}</Tag> : r.status;
      },
    },
    {
      title: formatMessage({ id: 'report.col.action' }),
      width: 120,
      fixed: 'right',
      hideInSearch: true,
      render: (_, r) => (
        <Space>
          {r.status === 'REVIEW' && access.report_reviewer && (
            <Popconfirm title={formatMessage({ id: 'approval.reviewConfirm' })} onConfirm={() => handleReview(r.id)}>
              <a>{formatMessage({ id: 'approval.review' })}</a>
            </Popconfirm>
          )}
          {r.status === 'APPROVED' && access.report_approver && (
            <Popconfirm title={formatMessage({ id: 'approval.approveConfirm' })} onConfirm={() => handleApprove(r.id)}>
              <a>{formatMessage({ id: 'approval.approve' })}</a>
            </Popconfirm>
          )}
          {r.status !== 'REVIEW' && r.status !== 'APPROVED' && (
            <span style={{ color: '#999' }}>-</span>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageShell
      dept="report"
      eyebrow={formatMessage({ id: 'dept.report' })}
      title={formatMessage({ id: 'shell.reporting.approval.title' })}
      desc={formatMessage({ id: 'shell.reporting.approval.desc' })}
    >
      <ProTable<Report>
        headerTitle={false}
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto', defaultCollapsed: false }}
        request={async (params) => {
          const res = await getReports({
            page: params.current,
            pageSize: params.pageSize,
            keyword: params.reportNo,
            status: params.status,
          });
          return { data: res.list, success: true, total: res.total };
        }}
        columns={columns}
        pagination={{ pageSize: 10 }}
      />
    </PageShell>
  );
}
