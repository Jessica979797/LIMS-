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
import { useIntl } from '@umijs/max';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  type Customer,
} from '@/services/customer';
import PageShell from '@/components/PageShell';

export default function Customers() {
  const { formatMessage } = useIntl();
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<Customer | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const TYPE_OPTIONS = [
    { label: formatMessage({ id: 'customer.type.ENTERPRISE' }), value: 'ENTERPRISE' },
    { label: formatMessage({ id: 'customer.type.PERSONAL' }), value: 'PERSONAL' },
    { label: formatMessage({ id: 'customer.type.GOVERNMENT' }), value: 'GOVERNMENT' },
    { label: formatMessage({ id: 'customer.type.OTHER' }), value: 'OTHER' },
  ];

  const STATUS_OPTIONS = [
    { label: formatMessage({ id: 'status.common.ACTIVE' }), value: 'ACTIVE' },
    { label: formatMessage({ id: 'status.common.INACTIVE' }), value: 'INACTIVE' },
  ];

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
        message.success(formatMessage({ id: 'common.updateSuccess' }));
      } else {
        await createCustomer(values);
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
      await deleteCustomer(id);
      message.success(formatMessage({ id: 'common.deleteSuccess' }));
      actionRef.current?.reload();
    } catch {
      message.error(formatMessage({ id: 'common.deleteFail' }));
    }
  };

  const columns: ProColumns<Customer>[] = [
    { title: formatMessage({ id: 'customer.col.customerNo' }), dataIndex: 'customerNo', width: 120, hideInSearch: true },
    {
      title: formatMessage({ id: 'customer.col.name' }),
      dataIndex: 'name',
      render: (dom, record) => record.name,
    },
    {
      title: formatMessage({ id: 'customer.col.type' }),
      dataIndex: 'type',
      width: 90,
      valueType: 'select',
      fieldProps: { options: TYPE_OPTIONS },
      render: (_, record) =>
        TYPE_OPTIONS.find((o) => o.value === record.type)?.label ?? record.type,
    },
    { title: formatMessage({ id: 'customer.col.industry' }), dataIndex: 'industry', width: 120, hideInSearch: true },
    { title: formatMessage({ id: 'customer.col.phone' }), dataIndex: 'phone', width: 130, hideInSearch: true },
    { title: formatMessage({ id: 'customer.col.creditCode' }), dataIndex: 'creditCode', width: 160, hideInSearch: true },
    {
      title: formatMessage({ id: 'customer.col.status' }),
      dataIndex: 'status',
      width: 80,
      valueType: 'select',
      fieldProps: { options: STATUS_OPTIONS },
      render: (_, record) => (
        <Tag color={record.status === 'ACTIVE' ? 'green' : 'default'}>
          {record.status === 'ACTIVE'
            ? formatMessage({ id: 'status.common.ACTIVE' })
            : formatMessage({ id: 'status.common.INACTIVE' })}
        </Tag>
      ),
    },
    {
      title: formatMessage({ id: 'customer.col.createdAt' }),
      dataIndex: 'createdAt',
      width: 160,
      hideInSearch: true,
      render: (_, record) => new Date(record.createdAt).toLocaleString(),
    },
    {
      title: formatMessage({ id: 'customer.col.action' }),
      width: 120,
      fixed: 'right',
      hideInSearch: true,
      render: (_, record) => (
        <Space>
          <a onClick={() => handleEdit(record)}>{formatMessage({ id: 'common.edit' })}</a>
          <Popconfirm
            title={formatMessage({ id: 'customer.confirmDelete' })}
            onConfirm={() => handleDelete(record.id)}
          >
            <a style={{ color: '#ff4d4f' }}>{formatMessage({ id: 'common.delete' })}</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageShell
      dept="cs"
      eyebrow={formatMessage({ id: 'dept.cs' })}
      title={formatMessage({ id: 'shell.cs.customers.title' })}
      desc={formatMessage({ id: 'shell.cs.customers.desc' })}
    >
      <ProTable<Customer>
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
            {formatMessage({ id: 'customer.add' })}
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
        title={editing ? formatMessage({ id: 'customer.editTitle' }) : formatMessage({ id: 'customer.addTitle' })}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFinish={handleSubmit}
        initialValues={editing ?? { status: 'ACTIVE' }}
        width={520}
      >
        <ProFormText
          name="name"
          label={formatMessage({ id: 'customer.form.name' })}
          rules={[{ required: true, message: formatMessage({ id: 'common.pleaseInput' }, { field: formatMessage({ id: 'customer.form.name' }) }) }]}
        />
        <ProFormSelect
          name="type"
          label={formatMessage({ id: 'customer.form.type' })}
          options={TYPE_OPTIONS}
          rules={[{ required: true, message: formatMessage({ id: 'common.pleaseSelect' }, { field: formatMessage({ id: 'customer.form.type' }) }) }]}
        />
        <ProFormText name="industry" label={formatMessage({ id: 'customer.form.industry' })} />
        <ProFormText name="phone" label={formatMessage({ id: 'customer.form.phone' })} />
        <ProFormText name="email" label={formatMessage({ id: 'customer.form.email' })} />
        <ProFormText name="creditCode" label={formatMessage({ id: 'customer.form.creditCode' })} />
        <ProFormText name="address" label={formatMessage({ id: 'customer.form.address' })} />
        <ProFormSelect name="status" label={formatMessage({ id: 'customer.form.status' })} options={STATUS_OPTIONS} />
      </DrawerForm>
    </PageShell>
  );
}
