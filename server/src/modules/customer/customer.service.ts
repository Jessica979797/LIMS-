import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  QueryCustomerDto,
} from './dto/customer.dto';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryCustomerDto) {
    const { keyword, type, status } = query;
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where = {
      ...(type && { type }),
      ...(status && { status }),
      ...(keyword && {
        OR: [
          { name: { contains: keyword } },
          { customerNo: { contains: keyword } },
        ],
      }),
    };
    const [list, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  findOne(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
      include: { contacts: true },
    });
  }

  async create(data: CreateCustomerDto) {
    const customerNo = await this.generateCustomerNo();
    return this.prisma.customer.create({
      data: { ...data, customerNo },
    });
  }

  update(id: string, data: UpdateCustomerDto) {
    return this.prisma.customer.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.customer.delete({ where: { id } });
  }

  // 客户编号：C + 年份 + 4位流水，如 C20260001
  private async generateCustomerNo() {
    const year = new Date().getFullYear();
    const prefix = `C${year}`;
    const rows = await this.prisma.customer.findMany({
      where: { customerNo: { startsWith: prefix } },
      select: { customerNo: true },
    });
    const maxSeq = rows.reduce((max, r) => {
      const seq = Number.parseInt(r.customerNo.slice(prefix.length), 10) || 0;
      return Math.max(max, seq);
    }, 0);
    return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
  }
}
