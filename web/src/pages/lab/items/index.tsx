import { ProTable, ProFormText, DrawerForm } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Popconfirm, message, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import { useIntl } from '@umijs/max';
import {
  getTestItems,
  createTestItem,
  updateTestItem,
  deleteTestItem,
  type TestItem,
} from '@/services/testItem';
import PageShell from '@/components/PageShell';

export default function TestItems() {
  const { formatMessage } = useIntl();
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<TestItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      if (editing) {
        await updateTestItem(editing.id, values);
        message.success(formatMessage({ id: 'common.updateSuccess' }));
      } else {
        await createTestItem(values);
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
      await deleteTestItem(id);
      message.success(formatMessage({ id: 'common.deleteSuccess' }));
      actionRef.current?.reload();
    } catch {
      message.error(formatMessage({ id: 'common.deleteFail' }));
    }
  };

  const columns: ProColumns<TestItem>[] = [
    { title: formatMessage({ id: 'item.col.code' }), dataIndex: 'code', width: 120 },
    { title: formatMessage({ id: 'item.col.name' }), dataIndex: 'name' },
    { title: formatMessage({ id: 'item.col.category' }), dataIndex: 'category', width: 120, hideInSearch: true },
    { title: formatMessage({ id: 'item.col.unit' }), dataIndex: 'unit', width: 80, hideInSearch: true },
    {
      title: formatMessage({ id: 'item.col.action' }),
      width: 120,
      fixed: 'right',
      hideInSearch: true,
      render: (_, r) => (
        <Space>
          <a onClick={() => { setEditing(r); setDrawerOpen(true); }}>{formatMessage({ id: 'common.edit' })}</a>
          <Popconfirm title={formatMessage({ id: 'item.confirmDelete' })} onConfirm={() => handleDelete(r.id)}>
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
      title={formatMessage({ id: 'shell.lab.items.title' })}
      desc={formatMessage({ id: 'shell.lab.items.desc' })}
    >
      <ProTable<TestItem>
        headerTitle={false}
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setDrawerOpen(true); }}>
            {formatMessage({ id: 'item.add' })}
          </Button>,
        ]}
        request={async (params) => {
          const res = await getTestItems();
          let data = res;
          if (params.code) data = data.filter((i) => i.code.includes(params.code));
          if (params.name) data = data.filter((i) => i.name.includes(params.name));
          return { data, success: true, total: data.length };
        }}
        columns={columns}
      />
      <DrawerForm
        key={editing?.id ?? 'new'}
        title={editing ? formatMessage({ id: 'item.editTitle' }) : formatMessage({ id: 'item.addTitle' })}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFinish={handleSubmit}
        initialValues={editing ?? {}}
        width={480}
      >
        <ProFormText name="code" label={formatMessage({ id: 'item.form.code' })} rules={[{ required: true, message: formatMessage({ id: 'common.pleaseInput' }, { field: formatMessage({ id: 'item.form.code' }) }) }]} />
        <ProFormText name="name" label={formatMessage({ id: 'item.form.name' })} rules={[{ required: true, message: formatMessage({ id: 'common.pleaseInput' }, { field: formatMessage({ id: 'item.form.name' }) }) }]} />
        <ProFormText name="category" label={formatMessage({ id: 'item.form.category' })} />
        <ProFormText name="unit" label={formatMessage({ id: 'item.form.unit' })} />
      </DrawerForm>
    </PageShell>
  );
}
