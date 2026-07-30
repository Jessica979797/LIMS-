import { ProTable, ProFormText, DrawerForm } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Popconfirm, message, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import {
  getTestItems,
  createTestItem,
  updateTestItem,
  deleteTestItem,
  type TestItem,
} from '@/services/testItem';

export default function TestItems() {
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<TestItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      if (editing) {
        await updateTestItem(editing.id, values);
        message.success('更新成功');
      } else {
        await createTestItem(values);
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
      await deleteTestItem(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ProColumns<TestItem>[] = [
    { title: '项目编码', dataIndex: 'code', width: 120 },
    { title: '项目名称', dataIndex: 'name' },
    { title: '类别', dataIndex: 'category', width: 120, hideInSearch: true },
    { title: '单位', dataIndex: 'unit', width: 80, hideInSearch: true },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      hideInSearch: true,
      render: (_, r) => (
        <Space>
          <a onClick={() => { setEditing(r); setDrawerOpen(true); }}>编辑</a>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(r.id)}>
            <a style={{ color: '#ff4d4f' }}>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<TestItem>
        headerTitle="检测项目"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setDrawerOpen(true); }}>
            新增项目
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
        title={editing ? '编辑检测项目' : '新增检测项目'}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFinish={handleSubmit}
        initialValues={editing ?? {}}
        width={480}
      >
        <ProFormText name="code" label="项目编码" rules={[{ required: true, message: '请输入编码' }]} />
        <ProFormText name="name" label="项目名称" rules={[{ required: true, message: '请输入名称' }]} />
        <ProFormText name="category" label="类别" />
        <ProFormText name="unit" label="单位" />
      </DrawerForm>
    </>
  );
}
