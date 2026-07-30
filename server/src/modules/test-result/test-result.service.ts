import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateTestResultDto,
  UpdateTestResultDto,
  QueryTestResultDto,
} from './dto/test-result.dto';

@Injectable()
export class TestResultService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryTestResultDto) {
    const { keyword, conclusion, taskId } = query;
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where = {
      ...(conclusion && { conclusion }),
      ...(taskId && { taskId }),
      ...(keyword && {
        OR: [
          { value: { contains: keyword } },
          { task: { taskNo: { contains: keyword } } },
        ],
      }),
    };
    const [list, total] = await Promise.all([
      this.prisma.testResult.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          task: {
            select: {
              id: true,
              taskNo: true,
              testItem: { select: { id: true, name: true } },
            },
          },
        },
      }),
      this.prisma.testResult.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  findOne(id: string) {
    return this.prisma.testResult.findUnique({
      where: { id },
      include: {
        task: { include: { testItem: true, sample: true } },
      },
    });
  }

  // 录入人取当前登录用户
  async create(data: CreateTestResultDto, enteredById: string) {
    return this.prisma.testResult.create({
      data: {
        ...data,
        enteredById,
        enteredAt: new Date(),
      },
      include: { task: { include: { testItem: true } } },
    });
  }

  update(id: string, data: UpdateTestResultDto) {
    return this.prisma.testResult.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.testResult.delete({ where: { id } });
  }
}
