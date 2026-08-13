import {
  ProTable,
  ProFormText,
  ProFormSelect,
  ProFormDatePicker,
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
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  type Equipment,
} from '@/services/equipment';
import PageShell from '@/components/PageShell';

const STATUS_MAP: Record<string, { labelId: string; color: string }> = {
  NORMAL: { labelId: 'status.equipment.NORMAL', color: 'green' },
  MAINTENANCE: { labelId: 'status.equipment.MAINTENANCE', color: 'gold' },
  CALIBRATING: { labelId: 'status.equipment.CALIBRATING', color: 'blue' },
  OUTOFSERVICE: { labelId: 'status.equipment.OUTOFSERVICE', color: 'red' },
};

export default function EquipmentPage() {
  const { formatMessage } = useIntl();
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(([value, v]) => ({
    label: formatMessage({ id: v.labelId }),
    value,
  }));

  const handleSubmit = async (values: any) => {
    const payload = {
      ...values,
      calibrateDate: values.calibrateDate ? dayjs(values.calibrateDate).toISOString() : null,
      calibrateDue: values.calibrateDue ? dayjs(values.calibrateDue).toISOString() : null,
    };
    try {
      if (editing) {
        await updateEquipment(editing.id, payload);
        message.success(formatMessage({ id: 'common.updateSuccess' }));
      } else {
        await createEquipment(payload);
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
      await deleteEquipment(id);
      message.success(formatMessage({ id: 'common.deleteSuccess' }));
      actionRef.current?.reload();
    } catch {
      message.error(formatMessage({ id: 'common.deleteFail' }));
    }
  };

  const columns: ProColumns<Equipment>[] = [
    { title: formatMessage({ id: 'equipment.col.code' }), dataIndex: 'code', width: 130 },
    { title: formatMessage({ id: 'equipment.col.name' }), dataIndex: 'name' },
    { title: formatMessage({ id: 'equipment.col.model' }), dataIndex: 'model', width: 100, hideInSearch: true },
    { title: formatMessage({ id: 'equipment.col.serialNo' }), dataIndex: 'serialNo', width: 120, hideInSearch: true },
    { title: formatMessage({ id: 'equipment.col.manufacturer' }), dataIndex: 'manufacturer', width: 120, hideInSearch: true },
    {
      title: formatMessage({ id: 'equipment.col.status' }),
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
      title: formatMessage({ id: 'equipment.col.calibrateDue' }),
      dataIndex: 'calibrateDue',
      width: 120,
      hideInSearch: true,
      render: (_, r) => (r.calibrateDue ? new Date(r.calibrateDue).toLocaleDateString() : '-'),
    },
    {
      title: formatMessage({ id: 'equipment.col.action' }),
      width: 120,
      fixed: 'right',
      hideInSearch: true,
      render: (_, r) => (
        <Space>
          <a onClick={() => { setEditing(r); setDrawerOpen(true); }}>{formatMessage({ id: 'common.edit' })}</a>
          <Popconfirm title={formatMessage({ id: 'equipment.confirmDelete' })} onConfirm={() => handleDelete(r.id)}>
            <a style={{ color: '#ff4d4f' }}>{formatMessage({ id: 'common.delete' })}</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const formInitialValues = editing
    ? {
        ...editing,
        calibrateDate: editing.calibrateDate ? dayjs(editing.calibrateDate) : undefined,
        calibrateDue: editing.calibrateDue ? dayjs(editing.calibrateDue) : undefined,
      }
    : { status: 'NORMAL' };

  return (
    <PageShell
      dept="lab"
      eyebrow={formatMessage({ id: 'dept.lab' })}
      title={formatMessage({ id: 'shell.lab.equipment.title' })}
      desc={formatMessage({ id: 'shell.lab.equipment.desc' })}
    >
      <ProTable<Equipment>
        headerTitle={false}
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setDrawerOpen(true); }}>
            {formatMessage({ id: 'equipment.add' })}
          </Button>,
        ]}
        request={async (params) => {
          const res = await getEquipment({
            page: params.current,
            pageSize: params.pageSize,
            keyword: params.code,
            status: params.status,
          });
          return { data: res.list, success: true, total: res.total };
        }}
        columns={columns}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1100 }}
      />
      <DrawerForm
        key={editing?.id ?? 'new'}
        title={editing ? formatMessage({ id: 'equipment.editTitle' }) : formatMessage({ id: 'equipment.addTitle' })}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFinish={handleSubmit}
        initialValues={formInitialValues}
        width={520}
      >
        <ProFormText name="code" label={formatMessage({ id: 'equipment.form.code' })} rules={[{ required: true, message: formatMessage({ id: 'common.pleaseInput' }, { field: formatMessage({ id: 'equipment.form.code' }) }) }]} />
        <ProFormText name="name" label={formatMessage({ id: 'equipment.form.name' })} rules={[{ required: true, message: formatMessage({ id: 'common.pleaseInput' }, { field: formatMessage({ id: 'equipment.form.name' }) }) }]} />
        <ProForm.Group>
          <ProFormText name="model" label={formatMessage({ id: 'equipment.form.model' })} width="sm" />
          <ProFormText name="serialNo" label={formatMessage({ id: 'equipment.form.serialNo' })} width="sm" />
        </ProForm.Group>
        <ProFormText name="manufacturer" label={formatMessage({ id: 'equipment.form.manufacturer' })} />
        <ProForm.Group>
          <ProFormDatePicker name="calibrateDate" label={formatMessage({ id: 'equipment.form.calibrateDate' })} width="sm" />
          <ProFormDatePicker name="calibrateDue" label={formatMessage({ id: 'equipment.form.calibrateDue' })} width="sm" />
        </ProForm.Group>
        <ProFormSelect name="status" label={formatMessage({ id: 'equipment.form.status' })} options={STATUS_OPTIONS} />
      </DrawerForm>
    </PageShell>
  );
}
