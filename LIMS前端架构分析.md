# LIMS 前端架构分析

> 前端转全栈学习笔记 · React 18 + UmiJS 4 (@umijs/max) + Ant Design 5 + ProComponents + TypeScript · 2026-07-25

---

## 一、技术栈总览

| 技术 | 版本 | 作用 |
|---|---|---|
| React | 18.3 | UI 视图层 |
| @umijs/max | 4.6 | **企业级框架**(路由/构建/插件体系),类似 Next.js 但偏中后台 |
| antd | 5.20 | UI 组件库 |
| @ant-design/pro-components | 2.7 | 中后台场景组件(ProTable/ProForm/DrawerForm 等) |
| dayjs | 1.11 | 日期处理 |
| TypeScript | 5.6 | 类型系统 |

**关键认知**:`@umijs/max` 不是普通脚手架,而是**框架**。它提供路由、构建、请求、布局、权限、状态管理等一整套**插件化**能力。你写的是"配置 + 约定",框架帮你串起来。这和后端 NestJS 的"模块化 + 装配"思想完全一致。

---

## 二、目录结构

```
web/
├── .umirc.ts          // 框架配置(路由/proxy/插件开关)-- 类似后端 app.module
├── src/
│   ├── app.tsx        // 运行时配置(当前用户/布局/请求拦截)-- 框架约定入口
│   ├── access.ts      // 权限定义(access 函数)-- 类似后端 RolesGuard
│   ├── pages/         // 页面组件,按业务域分目录
│   │   ├── Dashboard/  ├── Login/
│   │   ├── cs/         (customers / applications / quotations)
│   │   ├── op/         (samples / tasks)
│   │   ├── lab/        (tasks / results / items / methods / equipment)
│   │   ├── reporting/  (reports / templates / approval)
│   │   └── system/     (users / roles / audit)
│   ├── services/      // API 封装,按域拆分(14 个文件)
│   ├── components/     // 公共组件(目前仅 PagePlaceholder)
│   └── utils/          // 工具(auth.ts token 存取)
```

**对照后端**:`pages/*` 对应后端 `modules/*/controller`,`services/*` 对应后端 `modules/*/service`,`.umirc.ts` 对应 `app.module.ts`。前后端按同样的业务域划分,这是全栈项目的默契。

---

## 三、三份核心配置(框架的"装配点")

UmiJS Max 的运行机制集中在三个文件,理解它们就懂了前端骨架:

### 1. `.umirc.ts` -- 静态配置(编译期)

```ts
export default defineConfig({
  antd: {},          // 启用 antd 插件
  model: {},         // 启用数据流插件(useModel)
  initialState: {},  // 启用初始状态插件(getInitialState)
  request: {},       // 启用请求插件
  access: {},        // 启用权限插件(★漏配会导致 useAccess is not a function)
  layout: { title: 'LIMS 检测系统' },
  proxy: { '/api': { target: 'http://localhost:3001', changeOrigin: true } },
  routes: [ /* 路由树,带菜单名 */ ],
});
```

> **坑点**:`access: {}` 必须显式开启,光建 `access.ts` 文件不够。这是你之前踩的坑。

### 2. `src/app.tsx` -- 运行时配置(运行期)

三个导出函数,框架在特定时机调用:

```ts
// ① 初始状态:应用启动时拉当前用户(类似后端的 onModuleInit)
export async function getInitialState() {
  const currentUser = await fetchCurrentUser();
  return { currentUser };
}

// ② 布局:头像下拉(退出登录)+ 路由守卫(onPageChange)
export const layout: RunTimeLayoutConfig = (props) => ({
  avatarProps: { /* 退出登录 */ },
  onPageChange: () => {
    if (!initialState?.currentUser && location.pathname !== '/login')
      history.push('/login');  // 未登录跳登录页
  },
});

// ③ 请求:拦截器(自动带 token)+ 错误处理(401 跳登录)
export const request: RequestConfig = {
  requestInterceptors: [(config) => {
    const token = auth.getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  }],
  errorConfig: { errorHandler: (error) => {
    if (error?.response?.status === 401) { auth.clear(); history.push('/login'); }
    throw error;
  }},
};
```

### 3. `src/access.ts` -- 权限定义

```ts
export default function access(initialState) {
  const roles = initialState?.currentUser?.roles ?? [];
  const has = (code) => roles.includes(code) || roles.includes('system_admin');
  return {
    system_admin: has('system_admin'),
    report_approver: has('report_approver'),
    // ... 各角色布尔
  };
}
```

框架把 `getInitialState` 的返回值传给 `access` 函数,生成权限对象,供 `useAccess` 和路由 `access` 字段使用。

> **对照后端**:这是前端的"授权层",对应后端 `RolesGuard`。但记住--前端权限只控显隐(体验),后端权限才拒请求(安全)。

---

## 四、一个页面的标准结构(ProTable + DrawerForm)

这是整个项目最核心的页面模式,几乎所有列表页都长这样。以客户管理为例:

```tsx
export default function Customers() {
  const actionRef = useRef<ActionType>();        // ProTable 实例引用(用于 reload)
  const [editing, setEditing] = useState(null);  // 当前编辑行
  const [drawerOpen, setDrawerOpen] = useState(false);
  const access = useAccess();                    // 拿权限对象

  const handleSubmit = async (values) => {       // 新增/编辑提交
    if (editing) await updateCustomer(editing.id, values);
    else await createCustomer(values);
    setDrawerOpen(false);
    actionRef.current?.reload();                 // 刷新表格
  };

  const columns: ProColumns<Customer>[] = [
    { title: '客户名称', dataIndex: 'name' },
    { title: '类型', dataIndex: 'type', valueType: 'select',
      fieldProps: { options: TYPE_OPTIONS } },
    {
      title: '操作', render: (_, r) => (
        <Space>
          {access.system_admin && <a onClick={() => handleEdit(r)}>编辑</a>}
          {access.system_admin && <Popconfirm onConfirm={() => handleDelete(r.id)}>
            <a>删除</a>
          </Popconfirm>}
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<Customer>
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}            // 搜索表单
        toolBarRender={() =>                        // 工具栏(新增按钮)
          access.system_admin ? [<Button onClick={handleAdd}>新增</Button>] : []
        }
        request={async (params) => {                // 拉数据(ProTable 自动管分页/搜索)
          const res = await getCustomers({ page: params.current, pageSize: params.pageSize, ... });
          return { data: res.list, success: true, total: res.total };
        }}
        columns={columns}
      />
      <DrawerForm                                    // 新增/编辑抽屉表单
        open={drawerOpen}
        onFinish={handleSubmit}
        initialValues={editing ?? {}}>
        <ProFormText name="name" label="客户名称" rules={[{ required: true }]} />
        <ProFormSelect name="type" label="类型" options={TYPE_OPTIONS} />
      </DrawerForm>
    </>
  );
}
```

**ProTable 的价值**:把"列表 + 搜索 + 分页 + 工具栏"打包,你只写 `columns` 和 `request`,它自动渲染搜索表单、分页器、刷新。省掉 70% 的列表页样板代码。

**DrawerForm 的价值**:新增和编辑共用一个抽屉,靠 `editing` 状态区分。`initialValues` 变化时自动填充。

> **对照后端**:ProTable 的 `request` 对应后端 `findAll`(分页查询),`handleSubmit` 对应 `create`/`update`。前端 actionRef.reload() 触发后端重新查询。

---

## 五、数据请求层(services/)

每个业务域一个 service 文件,封装该域所有 API 调用:

```ts
// services/report.ts
import { request } from '@umijs/max';
import { auth } from '@/utils/auth';

export async function getReports(params: ReportQuery) {
  return request<ReportListResult>('/api/reports', { params });  // GET
}
export async function createReport(data: any) {
  return request('/api/reports', { method: 'POST', data });      // POST
}
export async function generateReport(id: string) {
  return request<{ jobId: string }>(`/api/reports/${id}/generate`, { method: 'POST' });
}

// 下载(需 blob,绕过 request 封装,直接 fetch)
export async function downloadReport(id: string) {
  const token = auth.getToken();
  const res = await fetch(`/api/reports/${id}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const blob = await res.blob();
  // 创建临时 <a> 触发下载
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `report-${id}.pdf`; a.click();
  URL.revokeObjectURL(url);
}
```

**要点**:
- `request` 是 `@umijs/max` 封装的(基于 umi-request),自动走 `.umirc.ts` 的 `/api` 代理到后端 3001
- `request<T>` 带泛型,返回值有类型
- token 不用手动加--`app.tsx` 的 requestInterceptor 全局加了 Authorization
- **下载/上传**等需要 blob/formData 的场景,绕过 request 封装,直接用 `fetch`(但要手动带 token)

> **对照后端**:前端的 `services/*.ts` 就是后端 `controller` 的客户端镜像--一个端点对应一个函数。前后端接口契约靠 TS interface + 后端 DTO 共同保证。

---

## 六、认证流程(完整链路)

```
登录页提交
  │
  ├─ POST /api/auth/login  -> 返回 { accessToken, user }
  │
  ├─ auth.setToken(token)  存 localStorage(utils/auth.ts)
  │
  ├─ history.push('/dashboard')  跳主页
  │
  └─ getInitialState() 触发  -> GET /api/auth/profile  -> 返回 currentUser(含 roles)
                                │
                                └─ access() 计算 -> 生成权限对象
                                     │
                                     └─ useAccess() / 路由 access 字段可用

后续请求:
  requestInterceptor 自动带 Authorization: Bearer <token>

token 失效(401):
  errorHandler -> auth.clear() -> history.push('/login')
```

**关键设计**:token 存 localStorage(刷新页面不丢),但用户信息(currentUser/roles)放 initialState(内存,刷新重拉)。这样权限是实时的--后端改了角色,前端刷新就生效。

---

## 七、权限控制:菜单级 + 按钮级

### 菜单级(路由 access 字段)

`.umirc.ts` 路由配置加 `access` 字段,框架自动过滤菜单:

```ts
{
  name: '系统管理', path: '/system', access: 'system_admin',
  routes: [
    { name: '用户管理', path: '/system/users', component: './system/users' },
    ...
  ],
}
```

非 system_admin 用户看不到"系统管理"菜单组。

### 按钮级(useAccess hook)

```tsx
const access = useAccess();
{access.report_approver && <Button onClick={handleApprove}>批准签发</Button>}
{access.system_admin ? [<Button>新增</Button>] : []}
```

按角色显隐操作按钮。

> **对照后端**:菜单/按钮级权限 = 后端 `@Roles` 装饰器 + `RolesGuard`。但**前端权限可被绕过**(改浏览器代码),后端权限才是真防线。两者都要做,前端为体验,后端为安全。

---

## 八、ProComponents 的价值(为什么用它)

不用 ProComponents,一个列表页要手写:表格 + 搜索表单 + 分页 + 加载态 + 工具栏 + 列设置...几百行。用了 ProTable,几十行搞定,且交互统一。

| 组件 | 作用 | 省掉的工作 |
|---|---|---|
| ProTable | 列表 + 搜索 + 分页 + 工具栏 | 搜索表单、分页器、loading、刷新 |
| ProFormText/Select | 表单字段 + 校验 | 手写 antd Form.Item + rules |
| DrawerForm | 抽屉表单(新增/编辑共用) | 抽屉开关、表单提交、初始化 |
| Access | 权限包裹组件 | 手写 if 判断 + fallback |

**代价**:学习 ProComponents 的 API,且高度依赖其行为约定。但中后台场景收益巨大。

---

## 九、前后端架构对照(全栈视角)

| 维度 | 前端 | 后端 |
|---|---|---|
| 框架 | @umijs/max(插件化) | NestJS(模块化) |
| 装配点 | `.umirc.ts` + `app.tsx` | `app.module.ts` |
| 业务域划分 | `pages/*` + `services/*` | `modules/*` |
| 路由 | `.umirc.ts` routes | `@Controller` 装饰器 |
| 数据获取 | services/*.ts(request) | controller -> service -> prisma |
| 类型契约 | TS interface | DTO(class-validator) |
| 权限 | access.ts + useAccess | RolesGuard + @Roles |
| 认证 | localStorage token + 拦截器 | JWT + Passport + JwtAuthGuard |
| 拦截器 | requestInterceptors | AuditInterceptor(全局) |
| 状态 | initialState + useState | 数据库(唯一真相源) |

**核心差异**:前端状态是"内存中的视图镜像"(可丢可重建),后端状态是"持久化的真相"(丢不得)。前端校验为体验,后端校验为安全。

---

## 十、学习路径建议

1. **理解 UmiJS Max 的插件机制**:`.umirc.ts` 里每个 `xxx: {}` 开启一个插件(antd/model/initialState/request/access),对应 `app.tsx` 里的约定导出。这是框架的骨架
2. **吃透 ProTable**:`columns`/`request`/`search`/`toolBarRender` 四个核心配置,90% 的列表页靠它
3. **打通认证链路**:登录 -> token -> getInitialState -> access -> useAccess,这串是中后台权限的命脉
4. **对照后端学**:每个 service 函数找对应的后端 controller 端点,看请求怎么变成数据库操作
5. **加一个全链路功能**:从 schema 加字段 -> 后端 dto/service -> 前端 service -> 前端页面表单/列,走完一遍就是全栈

---

## 记忆要点

**前端运行时三件套**:`.umirc.ts`(静态配置)+ `app.tsx`(运行时配置:getInitialState/layout/request)+ `access.ts`(权限)

**页面标准模式**:ProTable(列表)+ DrawerForm(新增/编辑)+ useAccess(按钮权限)

**认证链路**:登录拿 token -> 存 localStorage -> 拦截器带 token -> getInitialState 拉用户 -> access 算权限 -> useAccess 控按钮

**全栈心法**:前端权限为体验(可绕过),后端权限为安全(真防线);前端状态是镜像(可重建),后端状态是真相(要持久)。
