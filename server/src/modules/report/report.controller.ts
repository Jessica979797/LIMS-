import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  Res,
} from '@nestjs/common';
import { ReportService } from './report.service';
import {
  CreateReportDto,
  UpdateReportDto,
  QueryReportDto,
  SignoffDto,
} from './dto/report.dto';
import { Audit } from '../../common/decorators/audit.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('reports')
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Get()
  findAll(@Query() query: QueryReportDto) {
    return this.reportService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportService.findOne(id);
  }

  @Post()
  @Roles('report_preparer')
  create(@Body() body: CreateReportDto) {
    return this.reportService.create(body);
  }

  @Patch(':id')
  @Roles('report_preparer')
  update(@Param('id') id: string, @Body() body: UpdateReportDto) {
    return this.reportService.update(id, body);
  }

  @Delete(':id')
  @Roles('system_admin')
  remove(@Param('id') id: string) {
    return this.reportService.remove(id);
  }

  // 三级签发
  @Post(':id/prepare')
  @Roles('report_preparer')
  @Audit({ action: 'STATUS_CHANGE' })
  prepare(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: SignoffDto,
  ) {
    return this.reportService.prepare(id, req.user.id, dto);
  }

  @Post(':id/review')
  @Roles('report_reviewer')
  @Audit({ action: 'STATUS_CHANGE' })
  review(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: SignoffDto,
  ) {
    return this.reportService.review(id, req.user.id, dto);
  }

  @Post(':id/approve')
  @Roles('report_approver')
  @Audit({ action: 'STATUS_CHANGE' })
  approve(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: SignoffDto,
  ) {
    return this.reportService.approve(id, req.user.id, dto);
  }

  // 生成 PDF（入队 BullMQ 异步处理，立即返回 jobId）
  @Post(':id/generate')
  @Roles('report_preparer')
  @Audit({ action: 'UPDATE' })
  generate(@Param('id') id: string) {
    return this.reportService.generate(id);
  }

  // 预览报告 HTML（弹框预览，不生成 PDF）
  @Get(':id/preview')
  @Roles('report_preparer')
  preview(@Param('id') id: string) {
    return this.reportService.previewHtml(id);
  }

  // 查询生成状态（前端轮询）
  @Get(':id/generation-status')
  generationStatus(
    @Param('id') id: string,
    @Query('jobId') jobId: string,
  ) {
    return this.reportService.getGenerationStatus(id, jobId);
  }

  // 下载已生成的 PDF
  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: any) {
    const { stream, filename } = await this.reportService.streamReport(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(filename)}"`,
    );
    stream.pipe(res);
  }
}
