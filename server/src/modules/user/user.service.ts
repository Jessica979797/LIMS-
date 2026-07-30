import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

// 默认角色编码体系（与 RolesGuard 配合，system_admin 为超管通配）
const DEFAULT_ROLES = [
  { name: '系统管理员', code: 'system_admin', module: 'SYSTEM' },
  { name: 'CS 专员', code: 'cs_staff', module: 'CS' },
  { name: 'CS 主管', code: 'cs_supervisor', module: 'CS' },
  { name: 'OP 专员', code: 'op_staff', module: 'OP' },
  { name: 'OP 主管', code: 'op_supervisor', module: 'OP' },
  { name: '检测员', code: 'lab_tester', module: 'LAB' },
  { name: '数据复核员', code: 'lab_reviewer', module: 'LAB' },
  { name: '实验室主管', code: 'lab_supervisor', module: 'LAB' },
  { name: '报告编制', code: 'report_preparer', module: 'REPORTING' },
  { name: '报告审核', code: 'report_reviewer', module: 'REPORTING' },
  { name: '报告批准', code: 'report_approver', module: 'REPORTING' },
] as const;

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) {}

  // 含密码，用于登录验证
  findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      include: { roles: { include: { role: true } } },
    });
  }

  // 不含密码，用于获取当前用户信息（roles 拍平为 code 数组，前端直接 includes）
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        roles: { select: { role: { select: { code: true, name: true } } } },
      },
    });
    if (!user) return null;
    const { roles, ...rest } = user;
    return { ...rest, roles: roles.map((ur) => ur.role.code) };
  }

  // 列表（不含密码），供选择检测员等下拉
  findAll() {
    return this.prisma.user.findMany({
      select: { id: true, username: true, name: true, status: true },
      orderBy: { name: 'asc' },
    });
  }

  async create(data: CreateUserDto) {
    const exist = await this.prisma.user.findUnique({
      where: { username: data.username },
    });
    if (exist) throw new BadRequestException('用户名已存在');
    const { password, ...rest } = data;
    const hashed = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { ...rest, password: hashed },
    });
  }

  async update(id: string, data: UpdateUserDto) {
    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    } else {
      delete updateData.password; // 不传密码则不改
    }
    return this.prisma.user.update({ where: { id }, data: updateData });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  // 启动时幂等种入默认角色编码体系（RBAC 守卫依赖）
  async ensureRoles() {
    for (const r of DEFAULT_ROLES) {
      const exist = await this.prisma.role.findUnique({
        where: { code: r.code },
      });
      if (!exist) {
        await this.prisma.role.create({
          data: { name: r.name, code: r.code, module: r.module as any },
        });
        this.logger.log(`角色已种入：${r.code}`);
      }
    }
  }

  // 启动时种入默认管理员（若不存在）
  async seedAdmin() {
    const exist = await this.prisma.user.findUnique({
      where: { username: 'admin' },
    });
    if (exist) return;

    let adminRole = await this.prisma.role.findUnique({
      where: { code: 'system_admin' },
    });
    if (!adminRole) {
      adminRole = await this.prisma.role.create({
        data: { name: '系统管理员', code: 'system_admin', module: 'SYSTEM' as any },
      });
    }

    const hashed = await bcrypt.hash('admin123', 10);
    await this.prisma.user.create({
      data: {
        username: 'admin',
        password: hashed,
        name: '系统管理员',
        roles: { create: { roleId: adminRole.id } },
      },
    });
    this.logger.log('默认管理员已创建：admin / admin123');
  }
}
