import { ProTable, ProFormSelect, DrawerForm } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Popconfirm, message, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
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

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待分配', color: 'default' },
  ASSIGNED: { label: '已分配', color: 'blue' },
  TESTING: { label: '检测中', color: 'processing' },
  REVIEW: { label: '待复核', color: 'gold' },
  COMPLETED: { label: '已完成', color: 'green' },
  JUDGED: { label: '已判定', color: 'green' },
  CANCELLED: { label: '已取消', color: 'red' },
};

const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(([value, v]) => ({
  label: v.label,
  value,
}));

// 状态推进按钮文字
const TASK_NEXT_LABEL: Record<string, string> = {
  PENDING: '分配',
  ASSIGNED: '开始检测',
  TESTING: '提交复核',
  REVIEW: '复核通过',
  COMPLETED: '判定',
};

export default function TestTasks() {
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<TestTask | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
        message.success('更新成功');
      } else {
        await createTestTask(values);
        message.success('创建成功');
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
      message.success('删除成功');
      actionRef.current?.reload();
    } catch {
      message.error('删除失败');
    }
  };

  const handleAdvance = async (id: string) => {
    try {
      await advanceTestTask(id);
      message.success('推进成功');
      actionRef.current?.reload();
    } catch {
      message.error('推进失败');
    }
  };

  const columns: ProColumns<TestTask>[] = [
    { title: '任务编号', dataIndex: 'taskNo', width: 130 },
    {
      title: '样品',
      dataIndex: 'sample',
      hideInSearch: true,
      render: (_, r) => (r.sample ? `${r.sample.sampleNo} ${r.sample.name}` : '-'),
    },
    {
      title: '检测项目',
      dataIndex: 'testItem',
      hideInSearch: true,
      render: (_, r) => r.testItem?.name ?? '-',
    },
    {
      title: '检测员',
      dataIndex: 'assignedTo',
      width: 100,
      hideInSearch: true,
      render: (_, r) => r.assignedTo?.name ?? '-',
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
      title: '分配时间',
      dataIndex: 'assignedAt',
      width: 150,
      hideInSearch: true,
      render: (_, r) => (r.assignedAt ? new Date(r.assignedAt).toLocaleString() : '-'),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 150,
      hideInSearch: true,
      render: (_, r) => new Date(r.createdAt).toLocaleString(),
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right',
      hideInSearch: true,
      render: (_, r) => (
        <Space>
          {TASK_NEXT_LABEL[r.status] && (
            <Popconfirm
              title={`确认${TASK_NEXT_LABEL[r.status]}？`}
              onConfirm={() => handleAdvance(r.id)}
            >
              <a>{TASK_NEXT_LABEL[r.status]}</a>
            </Popconfirm>
          )}
          <a onClick={() => handleEdit(r)}>编辑</a>
          <Popconfirm
            title="确认删除该任务？"
            onConfirm={() => handleDelete(r.id)}
          >
            <a style={{ color: '#ff4d4f' }}>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<TestTask>
        headerTitle="检测任务"
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
            新增任务
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
        title={editing ? '编辑检测任务' : '新增检测任务'}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFinish={handleSubmit}
        initialValues={editing ?? { status: 'PENDING' }}
        width={520}
      >
        <ProFormSelect
          name="sampleId"
          label="样品"
          rules={[{ required: true, message: '请选择样品' }]}
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
          label="检测项目"
          rules={[{ required: true, message: '请选择检测项目' }]}
          request={async () => {
            const res = await getTestItems();
            return res.map((t) => ({ label: `${t.name}(${t.code})`, value: t.id }));
          }}
        />
        <ProFormSelect
          name="assignedToId"
          label="检测员"
          allowClear
          request={async () => {
            const res = await getUsers();
            return res.map((u) => ({ label: u.name, value: u.id }));
          }}
        />
        <ProFormSelect name="status" label="状态" options={STATUS_OPTIONS} />
      </DrawerForm>
    </>
  );
}
