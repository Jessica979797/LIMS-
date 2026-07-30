import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateApplicationDto,
  UpdateApplicationDto,
  QueryApplicationDto,
} from './dto/application.dto';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryApplicationDto) {
    const { keyword, status, customerId } = query;
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where = {
      ...(status && { status }),
      ...(customerId && { customerId }),
      ...(keyword && {
        OR: [
          { applicationNo: { contains: keyword } },
          { customer: { name: { contains: keyword } } },
        ],
      }),
    };
    const [list, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, customerNo: true } },
          items: {
            include: {
              testItem: { select: { id: true, name: true, code: true } },
            },
          },
        },
      }),
      this.prisma.application.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  findOne(id: string) {
    return this.prisma.application.findUnique({
      where: { id },
      include: {
        customer: { include: { contacts: true } },
        items: { include: { testItem: true } },
      },
    });
  }

  async create(data: CreateApplicationDto) {
    const applicationNo = await this.generateApplicationNo();
    const { items, expectedDate, ...rest } = data;
    return this.prisma.application.create({
      data: {
        ...rest,
        applicationNo,
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        items: {
          create: items.map((it) => ({
            testItemId: it.testItemId,
            remark: it.remark,
          })),
        },
      },
      include: { items: { include: { testItem: true } } },
    });
  }

  async update(id: string, data: UpdateApplicationDto) {
    const { items, expectedDate, ...rest } = data;
    const updateData: any = { ...rest };
    if (expectedDate !== undefined) {
      updateData.expectedDate = expectedDate ? new Date(expectedDate) : null;
    }
    // 检测项子表：删除旧的重建
    if (items !== undefined) {
      await this.prisma.applicationItem.deleteMany({
        where: { applicationId: id },
      });
      updateData.items = {
        create: items.map((it) => ({
          testItemId: it.testItemId,
          remark: it.remark,
        })),
      };
    }
    return this.prisma.application.update({
      where: { id },
      data: updateData,
      include: { items: { include: { testItem: true } } },
    });
  }

  remove(id: string) {
    return this.prisma.application.delete({ where: { id } });
  }

  // 委托状态机：DRAFT->QUOTED->CONTRACTED->RECEIVED->TESTING->REPORTING->ISSUED->DELIVERED->ARCHIVED
  private static readonly APP_NEXT: Record<string, string> = {
    DRAFT: 'QUOTED',
    QUOTED: 'CONTRACTED',
    CONTRACTED: 'RECEIVED',
    RECEIVED: 'TESTING',
    TESTING: 'REPORTING',
    REPORTING: 'ISSUED',
    ISSUED: 'DELIVERED',
    DELIVERED: 'ARCHIVED',
  };

  async advance(id: string) {
    const exist = await this.prisma.application.findUnique({ where: { id } });
    if (!exist) throw new NotFoundException('委托不存在');
    const next = ApplicationService.APP_NEXT[exist.status];
    if (!next) {
      throw new BadRequestException(`状态 ${exist.status} 已是终态，无法推进`);
    }
    return this.prisma.application.update({
      where: { id },
      data: { status: next as any },
    });
  }

  // 委托单号：WT + 年份 + 4位流水，如 WT20260001
  private async generateApplicationNo() {
    const year = new Date().getFullYear();
    const prefix = `WT${year}`;
    const rows = await this.prisma.application.findMany({
      where: { applicationNo: { startsWith: prefix } },
      select: { applicationNo: true },
    });
    const maxSeq = rows.reduce((max, r) => {
      const seq = Number.parseInt(r.applicationNo.slice(prefix.length), 10) || 0;
      return Math.max(max, seq);
    }, 0);
    return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
  }
}
