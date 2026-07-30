// 访问控制：基于 currentUser.roles 判断各角色权限（与后端 RolesGuard 角色编码一致）
// system_admin 为超管，通配所有 access；其余角色按编码精确判断。
// 用法：<Access accessible={access.report_approver} fallback={null}>...</Access>
//       路由级：.umirc.ts 中给路由加 access: 'system_admin' 过滤菜单
export default function access(initialState: { currentUser?: { roles?: string[] } }) {
  const roles: string[] = initialState?.currentUser?.roles ?? [];
  const has = (code: string) =>
    roles.includes(code) || roles.includes('system_admin');

  return {
    system_admin: has('system_admin'),
    cs_staff: has('cs_staff'),
    cs_supervisor: has('cs_supervisor'),
    op_staff: has('op_staff'),
    op_supervisor: has('op_supervisor'),
    lab_tester: has('lab_tester'),
    lab_reviewer: has('lab_reviewer'),
    lab_supervisor: has('lab_supervisor'),
    report_preparer: has('report_preparer'),
    report_reviewer: has('report_reviewer'),
    report_approver: has('report_approver'),
  };
}
