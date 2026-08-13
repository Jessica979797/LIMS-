import { ProTable, ProFormText, DrawerForm } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import { useIntl } from '@umijs/max';
import {
  getReportTemplates,
  createReportTemplate,
  type ReportTemplate,
} from '@/services/reportTemplate';
import PageShell from '@/components/PageShell';

export default function ReportTemplates() {
  const { formatMessage } = useIntl();
  const actionRef = useRef<ActionType>();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      await createReportTemplate(values);
      message.success(formatMessage({ id: 'common.createSuccess' }));
      setDrawerOpen(false);
      actionRef.current?.reload();
      return true;
    } catch {
      return false;
    }
  };

  const columns: ProColumns<ReportTemplate>[] = [
    { title: formatMessage({ id: 'template.col.name' }), dataIndex: 'name' },
    { title: formatMessage({ id: 'template.col.category' }), dataIndex: 'category', width: 120 },
    { title: formatMessage({ id: 'template.col.fileUrl' }), dataIndex: 'fileUrl' },
    { title: formatMessage({ id: 'template.col.status' }), dataIndex: 'status', width: 80 },
  ];

  return (
    <PageShell
      dept="report"
      eyebrow={formatMessage({ id: 'dept.report' })}
      title={formatMessage({ id: 'shell.reporting.templates.title' })}
      desc={formatMessage({ id: 'shell.reporting.templates.desc' })}
    >
      <ProTable<ReportTemplate>
        headerTitle={false}
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
            {formatMessage({ id: 'template.add' })}
          </Button>,
        ]}
        request={async () => {
          const res = await getReportTemplates();
          return { data: res, success: true };
        }}
        columns={columns}
      />
      <DrawerForm
        title={formatMessage({ id: 'template.addTitle' })}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFinish={handleSubmit}
        width={520}
      >
        <ProFormText
          name="name"
          label={formatMessage({ id: 'template.form.name' })}
          rules={[{ required: true, message: formatMessage({ id: 'common.pleaseInput' }, { field: formatMessage({ id: 'template.form.name' }) }) }]}
        />
        <ProFormText
          name="category"
          label={formatMessage({ id: 'template.form.category' })}
          rules={[{ required: true, message: formatMessage({ id: 'common.pleaseInput' }, { field: formatMessage({ id: 'template.form.category' }) }) }]}
        />
        <ProFormText
          name="fileUrl"
          label={formatMessage({ id: 'template.form.fileUrl' })}
          rules={[{ required: true, message: formatMessage({ id: 'common.pleaseInput' }, { field: formatMessage({ id: 'template.form.fileUrl' }) }) }]}
          placeholder={formatMessage({ id: 'template.form.fileUrlPh' })}
        />
      </DrawerForm>
    </PageShell>
  );
}
