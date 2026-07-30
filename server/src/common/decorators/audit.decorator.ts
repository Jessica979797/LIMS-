import { SetMetadata } from '@nestjs/common';

export const AUDIT_KEY = 'audit';

export interface AuditOptions {
  // 实体名，覆盖从 Controller 类名的自动推断（如 CustomerController -> Customer）
  entity?: string;
  // 动作名，覆盖从 HTTP 方法的自动推断（POST->CREATE / PUT|PATCH->UPDATE / DELETE->DELETE）
  action?: string;
  // 标记跳过审计（如内部统计接口）
  ignore?: boolean;
}

// 标注接口审计元数据；不标注时全局拦截器按约定自动推断 entity 与 action
export const Audit = (options: AuditOptions = {}) => SetMetadata(AUDIT_KEY, options);
