import { existsSync } from 'fs';
import { ConfigService } from '@nestjs/config';

// 候选浏览器路径：Windows Edge/Chrome 常见安装位置 + Linux 常见路径
const CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];

/**
 * 定位可用的 Chromium 内核浏览器可执行文件。
 * 优先环境变量 PUPPETEER_EXECUTABLE_PATH，其次候选路径，找不到抛清晰错误。
 */
export function findBrowserPath(configService?: ConfigService): string {
  const envPath = configService?.get<string>('PUPPETEER_EXECUTABLE_PATH');
  if (envPath && existsSync(envPath)) return envPath;

  for (const p of CANDIDATES) {
    if (existsSync(p)) return p;
  }
  throw new Error(
    '未找到可用的 Chromium 内核浏览器（Edge/Chrome）。请在 .env 设置 PUPPETEER_EXECUTABLE_PATH 指向浏览器可执行文件。',
  );
}
