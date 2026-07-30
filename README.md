# LIMS 检测系统

参考 TÜV 莱茵检测流程的实验室信息管理系统（LIMS），前后端分离。

## 业务模块

| 模块 | 职责 |
|------|------|
| **CS** Customer Service | 客户档案、委托受理、报价、合同 |
| **OP** Operation | 样品接收登记、检测任务分配与调度、进度跟踪 |
| **Lab** Laboratory | 检测执行、方法库、设备、质控、数据复核 |
| **Reporting** | 报告模板、生成、三级签发（编制→审核→批准）、归档 |

主数据链：`Customer → Application → Sample → TestTask → TestResult → Report`

## 技术栈

- **前端** `web/`：React + UmiJS 4 (@umijs/max) + Ant Design 5 + ProComponents + TypeScript
- **后端** `server/`：NestJS + Prisma + TypeScript
- **数据库**：MySQL 8.0
- **缓存/队列**：Redis + BullMQ
- **文件存储**：开发期本地磁盘，生产 MinIO/OSS
- **报告生成**：docxtemplater (Word) + Puppeteer (PDF)

## 目录结构

```
├── web/                 # 前端
│   ├── src/
│   │   ├── pages/       # 按业务域: cs / op / lab / reporting / system
│   │   ├── services/    # API 封装
│   │   └── app.tsx      # 运行时配置
│   └── .umirc.ts
├── server/              # 后端
│   ├── src/
│   │   └── modules/     # 按业务域: cs / op / lab / reporting / system
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/main.ts
├── docker-compose.yml   # Redis + MinIO
└── CLAUDE.md
```

## 开发命令

### 基础设施
```bash
docker compose up -d          # 启动 Redis(6379) + MinIO(9000/9001)
```

### 后端（server/）
```bash
pnpm install
pnpm start:dev                # 开发服务器 http://localhost:3001
npx prisma migrate dev        # 数据库迁移
npx prisma studio             # 数据库可视化
pnpm test                     # 单元测试
```

### 前端（web/）
```bash
pnpm install
pnpm dev                      # 开发服务器 http://localhost:8000 （/api 代理到 3001）
pnpm build                    # 构建
```

## 环境要求

- Node.js 20+ LTS（本地 v24.14.1）
- MySQL 8.0（本地已运行 3306）
- Redis（通过 docker-compose）
- Docker Desktop（用于 Redis/MinIO 容器）

## 环境变量

后端 `server/.env`：
```
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/lims"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret
```
