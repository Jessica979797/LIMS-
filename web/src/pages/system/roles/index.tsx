import { ProTable, ProFormText, ProFormSelect, DrawerForm } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Popconfirm, message, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import { useAccess } from '@umijs/max';
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  type Role,
} from '@/services/role';

const MODULE_MAP: Record<string, string> = {
  CS: '客户服务',
  OP: '业务运营',
  LAB: '实验室',
  REPORTING: '报告',
  SYSTEM: '系统',
};

const MODULE_OPTIONS = Object.entries(MODULE_MAP).map(([value, label]) => ({
  label,
  value,
}));

export default function Roles() {
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<Role | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const access = useAccess();

  const handleSubmit = async (values: any) => {
    try {
      if (editing) {
        await updateRole(editing.id, values);
        message.success('更新成功');
      } else {
        await createRole(values);
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
      await deleteRole(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ProColumns<Role>[] = [
    { title: '角色名称', dataIndex: 'name' },
    { title: '编码', dataIndex: 'code', width: 160 },
    {
      title: '所属模块',
      dataIndex: 'module',
      width: 120,
      valueType: 'select',
      fieldProps: { options: MODULE_OPTIONS },
      render: (_, r) => <Tag>{MODULE_MAP[r.module] ?? r.module}</Tag>,
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      hideInSearch: true,
      render: (_, r) => (
        <Space>
          {access.system_admin && (
            <a onClick={() => { setEditing(r); setDrawerOpen(true); }}>编辑</a>
          )}
          {access.system_admin && (
            <Popconfirm title="确认删除？" onConfirm={() => handleDelete(r.id)}>
              <a style={{ color: '#ff4d4f' }}>删除</a>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<Role>
        headerTitle="角色权限"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        toolBarRender={() =>
          access.system_admin
            ? [
                <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setDrawerOpen(true); }}>
                  新增角色
                </Button>,
              ]
            : []
        }
        request={async (params) => {
          const res = await getRoles({
            page: params.current,
            pageSize: params.pageSize,
            keyword: params.name,
          });
          return { data: res.list, success: true, total: res.total };
        }}
        columns={columns}
        pagination={{ pageSize: 10 }}
      />
      <DrawerForm
        key={editing?.id ?? 'new'}
        title={editing ? '编辑角色' : '新增角色'}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFinish={handleSubmit}
        initialValues={editing ?? {}}
        width={480}
      >
        <ProFormText name="name" label="角色名称" rules={[{ required: true, message: '请输入名称' }]} />
        <ProFormText name="code" label="编码" rules={[{ required: true, message: '请输入编码' }]} placeholder="如 cs_staff" />
        <ProFormSelect name="module" label="所属模块" options={MODULE_OPTIONS} rules={[{ required: true, message: '请选择模块' }]} />
      </DrawerForm>
    </>
  );
}
