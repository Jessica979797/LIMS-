import {
  ProTable,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
  DrawerForm,
} from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Popconfirm, message, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import { useIntl } from '@umijs/max';
import {
  getTestMethods,
  createTestMethod,
  updateTestMethod,
  deleteTestMethod,
  type TestMethod,
} from '@/services/testMethod';
import { getTestItems } from '@/services/testItem';
import PageShell from '@/components/PageShell';

export default function TestMethods() {
  const { formatMessage } = useIntl();
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<TestMethod | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      if (editing) {
        await updateTestMethod(editing.id, values);
        message.success(formatMessage({ id: 'common.updateSuccess' }));
      } else {
        await createTestMethod(values);
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
      await deleteTestMethod(id);
      message.success(formatMessage({ id: 'common.deleteSuccess' }));
      actionRef.current?.reload();
    } catch {
      message.error(formatMessage({ id: 'common.deleteFail' }));
    }
  };

  const columns: ProColumns<TestMethod>[] = [
    { title: formatMessage({ id: 'method.col.code' }), dataIndex: 'code', width: 140 },
    { title: formatMessage({ id: 'method.col.name' }), dataIndex: 'name' },
    { title: formatMessage({ id: 'method.col.standard' }), dataIndex: 'standard', width: 140, hideInSearch: true },
    {
      title: formatMessage({ id: 'method.col.testItemName' }),
      dataIndex: 'testItemName',
      hideInSearch: true,
      render: (_, r) => r.testItem?.name ?? '-',
    },
    {
      title: formatMessage({ id: 'method.col.action' }),
      width: 120,
      fixed: 'right',
      hideInSearch: true,
      render: (_, r) => (
        <Space>
          <a onClick={() => { setEditing(r); setDrawerOpen(true); }}>{formatMessage({ id: 'common.edit' })}</a>
          <Popconfirm title={formatMessage({ id: 'method.confirmDelete' })} onConfirm={() => handleDelete(r.id)}>
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
      title={formatMessage({ id: 'shell.lab.methods.title' })}
      desc={formatMessage({ id: 'shell.lab.methods.desc' })}
    >
      <ProTable<TestMethod>
        headerTitle={false}
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setDrawerOpen(true); }}>
            {formatMessage({ id: 'method.add' })}
          </Button>,
        ]}
        request={async (params) => {
          const res = await getTestMethods({
            page: params.current,
            pageSize: params.pageSize,
            keyword: params.code,
          });
          return { data: res.list, success: true, total: res.total };
        }}
        columns={columns}
        pagination={{ pageSize: 10 }}
      />
      <DrawerForm
        key={editing?.id ?? 'new'}
        title={editing ? formatMessage({ id: 'method.editTitle' }) : formatMessage({ id: 'method.addTitle' })}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFinish={handleSubmit}
        initialValues={editing ?? {}}
        width={520}
      >
        <ProFormText name="code" label={formatMessage({ id: 'method.form.code' })} rules={[{ required: true, message: formatMessage({ id: 'common.pleaseInput' }, { field: formatMessage({ id: 'method.form.code' }) }) }]} placeholder={formatMessage({ id: 'method.form.codePh' })} />
        <ProFormText name="name" label={formatMessage({ id: 'method.form.name' })} rules={[{ required: true, message: formatMessage({ id: 'common.pleaseInput' }, { field: formatMessage({ id: 'method.form.name' }) }) }]} />
        <ProFormText name="standard" label={formatMessage({ id: 'method.form.standard' })} />
        <ProFormSelect
          name="testItemId"
          label={formatMessage({ id: 'method.form.testItem' })}
          rules={[{ required: true, message: formatMessage({ id: 'common.pleaseSelect' }, { field: formatMessage({ id: 'method.form.testItem' }) }) }]}
          request={async () => {
            const res = await getTestItems();
            return res.map((t) => ({ label: `${t.name}(${t.code})`, value: t.id }));
          }}
        />
        <ProFormTextArea name="scope" label={formatMessage({ id: 'method.form.scope' })} />
      </DrawerForm>
    </PageShell>
  );
}
