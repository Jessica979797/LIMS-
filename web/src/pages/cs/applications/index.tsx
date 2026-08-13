import {
  ProTable,
  ProFormText,
  ProFormSelect,
  ProFormDatePicker,
  ProFormDigit,
  ProFormList,
  ProForm,
  DrawerForm,
} from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Popconfirm, message, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRef, useState, useEffect } from 'react';
import { useIntl } from '@umijs/max';
import dayjs from 'dayjs';
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  advanceApplication,
  type Application,
} from '@/services/application';
import { getCustomers } from '@/services/customer';
import { getTestItems, type TestItem } from '@/services/testItem';
import PageShell from '@/components/PageShell';

const STATUS_MAP: Record<string, { labelId: string; color: string }> = {
  DRAFT: { labelId: 'status.application.DRAFT', color: 'default' },
  QUOTED: { labelId: 'status.application.QUOTED', color: 'blue' },
  CONTRACTED: { labelId: 'status.application.CONTRACTED', color: 'cyan' },
  RECEIVED: { labelId: 'status.application.RECEIVED', color: 'gold' },
  TESTING: { labelId: 'status.application.TESTING', color: 'processing' },
  REPORTING: { labelId: 'status.application.REPORTING', color: 'processing' },
  ISSUED: { labelId: 'status.application.ISSUED', color: 'green' },
  DELIVERED: { labelId: 'status.application.DELIVERED', color: 'green' },
  ARCHIVED: { labelId: 'status.application.ARCHIVED', color: 'default' },
  CANCELLED: { labelId: 'status.application.CANCELLED', color: 'red' },
};

const REPORT_FORM_OPTIONS = [
  { label: 'PDF', value: 'PDF' },
  { label: 'Word', value: 'WORD' },
  { label: 'PDF+Word', value: 'BOTH' },
];

// 状态推进按钮文字
const APP_NEXT_LABEL: Record<string, string> = {
  DRAFT: 'advance.DRAFT',
  QUOTED: 'advance.QUOTED',
  CONTRACTED: 'advance.CONTRACTED',
  RECEIVED: 'advance.RECEIVED',
  TESTING: 'advance.TESTING',
  REPORTING: 'advance.REPORTING',
  ISSUED: 'advance.ISSUED',
  DELIVERED: 'advance.DELIVERED',
};

export default function Applications() {
  const { formatMessage } = useIntl();
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<Application | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [testItems, setTestItems] = useState<TestItem[]>([]);

  const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(([value, v]) => ({
    label: formatMessage({ id: v.labelId }),
    value,
  }));

  useEffect(() => {
    getTestItems()
      .then(setTestItems)
      .catch(() => {});
  }, []);

  const handleAdd = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const handleEdit = (record: Application) => {
    setEditing(record);
    setDrawerOpen(true);
  };

  const handleSubmit = async (values: any) => {
    const payload = {
      ...values,
      expectedDate: values.expectedDate
        ? dayjs(values.expectedDate).toISOString()
        : null,
      items: (values.items || []).map((it: any) => ({
        testItemId: it.testItemId,
        remark: it.remark,
      })),
    };
    try {
      if (editing) {
        await updateApplication(editing.id, payload);
        message.success(formatMessage({ id: 'common.updateSuccess' }));
      } else {
        await createApplication(payload);
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
      await deleteApplication(id);
      message.success(formatMessage({ id: 'common.deleteSuccess' }));
      actionRef.current?.reload();
    } catch {
      message.error(formatMessage({ id: 'common.deleteFail' }));
    }
  };

  const handleAdvance = async (id: string) => {
    try {
      await advanceApplication(id);
      message.success(formatMessage({ id: 'common.advanceSuccess' }));
      actionRef.current?.reload();
    } catch {
      message.error(formatMessage({ id: 'common.advanceFail' }));
    }
  };

  const columns: ProColumns<Application>[] = [
    { title: formatMessage({ id: 'application.col.applicationNo' }), dataIndex: 'applicationNo', width: 130, hideInSearch: true },
    {
      title: formatMessage({ id: 'application.col.customerName' }),
      dataIndex: 'name',
      render: (_, record) => record.customer?.name ?? '-',
    },
    { title: formatMessage({ id: 'application.col.category' }), dataIndex: 'category', width: 100, hideInSearch: true },
    {
      title: formatMessage({ id: 'application.col.status' }),
      dataIndex: 'status',
      width: 110,
      valueType: 'select',
      fieldProps: { options: STATUS_OPTIONS },
      render: (_, record) => {
        const s = STATUS_MAP[record.status];
        return s ? <Tag color={s.color}>{formatMessage({ id: s.labelId })}</Tag> : record.status;
      },
    },
    { title: formatMessage({ id: 'application.col.reportCopies' }), dataIndex: 'reportCopies', width: 80, hideInSearch: true },
    { title: formatMessage({ id: 'application.col.reportForm' }), dataIndex: 'reportForm', width: 90, hideInSearch: true },
    {
      title: formatMessage({ id: 'application.col.createdAt' }),
      dataIndex: 'createdAt',
      width: 160,
      hideInSearch: true,
      render: (_, record) => new Date(record.createdAt).toLocaleString(),
    },
    {
      title: formatMessage({ id: 'application.col.action' }),
      width: 180,
      fixed: 'right',
      hideInSearch: true,
      render: (_, record) => (
        <Space>
          {APP_NEXT_LABEL[record.status] && (
            <Popconfirm
              title={formatMessage({ id: 'advance.confirm' }, { action: formatMessage({ id: APP_NEXT_LABEL[record.status] }) })}
              onConfirm={() => handleAdvance(record.id)}
            >
              <a>{formatMessage({ id: APP_NEXT_LABEL[record.status] })}</a>
            </Popconfirm>
          )}
          <a onClick={() => handleEdit(record)}>{formatMessage({ id: 'common.edit' })}</a>
          <Popconfirm
            title={formatMessage({ id: 'application.confirmDelete' })}
            onConfirm={() => handleDelete(record.id)}
          >
            <a style={{ color: '#ff4d4f' }}>{formatMessage({ id: 'common.delete' })}</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const formInitialValues = editing
    ? {
        ...editing,
        expectedDate: editing.expectedDate
          ? dayjs(editing.expectedDate)
          : undefined,
        items: editing.items?.map((it) => ({
          testItemId: it.testItemId,
          remark: it.remark,
        })),
      }
    : { reportCopies: 1, reportForm: 'PDF', status: 'DRAFT', items: [] };

  return (
    <PageShell
      dept="cs"
      eyebrow={formatMessage({ id: 'dept.cs' })}
      title={formatMessage({ id: 'shell.cs.applications.title' })}
      desc={formatMessage({ id: 'shell.cs.applications.desc' })}
    >
      <ProTable<Application>
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
            {formatMessage({ id: 'application.add' })}
          </Button>,
        ]}
        request={async (params) => {
          const res = await getApplications({
            page: params.current,
            pageSize: params.pageSize,
            keyword: params.name,
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
        title={editing ? formatMessage({ id: 'application.editTitle' }) : formatMessage({ id: 'application.addTitle' })}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFinish={handleSubmit}
        initialValues={formInitialValues}
        width={640}
      >
        <ProFormSelect
          name="customerId"
          label={formatMessage({ id: 'application.form.customer' })}
          rules={[{ required: true, message: formatMessage({ id: 'common.pleaseSelect' }, { field: formatMessage({ id: 'application.form.customer' }) }) }]}
          request={async () => {
            const res = await getCustomers({ page: 1, pageSize: 1000 });
            return res.list.map((c) => ({ label: c.name, value: c.id }));
          }}
        />
        <ProForm.Group>
          <ProFormText
            name="category"
            label={formatMessage({ id: 'application.form.category' })}
            width="sm"
            placeholder={formatMessage({ id: 'application.form.categoryPh' })}
          />
          <ProFormText name="contractNo" label={formatMessage({ id: 'application.form.contractNo' })} width="sm" />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormDatePicker name="expectedDate" label={formatMessage({ id: 'application.form.expectedDate' })} width="sm" />
          <ProFormDigit
            name="reportCopies"
            label={formatMessage({ id: 'application.form.reportCopies' })}
            width="sm"
            min={1}
          />
          <ProFormSelect
            name="reportForm"
            label={formatMessage({ id: 'application.form.reportForm' })}
            width="sm"
            options={REPORT_FORM_OPTIONS}
          />
        </ProForm.Group>
        <ProFormText name="remark" label={formatMessage({ id: 'application.form.remark' })} />
        <ProFormList
          name="items"
          label={formatMessage({ id: 'application.form.items' })}
          creatorButtonProps={{ creatorButtonText: formatMessage({ id: 'application.form.addItem' }) }}
          min={1}
          copyIconProps={false}
        >
          <ProForm.Group key="group">
            <ProFormSelect
              name="testItemId"
              label={formatMessage({ id: 'application.form.testItem' })}
              options={testItems.map((t) => ({
                label: `${t.name}(${t.code})`,
                value: t.id,
              }))}
              rules={[{ required: true, message: formatMessage({ id: 'common.pleaseSelect' }, { field: formatMessage({ id: 'application.form.testItem' }) }) }]}
              width="md"
            />
            <ProFormText name="remark" label={formatMessage({ id: 'application.form.remark' })} width="md" />
          </ProForm.Group>
        </ProFormList>
      </DrawerForm>
    </PageShell>
  );
}
