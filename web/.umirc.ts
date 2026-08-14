import { defineConfig } from '@umijs/max';

export default defineConfig({
  npmClient: 'pnpm',
  antd: {
    configProvider: {},
    theme: {
      token: {
        colorPrimary: '#2B5FFF',
        colorInfo: '#2B5FFF',
        colorSuccess: '#16C79A',
        colorWarning: '#FFB020',
        colorError: '#FF5A5A',
        colorLink: '#2B5FFF',
        borderRadius: 10,
        borderRadiusLG: 14,
        colorText: '#0E1A24',
        colorTextSecondary: '#4A5A66',
        colorBorder: 'rgba(14, 26, 36, 0.12)',
        colorBorderSecondary: 'rgba(14, 26, 36, 0.08)',
        colorBgLayout: '#FAFBF7',
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', system-ui, sans-serif",
        fontSize: 14,
      },
      components: {
        Button: { controlHeight: 36, fontWeight: 500 },
        Layout: { headerBg: '#FFFFFF', bodyBg: '#FAFBF7', siderBg: '#FFFFFF' },
        Menu: { itemBorderRadius: 8, itemHeight: 40 },
        Table: { headerBg: '#FAFBF7', rowHoverBg: 'rgba(43, 95, 255, 0.03)' },
      },
    },
  },
  model: {},
  initialState: {},
  request: {},
  access: {},
  locale: {
    default: 'zh-CN',
    baseNavigator: false,
    antd: true,
    locales: [
      { name: '中文', value: 'zh-CN' },
      { name: 'English', value: 'en-US' },
      { name: 'Deutsch', value: 'de-DE' },
    ],
  },
  layout: {
    title: 'LIMS',
  },
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
  routes: [
    { path: '/login', layout: false, component: './Login' },
    { path: '/', redirect: '/practice' },
    { name: 'menu.practice', path: '/practice', component: './Practice' },
    { name: 'menu.dashboard', path: '/dashboard', component: './Dashboard' },
    {
      name: 'menu.cs',
      path: '/cs',
      routes: [
        { name: 'menu.cs.customers', path: '/cs/customers', component: './cs/customers' },
        { name: 'menu.cs.applications', path: '/cs/applications', component: './cs/applications' },
        { name: 'menu.cs.quotations', path: '/cs/quotations', component: './cs/quotations' },
      ],
    },
    {
      name: 'menu.op',
      path: '/op',
      routes: [
        { name: 'menu.op.samples', path: '/op/samples', component: './op/samples' },
        { name: 'menu.op.tasks', path: '/op/tasks', component: './op/tasks' },
      ],
    },
    {
      name: 'menu.lab',
      path: '/lab',
      routes: [
        { name: 'menu.lab.tasks', path: '/lab/tasks', component: './lab/tasks' },
        { name: 'menu.lab.results', path: '/lab/results', component: './lab/results' },
        { name: 'menu.lab.items', path: '/lab/items', component: './lab/items' },
        { name: 'menu.lab.methods', path: '/lab/methods', component: './lab/methods' },
        { name: 'menu.lab.equipment', path: '/lab/equipment', component: './lab/equipment' },
      ],
    },
    {
      name: 'menu.reporting',
      path: '/reporting',
      routes: [
        { name: 'menu.reporting.reports', path: '/reporting/reports', component: './reporting/reports' },
        { name: 'menu.reporting.templates', path: '/reporting/templates', component: './reporting/templates' },
        { name: 'menu.reporting.approval', path: '/reporting/approval', component: './reporting/approval' },
      ],
    },
    {
      name: 'menu.system',
      path: '/system',
      access: 'system_admin',
      routes: [
        { name: 'menu.system.users', path: '/system/users', component: './system/users' },
        { name: 'menu.system.roles', path: '/system/roles', component: './system/roles' },
        { name: 'menu.system.audit', path: '/system/audit', component: './system/audit' },
      ],
    },
  ],
});
