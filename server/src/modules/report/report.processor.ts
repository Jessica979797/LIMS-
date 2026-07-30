import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ReportService } from './report.service';
import { REPORT_QUEUE } from './report.constants';

/**
 * 报告生成队列消费者：从 Redis 拉取生成任务，调用 ReportService.generateSync 出 PDF。
 */
@Processor(REPORT_QUEUE)
export class ReportProcessor extends WorkerHost {
  private readonly logger = new Logger(ReportProcessor.name);

  constructor(private readonly reportService: ReportService) {
    super();
  }

  async process(job: Job<{ id: string }>) {
    const { id } = job.data;
    this.logger.log(`开始生成报告 reportId=${id}, job=${job.id}`);
    const result = await this.reportService.generateSync(id);
    this.logger.log(`报告生成完成 reportId=${id}: ${result.fileUrl}`);
    return result;
  }
}
