import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { tmpdir } from 'os';
import { join } from 'path';
import { findBrowserPath } from './browser.resolver';

/**
 * PDF 生成服务：用系统已安装的 Chromium 内核浏览器（puppeteer-core）
 * 把 HTML 字符串渲染为 A4 PDF。
 *
 * 注：puppeteer-core 25 为 ESM 包，CJS 项目中用动态 import() 加载，
 * 且不静态 import 其类型（verbatimModuleSyntax 下会报 TS1479），browser 用 any。
 */
@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private readonly executablePath: string;

  constructor(private configService: ConfigService) {
    this.executablePath = findBrowserPath(configService);
    this.logger.log(`PDF 浏览器: ${this.executablePath}`);
  }

  async htmlToPdf(html: string): Promise<Buffer> {
    let browser: any;
    try {
      const { launch } = await import('puppeteer-core');
      browser = await launch({
        headless: true,
        executablePath: this.executablePath,
        // 显式 userDataDir 到系统临时目录，避免浏览器在项目目录写文件触发 watch 重编译
        userDataDir: join(tmpdir(), 'lims-edge-profile'),
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      // setContent 直接渲染 HTML 字符串，无需起静态服务
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '16mm', bottom: '16mm', left: '14mm', right: '14mm' },
      });
      return Buffer.from(pdf);
    } finally {
      if (browser) await browser.close();
    }
  }
}
