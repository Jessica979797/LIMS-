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
import {
  getTestMethods,
  createTestMethod,
  updateTestMethod,
  deleteTestMethod,
  type TestMethod,
} from '@/services/testMethod';
import { getTestItems } from '@/services/testItem';

export default function TestMethods() {
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<TestMethod | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      if (editing) {
        await updateTestMethod(editing.id, values);
        message.success('更新成功');
      } else {
        await createTestMethod(values);
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
      await deleteTestMethod(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ProColumns<TestMethod>[] = [
    { title: '方法编码', dataIndex: 'code', width: 140 },
    { title: '方法名称', dataIndex: 'name' },
    { title: '标准号', dataIndex: 'standard', width: 140, hideInSearch: true },
    {
      title: '检测项目',
      dataIndex: 'testItemName',
      hideInSearch: true,
      render: (_, r) => r.testItem?.name ?? '-',
    },
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
      <ProTable<TestMethod>
        headerTitle="检测方法"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setDrawerOpen(true); }}>
            新增方法
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
        title={editing ? '编辑检测方法' : '新增检测方法'}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFinish={handleSubmit}
        initialValues={editing ?? {}}
        width={520}
      >
        <ProFormText name="code" label="方法编码" rules={[{ required: true, message: '请输入编码' }]} placeholder="如 GB/T 5009.12" />
        <ProFormText name="name" label="方法名称" rules={[{ required: true, message: '请输入名称' }]} />
        <ProFormText name="standard" label="标准号" />
        <ProFormSelect
          name="testItemId"
          label="检测项目"
          rules={[{ required: true, message: '请选择检测项目' }]}
          request={async () => {
            const res = await getTestItems();
            return res.map((t) => ({ label: `${t.name}(${t.code})`, value: t.id }));
          }}
        />
        <ProFormTextArea name="scope" label="适用范围" />
      </DrawerForm>
    </>
  );
}
