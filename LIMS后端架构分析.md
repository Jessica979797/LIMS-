# LIMS 后端架构分析

> 前端转全栈学习笔记 · NestJS 11 + Prisma 6 + TypeScript · 2026-07-25

---

## 一、总图:后端在干什么

前端是「用户界面 + 交互」,后端是「数据 + 业务规则 + 权限」。你的请求到了后端,要经历:

**认证(你是谁) → 授权(你能干这事吗) → 参数校验(数据对不对) → 业务逻辑(改数据) → 审计(记下你干了啥) → 返回**

NestJS 把这些环节拆成可插拔的零件,按固定顺序串起来。理解了这个顺序,后端就懂了一半。

---

## 二、目录结构 = 业务域划分

```
src/
├── main.ts                 // 启动入口(类似 web/src/main.tsx)
├── app.module.ts           // 根模块,组装所有子模块 + 全局守卫
├── common/                 // 跨模块复用的基础设施
│   ├── prisma/             // 数据库客户端
│   ├── decorators/         // @Public @Roles @Audit 装饰器
│   ├── guards/             // RolesGuard 角色守卫
│   ├── interceptors/       // AuditInterceptor 审计拦截器
│   ├── storage/            // 文件存储
│   └── pdf/                // PDF 生成
└── modules/                // 业务模块,每个一个域(对照前端 src/pages)
    ├── auth/               // 登录认证
    ├── customer/           // 客户(CS)
    ├── report/             // 报告(Reporting)
    └── ...                 // application / sample / test-task 等
```

每个业务模块内部是**固定四件套**:

```
modules/customer/
├── customer.module.ts      // 模块声明:把 controller/service/dto 装箱
├── customer.controller.ts  // 路由:接收 HTTP 请求,调 service
├── customer.service.ts     // 业务逻辑:操作数据库
└── dto/customer.dto.ts     // 数据校验:定义请求体结构 + 规则
```

> **类比**:Module = 前端功能目录;Controller = 路由 loader/action;Service = 自定义 hook 里的纯逻辑;DTO = zod schema + TS 类型二合一。

---

## 三、一个请求的完整生命周期(核心!)

以 `POST /api/reports/:id/approve`(批准签发报告)为例,走一遍:

```
HTTP 请求进来
  │
  1. 中间件(本项目无自定义,跳过)
  │
  2. JwtAuthGuard   ← 认证:解析 token,查用户,塞进 request.user
  │    (app.module.ts 全局注册,所有接口默认要登录)
  │
  3. RolesGuard     ← 授权:读 @Roles('report_approver'),检查 roles
  │    (system_admin 通配,不匹配抛 403)
  │
  4. AuditInterceptor(before) ← 审计前置:执行前查"变更前"快照
  │
  5. ValidationPipe ← 参数校验:用 SignoffDto 校验 body,剥离多余字段
  │    (main.ts 全局注册)
  │
  6. Controller.approve() ← 路由处理函数
  │    └─ 调 ReportService.approve(id, userId, dto)
  │
  7. Service.approve() ← 业务逻辑
  │    ├─ 查报告,校验状态必须是 APPROVED(状态机)
  │    ├─ prisma.report.update({ status: 'ISSUED', ... })
  │    └─ prisma.reportSignoff.create({ step: 'APPROVE', ... })
  │
  8. AuditInterceptor(after) ← 审计后置:拿返回值作"变更后"快照,写 AuditLog
  │
  9. 响应返回前端(JSON)
```

**这个顺序是 NestJS 固定的**:Guard → Interceptor(before) → Pipe → Handler → Interceptor(after)。背下来,以后看任何 NestJS 项目都通。

> **类比前端**:Guard 像 React Router 的 loader 里做鉴权;Interceptor 像 axios 拦截器(请求前/响应后);Pipe 像表单提交前的 validate。

---

## 四、NestJS 的灵魂:依赖注入(DI)

这是前端转后端最大的思维转变。看 ReportService 的构造函数:

```ts
constructor(
  private prisma: PrismaService,      // 不自己 new,框架塞进来
  private storage: StorageService,
  private pdf: PdfService,
  @InjectQueue(REPORT_QUEUE) private queue: Queue,
) {}
```

你**不 `new PrismaService()`**,只声明"我需要它",NestJS 在启动时自动创建实例并注入。好处:

- **单例**:全应用共享一个 PrismaService(连接池复用)
- **可替换**:测试时能注入 mock
- **解耦**:Service 不关心依赖怎么来的

> **类比**:像 React Context,但更系统化——不用层层 props 传递,框架按类型自动注入。

DI 的"装配"在 Module 里完成:

```ts
@Module({
  imports: [StorageModule, PdfModule, BullModule.registerQueue(...)],  // 引入别的模块
  providers: [ReportService, ReportProcessor],  // 声明本模块能提供什么
  controllers: [ReportController],
  exports: [ReportService],  // 别的模块能用我什么
})
```

`PrismaService` 在 `PrismaModule` 里标了 `@Global()`,所以全局不用每个模块都 import。

---

## 五、数据层:Prisma + schema.prisma

Prisma 是类型安全的数据库客户端。流程:**写 schema → prisma generate → 得到带类型的 client**。

`prisma/schema.prisma` 定义所有表(20 个模型),比如 Customer:

```prisma
model Customer {
  id          String   @id @default(cuid())   // 自动生成 ID
  customerNo  String   @unique                // 唯一约束
  name        String
  type        CustomerType                     // 枚举字段
  contacts    Contact[]
  @@index([status])                            // 索引
}
```

写完 schema,跑 `npx prisma migrate dev` 生成迁移 + 建表,`prisma generate` 生成类型化 client。然后在 service 里:

```ts
this.prisma.customer.findMany({ where: {...}, include: { contacts: true } })
this.prisma.customer.create({ data: { ... } })
```

**全程类型安全**:字段名打错编译就报错。

> **类比**:像 GraphQL codegen 自动出类型,但针对数据库。

`PrismaService` 只是继承 `PrismaClient` + 实现 `onModuleInit`(连接)/ `onModuleDestroy`(断开),让它融入 NestJS 生命周期。

---

## 六、认证授权:JWT + Passport + RBAC

这是后端的"安全门",分两层:

### 认证(Authentication)= 你是谁 → auth 模块

- **登录**:LocalStrategy 用用户名密码查库,验证 bcrypt 哈希,通过则 `JwtService.sign()` 发 token
- **后续请求**:带 token → `JwtStrategy.validate` 解析 token,查用户角色,塞进 `request.user = {id, username, roles}`
- **JwtAuthGuard** 全局拦截,`@Public()` 装饰器豁免(如登录接口)

### 授权(Authorization)= 你能干啥 → RolesGuard

- `@Roles('report_approver')` 标注接口需要的角色
- RolesGuard 读标注,比对 `request.user.roles`,不符抛 403
- `system_admin` 通配放行

> **关键认知**:认证像前端登录拿 token 存 localStorage;授权像 access.ts 的 useAccess 控制按钮。**后端这层才是真实的安全保障**——前端按钮隐藏只是体验,后端拒绝才是真防线。

---

## 七、三个业务特色(值得学的模式)

### 1. 审计拦截器(全局,ISO 17025 可追溯)

AuditInterceptor 包裹所有写操作:

- **before**:handler 执行前查"变更前"数据
- **after**:拿返回值作"变更后"
- 异步写 AuditLog 表(userId、entity、before、after)

用 `@Audit({action:'STATUS_CHANGE'})` 装饰器标注特殊动作。这是**横切关注点(AOP)**——不侵入业务代码,统一处理。

### 2. 状态机驱动业务流

报告状态:`DRAFT → REVIEW → APPROVED → ISSUED`,每步在 service 里校验当前状态 + 推进:

```ts
// report.service.ts approve()
if (exist.status !== 'APPROVED')
  throw new BadRequestException('仅待批准状态可批准');
// update status -> ISSUED
```

委托单、任务也有各自状态机。**这是后端业务逻辑的核心**:不是简单 CRUD,而是受规则约束的状态流转。

### 3. 异步队列报告生成(BullMQ)

PDF 生成慢(Puppeteer),不能让请求干等。用 BullMQ + Redis:

- `generate(id)` 入队,立即返回 jobId
- ReportProcessor 后台消费,调 generateSync 出 PDF
- 前端轮询 `generation-status?jobId=xxx` 直到 completed

> **类比**:像前端把大任务丢给 Web Worker,主线程不阻塞。后端用 Redis 队列实现,可跨进程、可重试、可监控。

---

## 八、DTO:类型 + 校验二合一

```ts
export class CreateCustomerDto {
  @IsString() @IsNotEmpty() name: string;      // 必填非空字符串
  @IsEnum(CustomerType) type: CustomerType;     // 枚举
  @IsOptional() @IsString() email?: string;     // 可选
}
```

class-validator 装饰器既定义 TS 类型,又在运行时校验。ValidationPipe 全局应用:

- `whitelist: true` 剥离 dto 没声明的字段(安全)
- `transform: true` 自动把 query string 转 number 等

> **这就是 400 的根源**——DTO 是后端和前端之间的"契约",前端传错字段就被拦。

---

## 九、前端转全栈的思维转变

| 前端思维 | 后端思维 |
|---|---|
| 状态在组件 / localStorage | 状态在数据库,是**唯一真相源** |
| 校验为体验(提示用户) | 校验为安全(防恶意/脏数据),前端校验不可信 |
| 按钮隐藏 = 权限 | 接口拒绝 = 权限,前端隐藏只是体验 |
| 同步为主,UI 不卡就行 | 长任务要异步(队列),否则请求超时 |
| 出错 alert | 出错要记日志、返回规范错误码、事务回滚 |
| 关注"看起来对" | 关注"数据一致、可追溯、可恢复" |

---

## 十、建议的学习路径

1. **跑通一个完整链路**:从 customer 模块入手(最简单 CRUD),对着 controller → service → dto → prisma 走一遍,理解数据怎么流动
2. **理解请求生命周期**:在第三节那张图基础上,打断点或加 log 看 Guard / Interceptor / Pipe 执行顺序
3. **改一个小功能**:比如给 customer 加个"联系人"字段,要改:schema → migrate → dto → service → controller,全链路走一遍就懂了
4. **啃 Prisma 文档**:学会 `include` / `select` / `where` / `transaction`,这是后端日常
5. **理解认证流程**:登录 → token → 守卫 → request.user,这串打通后,前后端权限就贯通了

---

## 记忆要点

**NestJS 请求顺序** = Guard → Interceptor(前) → Pipe → Handler → Interceptor(后)

**核心概念**:
- **Module** 装箱
- **DI** 框架注入
- **Controller** 路由
- **Service** 逻辑
- **DTO** 契约
- **Prisma** 数据
- **Guard** 门禁
- **Pipe** 校验
- **Interceptor** 环绕
