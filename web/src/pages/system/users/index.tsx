import { ProTable, ProFormText, DrawerForm } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Popconfirm, message, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import { useAccess, useIntl } from '@umijs/max';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  type UserOption,
} from '@/services/user';
import PageShell from '@/components/PageShell';

const STATUS_MAP: Record<string, { labelId: string; color: string }> = {
  ACTIVE: { labelId: 'status.common.ACTIVE', color: 'green' },
  INACTIVE: { labelId: 'status.common.INACTIVE', color: 'default' },
};

export default function Users() {
  const { formatMessage } = useIntl();
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<UserOption | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const access = useAccess();

  const handleSubmit = async (values: any) => {
    try {
      if (editing) {
        await updateUser(editing.id, values);
        message.success(formatMessage({ id: 'common.updateSuccess' }));
      } else {
        await createUser(values);
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
      await deleteUser(id);
      message.success(formatMessage({ id: 'common.deleteSuccess' }));
      actionRef.current?.reload();
    } catch {
      message.error(formatMessage({ id: 'common.deleteFail' }));
    }
  };

  const columns: ProColumns<UserOption>[] = [
    { title: formatMessage({ id: 'user.col.username' }), dataIndex: 'username' },
    { title: formatMessage({ id: 'user.col.name' }), dataIndex: 'name' },
    {
      title: formatMessage({ id: 'user.col.status' }),
      dataIndex: 'status',
      hideInSearch: true,
      render: (_, r) => {
        const s = STATUS_MAP[r.status];
        return s ? <Tag color={s.color}>{formatMessage({ id: s.labelId })}</Tag> : r.status;
      },
    },
    {
      title: formatMessage({ id: 'user.col.action' }),
      width: 120,
      fixed: 'right',
      hideInSearch: true,
      render: (_, r) => (
        <Space>
          {access.system_admin && (
            <a onClick={() => { setEditing(r); setDrawerOpen(true); }}>{formatMessage({ id: 'common.edit' })}</a>
          )}
          {access.system_admin && (
            <Popconfirm title={formatMessage({ id: 'user.confirmDelete' })} onConfirm={() => handleDelete(r.id)}>
              <a style={{ color: '#ff4d4f' }}>{formatMessage({ id: 'common.delete' })}</a>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageShell
      dept="system"
      eyebrow={formatMessage({ id: 'dept.system' })}
      title={formatMessage({ id: 'shell.system.users.title' })}
      desc={formatMessage({ id: 'shell.system.users.desc' })}
    >
      <ProTable<UserOption>
        headerTitle={false}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() =>
          access.system_admin
            ? [
                <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setDrawerOpen(true); }}>
                  {formatMessage({ id: 'user.add' })}
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
        title={editing ? formatMessage({ id: 'user.editTitle' }) : formatMessage({ id: 'user.addTitle' })}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFinish={handleSubmit}
        initialValues={editing ?? {}}
        width={480}
      >
        <ProFormText name="username" label={formatMessage({ id: 'user.form.username' })} disabled={!!editing} rules={[{ required: true, message: formatMessage({ id: 'common.pleaseInput' }, { field: formatMessage({ id: 'user.form.username' }) }) }]} />
        <ProFormText name="name" label={formatMessage({ id: 'user.form.name' })} rules={[{ required: true, message: formatMessage({ id: 'common.pleaseInput' }, { field: formatMessage({ id: 'user.form.name' }) }) }]} />
        <ProFormText
          name="password"
          label={editing ? formatMessage({ id: 'user.form.passwordEdit' }) : formatMessage({ id: 'user.form.password' })}
          rules={editing ? [] : [{ required: true, message: formatMessage({ id: 'common.pleaseInput' }, { field: formatMessage({ id: 'user.form.password' }) }) }]}
        />
        <ProFormText name="email" label={formatMessage({ id: 'user.form.email' })} />
        <ProFormText name="phone" label={formatMessage({ id: 'user.form.phone' })} />
      </DrawerForm>
    </PageShell>
  );
}
