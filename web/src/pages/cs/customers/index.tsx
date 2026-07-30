import {
  ProTable,
  ProFormText,
  ProFormSelect,
  DrawerForm,
} from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Popconfirm, message, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  type Customer,
} from '@/services/customer';

const TYPE_OPTIONS = [
  { label: '企业', value: 'ENTERPRISE' },
  { label: '个人', value: 'PERSONAL' },
  { label: '政府', value: 'GOVERNMENT' },
  { label: '其他', value: 'OTHER' },
];

const STATUS_OPTIONS = [
  { label: '启用', value: 'ACTIVE' },
  { label: '停用', value: 'INACTIVE' },
];

export default function Customers() {
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<Customer | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleAdd = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const handleEdit = (record: Customer) => {
    setEditing(record);
    setDrawerOpen(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editing) {
        await updateCustomer(editing.id, values);
        message.success('更新成功');
      } else {
        await createCustomer(values);
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
      await deleteCustomer(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ProColumns<Customer>[] = [
    { title: '客户编号', dataIndex: 'customerNo', width: 120, hideInSearch: true },
    {
      title: '客户名称',
      dataIndex: 'name',
      render: (dom, record) => record.name,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 90,
      valueType: 'select',
      fieldProps: { options: TYPE_OPTIONS },
      render: (_, record) =>
        TYPE_OPTIONS.find((o) => o.value === record.type)?.label ?? record.type,
    },
    { title: '行业', dataIndex: 'industry', width: 120, hideInSearch: true },
    { title: '联系电话', dataIndex: 'phone', width: 130, hideInSearch: true },
    { title: '信用代码', dataIndex: 'creditCode', width: 160, hideInSearch: true },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      valueType: 'select',
      fieldProps: { options: STATUS_OPTIONS },
      render: (_, record) => (
        <Tag color={record.status === 'ACTIVE' ? 'green' : 'default'}>
          {record.status === 'ACTIVE' ? '启用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 160,
      hideInSearch: true,
      render: (_, record) => new Date(record.createdAt).toLocaleString(),
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      hideInSearch: true,
      render: (_, record) => (
        <Space>
          <a onClick={() => handleEdit(record)}>编辑</a>
          <Popconfirm
            title="确认删除该客户？"
            onConfirm={() => handleDelete(record.id)}
          >
            <a style={{ color: '#ff4d4f' }}>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<Customer>
        headerTitle="客户管理"
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
            新增客户
          </Button>,
        ]}
        request={async (params) => {
          const res = await getCustomers({
            page: params.current,
            pageSize: params.pageSize,
            keyword: params.name,
            type: params.type,
            status: params.status,
          });
          return {
            data: res.list,
            success: true,
            total: res.total,
          };
        }}
        columns={columns}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1100 }}
      />
      <DrawerForm
        key={editing?.id ?? 'new'}
        title={editing ? '编辑客户' : '新增客户'}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFinish={handleSubmit}
        initialValues={editing ?? { status: 'ACTIVE' }}
        width={520}
      >
        <ProFormText
          name="name"
          label="客户名称"
          rules={[{ required: true, message: '请输入客户名称' }]}
        />
        <ProFormSelect
          name="type"
          label="客户类型"
          options={TYPE_OPTIONS}
          rules={[{ required: true, message: '请选择客户类型' }]}
        />
        <ProFormText name="industry" label="行业" />
        <ProFormText name="phone" label="联系电话" />
        <ProFormText name="email" label="邮箱" />
        <ProFormText name="creditCode" label="统一社会信用代码" />
        <ProFormText name="address" label="地址" />
        <ProFormSelect name="status" label="状态" options={STATUS_OPTIONS} />
      </DrawerForm>
    </>
  );
}
