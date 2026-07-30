import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateReportTemplateDto } from './dto/report-template.dto';

@Injectable()
export class ReportTemplateService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.reportTemplate.findMany({
      orderBy: { category: 'asc' },
    });
  }

  create(data: CreateReportTemplateDto) {
    return this.prisma.reportTemplate.create({ data });
  }
}
