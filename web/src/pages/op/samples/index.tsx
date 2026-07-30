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
import {
  getSamples,
  createSample,
  updateSample,
  deleteSample,
  type Sample,
} from '@/services/sample';
import { getApplications } from '@/services/application';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  RECEIVED: { label: '已收样', color: 'blue' },
  TESTING: { label: '检测中', color: 'processing' },
  COMPLETED: { label: '检测完成', color: 'green' },
  RETAINED: { label: '留样', color: 'gold' },
  RETURNED: { label: '已退样', color: 'default' },
  DISPOSED: { label: '已处置', color: 'default' },
};

const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(([value, v]) => ({
  label: v.label,
  value,
}));

export default function Samples() {
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<Sample | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
        message.success('更新成功');
      } else {
        await createSample(values);
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
      await deleteSample(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ProColumns<Sample>[] = [
    { title: '样品编号', dataIndex: 'sampleNo', width: 130, hideInSearch: true },
    {
      title: '样品名称',
      dataIndex: 'name',
      render: (_, r) => r.name,
    },
    {
      title: '委托编号',
      dataIndex: 'applicationNo',
      width: 130,
      hideInSearch: true,
      render: (_, r) => r.application?.applicationNo ?? '-',
    },
    { title: '型号', dataIndex: 'model', width: 100, hideInSearch: true },
    { title: '批号', dataIndex: 'batchNo', width: 100, hideInSearch: true },
    {
      title: '数量',
      dataIndex: 'quantity',
      width: 80,
      hideInSearch: true,
      render: (_, r) => `${r.quantity}${r.unit ?? ''}`,
    },
    { title: '生产厂家', dataIndex: 'manufacturer', width: 120, hideInSearch: true },
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
      title: '收样时间',
      dataIndex: 'receivedAt',
      width: 150,
      hideInSearch: true,
      render: (_, r) => new Date(r.receivedAt).toLocaleString(),
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      hideInSearch: true,
      render: (_, r) => (
        <Space>
          <a onClick={() => handleEdit(r)}>编辑</a>
          <Popconfirm
            title="确认删除该样品？"
            onConfirm={() => handleDelete(r.id)}
          >
            <a style={{ color: '#ff4d4f' }}>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<Sample>
        headerTitle="样品管理"
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
            新增样品
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
        title={editing ? '编辑样品' : '新增样品'}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFinish={handleSubmit}
        initialValues={editing ?? { quantity: 1, status: 'RECEIVED' }}
        width={560}
      >
        <ProFormSelect
          name="applicationId"
          label="委托单"
          rules={[{ required: true, message: '请选择委托单' }]}
          request={async () => {
            const res = await getApplications({ page: 1, pageSize: 1000 });
            return res.list.map((a) => ({ label: a.applicationNo, value: a.id }));
          }}
        />
        <ProFormText
          name="name"
          label="样品名称"
          rules={[{ required: true, message: '请输入样品名称' }]}
        />
        <ProForm.Group>
          <ProFormText name="type" label="规格类别" width="sm" />
          <ProFormText name="model" label="型号" width="sm" />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText name="batchNo" label="批号" width="sm" />
          <ProFormText name="manufacturer" label="生产厂家" width="sm" />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormDigit name="quantity" label="数量" width="sm" min={1} />
          <ProFormText name="unit" label="单位" width="sm" placeholder="如 个/件/批" />
          <ProFormText name="storageLocation" label="存储位置" width="sm" />
        </ProForm.Group>
        <ProFormSelect name="status" label="状态" options={STATUS_OPTIONS} />
      </DrawerForm>
    </>
  );
}
