import { useEffect } from 'react';
import { RunTimeLayoutConfig, history, useIntl, getLocale, setLocale } from '@umijs/max';
import { Avatar, Button, Dropdown, message, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/de';
import { auth } from '@/utils/auth';

const LOGIN_PATH = '/login';

const LANGS = [
  { value: 'zh-CN', label: '中文', short: '中' },
  { value: 'en-US', label: 'English', short: 'EN' },
  { value: 'de-DE', label: 'Deutsch', short: 'DE' },
] as const;

const DAYJS_LOCALE: Record<string, string> = {
  'zh-CN': 'zh-cn',
  'en-US': 'en',
  'de-DE': 'de',
};

// 带 token 获取当前用户，失败则清 token
async function fetchCurrentUser() {
  const token = auth.getToken();
  if (!token) return undefined;
  try {
    const res = await fetch('/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      auth.clear();
      return undefined;
    }
    return await res.json();
  } catch {
    return undefined;
  }
}

// 运行时初始状态：当前用户
export async function getInitialState() {
  const currentUser = await fetchCurrentUser();
  return { currentUser };
}

/** 顶栏右侧：语言切换 + 用户头像/退出。用组件形式以合法使用 useIntl。 */
function HeaderActions({ initialState, setInitialState }: any) {
  const { formatMessage } = useIntl();
  const locale = getLocale();

  useEffect(() => {
    dayjs.locale(DAYJS_LOCALE[locale] || 'en');
  }, [locale]);

  const handleLogout = async () => {
    auth.clear();
    await setInitialState?.((s: any) => ({
      ...s,
      currentUser: undefined,
    }));
    message.success(formatMessage({ id: 'app.logoutSuccess' }));
    history.push(LOGIN_PATH);
  };

  const name = initialState?.currentUser?.name;

  return (
    <Space size={12} style={{ paddingRight: 12 }}>
      <Dropdown
        menu={{
          items: LANGS.map((l) => ({ key: l.value, label: l.label })),
          selectedKeys: [locale],
          onClick: ({ key }) => setLocale(key, false),
        }}
      >
        <Button
          type="text"
          size="small"
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <GlobalOutlined />
          {LANGS.find((l) => l.value === locale)?.short}
        </Button>
      </Dropdown>
      <Dropdown
        menu={{
          items: [
            {
              key: 'logout',
              label: formatMessage({ id: 'app.logout' }),
              onClick: handleLogout,
            },
          ],
        }}
      >
        <Space size={8} style={{ cursor: 'pointer' }}>
          <Avatar size="small">{name ? name[0] : ''}</Avatar>
          {name && <span style={{ fontSize: 14 }}>{name}</span>}
        </Space>
      </Dropdown>
    </Space>
  );
}

// 布局运行时配置：右侧操作 + 路由守卫
export const layout: RunTimeLayoutConfig = (props: any) => {
  const { initialState, setInitialState } = props || {};
  return {
    title: 'LIMS',
    rightContentRender: () => (
      <HeaderActions
        initialState={initialState}
        setInitialState={setInitialState}
      />
    ),
    onPageChange: () => {
      const { location } = history;
      if (location.pathname === LOGIN_PATH) return;
      // token 是同步写入 localStorage 的，登录后立即可用；
      // 若只看 currentUser（异步更新），history.push('/') 时守卫仍读到旧值 undefined，
      // 会把用户弹回 /login，表现为“要点两次登录才能进去”。
      if (!initialState?.currentUser && !auth.getToken()) {
        history.push(LOGIN_PATH);
      }
    },
  };
};

// 请求拦截：自动带 token；401 清 token 跳登录
export const request: RequestConfig = {
  requestInterceptors: [
    (config) => {
      const token = auth.getToken();
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return config;
    },
  ],
  errorConfig: {
    errorHandler: (error: any) => {
      if (error?.response?.status === 401) {
        auth.clear();
        if (history.location.pathname !== LOGIN_PATH) {
          history.push(LOGIN_PATH);
        }
      }
      throw error;
    },
  },
};
