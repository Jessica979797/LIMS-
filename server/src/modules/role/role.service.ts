import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  QueryRoleDto,
} from './dto/role.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryRoleDto) {
    const { keyword } = query;
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where = keyword
      ? {
          OR: [
            { name: { contains: keyword } },
            { code: { contains: keyword } },
          ],
        }
      : {};
    const [list, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.role.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  findOne(id: string) {
    return this.prisma.role.findUnique({
      where: { id },
      include: {
        users: { include: { user: { select: { id: true, name: true } } } },
      },
    });
  }

  create(data: CreateRoleDto) {
    return this.prisma.role.create({ data });
  }

  update(id: string, data: UpdateRoleDto) {
    return this.prisma.role.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.role.delete({ where: { id } });
  }
}
