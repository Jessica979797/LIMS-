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
import { useIntl } from '@umijs/max';
import dayjs from 'dayjs';
import {
  getQuotations,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  type Quotation,
} from '@/services/quotation';
import { getCustomers } from '@/services/customer';
import PageShell from '@/components/PageShell';

const STATUS_MAP: Record<string, { labelId: string; color: string }> = {
  DRAFT: { labelId: 'status.quotation.DRAFT', color: 'default' },
  SENT: { labelId: 'status.quotation.SENT', color: 'blue' },
  ACCEPTED: { labelId: 'status.quotation.ACCEPTED', color: 'green' },
  REJECTED: { labelId: 'status.quotation.REJECTED', color: 'red' },
};

export default function Quotations() {
  const { formatMessage } = useIntl();
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<Quotation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(([value, v]) => ({
    label: formatMessage({ id: v.labelId }),
    value,
  }));

  const handleSubmit = async (values: any) => {
    let items;
    if (values.items) {
      try {
        items = JSON.parse(values.items);
      } catch {
        message.error(formatMessage({ id: 'common.illegalJson' }));
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
        message.success(formatMessage({ id: 'common.updateSuccess' }));
      } else {
        await createQuotation(payload);
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
      await deleteQuotation(id);
      message.success(formatMessage({ id: 'common.deleteSuccess' }));
      actionRef.current?.reload();
    } catch {
      message.error(formatMessage({ id: 'common.deleteFail' }));
    }
  };

  const columns: ProColumns<Quotation>[] = [
    { title: formatMessage({ id: 'quotation.col.quotationNo' }), dataIndex: 'quotationNo', width: 130 },
    {
      title: formatMessage({ id: 'quotation.col.customerName' }),
      dataIndex: 'customerName',
      hideInSearch: true,
      render: (_, r) => r.customer?.name ?? '-',
    },
    {
      title: formatMessage({ id: 'quotation.col.totalAmount' }),
      dataIndex: 'totalAmount',
      width: 120,
      hideInSearch: true,
      render: (_, r) => `${r.totalAmount} ${r.currency ?? ''}`,
    },
    {
      title: formatMessage({ id: 'quotation.col.status' }),
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      fieldProps: { options: STATUS_OPTIONS },
      render: (_, r) => {
        const s = STATUS_MAP[r.status];
        return s ? <Tag color={s.color}>{formatMessage({ id: s.labelId })}</Tag> : r.status;
      },
    },
    {
      title: formatMessage({ id: 'quotation.col.validUntil' }),
      dataIndex: 'validUntil',
      width: 120,
      hideInSearch: true,
      render: (_, r) => (r.validUntil ? new Date(r.validUntil).toLocaleDateString() : '-'),
    },
    {
      title: formatMessage({ id: 'quotation.col.action' }),
      width: 120,
      fixed: 'right',
      hideInSearch: true,
      render: (_, r) => (
        <Space>
          <a onClick={() => { setEditing(r); setDrawerOpen(true); }}>{formatMessage({ id: 'common.edit' })}</a>
          <Popconfirm title={formatMessage({ id: 'quotation.confirmDelete' })} onConfirm={() => handleDelete(r.id)}>
            <a style={{ color: '#ff4d4f' }}>{formatMessage({ id: 'common.delete' })}</a>
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
    <PageShell
      dept="cs"
      eyebrow={formatMessage({ id: 'dept.cs' })}
      title={formatMessage({ id: 'shell.cs.quotations.title' })}
      desc={formatMessage({ id: 'shell.cs.quotations.desc' })}
    >
      <ProTable<Quotation>
        headerTitle={false}
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setDrawerOpen(true); }}>
            {formatMessage({ id: 'quotation.add' })}
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
        title={editing ? formatMessage({ id: 'quotation.editTitle' }) : formatMessage({ id: 'quotation.addTitle' })}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFinish={handleSubmit}
        initialValues={formInit}
        width={560}
      >
        <ProFormSelect
          name="customerId"
          label={formatMessage({ id: 'quotation.form.customer' })}
          rules={[{ required: true, message: formatMessage({ id: 'common.pleaseSelect' }, { field: formatMessage({ id: 'quotation.form.customer' }) }) }]}
          request={async () => {
            const res = await getCustomers({ page: 1, pageSize: 1000 });
            return res.list.map((c) => ({ label: c.name, value: c.id }));
          }}
        />
        <ProForm.Group>
          <ProFormDigit name="totalAmount" label={formatMessage({ id: 'quotation.form.totalAmount' })} width="sm" />
          <ProFormText name="currency" label={formatMessage({ id: 'quotation.form.currency' })} width="sm" />
          <ProFormDatePicker name="validUntil" label={formatMessage({ id: 'quotation.form.validUntil' })} width="sm" />
        </ProForm.Group>
        <ProFormSelect name="status" label={formatMessage({ id: 'quotation.form.status' })} options={STATUS_OPTIONS} />
        <ProFormTextArea name="items" label={formatMessage({ id: 'quotation.form.items' })} placeholder={formatMessage({ id: 'quotation.form.itemsPh' })} />
      </DrawerForm>
    </PageShell>
  );
}
