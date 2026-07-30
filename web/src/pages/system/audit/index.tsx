import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Tag } from 'antd';
import { useRef } from 'react';
import { getAuditLogs, type AuditLog } from '@/services/auditLog';

const ACTION_COLOR: Record<string, string> = {
  CREATE: 'green',
  UPDATE: 'blue',
  DELETE: 'red',
  STATUS_CHANGE: 'gold',
};

export default function AuditLogs() {
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<AuditLog>[] = [
    {
      title: '时间',
      dataIndex: 'createdAt',
      width: 160,
      hideInSearch: true,
      render: (_, r) => new Date(r.createdAt).toLocaleString(),
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 130,
      render: (_, r) => (
        <Tag color={ACTION_COLOR[r.action] || 'default'}>{r.action}</Tag>
      ),
    },
    { title: '实体', dataIndex: 'entity', width: 120 },
    {
      title: '实体ID',
      dataIndex: 'entityId',
      width: 200,
      hideInSearch: true,
      render: (_, r) => r.entityId ?? '-',
    },
    {
      title: '操作人',
      dataIndex: 'userId',
      width: 200,
      hideInSearch: true,
      render: (_, r) => r.userId ?? '-',
    },
    {
      title: '详情',
      dataIndex: 'after',
      hideInSearch: true,
      render: (_, r) =>
        r.after ? JSON.stringify(r.after).slice(0, 100) : '-',
    },
  ];

  return (
    <ProTable<AuditLog>
      headerTitle="审计日志"
      actionRef={actionRef}
      rowKey="id"
      search={{ labelWidth: 'auto' }}
      request={async (params) => {
        const res = await getAuditLogs({
          page: params.current,
          pageSize: params.pageSize,
          entity: params.entity,
          keyword: params.action,
        });
        return { data: res.list, success: true, total: res.total };
      }}
      columns={columns}
      pagination={{ pageSize: 20 }}
      scroll={{ x: 1000 }}
    />
  );
}
