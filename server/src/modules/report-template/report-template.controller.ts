import { Controller, Get, Post, Body } from '@nestjs/common';
import { ReportTemplateService } from './report-template.service';
import { CreateReportTemplateDto } from './dto/report-template.dto';

@Controller('report-templates')
export class ReportTemplateController {
  constructor(private svc: ReportTemplateService) {}

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Post()
  create(@Body() body: CreateReportTemplateDto) {
    return this.svc.create(body);
  }
}
