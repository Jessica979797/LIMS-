import {
  ProTable,
  ProFormSelect,
  ProFormTextArea,
  DrawerForm,
} from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Popconfirm, message, Tag, Space, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import { useAccess, useIntl } from '@umijs/max';
import {
  getReports,
  createReport,
  deleteReport,
  prepareReport,
  reviewReport,
  approveReport,
  generateReport,
  downloadReport,
  getGenerationStatus,
  previewReport,
  type Report,
} from '@/services/report';
import { getApplications } from '@/services/application';
import PageShell from '@/components/PageShell';

const STATUS_MAP: Record<string, { labelId: string; color: string }> = {
  DRAFT: { labelId: 'status.report.DRAFT', color: 'default' },
  REVIEW: { labelId: 'status.report.REVIEW', color: 'gold' },
  APPROVED: { labelId: 'status.report.APPROVED', color: 'blue' },
  ISSUED: { labelId: 'status.report.ISSUED', color: 'green' },
  VOID: { labelId: 'status.report.VOID', color: 'red' },
  REVISED: { labelId: 'status.report.REVISED', color: 'cyan' },
};

export default function Reports() {
  const { formatMessage } = useIntl();
  const actionRef = useRef<ActionType>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const access = useAccess();
  // 预览弹框
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewId, setPreviewId] = useState('');

  const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(([value, v]) => ({
    label: formatMessage({ id: v.labelId }),
    value,
  }));

  const handleSubmit = async (values: any) => {
    try {
      await createReport(values);
      message.success(formatMessage({ id: 'common.createSuccess' }));
      setDrawerOpen(false);
      actionRef.current?.reload();
      return true;
    } catch {
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReport(id);
      message.success(formatMessage({ id: 'common.deleteSuccess' }));
      actionRef.current?.reload();
    } catch {
      message.error(formatMessage({ id: 'common.deleteFail' }));
    }
  };

  const handleSignoff = async (
    action: 'prepare' | 'review' | 'approve',
    id: string,
  ) => {
    try {
      if (action === 'prepare') await prepareReport(id);
      else if (action === 'review') await reviewReport(id);
      else await approveReport(id);
      message.success(formatMessage({ id: 'common.opSuccess' }));
      actionRef.current?.reload();
    } catch {
      message.error(formatMessage({ id: 'common.opFail' }));
    }
  };

  // 预览报告 HTML（弹框展示，确认后再生成）
  const handlePreview = async (id: string) => {
    try {
      const res = await previewReport(id);
      setPreviewHtml(res.html);
      setPreviewId(id);
      setPreviewOpen(true);
    } catch {
      message.error(formatMessage({ id: 'report.previewFail' }));
    }
  };

  const handleGenerate = async (id: string) => {
    try {
      const res = await generateReport(id);
      setPreviewOpen(false); // 关闭预览弹框
      message.loading({ content: formatMessage({ id: 'report.generating' }), key: `gen-$glm_5.2_ark_toC`, duration: 0 });
      pollGeneration(id, res.jobId);
    } catch {
      message.error(formatMessage({ id: 'report.generateFail' }));
    }
  };

  // 轮询生成状态，完成或失败时停止
  const pollGeneration = (id: string, jobId: string) => {
    let times = 0;
    const timer = setInterval(async () => {
      times++;
      try {
        const res = await getGenerationStatus(id, jobId);
        if (res.state === 'completed' && res.fileUrl) {
          clearInterval(timer);
          message.success({ content: formatMessage({ id: 'report.generateSuccess' }), key: `gen-$glm_5.2_ark_toC` });
          actionRef.current?.reload();
        } else if (res.state === 'failed') {
          clearInterval(timer);
          message.error({ content: formatMessage({ id: 'report.generateFail' }), key: `gen-$glm_5.2_ark_toC` });
        }
      } catch {
        // 忽略轮询瞬态错误
      }
      if (times >= 60) {
        clearInterval(timer);
        message.warning({ content: formatMessage({ id: 'report.generateTimeout' }), key: `gen-$glm_5.2_ark_toC` });
      }
    }, 2000);
  };

  const columns: ProColumns<Report>[] = [
    { title: formatMessage({ id: 'report.col.reportNo' }), dataIndex: 'reportNo', width: 130 },
    {
      title: formatMessage({ id: 'report.col.appNo' }),
      dataIndex: 'appNo',
      hideInSearch: true,
      render: (_, r) => r.application?.applicationNo ?? '-',
    },
    { title: formatMessage({ id: 'report.col.version' }), dataIndex: 'version', width: 60, hideInSearch: true },
    {
      title: formatMessage({ id: 'report.col.conclusion' }),
      dataIndex: 'conclusion',
      hideInSearch: true,
      render: (_, r) => r.conclusion ?? '-',
    },
    {
      title: formatMessage({ id: 'report.col.status' }),
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      fieldProps: { options: STATUS_OPTIONS },
      render: (_, r) => {
        const s = STATUS_MAP[r.status];
        return s ? <Tag color={s.color}>{formatMessage({ id: s.labelId })}</Tag> : r.status;
      },
    },
    {
      title: formatMessage({ id: 'report.col.issuedAt' }),
      dataIndex: 'issuedAt',
      width: 150,
      hideInSearch: true,
      render: (_, r) => (r.issuedAt ? new Date(r.issuedAt).toLocaleString() : '-'),
    },
    {
      title: formatMessage({ id: 'report.col.action' }),
      width: 240,
      fixed: 'right',
      hideInSearch: true,
      render: (_, r) => (
        <Space>
          {r.status !== 'ISSUED' && r.status !== 'VOID' && access.report_preparer && (
            <a onClick={() => handlePreview(r.id)}>{formatMessage({ id: 'report.generate' })}</a>
          )}
          {r.fileUrl && <a onClick={() => downloadReport(r.id)}>{formatMessage({ id: 'report.download' })}</a>}
          {r.status === 'DRAFT' && access.report_preparer && (
            <Popconfirm
              title={formatMessage({ id: 'report.prepareConfirm' })}
              onConfirm={() => handleSignoff('prepare', r.id)}
            >
              <a>{formatMessage({ id: 'report.prepare' })}</a>
            </Popconfirm>
          )}
          {r.status === 'REVIEW' && access.report_reviewer && (
            <Popconfirm
              title={formatMessage({ id: 'report.reviewConfirm' })}
              onConfirm={() => handleSignoff('review', r.id)}
            >
              <a>{formatMessage({ id: 'report.review' })}</a>
            </Popconfirm>
          )}
          {r.status === 'APPROVED' && access.report_approver && (
            <Popconfirm
              title={formatMessage({ id: 'report.approveConfirm' })}
              onConfirm={() => handleSignoff('approve', r.id)}
            >
              <a>{formatMessage({ id: 'report.approve' })}</a>
            </Popconfirm>
          )}
          {r.status === 'DRAFT' && access.system_admin && (
            <Popconfirm
              title={formatMessage({ id: 'report.confirmDelete' })}
              onConfirm={() => handleDelete(r.id)}
            >
              <a style={{ color: '#ff4d4f' }}>{formatMessage({ id: 'common.delete' })}</a>
            </Popconfirm>
          )}
          {r.status === 'ISSUED' && (
            <span style={{ color: '#999' }}>{formatMessage({ id: 'common.locked' })}</span>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageShell
      dept="report"
      eyebrow={formatMessage({ id: 'dept.report' })}
      title={formatMessage({ id: 'shell.reporting.reports.title' })}
      desc={formatMessage({ id: 'shell.reporting.reports.desc' })}
    >
      <ProTable<Report>
        headerTitle={false}
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        toolBarRender={() =>
          access.report_preparer
            ? [
                <Button
                  key="add"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setDrawerOpen(true)}
                >
                  {formatMessage({ id: 'report.add' })}
                </Button>,
              ]
            : []
        }
        request={async (params) => {
          const res = await getReports({
            page: params.current,
            pageSize: params.pageSize,
            keyword: params.reportNo,
            status: params.status,
          });
          return { data: res.list, success: true, total: res.total };
        }}
        columns={columns}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1100 }}
      />
      <DrawerForm
        title={formatMessage({ id: 'report.addTitle' })}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFinish={handleSubmit}
        initialValues={{}}
        width={520}
      >
        <ProFormSelect
          name="applicationId"
          label={formatMessage({ id: 'report.form.application' })}
          rules={[{ required: true, message: formatMessage({ id: 'common.pleaseSelect' }, { field: formatMessage({ id: 'report.form.application' }) }) }]}
          request={async () => {
            const res = await getApplications({ page: 1, pageSize: 1000 });
            return res.list.map((a) => ({ label: a.applicationNo, value: a.id }));
          }}
        />
        <ProFormTextArea name="conclusion" label={formatMessage({ id: 'report.form.conclusion' })} />
      </DrawerForm>
      <Modal
        title={formatMessage({ id: 'report.previewTitle' })}
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        width={900}
        destroyOnClose
        footer={[
          <Button key="cancel" onClick={() => setPreviewOpen(false)}>
            {formatMessage({ id: 'common.cancel' })}
          </Button>,
          <Button
            key="gen"
            type="primary"
            onClick={() => handleGenerate(previewId)}
          >
            {formatMessage({ id: 'report.generate' })}
          </Button>,
        ]}
      >
        <iframe
          srcDoc={previewHtml}
          style={{ width: '100%', height: '70vh', border: '1px solid #eee' }}
          title="report-preview"
        />
      </Modal>
    </PageShell>
  );
}
