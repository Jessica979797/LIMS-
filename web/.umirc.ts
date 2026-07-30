import { defineConfig } from '@umijs/max';

export default defineConfig({
  npmClient: 'pnpm',
  antd: {},
  model: {},
  initialState: {},
  request: {},
  access: {},
  layout: {
    title: 'LIMS 检测系统',
  },
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
  routes: [
    { path: '/login', layout: false, component: './Login' },
    { path: '/', redirect: '/dashboard' },
    { name: '工作台', path: '/dashboard', component: './Dashboard' },
    {
      name: 'CS 客户服务',
      path: '/cs',
      routes: [
        { name: '客户管理', path: '/cs/customers', component: './cs/customers' },
        { name: '委托受理', path: '/cs/applications', component: './cs/applications' },
        { name: '报价管理', path: '/cs/quotations', component: './cs/quotations' },
      ],
    },
    {
      name: 'OP 业务运营',
      path: '/op',
      routes: [
        { name: '样品管理', path: '/op/samples', component: './op/samples' },
        { name: '任务分配', path: '/op/tasks', component: './op/tasks' },
      ],
    },
    {
      name: 'Lab 实验室',
      path: '/lab',
      routes: [
        { name: '检测任务', path: '/lab/tasks', component: './lab/tasks' },
        { name: '检测结果', path: '/lab/results', component: './lab/results' },
        { name: '检测项目', path: '/lab/items', component: './lab/items' },
        { name: '检测方法', path: '/lab/methods', component: './lab/methods' },
        { name: '设备管理', path: '/lab/equipment', component: './lab/equipment' },
      ],
    },
    {
      name: '报告管理',
      path: '/reporting',
      routes: [
        { name: '报告列表', path: '/reporting/reports', component: './reporting/reports' },
        { name: '报告模板', path: '/reporting/templates', component: './reporting/templates' },
        { name: '签发审批', path: '/reporting/approval', component: './reporting/approval' },
      ],
    },
    {
      name: '系统管理',
      path: '/system',
      access: 'system_admin',
      routes: [
        { name: '用户管理', path: '/system/users', component: './system/users' },
        { name: '角色权限', path: '/system/roles', component: './system/roles' },
        { name: '审计日志', path: '/system/audit', component: './system/audit' },
      ],
    },
  ],
});
