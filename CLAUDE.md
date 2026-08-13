# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

LIMS 检测系统（参考 TÜV 莱茵检测流程），前后端分离。四大业务模块通过「委托单 + 样品 + 检测任务 + 报告」主数据链串联形成闭环：
- **CS** 客户服务：客户档案、委托受理、报价、合同
- **OP** 业务运营：样品接收登记、任务分配调度、进度跟踪
- **Lab** 实验室：检测执行、方法库、设备、质控、数据复核
- **Reporting** 报告：模板、生成、三级签发（编制→审核→批准）、归档

## 技术栈

- 前端 `web/`：React + UmiJS 4 (@umijs/max) + Ant Design 5 + ProComponents + TypeScript
- 后端 `server/`：NestJS + Prisma + TypeScript
- 数据库：MySQL 8.0（JSON 字段存检测原始数据）
- 缓存/队列：Redis + BullMQ（报告生成走异步队列）
- 报告：docxtemplater (Word) + Puppeteer (PDF)

## 开发命令

前端（`web/`）：
- `pnpm dev` — 开发服务器，默认 8000 端口，`/api` 代理到 `localhost:3001`
- `pnpm build` — 构建
- `pnpm tsc` — 类型检查

后端（`server/`）：
- `pnpm start:dev` — 开发服务器，默认 3001 端口，热重载
- `pnpm build` — 构建
- `pnpm test` — 单元测试
- `npx prisma migrate dev` — 数据库迁移（需配置 `DATABASE_URL`）
- `npx prisma studio` — 数据库可视化

基础设施：
- `docker compose up -d` — 启动 Redis(6379) + MinIO(9000/9001)

## 架构

- **前端** 按业务域分目录：`src/pages/{cs,op,lab,reporting,system}`，API 封装在 `src/services` 按域拆分；路由与运行时配置在 `.umirc.ts` 与 `src/app.tsx`。
- **后端** 按业务域分模块：`src/modules/{cs,op,lab,reporting,system}`，每模块含 `controller / service / dto`；通用守卫、拦截器、装饰器在 `src/common`。
- **数据模型** 在 `server/prisma/schema.prisma`。主数据链：`Customer → Application → Sample → TestTask → TestResult → Report`，报告版本化（签发后不可改，只能修订重发）。
- **权限** RBAC：CS/OP/Lab/Reporting 各有专员、复核、主管等角色，路由级 + 按钮级控制。
- **工作流** 用 NestJS 自建状态机驱动委托/任务/报告三条主流程，每步写审计日志（满足 ISO/IEC 17025 可追溯）。

## 约定

- 检测原始数据用 JSON 字段存储（不同检测项目结构差异大），不为此建表。
- 报告生成统一走后端 BullMQ 队列，前端只做预览，避免客户端排版差异。
- 所有核心实体变更走审计日志，记录前后值快照。
- 所有回复使用中文。
