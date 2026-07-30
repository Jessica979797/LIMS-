import { ProTable, ProFormText, DrawerForm } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import {
  getReportTemplates,
  createReportTemplate,
  type ReportTemplate,
} from '@/services/reportTemplate';

export default function ReportTemplates() {
  const actionRef = useRef<ActionType>();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      await createReportTemplate(values);
      message.success('创建成功');
      setDrawerOpen(false);
      actionRef.current?.reload();
      return true;
    } catch {
      return false;
    }
  };

  const columns: ProColumns<ReportTemplate>[] = [
    { title: '模板名称', dataIndex: 'name' },
    { title: '类别', dataIndex: 'category', width: 120 },
    { title: '文件路径', dataIndex: 'fileUrl' },
    { title: '状态', dataIndex: 'status', width: 80 },
  ];

  return (
    <>
      <ProTable<ReportTemplate>
        headerTitle="报告模板"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setDrawerOpen(true)}
          >
            新增模板
          </Button>,
        ]}
        request={async () => {
          const res = await getReportTemplates();
          return { data: res, success: true };
        }}
        columns={columns}
      />
      <DrawerForm
        title="新增模板"
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFinish={handleSubmit}
        width={520}
      >
        <ProFormText
          name="name"
          label="模板名称"
          rules={[{ required: true, message: '请输入模板名称' }]}
        />
        <ProFormText
          name="category"
          label="类别"
          rules={[{ required: true, message: '请输入类别' }]}
        />
        <ProFormText
          name="fileUrl"
          label="文件路径"
          rules={[{ required: true, message: '请输入模板文件路径' }]}
          placeholder="模板文件(.docx)路径"
        />
      </DrawerForm>
    </>
  );
}
