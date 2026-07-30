import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { QueryAuditLogDto } from './dto/audit-log.dto';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryAuditLogDto) {
    const { userId, entity, keyword } = query;
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where = {
      ...(userId && { userId }),
      ...(entity && { entity }),
      ...(keyword && {
        OR: [
          { entity: { contains: keyword } },
          { action: { contains: keyword } },
        ],
      }),
    };
    const [list, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  // 供其他 service/拦截器记录审计（后续接入）
  log(data: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    before?: any;
    after?: any;
    ip?: string;
  }) {
    return this.prisma.auditLog.create({ data });
  }
}
