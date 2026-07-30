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
import dayjs from 'dayjs';
import {
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  type Equipment,
} from '@/services/equipment';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  NORMAL: { label: '正常', color: 'green' },
  MAINTENANCE: { label: '维护中', color: 'gold' },
  CALIBRATING: { label: '校准中', color: 'blue' },
  OUTOFSERVICE: { label: '停用', color: 'red' },
};

const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(([value, v]) => ({
  label: v.label,
  value,
}));

export default function EquipmentPage() {
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSubmit = async (values: any) => {
    const payload = {
      ...values,
      calibrateDate: values.calibrateDate ? dayjs(values.calibrateDate).toISOString() : null,
      calibrateDue: values.calibrateDue ? dayjs(values.calibrateDue).toISOString() : null,
    };
    try {
      if (editing) {
        await updateEquipment(editing.id, payload);
        message.success('更新成功');
      } else {
        await createEquipment(payload);
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
      await deleteEquipment(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ProColumns<Equipment>[] = [
    { title: '设备编号', dataIndex: 'code', width: 130 },
    { title: '设备名称', dataIndex: 'name' },
    { title: '型号', dataIndex: 'model', width: 100, hideInSearch: true },
    { title: '出厂编号', dataIndex: 'serialNo', width: 120, hideInSearch: true },
    { title: '厂家', dataIndex: 'manufacturer', width: 120, hideInSearch: true },
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
      title: '校准到期',
      dataIndex: 'calibrateDue',
      width: 120,
      hideInSearch: true,
      render: (_, r) => (r.calibrateDue ? new Date(r.calibrateDue).toLocaleDateString() : '-'),
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

  const formInitialValues = editing
    ? {
        ...editing,
        calibrateDate: editing.calibrateDate ? dayjs(editing.calibrateDate) : undefined,
        calibrateDue: editing.calibrateDue ? dayjs(editing.calibrateDue) : undefined,
      }
    : { status: 'NORMAL' };

  return (
    <>
      <ProTable<Equipment>
        headerTitle="设备管理"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setDrawerOpen(true); }}>
            新增设备
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
        title={editing ? '编辑设备' : '新增设备'}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFinish={handleSubmit}
        initialValues={formInitialValues}
        width={520}
      >
        <ProFormText name="code" label="设备编号" rules={[{ required: true, message: '请输入编号' }]} />
        <ProFormText name="name" label="设备名称" rules={[{ required: true, message: '请输入名称' }]} />
        <ProForm.Group>
          <ProFormText name="model" label="型号" width="sm" />
          <ProFormText name="serialNo" label="出厂编号" width="sm" />
        </ProForm.Group>
        <ProFormText name="manufacturer" label="生产厂家" />
        <ProForm.Group>
          <ProFormDatePicker name="calibrateDate" label="校准日期" width="sm" />
          <ProFormDatePicker name="calibrateDue" label="校准到期" width="sm" />
        </ProForm.Group>
        <ProFormSelect name="status" label="状态" options={STATUS_OPTIONS} />
      </DrawerForm>
    </>
  );
}
