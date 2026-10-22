# 应用架构

Hymio 是模块化应用 monorepo，Oath 是独立运行时。客户端使用产品 API 和鉴权网关，不负责启动运行底座。

## 真实案例：一份行程文件如何出现在两端

[附件案例](./media#真实案例-把行程笔记作为资料发给助手)实际完成了这条链路：Web 上传 `trip-notes.txt`，Backend 保存账号下的附件；用户消息引用该文件，Oath 推进模型与所需工具；回复通过事件链路出现在 Web 和原生 iOS。

手机并没有再上传一份文件，也没有在本机执行解析服务。这个案例把客户端输入、产品文件归属、Agent 执行和多端展示四个边界放在了一次可复现操作里。

## 请求链路

<ProjectOverviewMap kind="hymio" />

公网 WebSocket 入口为 Backend 的 `/agent/ws`，Oath 地址属于私有上游配置。相同产品用户 ID 用于隔离任务、附件、设备与持续对话。

## 客户端范围

| 客户端 | 状态 | 说明 |
| --- | --- | --- |
| Web / Desktop | 当前 | 共用 React 前端，通过 Backend 的产品 API 与 `/agent/ws` 接入 |
| iOS | 当前 | 原生 SwiftUI，使用相同后端和事件契约 |
| 浏览器扩展 | 脚手架 | 已有职责目录，页面捕获与主客户端能力仍在开发 |
| Apple Watch | 规划 | 适合快速输入、通知和任务状态查看 |
| Android | 规划 | 计划复用后端、鉴权和事件协议 |

多端共享账号和产品状态，但每台客户端维护自己的事件 cursor。客户端关闭不会取消 Oath 已接纳的工作。

## 目录

| 目录 | 职责 |
| --- | --- |
| `apps/client` | React Web / Tauri 客户端 |
| `apps/ios` | 原生 SwiftUI 客户端 |
| `apps/admin` | 独立管理平台 |
| `packages/client`、`packages/protocol` | 客户端传输与共享契约 |
| `packages/ui` | 设计 Token 与 Web 组件 |
| `backend/hymio_backend` | 身份、任务、媒体、设备与网关 |
| `extensions/{skills,tools,cli}` | Oath 加载的应用能力 |
| `deploy` | 本机与云端组合部署 |

## 状态归属

Backend 的产品 SQLite 数据库存储账号映射、哈希凭据、任务、附件与设备操作记录。Oath 的独立执行数据库由 Storage 管理。共用用户身份，不需要共用数据库表。

Backend 在边界校验用户凭据；内部路由使用服务鉴权，由受信调用方传递权威用户上下文。CLI 与 Tool 适配器不单独实现账号或配额数据库。

## 增加应用能力

把校验和业务状态放在 Backend 服务中，提供有界、鉴权的操作，再增加轻量 Tool 或 CLI 适配器，以及说明使用时机的 Skill。UI 操作遵循同一套权限与业务规则。

Nostalgia 和 Kit 尚不是当前安装的运行依赖。未来通过公开契约集成，避免把其他项目核心实现复制进 Hymio。
