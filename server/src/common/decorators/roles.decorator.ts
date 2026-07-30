import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * 路由级角色控制：标注接口所需角色编码。
 * @Roles('report_approver') 或多角色 @Roles('cs_staff', 'cs_supervisor')
 * 未标注的接口仅验登录即可访问（RolesGuard 放行）。
 * system_admin 为超管，守卫中通配放行，无需逐一标注。
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
