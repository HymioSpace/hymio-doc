# Oath

Oath 是个人 Agent 的 Harness（执行框架），也是持续管理执行状态与调度的服务端 runtime（运行时）。它让 Agent 在两次对话之间也能继续工作：客户端提交任务后可以断开，服务端继续推进，用户回来时再接收已保存的事件。

这里的 runtime 指持续管理执行状态与调度的服务端程序，不是浏览器或前端框架里的 runtime。

它适合需要持续执行、异步工具结果或多设备接入的应用。Oath 不提供产品账号和聊天界面，也不保存由应用负责的任务业务状态。

## 先看整体结构

<OathOverviewMap />

## 先认识这些术语

文档后面会反复出现这些词。第一次阅读时，不需要记住内部实现，先知道它们各自负责什么即可。

### 执行链路

| 术语 | 在这里是什么意思 |
| --- | --- |
| Agent | 由模型驱动、可以调用工具并推进任务的工作单元。Oath 管它的执行，不定义产品身份。 |
| Client | 向 Oath 发送消息、接收事件的客户端，例如 Web、Desktop 或 iOS。它不运行 Agent。 |
| Message / Event | Message 是业务输入或输出；Event 是可持久、可排序、可补发的执行事件。工具结果也是 Event。 |
| Gateway | WebSocket 入口，负责接纳客户端命令、持久投递事件和维护客户端连接。 |
| Biz | HTTP 入口，提供 Trace 查询与应用 CLI 命令等业务接口。 |
| Queue | 三个输入入口：User、Tool、System。它们分别承载用户消息、工具结果和系统干预。 |
| Buffer | Queue 背后的持久待处理集合。输入不会因为连接断开而消失。 |
| Intake | 从持久 Buffer 中认领一个固定输入批次，交给后续执行。 |
| Step | 一次有界的模型推进。一个 Step 包含固定输入、模型请求和可能的工具提交。 |
| Worker | 执行 Step 的一个共享工作单元。用户没有永久 Worker 线程。 |
| Brain | Worker 中负责组织 context、准备模型请求和处理模型结果的部分。 |

### 工具、状态与恢复

| 术语 | 在这里是什么意思 |
| --- | --- |
| Manager | 管理调度与 lease，决定哪个 Worker 可以执行当前 Step。 |
| Lease | 带所有权的执行租约。过期 Worker 不能继续冒充当前执行者提交结果。 |
| Tool | Agent 可以调用的一项能力。每次调用是一个 Invocation，有身份、参数、deadline、审批和终态。 |
| Skill | 写给模型阅读的 Markdown 工作说明，告诉它何时以及如何使用能力。 |
| CLI | 应用通过 HTTP 暴露给 Agent 的命令，可由 `oath-cli` 从 Bash 中组合调用。 |
| Storage | Oath 的持久状态边界，当前用 SQLite 保存执行状态和 Journal。 |
| Journal | 追加式执行事实记录。恢复和 Trace 都以已有记录为依据。 |
| Outbox | 与状态提交放在同一事务中的待投递事件，用来连接数据库提交和队列投递。 |
| ACK | 对“输入或事件已经持久接纳”的确认。ACK 不代表模型已经完成推理。 |
| Cursor | 每台客户端独立保存的已接收事件位置，用于重连后补发遗漏内容。 |
| Supervisor | 独立检查持久待办并请求唤醒的服务。空 Buffer 不调用模型。 |
| Trace | 一次任务内部 Step、模型请求、工具调用和时序的观察记录。 |
| `user_id` | Oath 的隔离身份。一个 `user_id` 对应一段持续对话，不需要创建 session。 |

## 真实集成案例：手机提交任务，服务端带回结果

本轮我们在 Hymio 原生 iOS 创建了 `Weekend packing check`，先看到“已安排”，随后在任务详情收到实际完成的核对清单与未确认事项。用户不需要一直停留在对话页，Web 也能查看同一任务。

这次集成里，Oath 推进模型与工具执行，Hymio 保存并展示 Task / Run 的业务状态。不要把某次工具调用成功，直接当作整个任务完成。实际截图和操作过程见[原生任务案例](../hymio/tasks#真实案例-在-iphone-创建出发前核对任务)。

## 三个底层机制

- **事件驱动**：用户输入、工具结果和系统干预分路进入队列。工具结果也能推动下一步。
- **持久化**：Journal、Storage、Outbox 与 lease 保存执行事实，并为恢复和事件补发提供依据。
- **独立监督**：Supervisor 检查持久待办并请求唤醒；空 buffer 不调用模型。

[执行架构](./architecture)解释了这些机制如何协作，并包含一个可交互的输入流程演示。

## 从哪里开始

| 你的目标 | 阅读 |
| --- | --- |
| 先运行起来 | [安装与运行](./getting-started) |
| 理解执行与恢复 | [架构与执行语义](./architecture) |
| 接入自己的客户端 | [WebSocket 与 HTTP](./protocol) |
| 增加 Tool、CLI 或 Skill | [扩展能力](./extensions) |
| 配置 Prompt、模型和鉴权 | [运行时配置](./configuration) |
| 创建有界子 Agent | [子 Agent 与应用事件](./delegation) |

## 开发顺序

1. 用 `oath start` 启动运行时，先通过内置 terminal client 验证模型和工具链路。
2. 客户端发送 `user.message`，处理 accepted、事件和 cursor；不要自己实现服务端会话状态。
3. 业务能力放在应用中，通过 Tool、CLI 或 Skill 接入。账号、权限和业务数据不要复制进 Oath Core。
4. 用 Trace 检查模型请求、工具调用和 step 关联，再根据真实失败边界补充幂等与恢复。

```sh
oath start \
  --system-prompt ./prompts/assistant.md \
  --skill ./skills \
  --tool ./tools \
  --cli ./cli
```

## 运行时边界

- 对外身份是 `user_id`，没有产品 session 创建 API。
- 空闲用户不需要永久 Worker 线程。
- 已接纳的工作独立于 WebSocket 连接。
- User、Tool、System 输入各走独立接纳路径。
- Oath 管执行状态；账号、任务业务状态与设备配额留在应用层。

## 当前范围

默认部署是单机 Docker Compose：服务独立运行，SQLite 由 Storage 管理，配合 RabbitMQ 与 Vault。尚不包含数据库自动故障转移和 broker 集群。

默认受信访问和 allow-all 工具策略面向本地或受控环境。开放给不受信调用方前，需要配置鉴权与执行隔离。
