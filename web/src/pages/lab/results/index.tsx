import {
  ProTable,
  ProFormText,
  ProFormSelect,
  ProFormTextArea,
  ProForm,
  DrawerForm,
} from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Popconfirm, message, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import { useAccess } from '@umijs/max';
import {
  getTestResults,
  createTestResult,
  updateTestResult,
  deleteTestResult,
  type TestResult,
} from '@/services/testResult';
import { getTestTasks } from '@/services/testTask';

const CONCLUSION_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待判定', color: 'default' },
  PASS: { label: '合格', color: 'green' },
  FAIL: { label: '不合格', color: 'red' },
  NA: { label: '不适用', color: 'default' },
};

const CONCLUSION_OPTIONS = Object.entries(CONCLUSION_MAP).map(
  ([value, v]) => ({ label: v.label, value }),
);

export default function TestResults() {
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<TestResult | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const access = useAccess();

  const handleAdd = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const handleEdit = (record: TestResult) => {
    setEditing(record);
    setDrawerOpen(true);
  };

  const handleSubmit = async (values: any) => {
    let rawData;
    if (values.rawData) {
      try {
        rawData = JSON.parse(values.rawData);
      } catch {
        message.error('原始数据需为合法 JSON');
        return false;
      }
    }
    const payload = { ...values, rawData };
    try {
      if (editing) {
        await updateTestResult(editing.id, payload);
        message.success('更新成功');
      } else {
        await createTestResult(payload);
        message.success('录入成功');
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
      await deleteTestResult(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ProColumns<TestResult>[] = [
    {
      title: '任务编号',
      dataIndex: 'taskNo',
      width: 130,
      hideInSearch: true,
      render: (_, r) => r.task?.taskNo ?? '-',
    },
    {
      title: '检测项目',
      dataIndex: 'testItemName',
      hideInSearch: true,
      render: (_, r) => r.task?.testItem?.name ?? '-',
    },
    {
      title: '检测值',
      dataIndex: 'value',
      width: 110,
      hideInSearch: true,
      render: (_, r) => (r.value ? `${r.value}${r.unit ?? ''}` : '-'),
    },
    { title: '限值', dataIndex: 'limit', width: 130, hideInSearch: true },
    {
      title: '结论',
      dataIndex: 'conclusion',
      width: 100,
      valueType: 'select',
      fieldProps: { options: CONCLUSION_OPTIONS },
      render: (_, r) => {
        const c = CONCLUSION_MAP[r.conclusion];
        return c ? <Tag color={c.color}>{c.label}</Tag> : r.conclusion;
      },
    },
    {
      title: '录入时间',
      dataIndex: 'enteredAt',
      width: 150,
      hideInSearch: true,
      render: (_, r) => (r.enteredAt ? new Date(r.enteredAt).toLocaleString() : '-'),
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      hideInSearch: true,
      render: (_, r) => (
        <Space>
          {access.lab_tester && <a onClick={() => handleEdit(r)}>编辑</a>}
          {access.lab_supervisor && (
            <Popconfirm
              title="确认删除该结果？"
              onConfirm={() => handleDelete(r.id)}
            >
              <a style={{ color: '#ff4d4f' }}>删除</a>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const formInitialValues = editing
    ? {
        ...editing,
        rawData: editing.rawData
          ? JSON.stringify(editing.rawData, null, 2)
          : undefined,
      }
    : { conclusion: 'PENDING' };

  return (
    <>
      <ProTable<TestResult>
        headerTitle="检测结果"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        toolBarRender={() =>
          access.lab_tester
            ? [
                <Button
                  key="add"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                >
                  录入结果
                </Button>,
              ]
            : []
        }
        request={async (params) => {
          const res = await getTestResults({
            page: params.current,
            pageSize: params.pageSize,
            conclusion: params.conclusion,
          });
          return { data: res.list, success: true, total: res.total };
        }}
        columns={columns}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1000 }}
      />
      <DrawerForm
        key={editing?.id ?? 'new'}
        title={editing ? '编辑检测结果' : '录入检测结果'}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFinish={handleSubmit}
        initialValues={formInitialValues}
        width={560}
      >
        <ProFormSelect
          name="taskId"
          label="检测任务"
          rules={[{ required: true, message: '请选择检测任务' }]}
          request={async () => {
            const res = await getTestTasks({ page: 1, pageSize: 1000 });
            return res.list.map((t) => ({
              label: `${t.taskNo} ${t.testItem?.name ?? ''}`,
              value: t.id,
            }));
          }}
        />
        <ProForm.Group>
          <ProFormText name="value" label="检测值" width="sm" />
          <ProFormText name="unit" label="单位" width="sm" />
          <ProFormText name="limit" label="限值" width="sm" />
        </ProForm.Group>
        <ProFormSelect
          name="conclusion"
          label="结论"
          options={CONCLUSION_OPTIONS}
        />
        <ProFormTextArea
          name="rawData"
          label="原始数据(JSON)"
          placeholder='{"measurements":[1.2,1.3,1.25]}'
        />
        <ProFormTextArea name="remark" label="备注" />
      </DrawerForm>
    </>
  );
}
