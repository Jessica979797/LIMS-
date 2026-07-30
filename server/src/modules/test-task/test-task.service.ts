import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateTestTaskDto,
  UpdateTestTaskDto,
  QueryTestTaskDto,
} from './dto/test-task.dto';

@Injectable()
export class TestTaskService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryTestTaskDto) {
    const { keyword, status, sampleId, assignedToId } = query;
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where = {
      ...(status && { status }),
      ...(sampleId && { sampleId }),
      ...(assignedToId && { assignedToId }),
      ...(keyword && {
        OR: [
          { taskNo: { contains: keyword } },
          { sample: { sampleNo: { contains: keyword } } },
          { testItem: { name: { contains: keyword } } },
        ],
      }),
    };
    const [list, total] = await Promise.all([
      this.prisma.testTask.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          sample: { select: { id: true, sampleNo: true, name: true } },
          testItem: { select: { id: true, name: true, code: true } },
          assignedTo: { select: { id: true, name: true } },
        },
      }),
      this.prisma.testTask.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  findOne(id: string) {
    return this.prisma.testTask.findUnique({
      where: { id },
      include: {
        sample: true,
        testItem: true,
        method: true,
        equipment: true,
        assignedTo: { select: { id: true, name: true } },
        results: true,
      },
    });
  }

  async create(data: CreateTestTaskDto) {
    const taskNo = await this.generateTaskNo();
    const sample = await this.prisma.sample.findUnique({
      where: { id: data.sampleId },
    });
    if (!sample) throw new NotFoundException('样品不存在');
    // applicationId 从样品冗余带入；有检测员则直接已分配
    return this.prisma.testTask.create({
      data: {
        ...data,
        taskNo,
        applicationId: sample.applicationId,
        status: data.assignedToId ? 'ASSIGNED' : 'PENDING',
        assignedAt: data.assignedToId ? new Date() : null,
      },
      include: { sample: true, testItem: true, assignedTo: true },
    });
  }

  async update(id: string, data: UpdateTestTaskDto) {
    const updateData: any = { ...data };
    // 首次分配检测员：记分配时间、状态置已分配
    if (data.assignedToId !== undefined) {
      const exist = await this.prisma.testTask.findUnique({ where: { id } });
      if (data.assignedToId && !exist?.assignedToId) {
        updateData.assignedAt = new Date();
        if (!exist || exist.status === 'PENDING') {
          updateData.status = 'ASSIGNED';
        }
      }
    }
    return this.prisma.testTask.update({
      where: { id },
      data: updateData,
      include: { sample: true, testItem: true, assignedTo: true },
    });
  }

  remove(id: string) {
    return this.prisma.testTask.delete({ where: { id } });
  }

  // 任务状态机：PENDING->ASSIGNED->TESTING->REVIEW->COMPLETED->JUDGED
  private static readonly TASK_NEXT: Record<string, string> = {
    PENDING: 'ASSIGNED',
    ASSIGNED: 'TESTING',
    TESTING: 'REVIEW',
    REVIEW: 'COMPLETED',
    COMPLETED: 'JUDGED',
  };

  async advance(id: string) {
    const exist = await this.prisma.testTask.findUnique({ where: { id } });
    if (!exist) throw new NotFoundException('任务不存在');
    const next = TestTaskService.TASK_NEXT[exist.status];
    if (!next) {
      throw new BadRequestException(`状态 ${exist.status} 已是终态，无法推进`);
    }
    // PENDING 推进到 ASSIGNED 前必须有检测员
    if (exist.status === 'PENDING' && !exist.assignedToId) {
      throw new BadRequestException('请先分配检测员再推进');
    }
    const data: any = { status: next };
    if (exist.status === 'ASSIGNED' && next === 'TESTING') {
      data.startedAt = new Date();
    }
    if (exist.status === 'REVIEW' && next === 'COMPLETED') {
      data.completedAt = new Date();
    }
    return this.prisma.testTask.update({ where: { id }, data });
  }

  // 任务号：T + 年份 + 4位流水，如 T20260001
  private async generateTaskNo() {
    const year = new Date().getFullYear();
    const prefix = `T${year}`;
    const rows = await this.prisma.testTask.findMany({
      where: { taskNo: { startsWith: prefix } },
      select: { taskNo: true },
    });
    const maxSeq = rows.reduce((max, r) => {
      const seq = Number.parseInt(r.taskNo.slice(prefix.length), 10) || 0;
      return Math.max(max, seq);
    }, 0);
    return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
  }
}
