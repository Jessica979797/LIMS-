import { ProTable, ProFormText, DrawerForm } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Popconfirm, message, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import { useAccess } from '@umijs/max';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  type UserOption,
} from '@/services/user';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: '启用', color: 'green' },
  INACTIVE: { label: '停用', color: 'default' },
};

export default function Users() {
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<UserOption | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const access = useAccess();

  const handleSubmit = async (values: any) => {
    try {
      if (editing) {
        await updateUser(editing.id, values);
        message.success('更新成功');
      } else {
        await createUser(values);
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
      await deleteUser(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ProColumns<UserOption>[] = [
    { title: '用户名', dataIndex: 'username' },
    { title: '姓名', dataIndex: 'name' },
    {
      title: '状态',
      dataIndex: 'status',
      hideInSearch: true,
      render: (_, r) => {
        const s = STATUS_MAP[r.status];
        return s ? <Tag color={s.color}>{s.label}</Tag> : r.status;
      },
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
      <ProTable<UserOption>
        headerTitle="用户管理"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() =>
          access.system_admin
            ? [
                <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setDrawerOpen(true); }}>
                  新增用户
                </Button>,
              ]
            : []
        }
        request={async () => {
          const res = await getUsers();
          return { data: res, success: true };
        }}
        columns={columns}
      />
      <DrawerForm
        key={editing?.id ?? 'new'}
        title={editing ? '编辑用户' : '新增用户'}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFinish={handleSubmit}
        initialValues={editing ?? {}}
        width={480}
      >
        <ProFormText name="username" label="用户名" disabled={!!editing} rules={[{ required: true, message: '请输入用户名' }]} />
        <ProFormText name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]} />
        <ProFormText
          name="password"
          label={editing ? '新密码（留空不改）' : '密码'}
          rules={editing ? [] : [{ required: true, message: '请输入密码' }]}
        />
        <ProFormText name="email" label="邮箱" />
        <ProFormText name="phone" label="电话" />
      </DrawerForm>
    </>
  );
}
