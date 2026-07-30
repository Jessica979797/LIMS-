import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateTestMethodDto,
  UpdateTestMethodDto,
  QueryTestMethodDto,
} from './dto/test-method.dto';

@Injectable()
export class TestMethodService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryTestMethodDto) {
    const { keyword, testItemId } = query;
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where = {
      ...(testItemId && { testItemId }),
      ...(keyword && {
        OR: [
          { code: { contains: keyword } },
          { name: { contains: keyword } },
        ],
      }),
    };
    const [list, total] = await Promise.all([
      this.prisma.testMethod.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          testItem: { select: { id: true, name: true, code: true } },
        },
      }),
      this.prisma.testMethod.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  findOne(id: string) {
    return this.prisma.testMethod.findUnique({
      where: { id },
      include: { testItem: true, equipment: true },
    });
  }

  create(data: CreateTestMethodDto) {
    return this.prisma.testMethod.create({ data });
  }

  update(id: string, data: UpdateTestMethodDto) {
    return this.prisma.testMethod.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.testMethod.delete({ where: { id } });
  }
}
