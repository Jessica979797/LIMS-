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
import { useAccess } from '@umijs/max';
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

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '编制中', color: 'default' },
  REVIEW: { label: '待审核', color: 'gold' },
  APPROVED: { label: '待批准', color: 'blue' },
  ISSUED: { label: '已签发', color: 'green' },
  VOID: { label: '作废', color: 'red' },
  REVISED: { label: '已修订', color: 'cyan' },
};

const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(([value, v]) => ({
  label: v.label,
  value,
}));

export default function Reports() {
  const actionRef = useRef<ActionType>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const access = useAccess();
  // 预览弹框
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewId, setPreviewId] = useState('');

  const handleSubmit = async (values: any) => {
    try {
      await createReport(values);
      message.success('创建成功');
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
      message.success('删除成功');
      actionRef.current?.reload();
    } catch {
      message.error('删除失败');
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
      message.success('操作成功');
      actionRef.current?.reload();
    } catch {
      message.error('操作失败');
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
      message.error('预览加载失败');
    }
  };

  const handleGenerate = async (id: string) => {
    try {
      const res = await generateReport(id);
      setPreviewOpen(false); // 关闭预览弹框
      message.loading({ content: '报告生成中...', key: `gen-${id}`, duration: 0 });
      pollGeneration(id, res.jobId);
    } catch {
      message.error('生成请求失败');
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
          message.success({ content: '生成成功', key: `gen-${id}` });
          actionRef.current?.reload();
        } else if (res.state === 'failed') {
          clearInterval(timer);
          message.error({ content: '生成失败', key: `gen-${id}` });
        }
      } catch {
        // 忽略轮询瞬态错误
      }
      if (times >= 60) {
        clearInterval(timer);
        message.warning({ content: '生成超时，请稍后刷新查看', key: `gen-${id}` });
      }
    }, 2000);
  };

  const columns: ProColumns<Report>[] = [
    { title: '报告编号', dataIndex: 'reportNo', width: 130 },
    {
      title: '委托编号',
      dataIndex: 'appNo',
      hideInSearch: true,
      render: (_, r) => r.application?.applicationNo ?? '-',
    },
    { title: '版本', dataIndex: 'version', width: 60, hideInSearch: true },
    {
      title: '结论',
      dataIndex: 'conclusion',
      hideInSearch: true,
      render: (_, r) => r.conclusion ?? '-',
    },
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
      title: '签发时间',
      dataIndex: 'issuedAt',
      width: 150,
      hideInSearch: true,
      render: (_, r) => (r.issuedAt ? new Date(r.issuedAt).toLocaleString() : '-'),
    },
    {
      title: '操作',
      width: 240,
      fixed: 'right',
      hideInSearch: true,
      render: (_, r) => (
        <Space>
          {r.status !== 'ISSUED' && r.status !== 'VOID' && access.report_preparer && (
            <a onClick={() => handlePreview(r.id)}>生成PDF</a>
          )}
          {r.fileUrl && <a onClick={() => downloadReport(r.id)}>下载</a>}
          {r.status === 'DRAFT' && access.report_preparer && (
            <Popconfirm
              title="确认提交编制？"
              onConfirm={() => handleSignoff('prepare', r.id)}
            >
              <a>编制提交</a>
            </Popconfirm>
          )}
          {r.status === 'REVIEW' && access.report_reviewer && (
            <Popconfirm
              title="确认审核通过？"
              onConfirm={() => handleSignoff('review', r.id)}
            >
              <a>审核</a>
            </Popconfirm>
          )}
          {r.status === 'APPROVED' && access.report_approver && (
            <Popconfirm
              title="确认批准签发？此操作不可逆"
              onConfirm={() => handleSignoff('approve', r.id)}
            >
              <a>批准签发</a>
            </Popconfirm>
          )}
          {r.status === 'DRAFT' && access.system_admin && (
            <Popconfirm
              title="确认删除该报告？"
              onConfirm={() => handleDelete(r.id)}
            >
              <a style={{ color: '#ff4d4f' }}>删除</a>
            </Popconfirm>
          )}
          {r.status === 'ISSUED' && (
            <span style={{ color: '#999' }}>已锁定</span>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<Report>
        headerTitle="报告管理"
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
                  新增报告
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
        title="新增报告"
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFinish={handleSubmit}
        initialValues={{}}
        width={520}
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
        <ProFormTextArea name="conclusion" label="报告结论" />
      </DrawerForm>
      <Modal
        title="报告预览"
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        width={900}
        destroyOnClose
        footer={[
          <Button key="cancel" onClick={() => setPreviewOpen(false)}>
            取消
          </Button>,
          <Button
            key="gen"
            type="primary"
            onClick={() => handleGenerate(previewId)}
          >
            生成PDF
          </Button>,
        ]}
      >
        <iframe
          srcDoc={previewHtml}
          style={{ width: '100%', height: '70vh', border: '1px solid #eee' }}
          title="report-preview"
        />
      </Modal>
    </>
  );
}
