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
import { useAccess, useIntl } from '@umijs/max';
import {
  getTestResults,
  createTestResult,
  updateTestResult,
  deleteTestResult,
  type TestResult,
} from '@/services/testResult';
import { getTestTasks } from '@/services/testTask';
import PageShell from '@/components/PageShell';

const CONCLUSION_MAP: Record<string, { labelId: string; color: string }> = {
  PENDING: { labelId: 'status.result.PENDING', color: 'default' },
  PASS: { labelId: 'status.result.PASS', color: 'green' },
  FAIL: { labelId: 'status.result.FAIL', color: 'red' },
  NA: { labelId: 'status.result.NA', color: 'default' },
};

export default function TestResults() {
  const { formatMessage } = useIntl();
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<TestResult | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const access = useAccess();

  const CONCLUSION_OPTIONS = Object.entries(CONCLUSION_MAP).map(
    ([value, v]) => ({ label: formatMessage({ id: v.labelId }), value }),
  );

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
        message.error(formatMessage({ id: 'common.illegalJson' }));
        return false;
      }
    }
    const payload = { ...values, rawData };
    try {
      if (editing) {
        await updateTestResult(editing.id, payload);
        message.success(formatMessage({ id: 'common.updateSuccess' }));
      } else {
        await createTestResult(payload);
        message.success(formatMessage({ id: 'result.enterSuccess' }));
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
      message.success(formatMessage({ id: 'common.deleteSuccess' }));
      actionRef.current?.reload();
    } catch {
      message.error(formatMessage({ id: 'common.deleteFail' }));
    }
  };

  const columns: ProColumns<TestResult>[] = [
    {
      title: formatMessage({ id: 'result.col.taskNo' }),
      dataIndex: 'taskNo',
      width: 130,
      hideInSearch: true,
      render: (_, r) => r.task?.taskNo ?? '-',
    },
    {
      title: formatMessage({ id: 'result.col.testItemName' }),
      dataIndex: 'testItemName',
      hideInSearch: true,
      render: (_, r) => r.task?.testItem?.name ?? '-',
    },
    {
      title: formatMessage({ id: 'result.col.value' }),
      dataIndex: 'value',
      width: 110,
      hideInSearch: true,
      render: (_, r) => (r.value ? `${r.value}${r.unit ?? ''}` : '-'),
    },
    { title: formatMessage({ id: 'result.col.limit' }), dataIndex: 'limit', width: 130, hideInSearch: true },
    {
      title: formatMessage({ id: 'result.col.conclusion' }),
      dataIndex: 'conclusion',
      width: 100,
      valueType: 'select',
      fieldProps: { options: CONCLUSION_OPTIONS },
      render: (_, r) => {
        const c = CONCLUSION_MAP[r.conclusion];
        return c ? <Tag color={c.color}>{formatMessage({ id: c.labelId })}</Tag> : r.conclusion;
      },
    },
    {
      title: formatMessage({ id: 'result.col.enteredAt' }),
      dataIndex: 'enteredAt',
      width: 150,
      hideInSearch: true,
      render: (_, r) => (r.enteredAt ? new Date(r.enteredAt).toLocaleString() : '-'),
    },
    {
      title: formatMessage({ id: 'result.col.action' }),
      width: 120,
      fixed: 'right',
      hideInSearch: true,
      render: (_, r) => (
        <Space>
          {access.lab_tester && <a onClick={() => handleEdit(r)}>{formatMessage({ id: 'common.edit' })}</a>}
          {access.lab_supervisor && (
            <Popconfirm
              title={formatMessage({ id: 'result.confirmDelete' })}
              onConfirm={() => handleDelete(r.id)}
            >
              <a style={{ color: '#ff4d4f' }}>{formatMessage({ id: 'common.delete' })}</a>
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
    <PageShell
      dept="lab"
      eyebrow={formatMessage({ id: 'dept.lab' })}
      title={formatMessage({ id: 'shell.lab.results.title' })}
      desc={formatMessage({ id: 'shell.lab.results.desc' })}
    >
      <ProTable<TestResult>
        headerTitle={false}
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
                  {formatMessage({ id: 'result.add' })}
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
        title={editing ? formatMessage({ id: 'result.editTitle' }) : formatMessage({ id: 'result.addTitle' })}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFinish={handleSubmit}
        initialValues={formInitialValues}
        width={560}
      >
        <ProFormSelect
          name="taskId"
          label={formatMessage({ id: 'result.form.task' })}
          rules={[{ required: true, message: formatMessage({ id: 'common.pleaseSelect' }, { field: formatMessage({ id: 'result.form.task' }) }) }]}
          request={async () => {
            const res = await getTestTasks({ page: 1, pageSize: 1000 });
            return res.list.map((t) => ({
              label: `${t.taskNo} ${t.testItem?.name ?? ''}`,
              value: t.id,
            }));
          }}
        />
        <ProForm.Group>
          <ProFormText name="value" label={formatMessage({ id: 'result.form.value' })} width="sm" />
          <ProFormText name="unit" label={formatMessage({ id: 'result.form.unit' })} width="sm" />
          <ProFormText name="limit" label={formatMessage({ id: 'result.form.limit' })} width="sm" />
        </ProForm.Group>
        <ProFormSelect
          name="conclusion"
          label={formatMessage({ id: 'result.form.conclusion' })}
          options={CONCLUSION_OPTIONS}
        />
        <ProFormTextArea
          name="rawData"
          label={formatMessage({ id: 'result.form.rawData' })}
          placeholder={formatMessage({ id: 'result.form.rawDataPh' })}
        />
        <ProFormTextArea name="remark" label={formatMessage({ id: 'result.form.remark' })} />
      </DrawerForm>
    </PageShell>
  );
}
