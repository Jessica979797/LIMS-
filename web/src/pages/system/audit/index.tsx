import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Tag } from 'antd';
import { useRef } from 'react';
import { useIntl } from '@umijs/max';
import { getAuditLogs, type AuditLog } from '@/services/auditLog';
import PageShell from '@/components/PageShell';

const ACTION_COLOR: Record<string, string> = {
  CREATE: 'green',
  UPDATE: 'blue',
  DELETE: 'red',
  STATUS_CHANGE: 'gold',
};

export default function AuditLogs() {
  const { formatMessage } = useIntl();
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<AuditLog>[] = [
    {
      title: formatMessage({ id: 'audit.col.time' }),
      dataIndex: 'createdAt',
      width: 160,
      hideInSearch: true,
      render: (_, r) => new Date(r.createdAt).toLocaleString(),
    },
    {
      title: formatMessage({ id: 'audit.col.action' }),
      dataIndex: 'action',
      width: 130,
      render: (_, r) => (
        <Tag color={ACTION_COLOR[r.action] || 'default'}>{r.action}</Tag>
      ),
    },
    { title: formatMessage({ id: 'audit.col.entity' }), dataIndex: 'entity', width: 120 },
    {
      title: formatMessage({ id: 'audit.col.entityId' }),
      dataIndex: 'entityId',
      width: 200,
      hideInSearch: true,
      render: (_, r) => r.entityId ?? '-',
    },
    {
      title: formatMessage({ id: 'audit.col.userId' }),
      dataIndex: 'userId',
      width: 200,
      hideInSearch: true,
      render: (_, r) => r.userId ?? '-',
    },
    {
      title: formatMessage({ id: 'audit.col.after' }),
      dataIndex: 'after',
      hideInSearch: true,
      render: (_, r) =>
        r.after ? JSON.stringify(r.after).slice(0, 100) : '-',
    },
  ];

  return (
    <PageShell
      dept="system"
      eyebrow={formatMessage({ id: 'dept.system' })}
      title={formatMessage({ id: 'shell.system.audit.title' })}
      desc={formatMessage({ id: 'shell.system.audit.desc' })}
    >
      <ProTable<AuditLog>
        headerTitle={false}
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
    </PageShell>
  );
}
