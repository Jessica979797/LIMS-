import { RunTimeLayoutConfig, history, RequestConfig } from '@umijs/max';
import { Dropdown, message } from 'antd';
import { auth } from '@/utils/auth';

const LOGIN_PATH = '/login';

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

// 布局运行时配置：头像下拉(退出登录) + 路由守卫
export const layout: RunTimeLayoutConfig = (props: any) => {
  const { initialState, setInitialState } = props || {};
  return {
    title: 'LIMS 检测系统',
    avatarProps: {
      title: initialState?.currentUser?.name,
      size: 'small',
      render: (_: any, dom: any) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'logout',
                label: '退出登录',
                onClick: async () => {
                  auth.clear();
                  await setInitialState?.((s: any) => ({
                    ...s,
                    currentUser: undefined,
                  }));
                  message.success('已退出登录');
                  history.push(LOGIN_PATH);
                },
              },
            ],
          }}
        >
          {dom}
        </Dropdown>
      ),
    },
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
