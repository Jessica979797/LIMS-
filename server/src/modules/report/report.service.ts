import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StorageService } from '../../common/storage/storage.service';
import { PdfService } from '../../common/pdf/pdf.service';
import {
  CreateReportDto,
  UpdateReportDto,
  QueryReportDto,
  SignoffDto,
} from './dto/report.dto';
import * as ejs from 'ejs';
import * as path from 'path';
import { readFile } from 'fs/promises';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { REPORT_QUEUE } from './report.constants';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);
  // 默认报告模板（开发期定位到源码路径；生产可配 REPORT_TEMPLATE_DIR 或随部署复制）
  private readonly defaultTemplatePath = path.join(
    process.cwd(),
    'src/modules/report/templates/default.ejs',
  );

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private pdf: PdfService,
    @InjectQueue(REPORT_QUEUE) private queue: Queue,
  ) {}

  async findAll(query: QueryReportDto) {
    const { keyword, status, applicationId } = query;
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where = {
      ...(status && { status }),
      ...(applicationId && { applicationId }),
      ...(keyword && {
        OR: [
          { reportNo: { contains: keyword } },
          { application: { applicationNo: { contains: keyword } } },
        ],
      }),
    };
    const [list, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          application: { select: { id: true, applicationNo: true } },
        },
      }),
      this.prisma.report.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  findOne(id: string) {
    return this.prisma.report.findUnique({
      where: { id },
      include: {
        application: {
          include: { customer: { select: { id: true, name: true } } },
        },
        template: true,
        signoffs: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' },
        },
        versions: { orderBy: { version: 'desc' } },
      },
    });
  }

  async create(data: CreateReportDto) {
    const reportNo = await this.generateReportNo();
    return this.prisma.report.create({
      data: { ...data, reportNo, status: 'DRAFT', version: 1 },
    });
  }

  async update(id: string, data: UpdateReportDto) {
    const exist = await this.prisma.report.findUnique({ where: { id } });
    if (!exist) throw new NotFoundException('报告不存在');
    if (exist.status === 'ISSUED' || exist.status === 'VOID') {
      throw new BadRequestException('已签发/作废报告不可修改');
    }
    return this.prisma.report.update({ where: { id }, data });
  }

  async remove(id: string) {
    const exist = await this.prisma.report.findUnique({ where: { id } });
    if (!exist) throw new NotFoundException('报告不存在');
    if (exist.status !== 'DRAFT') {
      throw new BadRequestException('仅草稿状态可删除');
    }
    return this.prisma.report.delete({ where: { id } });
  }

  // 编制完成 -> 待审核
  async prepare(id: string, userId: string, dto: SignoffDto) {
    const exist = await this.prisma.report.findUnique({ where: { id } });
    if (!exist) throw new NotFoundException('报告不存在');
    if (exist.status !== 'DRAFT') {
      throw new BadRequestException('仅草稿状态可提交编制');
    }
    const now = new Date();
    return this.prisma.report.update({
      where: { id },
      data: {
        status: 'REVIEW',
        preparedById: userId,
        preparedAt: now,
        signoffs: {
          create: {
            step: 'PREPARE',
            userId,
            signed: true,
            comment: dto.comment,
            signedAt: now,
          },
        },
      },
    });
  }

  // 审核通过 -> 待批准
  async review(id: string, userId: string, dto: SignoffDto) {
    const exist = await this.prisma.report.findUnique({ where: { id } });
    if (!exist) throw new NotFoundException('报告不存在');
    if (exist.status !== 'REVIEW') {
      throw new BadRequestException('仅待审核状态可审核');
    }
    const now = new Date();
    return this.prisma.report.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedById: userId,
        reviewedAt: now,
        signoffs: {
          create: {
            step: 'REVIEW',
            userId,
            signed: true,
            comment: dto.comment,
            signedAt: now,
          },
        },
      },
    });
  }

  // 批准签发 -> 已签发(锁定)
  async approve(id: string, userId: string, dto: SignoffDto) {
    const exist = await this.prisma.report.findUnique({ where: { id } });
    if (!exist) throw new NotFoundException('报告不存在');
    if (exist.status !== 'APPROVED') {
      throw new BadRequestException('仅待批准状态可批准');
    }
    const now = new Date();
    return this.prisma.report.update({
      where: { id },
      data: {
        status: 'ISSUED',
        approvedById: userId,
        approvedAt: now,
        issuedAt: now,
        signoffs: {
          create: {
            step: 'APPROVE',
            userId,
            signed: true,
            comment: dto.comment,
            signedAt: now,
          },
        },
      },
    });
  }

  // ===========================================================================
  // 报告生成（HTML 模板 + Puppeteer 出 PDF，同步）
  // ===========================================================================

  // 入队报告生成任务（异步），立即返回 jobId
  async generate(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!report) throw new NotFoundException('报告不存在');
    if (report.status === 'ISSUED' || report.status === 'VOID') {
      throw new BadRequestException('已签发/作废报告不可重新生成');
    }
    // jobId 带时间戳，支持同一报告多次重新生成
    const job = await this.queue.add(
      'generate',
      { id },
      { jobId: `${id}-${Date.now()}` },
    );
    this.logger.log(`报告生成已入队 reportId=${id}, jobId=${job.id}`);
    return { jobId: job.id, status: 'queued' };
  }

  // 查询生成任务状态（供前端轮询）
  async getGenerationStatus(id: string, jobId: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      select: { fileUrl: true, status: true },
    });
    if (!report) throw new NotFoundException('报告不存在');
    const job = await this.queue.getJob(jobId);
    let state = 'unknown';
    if (job) {
      state = await job.getState();
    }
    // job 已不在队列（被清理或从未入队）但 fileUrl 存在 -> 视为完成
    if (state === 'unknown' && report.fileUrl) state = 'completed';
    return { state, fileUrl: report.fileUrl, reportStatus: report.status };
  }

  // 实际生成逻辑（由队列 processor 调用）
  async generateSync(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        application: { include: { customer: true } },
        signoffs: {
          include: { user: { select: { id: true, name: true } } },
        },
        template: true,
      },
    });
    if (!report) throw new NotFoundException('报告不存在');

    try {
      const data = await this.buildReportData(report);

      // 选模板：自定义模板优先，否则默认 ejs
      let templateStr: string;
      if (report.template?.fileUrl && this.storage.exists(report.template.fileUrl)) {
        templateStr = await readFile(
          this.storage.resolvePath(report.template.fileUrl),
          'utf8',
        );
      } else {
        templateStr = await readFile(this.defaultTemplatePath, 'utf8');
      }
      const html = ejs.render(templateStr, data);
      const pdfBuffer = await this.pdf.htmlToPdf(html);

      const filename = `${report.reportNo}_v${report.version}_${Date.now()}.pdf`;
      const fileUrl = await this.storage.save(pdfBuffer, 'reports', filename);

      // 更新报告文件路径 + 写版本快照（保留每次生成的数据与文件）
      await this.prisma.report.update({ where: { id }, data: { fileUrl } });
      await this.prisma.reportVersion.create({
        data: {
          reportId: id,
          version: report.version,
          content: data as any,
          fileUrl,
        },
      });

      this.logger.log(`报告 ${report.reportNo} 生成 PDF: ${fileUrl}`);
      return { fileUrl, version: report.version };
    } catch (e: any) {
      this.logger.error(`报告生成失败: ${e?.stack || e}`);
      throw e;
    }
  }

  // 预览：返回渲染后的报告 HTML（不生成 PDF，供前端弹框预览）
  async previewHtml(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        application: { include: { customer: true } },
        signoffs: {
          include: { user: { select: { id: true, name: true } } },
        },
        template: true,
      },
    });
    if (!report) throw new NotFoundException('报告不存在');

    const data = await this.buildReportData(report);
    // 选模板：自定义模板优先，否则默认 ejs
    let templateStr: string;
    if (report.template?.fileUrl && this.storage.exists(report.template.fileUrl)) {
      templateStr = await readFile(
        this.storage.resolvePath(report.template.fileUrl),
        'utf8',
      );
    } else {
      templateStr = await readFile(this.defaultTemplatePath, 'utf8');
    }
    const html = ejs.render(templateStr, data);
    return { html };
  }

  // 返回文件流供控制器下载
  streamReport(id: string) {
    return this.prisma.report
      .findUnique({ where: { id }, select: { fileUrl: true } })
      .then((r) => {
        if (!r?.fileUrl) throw new NotFoundException('报告尚未生成文件');
        if (!this.storage.exists(r.fileUrl)) {
          throw new NotFoundException('报告文件不存在');
        }
        return {
          stream: this.storage.readStream(r.fileUrl),
          filename: path.basename(r.fileUrl),
        };
      });
  }

  // 组装模板变量：从委托单拉全链数据
  private async buildReportData(report: any) {
    const app = await this.prisma.application.findUnique({
      where: { id: report.applicationId },
      include: {
        customer: { select: { id: true, name: true } },
        samples: {
          select: {
            sampleNo: true,
            name: true,
            model: true,
            batchNo: true,
            manufacturer: true,
            quantity: true,
            unit: true,
          },
        },
        testTasks: {
          include: {
            testItem: { select: { name: true, unit: true } },
            method: { select: { name: true, standard: true } },
            results: {
              select: { value: true, unit: true, limit: true, conclusion: true },
            },
          },
        },
      },
    });
    if (!app) throw new NotFoundException('委托单不存在');

    const results = (app.testTasks || []).flatMap((t: any) =>
      (t.results || []).map((r: any) => ({
        itemName: t.testItem?.name ?? '-',
        method: t.method?.name ?? '',
        value: r.value ?? '',
        unit: r.unit ?? '',
        limit: r.limit ?? '',
        conclusion: this.conclusionLabel(r.conclusion),
      })),
    );

    // 三级签发栏
    const signoffs: any = { prepare: {}, review: {}, approve: {} };
    for (const s of report.signoffs || []) {
      const key = String(s.step).toLowerCase();
      if (signoffs[key]) {
        signoffs[key] = {
          name: s.user?.name ?? '',
          at: s.signedAt ? this.fmtDate(s.signedAt) : '',
        };
      }
    }

    return {
      reportNo: report.reportNo,
      version: report.version,
      applicationNo: app.applicationNo,
      category: app.category ?? '',
      customerName: app.customer?.name ?? '-',
      issuedAt: report.issuedAt ? this.fmtDate(report.issuedAt) : '',
      conclusion: report.conclusion ?? '',
      samples: (app.samples || []).map((s: any) => ({ ...s })),
      results,
      signoffs,
    };
  }

  private conclusionLabel(c: string | null | undefined): string {
    switch (c) {
      case 'PASS':
        return '合格';
      case 'FAIL':
        return '不合格';
      case 'PENDING':
        return '待判定';
      default:
        return c ?? '-';
    }
  }

  private fmtDate(d: Date | string): string {
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // 报告号：R + 年份 + 4位流水，如 R20260001
  private async generateReportNo() {
    const year = new Date().getFullYear();
    const prefix = `R${year}`;
    const rows = await this.prisma.report.findMany({
      where: { reportNo: { startsWith: prefix } },
      select: { reportNo: true },
    });
    const maxSeq = rows.reduce((max, r) => {
      const seq = Number.parseInt(r.reportNo.slice(prefix.length), 10) || 0;
      return Math.max(max, seq);
    }, 0);
    return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
  }
}
