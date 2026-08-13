import {
  ProTable,
  ProFormText,
  ProFormSelect,
  ProFormDigit,
  ProForm,
  DrawerForm,
} from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Popconfirm, message, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import { useIntl } from '@umijs/max';
import {
  getSamples,
  createSample,
  updateSample,
  deleteSample,
  type Sample,
} from '@/services/sample';
import { getApplications } from '@/services/application';
import PageShell from '@/components/PageShell';

const STATUS_MAP: Record<string, { labelId: string; color: string }> = {
  RECEIVED: { labelId: 'status.sample.RECEIVED', color: 'blue' },
  TESTING: { labelId: 'status.sample.TESTING', color: 'processing' },
  COMPLETED: { labelId: 'status.sample.COMPLETED', color: 'green' },
  RETAINED: { labelId: 'status.sample.RETAINED', color: 'gold' },
  RETURNED: { labelId: 'status.sample.RETURNED', color: 'default' },
  DISPOSED: { labelId: 'status.sample.DISPOSED', color: 'default' },
};

export default function Samples() {
  const { formatMessage } = useIntl();
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<Sample | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(([value, v]) => ({
    label: formatMessage({ id: v.labelId }),
    value,
  }));

  const handleAdd = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const handleEdit = (record: Sample) => {
    setEditing(record);
    setDrawerOpen(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editing) {
        await updateSample(editing.id, values);
        message.success(formatMessage({ id: 'common.updateSuccess' }));
      } else {
        await createSample(values);
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
      await deleteSample(id);
      message.success(formatMessage({ id: 'common.deleteSuccess' }));
      actionRef.current?.reload();
    } catch {
      message.error(formatMessage({ id: 'common.deleteFail' }));
    }
  };

  const columns: ProColumns<Sample>[] = [
    { title: formatMessage({ id: 'sample.col.sampleNo' }), dataIndex: 'sampleNo', width: 130, hideInSearch: true },
    {
      title: formatMessage({ id: 'sample.col.name' }),
      dataIndex: 'name',
      render: (_, r) => r.name,
    },
    {
      title: formatMessage({ id: 'sample.col.applicationNo' }),
      dataIndex: 'applicationNo',
      width: 130,
      hideInSearch: true,
      render: (_, r) => r.application?.applicationNo ?? '-',
    },
    { title: formatMessage({ id: 'sample.col.model' }), dataIndex: 'model', width: 100, hideInSearch: true },
    { title: formatMessage({ id: 'sample.col.batchNo' }), dataIndex: 'batchNo', width: 100, hideInSearch: true },
    {
      title: formatMessage({ id: 'sample.col.quantity' }),
      dataIndex: 'quantity',
      width: 80,
      hideInSearch: true,
      render: (_, r) => `${r.quantity}${r.unit ?? ''}`,
    },
    { title: formatMessage({ id: 'sample.col.manufacturer' }), dataIndex: 'manufacturer', width: 120, hideInSearch: true },
    {
      title: formatMessage({ id: 'sample.col.status' }),
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
      title: formatMessage({ id: 'sample.col.receivedAt' }),
      dataIndex: 'receivedAt',
      width: 150,
      hideInSearch: true,
      render: (_, r) => new Date(r.receivedAt).toLocaleString(),
    },
    {
      title: formatMessage({ id: 'sample.col.action' }),
      width: 120,
      fixed: 'right',
      hideInSearch: true,
      render: (_, r) => (
        <Space>
          <a onClick={() => handleEdit(r)}>{formatMessage({ id: 'common.edit' })}</a>
          <Popconfirm
            title={formatMessage({ id: 'sample.confirmDelete' })}
            onConfirm={() => handleDelete(r.id)}
          >
            <a style={{ color: '#ff4d4f' }}>{formatMessage({ id: 'common.delete' })}</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageShell
      dept="op"
      eyebrow={formatMessage({ id: 'dept.op' })}
      title={formatMessage({ id: 'shell.op.samples.title' })}
      desc={formatMessage({ id: 'shell.op.samples.desc' })}
    >
      <ProTable<Sample>
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
            {formatMessage({ id: 'sample.add' })}
          </Button>,
        ]}
        request={async (params) => {
          const res = await getSamples({
            page: params.current,
            pageSize: params.pageSize,
            keyword: params.name,
            status: params.status,
          });
          return { data: res.list, success: true, total: res.total };
        }}
        columns={columns}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />
      <DrawerForm
        key={editing?.id ?? 'new'}
        title={editing ? formatMessage({ id: 'sample.editTitle' }) : formatMessage({ id: 'sample.addTitle' })}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFinish={handleSubmit}
        initialValues={editing ?? { quantity: 1, status: 'RECEIVED' }}
        width={560}
      >
        <ProFormSelect
          name="applicationId"
          label={formatMessage({ id: 'sample.form.application' })}
          rules={[{ required: true, message: formatMessage({ id: 'common.pleaseSelect' }, { field: formatMessage({ id: 'sample.form.application' }) }) }]}
          request={async () => {
            const res = await getApplications({ page: 1, pageSize: 1000 });
            return res.list.map((a) => ({ label: a.applicationNo, value: a.id }));
          }}
        />
        <ProFormText
          name="name"
          label={formatMessage({ id: 'sample.form.name' })}
          rules={[{ required: true, message: formatMessage({ id: 'common.pleaseInput' }, { field: formatMessage({ id: 'sample.form.name' }) }) }]}
        />
        <ProForm.Group>
          <ProFormText name="type" label={formatMessage({ id: 'sample.form.type' })} width="sm" />
          <ProFormText name="model" label={formatMessage({ id: 'sample.form.model' })} width="sm" />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText name="batchNo" label={formatMessage({ id: 'sample.form.batchNo' })} width="sm" />
          <ProFormText name="manufacturer" label={formatMessage({ id: 'sample.form.manufacturer' })} width="sm" />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormDigit name="quantity" label={formatMessage({ id: 'sample.form.quantity' })} width="sm" min={1} />
          <ProFormText name="unit" label={formatMessage({ id: 'sample.form.unit' })} width="sm" placeholder={formatMessage({ id: 'sample.form.unitPh' })} />
          <ProFormText name="storageLocation" label={formatMessage({ id: 'sample.form.storageLocation' })} width="sm" />
        </ProForm.Group>
        <ProFormSelect name="status" label={formatMessage({ id: 'sample.form.status' })} options={STATUS_OPTIONS} />
      </DrawerForm>
    </PageShell>
  );
}
