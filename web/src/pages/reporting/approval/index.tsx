import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Popconfirm, message, Tag, Space } from 'antd';
import { useRef } from 'react';
import { useAccess } from '@umijs/max';
import {
  getReports,
  reviewReport,
  approveReport,
  type Report,
} from '@/services/report';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '编制中', color: 'default' },
  REVIEW: { label: '待审核', color: 'gold' },
  APPROVED: { label: '待批准', color: 'blue' },
  ISSUED: { label: '已签发', color: 'green' },
  VOID: { label: '作废', color: 'red' },
  REVISED: { label: '已修订', color: 'cyan' },
};

const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(([value, v]) => ({
  label: v.label,
  value,
}));

export default function Approval() {
  const actionRef = useRef<ActionType>();
  const access = useAccess();

  const handleReview = async (id: string) => {
    try {
      await reviewReport(id);
      message.success('审核通过');
      actionRef.current?.reload();
    } catch {
      message.error('操作失败');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveReport(id);
      message.success('批准签发');
      actionRef.current?.reload();
    } catch {
      message.error('操作失败');
    }
  };

  const columns: ProColumns<Report>[] = [
    { title: '报告编号', dataIndex: 'reportNo', width: 130 },
    {
      title: '委托编号',
      dataIndex: 'appNo',
      hideInSearch: true,
      render: (_, r) => r.application?.applicationNo ?? '-',
    },
    { title: '版本', dataIndex: 'version', width: 60, hideInSearch: true },
    {
      title: '结论',
      dataIndex: 'conclusion',
      hideInSearch: true,
      render: (_, r) => r.conclusion ?? '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      fieldProps: { options: STATUS_OPTIONS },
      render: (_, r) => {
        const s = STATUS_MAP[r.status];
        return s ? <Tag color={s.color}>{s.label}</Tag> : r.status;
      },
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      hideInSearch: true,
      render: (_, r) => (
        <Space>
          {r.status === 'REVIEW' && access.report_reviewer && (
            <Popconfirm title="确认审核通过？" onConfirm={() => handleReview(r.id)}>
              <a>审核</a>
            </Popconfirm>
          )}
          {r.status === 'APPROVED' && access.report_approver && (
            <Popconfirm title="确认批准签发？此操作不可逆" onConfirm={() => handleApprove(r.id)}>
              <a>批准签发</a>
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
    <ProTable<Report>
      headerTitle="签发审批"
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
  );
}
