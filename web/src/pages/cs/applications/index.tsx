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

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '草稿', color: 'default' },
  QUOTED: { label: '已报价', color: 'blue' },
  CONTRACTED: { label: '已签约', color: 'cyan' },
  RECEIVED: { label: '已收样', color: 'gold' },
  TESTING: { label: '检测中', color: 'processing' },
  REPORTING: { label: '报告编制中', color: 'processing' },
  ISSUED: { label: '已签发', color: 'green' },
  DELIVERED: { label: '已交付', color: 'green' },
  ARCHIVED: { label: '已归档', color: 'default' },
  CANCELLED: { label: '已取消', color: 'red' },
};

const REPORT_FORM_OPTIONS = [
  { label: 'PDF', value: 'PDF' },
  { label: 'Word', value: 'WORD' },
  { label: 'PDF+Word', value: 'BOTH' },
];

const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(([value, v]) => ({
  label: v.label,
  value,
}));

// 状态推进按钮文字
const APP_NEXT_LABEL: Record<string, string> = {
  DRAFT: '提交报价',
  QUOTED: '签约',
  CONTRACTED: '收样',
  RECEIVED: '开始检测',
  TESTING: '完成检测',
  REPORTING: '签发报告',
  ISSUED: '交付',
  DELIVERED: '归档',
};

export default function Applications() {
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<Application | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [testItems, setTestItems] = useState<TestItem[]>([]);

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
        message.success('更新成功');
      } else {
        await createApplication(payload);
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
      await deleteApplication(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch {
      message.error('删除失败');
    }
  };

  const handleAdvance = async (id: string) => {
    try {
      await advanceApplication(id);
      message.success('推进成功');
      actionRef.current?.reload();
    } catch {
      message.error('推进失败');
    }
  };

  const columns: ProColumns<Application>[] = [
    { title: '委托编号', dataIndex: 'applicationNo', width: 130, hideInSearch: true },
    {
      title: '客户名称',
      dataIndex: 'name',
      render: (_, record) => record.customer?.name ?? '-',
    },
    { title: '检测类别', dataIndex: 'category', width: 100, hideInSearch: true },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      valueType: 'select',
      fieldProps: { options: STATUS_OPTIONS },
      render: (_, record) => {
        const s = STATUS_MAP[record.status];
        return s ? <Tag color={s.color}>{s.label}</Tag> : record.status;
      },
    },
    { title: '报告份数', dataIndex: 'reportCopies', width: 80, hideInSearch: true },
    { title: '报告形式', dataIndex: 'reportForm', width: 90, hideInSearch: true },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 160,
      hideInSearch: true,
      render: (_, record) => new Date(record.createdAt).toLocaleString(),
    },
    {
      title: '操作',
      width: 180,
      fixed: 'right',
      hideInSearch: true,
      render: (_, record) => (
        <Space>
          {APP_NEXT_LABEL[record.status] && (
            <Popconfirm
              title={`确认${APP_NEXT_LABEL[record.status]}？`}
              onConfirm={() => handleAdvance(record.id)}
            >
              <a>{APP_NEXT_LABEL[record.status]}</a>
            </Popconfirm>
          )}
          <a onClick={() => handleEdit(record)}>编辑</a>
          <Popconfirm
            title="确认删除该委托？"
            onConfirm={() => handleDelete(record.id)}
          >
            <a style={{ color: '#ff4d4f' }}>删除</a>
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
    <>
      <ProTable<Application>
        headerTitle="委托受理"
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
            新增委托
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
        title={editing ? '编辑委托' : '新增委托'}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFinish={handleSubmit}
        initialValues={formInitialValues}
        width={640}
      >
        <ProFormSelect
          name="customerId"
          label="客户"
          rules={[{ required: true, message: '请选择客户' }]}
          request={async () => {
            const res = await getCustomers({ page: 1, pageSize: 1000 });
            return res.list.map((c) => ({ label: c.name, value: c.id }));
          }}
        />
        <ProForm.Group>
          <ProFormText
            name="category"
            label="检测类别"
            width="sm"
            placeholder="如 化学/电子"
          />
          <ProFormText name="contractNo" label="合同号" width="sm" />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormDatePicker name="expectedDate" label="期望完成日期" width="sm" />
          <ProFormDigit
            name="reportCopies"
            label="报告份数"
            width="sm"
            min={1}
          />
          <ProFormSelect
            name="reportForm"
            label="报告形式"
            width="sm"
            options={REPORT_FORM_OPTIONS}
          />
        </ProForm.Group>
        <ProFormText name="remark" label="备注" />
        <ProFormList
          name="items"
          label="检测项目"
          creatorButtonProps={{ creatorButtonText: '添加检测项' }}
          min={1}
          copyIconProps={false}
        >
          <ProForm.Group key="group">
            <ProFormSelect
              name="testItemId"
              label="检测项目"
              options={testItems.map((t) => ({
                label: `${t.name}(${t.code})`,
                value: t.id,
              }))}
              rules={[{ required: true, message: '请选择检测项目' }]}
              width="md"
            />
            <ProFormText name="remark" label="备注" width="md" />
          </ProForm.Group>
        </ProFormList>
      </DrawerForm>
    </>
  );
}
