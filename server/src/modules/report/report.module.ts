import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { ReportProcessor } from './report.processor';
import { REPORT_QUEUE } from './report.constants';
import { StorageModule } from '../../common/storage/storage.module';
import { PdfModule } from '../../common/pdf/pdf.module';

@Module({
  imports: [
    StorageModule,
    PdfModule,
    BullModule.registerQueue({ name: REPORT_QUEUE }),
  ],
  providers: [ReportService, ReportProcessor],
  controllers: [ReportController],
  exports: [ReportService],
})
export class ReportModule {}
