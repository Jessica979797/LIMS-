import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateSampleDto,
  UpdateSampleDto,
  QuerySampleDto,
} from './dto/sample.dto';

@Injectable()
export class SampleService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QuerySampleDto) {
    const { keyword, status, applicationId } = query;
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where = {
      ...(status && { status }),
      ...(applicationId && { applicationId }),
      ...(keyword && {
        OR: [
          { sampleNo: { contains: keyword } },
          { name: { contains: keyword } },
          { application: { applicationNo: { contains: keyword } } },
        ],
      }),
    };
    const [list, total] = await Promise.all([
      this.prisma.sample.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { receivedAt: 'desc' },
        include: {
          application: { select: { id: true, applicationNo: true } },
        },
      }),
      this.prisma.sample.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  findOne(id: string) {
    return this.prisma.sample.findUnique({
      where: { id },
      include: {
        application: { select: { id: true, applicationNo: true } },
        testTasks: true,
      },
    });
  }

  async create(data: CreateSampleDto) {
    const sampleNo = await this.generateSampleNo();
    return this.prisma.sample.create({
      data: {
        ...data,
        sampleNo,
        quantity: data.quantity ?? 1,
      },
    });
  }

  update(id: string, data: UpdateSampleDto) {
    return this.prisma.sample.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.sample.delete({ where: { id } });
  }

  // 样品号：S + 年份 + 4位流水，如 S20260001
  private async generateSampleNo() {
    const year = new Date().getFullYear();
    const prefix = `S${year}`;
    const rows = await this.prisma.sample.findMany({
      where: { sampleNo: { startsWith: prefix } },
      select: { sampleNo: true },
    });
    const maxSeq = rows.reduce((max, r) => {
      const seq = Number.parseInt(r.sampleNo.slice(prefix.length), 10) || 0;
      return Math.max(max, seq);
    }, 0);
    return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
  }
}
