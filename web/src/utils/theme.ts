import { theme as antdTheme } from 'antd';

export type ThemeName = 'white' | 'black' | 'gray';

export const THEMES: { value: ThemeName; labelId: string }[] = [
  { value: 'white', labelId: 'theme.white' },
  { value: 'black', labelId: 'theme.black' },
  { value: 'gray', labelId: 'theme.gray' },
];

/** 主题无关的基础令牌：主色、圆角、字体（试剂色在所有主题下保持一致） */
const BASE_TOKEN = {
  colorPrimary: '#2B5FFF',
  colorInfo: '#2B5FFF',
  colorSuccess: '#16C79A',
  colorWarning: '#FFB020',
  colorError: '#FF5A5A',
  colorLink: '#2B5FFF',
  borderRadius: 10,
  borderRadiusLG: 14,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', system-ui, sans-serif",
  fontSize: 14,
};

const BASE_COMPONENTS = {
  Button: { controlHeight: 36, fontWeight: 500 },
  Menu: { itemBorderRadius: 8, itemHeight: 40 },
};

/**
 * 构建给定主题的 antd ConfigProvider.theme。
 * 黑用 darkAlgorithm；白/灰用 defaultAlgorithm。中性色按主题切换，试剂主色不变。
 */
export function buildAntdTheme(name: ThemeName) {
  if (name === 'black') {
    return {
      algorithm: antdTheme.darkAlgorithm,
      token: {
        ...BASE_TOKEN,
        colorBgLayout: '#0e1a24',
        colorText: '#e8edf2',
        colorTextSecondary: '#a8b4c0',
        colorBorder: 'rgba(255, 255, 255, 0.12)',
        colorBorderSecondary: 'rgba(255, 255, 255, 0.08)',
      },
      components: {
        ...BASE_COMPONENTS,
        Layout: { headerBg: '#16232f', bodyBg: '#0e1a24', siderBg: '#16232f' },
        Table: { headerBg: '#16232f', rowHoverBg: 'rgba(43, 95, 255, 0.10)' },
      },
    };
  }
  if (name === 'gray') {
    return {
      algorithm: antdTheme.defaultAlgorithm,
      token: {
        ...BASE_TOKEN,
        colorBgLayout: '#f0f2f5',
        colorText: '#33373d',
        colorTextSecondary: '#5c6470',
        colorBorder: 'rgba(0, 0, 0, 0.10)',
        colorBorderSecondary: 'rgba(0, 0, 0, 0.06)',
      },
      components: {
        ...BASE_COMPONENTS,
        Layout: { headerBg: '#ffffff', bodyBg: '#f0f2f5', siderBg: '#ffffff' },
        Table: { headerBg: '#f0f2f5', rowHoverBg: 'rgba(43, 95, 255, 0.04)' },
      },
    };
  }
  // white（与 .umirc.ts 静态配置一致）
  return {
    algorithm: antdTheme.defaultAlgorithm,
    token: {
      ...BASE_TOKEN,
      colorBgLayout: '#FAFBF7',
      colorText: '#0E1A24',
      colorTextSecondary: '#4A5A66',
      colorBorder: 'rgba(14, 26, 36, 0.12)',
      colorBorderSecondary: 'rgba(14, 26, 36, 0.08)',
    },
    components: {
      ...BASE_COMPONENTS,
      Layout: { headerBg: '#FFFFFF', bodyBg: '#FAFBF7', siderBg: '#FFFFFF' },
      Table: { headerBg: '#FAFBF7', rowHoverBg: 'rgba(43, 95, 255, 0.03)' },
    },
  };
}
