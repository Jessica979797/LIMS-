import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * 全局角色守卫：配合 @Roles 装饰器做路由级授权。
 * - @Public 接口：放行（防御性，与 JwtAuthGuard 一致）
 * - 无 @Roles 标注：放行（仅验登录即可）
 * - 有 @Roles：request.user.roles 命中任一要求角色即放行；
 *   含 system_admin 直接放行（超管通配）；否则 403。
 * 依赖 JwtAuthGuard 先执行并填充 request.user（{ id, username, roles }）。
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.roles || user.roles.length === 0) {
      throw new ForbiddenException('无权限访问该资源');
    }

    // 超管通配
    if (user.roles.includes('system_admin')) return true;

    const ok = requiredRoles.some((r: string) => user.roles.includes(r));
    if (!ok) {
      throw new ForbiddenException('当前角色无权执行此操作');
    }
    return true;
  }
}
