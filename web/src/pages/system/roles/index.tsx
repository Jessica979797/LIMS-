import { ProTable, ProFormText, ProFormSelect, DrawerForm } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Popconfirm, message, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import { useAccess, useIntl } from '@umijs/max';
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  type Role,
} from '@/services/role';
import PageShell from '@/components/PageShell';

export default function Roles() {
  const { formatMessage } = useIntl();
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<Role | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const access = useAccess();

  const MODULE_OPTIONS = [
    { label: formatMessage({ id: 'role.module.CS' }), value: 'CS' },
    { label: formatMessage({ id: 'role.module.OP' }), value: 'OP' },
    { label: formatMessage({ id: 'role.module.LAB' }), value: 'LAB' },
    { label: formatMessage({ id: 'role.module.REPORTING' }), value: 'REPORTING' },
    { label: formatMessage({ id: 'role.module.SYSTEM' }), value: 'SYSTEM' },
  ];

  const handleSubmit = async (values: any) => {
    try {
      if (editing) {
        await updateRole(editing.id, values);
        message.success(formatMessage({ id: 'common.updateSuccess' }));
      } else {
        await createRole(values);
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
      await deleteRole(id);
      message.success(formatMessage({ id: 'common.deleteSuccess' }));
      actionRef.current?.reload();
    } catch {
      message.error(formatMessage({ id: 'common.deleteFail' }));
    }
  };

  const columns: ProColumns<Role>[] = [
    { title: formatMessage({ id: 'role.col.name' }), dataIndex: 'name' },
    { title: formatMessage({ id: 'role.col.code' }), dataIndex: 'code', width: 160 },
    {
      title: formatMessage({ id: 'role.col.module' }),
      dataIndex: 'module',
      width: 120,
      valueType: 'select',
      fieldProps: { options: MODULE_OPTIONS },
      render: (_, r) => <Tag>{formatMessage({ id: 'role.module.' + r.module })}</Tag>,
    },
    {
      title: formatMessage({ id: 'role.col.action' }),
      width: 120,
      fixed: 'right',
      hideInSearch: true,
      render: (_, r) => (
        <Space>
          {access.system_admin && (
            <a onClick={() => { setEditing(r); setDrawerOpen(true); }}>{formatMessage({ id: 'common.edit' })}</a>
          )}
          {access.system_admin && (
            <Popconfirm title={formatMessage({ id: 'role.confirmDelete' })} onConfirm={() => handleDelete(r.id)}>
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
      title={formatMessage({ id: 'shell.system.roles.title' })}
      desc={formatMessage({ id: 'shell.system.roles.desc' })}
    >
      <ProTable<Role>
        headerTitle={false}
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        toolBarRender={() =>
          access.system_admin
            ? [
                <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setDrawerOpen(true); }}>
                  {formatMessage({ id: 'role.add' })}
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
        title={editing ? formatMessage({ id: 'role.editTitle' }) : formatMessage({ id: 'role.addTitle' })}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFinish={handleSubmit}
        initialValues={editing ?? {}}
        width={480}
      >
        <ProFormText name="name" label={formatMessage({ id: 'role.form.name' })} rules={[{ required: true, message: formatMessage({ id: 'common.pleaseInput' }, { field: formatMessage({ id: 'role.form.name' }) }) }]} />
        <ProFormText name="code" label={formatMessage({ id: 'role.form.code' })} rules={[{ required: true, message: formatMessage({ id: 'common.pleaseInput' }, { field: formatMessage({ id: 'role.form.code' }) }) }]} placeholder={formatMessage({ id: 'role.form.codePh' })} />
        <ProFormSelect name="module" label={formatMessage({ id: 'role.form.module' })} options={MODULE_OPTIONS} rules={[{ required: true, message: formatMessage({ id: 'common.pleaseSelect' }, { field: formatMessage({ id: 'role.form.module' }) }) }]} />
      </DrawerForm>
    </PageShell>
  );
}
