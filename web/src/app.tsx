import { useEffect } from 'react';
import {
  RunTimeLayoutConfig,
  history,
  useIntl,
  getLocale,
  setLocale,
  useAntdConfigSetter,
} from '@umijs/max';
import { Avatar, Button, Dropdown, message, Space } from 'antd';
import { BgColorsOutlined, GlobalOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/de';
import { auth } from '@/utils/auth';
import { buildAntdTheme, THEMES, type ThemeName } from '@/utils/theme';

const LOGIN_PATH = '/login';
const THEME_STORAGE_KEY = 'lims-theme';

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

// 运行时初始状态：当前用户 + 主题（启动即设 data-theme，防闪烁）
export async function getInitialState() {
  const currentUser = await fetchCurrentUser();
  const theme =
    (localStorage.getItem(THEME_STORAGE_KEY) as ThemeName) || 'white';
  document.documentElement.dataset.theme = theme;
  return { currentUser, theme };
}

/** 顶栏右侧：主题切换 + 语言切换 + 用户头像/退出。 */
function HeaderActions({ initialState, setInitialState }: any) {
  const { formatMessage } = useIntl();
  const setAntdConfig = useAntdConfigSetter();
  const locale = getLocale();
  const theme = (initialState?.theme as ThemeName) || 'white';

  useEffect(() => {
    dayjs.locale(DAYJS_LOCALE[locale] || 'en');
  }, [locale]);

  // 主题变化时：合并更新 antd ConfigProvider.theme（保留 locale 等其它 props）+ 切 CSS 变量。
  // 注意：setAntdConfig 由 Umi 在每次 AntdProvider 渲染时重建（非稳定引用），不可放入依赖，
  // 否则 effect->setState->重渲染->引用变->effect 的无限循环会导致白屏。
  useEffect(() => {
    setAntdConfig((prev: any) => ({
      ...prev,
      theme: buildAntdTheme(theme),
    }));
    document.documentElement.dataset.theme = theme;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  const handleThemeChange = (t: ThemeName) => {
    localStorage.setItem(THEME_STORAGE_KEY, t);
    setInitialState?.((s: any) => ({ ...s, theme: t }));
  };

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
  const currentThemeLabel =
    THEMES.find((t) => t.value === theme)?.labelId || 'theme.white';

  return (
    <Space size={12} style={{ paddingRight: 12 }}>
      <Dropdown
        menu={{
          items: THEMES.map((t) => ({
            key: t.value,
            label: formatMessage({ id: t.labelId }),
          })),
          selectedKeys: [theme],
          onClick: ({ key }) => handleThemeChange(key as ThemeName),
        }}
      >
        <Button
          type="text"
          size="small"
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <BgColorsOutlined />
          {formatMessage({ id: currentThemeLabel })}
        </Button>
      </Dropdown>
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

  // 菜单 i18n：ProLayout 翻译用 item.locale 字段（非 item.name）。UmiJS 只设了 name，
  // 这里给每个菜单项补 locale = name（= 路由 name = i18n 键），配合 menu.locale:true，
  // ProLayout 用其 formatMessage（随语言切换）翻译菜单名。
  const withLocale = (list?: any[]): any[] =>
    (list || []).map((item: any) => {
      const next: any = { ...item, locale: item.name };
      if (next.children?.length) next.children = withLocale(next.children);
      if (next.routes?.length) next.routes = withLocale(next.routes);
      return next;
    });

  return {
    title: 'LIMS',
    menu: { locale: true },
    menuDataRender: (menuData: any[]) => withLocale(menuData),
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
