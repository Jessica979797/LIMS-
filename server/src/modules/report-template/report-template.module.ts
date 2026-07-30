import { Module } from '@nestjs/common';
import { ReportTemplateService } from './report-template.service';
import { ReportTemplateController } from './report-template.controller';

@Module({
  providers: [ReportTemplateService],
  controllers: [ReportTemplateController],
  exports: [ReportTemplateService],
})
export class ReportTemplateModule {}
