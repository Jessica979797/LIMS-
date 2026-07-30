import {
  ProTable,
  ProFormText,
  ProFormDigit,
  ProFormSelect,
  ProFormDatePicker,
  ProFormTextArea,
  ProForm,
  DrawerForm,
} from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Popconfirm, message, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import dayjs from 'dayjs';
import {
  getQuotations,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  type Quotation,
} from '@/services/quotation';
import { getCustomers } from '@/services/customer';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '草稿', color: 'default' },
  SENT: { label: '已发送', color: 'blue' },
  ACCEPTED: { label: '已接受', color: 'green' },
  REJECTED: { label: '已拒绝', color: 'red' },
};

const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(([value, v]) => ({
  label: v.label,
  value,
}));

export default function Quotations() {
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<Quotation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSubmit = async (values: any) => {
    let items;
    if (values.items) {
      try {
        items = JSON.parse(values.items);
      } catch {
        message.error('明细需为合法 JSON');
        return false;
      }
    }
    const payload = {
      ...values,
      items,
      validUntil: values.validUntil
        ? dayjs(values.validUntil).toISOString()
        : null,
    };
    try {
      if (editing) {
        await updateQuotation(editing.id, payload);
        message.success('更新成功');
      } else {
        await createQuotation(payload);
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
      await deleteQuotation(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ProColumns<Quotation>[] = [
    { title: '报价编号', dataIndex: 'quotationNo', width: 130 },
    {
      title: '客户',
      dataIndex: 'customerName',
      hideInSearch: true,
      render: (_, r) => r.customer?.name ?? '-',
    },
    {
      title: '金额',
      dataIndex: 'totalAmount',
      width: 120,
      hideInSearch: true,
      render: (_, r) => `${r.totalAmount} ${r.currency ?? ''}`,
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
      title: '有效期',
      dataIndex: 'validUntil',
      width: 120,
      hideInSearch: true,
      render: (_, r) => (r.validUntil ? new Date(r.validUntil).toLocaleDateString() : '-'),
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

  const formInit = editing
    ? {
        ...editing,
        validUntil: editing.validUntil ? dayjs(editing.validUntil) : undefined,
        items: editing.items ? JSON.stringify(editing.items, null, 2) : undefined,
      }
    : { currency: 'CNY', status: 'DRAFT' };

  return (
    <>
      <ProTable<Quotation>
        headerTitle="报价管理"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setDrawerOpen(true); }}>
            新增报价
          </Button>,
        ]}
        request={async (params) => {
          const res = await getQuotations({
            page: params.current,
            pageSize: params.pageSize,
            keyword: params.quotationNo,
            status: params.status,
          });
          return { data: res.list, success: true, total: res.total };
        }}
        columns={columns}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1000 }}
      />
      <DrawerForm
        key={editing?.id ?? 'new'}
        title={editing ? '编辑报价' : '新增报价'}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFinish={handleSubmit}
        initialValues={formInit}
        width={560}
      >
        <ProFormSelect
          name="customerId"
          label="客户"
          rules={[{ required: true, message: '请选择客户' }]}
          request={async () => {
            const res = await getCustomers({ page: 1, pageSize: 1000 });
            return res.list.map((c) => ({ label: c.name, value: c.id }));
          }}
        />
        <ProForm.Group>
          <ProFormDigit name="totalAmount" label="金额" width="sm" />
          <ProFormText name="currency" label="币种" width="sm" />
          <ProFormDatePicker name="validUntil" label="有效期" width="sm" />
        </ProForm.Group>
        <ProFormSelect name="status" label="状态" options={STATUS_OPTIONS} />
        <ProFormTextArea name="items" label="报价明细(JSON)" placeholder='[{"name":"...","price":100,"qty":1}]' />
      </DrawerForm>
    </>
  );
}
