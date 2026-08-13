import { ProTable, ProFormSelect, DrawerForm } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Popconfirm, message, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import { useIntl } from '@umijs/max';
import {
  getTestTasks,
  createTestTask,
  updateTestTask,
  deleteTestTask,
  advanceTestTask,
  type TestTask,
} from '@/services/testTask';
import { getSamples } from '@/services/sample';
import { getTestItems } from '@/services/testItem';
import { getUsers } from '@/services/user';
import PageShell from '@/components/PageShell';

const STATUS_MAP: Record<string, { labelId: string; color: string }> = {
  PENDING: { labelId: 'status.task.PENDING', color: 'default' },
  ASSIGNED: { labelId: 'status.task.ASSIGNED', color: 'blue' },
  TESTING: { labelId: 'status.task.TESTING', color: 'processing' },
  REVIEW: { labelId: 'status.task.REVIEW', color: 'gold' },
  COMPLETED: { labelId: 'status.task.COMPLETED', color: 'green' },
  JUDGED: { labelId: 'status.task.JUDGED', color: 'green' },
  CANCELLED: { labelId: 'status.task.CANCELLED', color: 'red' },
};

// 状态推进按钮文字
const TASK_NEXT_LABEL: Record<string, string> = {
  PENDING: 'advance.PENDING',
  ASSIGNED: 'advance.ASSIGNED',
  TESTING: 'advance.taskTESTING',
  REVIEW: 'advance.REVIEW',
  COMPLETED: 'advance.COMPLETED',
};

export default function TestTasks() {
  const { formatMessage } = useIntl();
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<TestTask | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(([value, v]) => ({
    label: formatMessage({ id: v.labelId }),
    value,
  }));

  const handleAdd = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const handleEdit = (record: TestTask) => {
    setEditing(record);
    setDrawerOpen(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editing) {
        await updateTestTask(editing.id, values);
        message.success(formatMessage({ id: 'common.updateSuccess' }));
      } else {
        await createTestTask(values);
        message.success(formatMessage({ id: 'common.createSuccess' }));
      }
      setDrawerOpen(false);
      actionRef.current?.reload();
      return true;
    } catch {
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTestTask(id);
      message.success(formatMessage({ id: 'common.deleteSuccess' }));
      actionRef.current?.reload();
    } catch {
      message.error(formatMessage({ id: 'common.deleteFail' }));
    }
  };

  const handleAdvance = async (id: string) => {
    try {
      await advanceTestTask(id);
      message.success(formatMessage({ id: 'common.advanceSuccess' }));
      actionRef.current?.reload();
    } catch {
      message.error(formatMessage({ id: 'common.advanceFail' }));
    }
  };

  const columns: ProColumns<TestTask>[] = [
    { title: formatMessage({ id: 'task.col.taskNo' }), dataIndex: 'taskNo', width: 130 },
    {
      title: formatMessage({ id: 'task.col.sample' }),
      dataIndex: 'sample',
      hideInSearch: true,
      render: (_, r) => (r.sample ? `${r.sample.sampleNo} ${r.sample.name}` : '-'),
    },
    {
      title: formatMessage({ id: 'task.col.testItem' }),
      dataIndex: 'testItem',
      hideInSearch: true,
      render: (_, r) => r.testItem?.name ?? '-',
    },
    {
      title: formatMessage({ id: 'task.col.assignedTo' }),
      dataIndex: 'assignedTo',
      width: 100,
      hideInSearch: true,
      render: (_, r) => r.assignedTo?.name ?? '-',
    },
    {
      title: formatMessage({ id: 'task.col.status' }),
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
      title: formatMessage({ id: 'task.col.assignedAt' }),
      dataIndex: 'assignedAt',
      width: 150,
      hideInSearch: true,
      render: (_, r) => (r.assignedAt ? new Date(r.assignedAt).toLocaleString() : '-'),
    },
    {
      title: formatMessage({ id: 'task.col.createdAt' }),
      dataIndex: 'createdAt',
      width: 150,
      hideInSearch: true,
      render: (_, r) => new Date(r.createdAt).toLocaleString(),
    },
    {
      title: formatMessage({ id: 'task.col.action' }),
      width: 200,
      fixed: 'right',
      hideInSearch: true,
      render: (_, r) => (
        <Space>
          {TASK_NEXT_LABEL[r.status] && (
            <Popconfirm
              title={formatMessage({ id: 'advance.confirm' }, { action: formatMessage({ id: TASK_NEXT_LABEL[r.status] }) })}
              onConfirm={() => handleAdvance(r.id)}
            >
              <a>{formatMessage({ id: TASK_NEXT_LABEL[r.status] })}</a>
            </Popconfirm>
          )}
          <a onClick={() => handleEdit(r)}>{formatMessage({ id: 'common.edit' })}</a>
          <Popconfirm
            title={formatMessage({ id: 'task.confirmDelete' })}
            onConfirm={() => handleDelete(r.id)}
          >
            <a style={{ color: '#ff4d4f' }}>{formatMessage({ id: 'common.delete' })}</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageShell
      dept="lab"
      eyebrow={formatMessage({ id: 'dept.lab' })}
      title={formatMessage({ id: 'shell.lab.tasks.title' })}
      desc={formatMessage({ id: 'shell.lab.tasks.desc' })}
    >
      <ProTable<TestTask>
        headerTitle={false}
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            {formatMessage({ id: 'task.add' })}
          </Button>,
        ]}
        request={async (params) => {
          const res = await getTestTasks({
            page: params.current,
            pageSize: params.pageSize,
            keyword: params.taskNo,
            status: params.status,
          });
          return { data: res.list, success: true, total: res.total };
        }}
        columns={columns}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1100 }}
      />
      <DrawerForm
        key={editing?.id ?? 'new'}
        title={editing ? formatMessage({ id: 'task.editTitle' }) : formatMessage({ id: 'task.addTitle' })}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFinish={handleSubmit}
        initialValues={editing ?? { status: 'PENDING' }}
        width={520}
      >
        <ProFormSelect
          name="sampleId"
          label={formatMessage({ id: 'task.form.sample' })}
          rules={[{ required: true, message: formatMessage({ id: 'common.pleaseSelect' }, { field: formatMessage({ id: 'task.form.sample' }) }) }]}
          request={async () => {
            const res = await getSamples({ page: 1, pageSize: 1000 });
            return res.list.map((s) => ({
              label: `${s.sampleNo} ${s.name}`,
              value: s.id,
            }));
          }}
        />
        <ProFormSelect
          name="testItemId"
          label={formatMessage({ id: 'task.form.testItem' })}
          rules={[{ required: true, message: formatMessage({ id: 'common.pleaseSelect' }, { field: formatMessage({ id: 'task.form.testItem' }) }) }]}
          request={async () => {
            const res = await getTestItems();
            return res.map((t) => ({ label: `${t.name}(${t.code})`, value: t.id }));
          }}
        />
        <ProFormSelect
          name="assignedToId"
          label={formatMessage({ id: 'task.form.assignedTo' })}
          allowClear
          request={async () => {
            const res = await getUsers();
            return res.map((u) => ({ label: u.name, value: u.id }));
          }}
        />
        <ProFormSelect name="status" label={formatMessage({ id: 'task.form.status' })} options={STATUS_OPTIONS} />
      </DrawerForm>
    </PageShell>
  );
}
