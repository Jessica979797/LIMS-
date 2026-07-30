import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateQuotationDto,
  UpdateQuotationDto,
  QueryQuotationDto,
} from './dto/quotation.dto';

@Injectable()
export class QuotationService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryQuotationDto) {
    const { keyword, status, customerId } = query;
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where = {
      ...(status && { status }),
      ...(customerId && { customerId }),
      ...(keyword && {
        OR: [
          { quotationNo: { contains: keyword } },
          { customer: { name: { contains: keyword } } },
        ],
      }),
    };
    const [list, total] = await Promise.all([
      this.prisma.quotation.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { id: true, name: true } } },
      }),
      this.prisma.quotation.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  findOne(id: string) {
    return this.prisma.quotation.findUnique({
      where: { id },
      include: { customer: true },
    });
  }

  async create(data: CreateQuotationDto) {
    const quotationNo = await this.generateQuotationNo();
    const { validUntil, totalAmount, ...rest } = data;
    return this.prisma.quotation.create({
      data: {
        ...rest,
        quotationNo,
        totalAmount: totalAmount ?? 0,
        validUntil: validUntil ? new Date(validUntil) : null,
      },
    });
  }

  async update(id: string, data: UpdateQuotationDto) {
    const { validUntil, ...rest } = data;
    const updateData: any = { ...rest };
    if (validUntil !== undefined) {
      updateData.validUntil = validUntil ? new Date(validUntil) : null;
    }
    return this.prisma.quotation.update({ where: { id }, data: updateData });
  }

  remove(id: string) {
    return this.prisma.quotation.delete({ where: { id } });
  }

  // 报价单号：Q + 年份 + 4位流水，如 Q20260001
  private async generateQuotationNo() {
    const year = new Date().getFullYear();
    const prefix = `Q${year}`;
    const rows = await this.prisma.quotation.findMany({
      where: { quotationNo: { startsWith: prefix } },
      select: { quotationNo: true },
    });
    const maxSeq = rows.reduce((max, r) => {
      const seq = Number.parseInt(r.quotationNo.slice(prefix.length), 10) || 0;
      return Math.max(max, seq);
    }, 0);
    return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
  }
}
