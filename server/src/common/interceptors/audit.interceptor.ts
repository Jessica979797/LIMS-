import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../../modules/audit-log/audit-log.service';
import { AUDIT_KEY, AuditOptions } from '../decorators/audit.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

// HTTP 方法 -> 默认动作（GET 不审计）
const METHOD_ACTION: Record<string, string> = {
  POST: 'CREATE',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE',
};

// after 快照体积上限：超出则只记摘要，避免把列表/大 JSON 写进审计表
const AFTER_MAX_KEYS = 50;

/**
 * 全局审计拦截器：对所有写操作（POST/PUT/PATCH/DELETE）自动记录审计日志，
 * 满足 ISO/IEC 17025 可追溯要求。
 *
 * - entity：取 @Audit 元数据，否则按 Controller 类名推断（CustomerController -> Customer）
 * - action：取 @Audit 元数据，否则按 HTTP 方法推断
 * - before：UPDATE/DELETE/STATUS_CHANGE 且能拿到 id 时，在 handler 执行前查当前快照
 * - after：handler 返回值（列表只记条数，超大对象截断）
 * - 写入失败不阻塞响应（fire-and-forget）
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();
    const method: string = (req.method || '').toUpperCase();

    // GET / HEAD / OPTIONS 等不审计
    if (!METHOD_ACTION[method]) return next.handle();

    // @Public 接口（登录等）无登录态，跳过
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return next.handle();

    const options = this.reflector.getAllAndOverride<AuditOptions>(AUDIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (options?.ignore) return next.handle();

    const entity =
      options?.entity ?? context.getClass().name.replace(/Controller$/, '');
    const action = options?.action ?? METHOD_ACTION[method];
    const entityId: string | undefined = req.params?.id;
    const userId = req.user?.id;
    const ip = this.resolveIp(req);

    // before 快照：非 CREATE 且能拿到 id 时，在 handler 执行前查当前数据
    let before: any = undefined;
    if (entityId && action !== 'CREATE') {
      before = await this.safeFind(entity, entityId);
    }

    return next.handle().pipe(
      tap((result) => {
        const finalId = entityId || result?.id;
        this.auditLogService
          .log({
            userId,
            action,
            entity,
            entityId: finalId,
            before,
            after: this.sanitize(result),
            ip,
          })
          .catch((e) =>
            this.logger.error(`审计日志写入失败: ${e?.message ?? e}`),
          );
      }),
    );
  }

  // 按 entity 名定位 Prisma model（首字母小写），查 before 快照；失败返回 undefined
  private async safeFind(entity: string, id: string) {
    try {
      const model = entity.charAt(0).toLowerCase() + entity.slice(1);
      const delegate = (this.prisma as any)[model];
      if (!delegate?.findUnique) return undefined;
      return await delegate.findUnique({ where: { id } });
    } catch (e: any) {
      this.logger.warn(`before 快照查询失败 entity=${entity}: ${e?.message ?? e}`);
      return undefined;
    }
  }

  // 解析客户端 IP（优先代理转发头）
  private resolveIp(req: any): string | undefined {
    const xff = req.headers?.['x-forwarded-for'];
    if (typeof xff === 'string' && xff.length) return xff.split(',')[0].trim();
    return req.ip ?? undefined;
  }

  // 精简 after：列表记条数，超大对象截断键，避免审计表膨胀
  private sanitize(value: any): any {
    if (value == null) return undefined;
    if (Array.isArray(value)) return { _kind: 'array', count: value.length };
    if (value && typeof value === 'object' && !Buffer.isBuffer(value)) {
      const keys = Object.keys(value);
      if (keys.length > AFTER_MAX_KEYS) {
        return { _kind: 'truncated', keys: keys.slice(0, AFTER_MAX_KEYS) };
      }
    }
    return value;
  }
}
