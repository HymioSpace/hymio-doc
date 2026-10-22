# 架构与执行语义

Oath 是给 personal agent 使用的 execution runtime。客户端提交输入后，Oath 在服务端保存输入、调度模型步骤、执行工具并产生事件。客户端断开不会撤销已经接纳的工作。

Oath 管执行状态，不负责产品账号、聊天界面或任务业务数据。这些边界由接入它的应用维护。

第一次阅读可以先看[概览中的术语表](./#先认识这些术语)。

## 三个底层机制

这三个机制描述运行时如何可靠推进工作，不是三个可以单独打开的功能开关。

| 机制 | 核心实现 | 对开发者意味着什么 |
| --- | --- | --- |
| 事件驱动 | User、Tool、System 分路进入队列和持久 buffer；Brain 只接收固定输入批次 | 新输入和工具结果可以推动后续步骤，不必把整段工作绑在一条 WebSocket 或阻塞循环上 |
| 持久化 | Journal、Storage、事务 Outbox、带所有权校验的 lease | 已接纳输入、执行状态和待投递事件可以在断线或 Worker 恢复后继续处理 |
| 独立监督 | 独立 Supervisor 检查持久待办，通过 `system.invoke` 请求唤醒 | 有待办时可以恢复推进；空 buffer 不调用模型 |

### 事件驱动

用户消息、工具结果和系统干预使用不同队列。各自 consumer 独立判断是否满足唤醒条件，Intake 再从持久 buffer 认领固定批次交给 Brain。

工具结果也是一条事件。一个工具等待审批时，其他已提交工具仍可执行；较早返回的结果可以推动下一步，较晚的批准或结果会从 system / tool 路径再次进入。

### 持久化

Journal 是追加式的执行事实记录。输入、工具状态、执行所有权和对外事件通过 Storage 保存；事务 Outbox 把已提交状态连接到队列投递，fenced lease 阻止过期 Worker 继续提交。

这里的持久化不等于任意外部副作用具备 exactly-once 语义。工具在超时前是否已经修改远程系统，框架无法仅凭本地记录判断。不可重复的操作仍需工具自己实现幂等或对账。

### 独立监督

Supervisor 是独立观察待办工作的服务。当前它会定期检查持久待处理工作，并在需要时发出 `system.invoke`。没有待处理输入时不会调用模型。

进程重启由 Docker 或部署平台负责。基于 Trace 的自动诊断和模型辅助修复仍属于后续工作。

<EventJourney />

## 一次输入如何执行

1. Gateway 接纳用户命令。ACK 表示输入已经持久接纳，不表示模型已经回复。
2. Intake 从对应 buffer 认领固定批次，创建一次有界的 Step。
3. Manager 为 Worker 提供 lease。Worker 准备固定的模型请求并调用模型。
4. 模型可以提交工具调用。工具具有独立 identity、deadline、审批状态和不可变终态。
5. 工具结果回到 tool queue，满足条件时推动后续模型步骤。
6. 输出写入持久事件。各客户端按自己的 cursor 接收、确认和补发。

完成一个 Step 时不能删除执行期间新到达的输入。Brain 不自行消费队列，用户也没有永久 Worker 线程。

## 服务分工

| 服务或模块 | 负责 |
| --- | --- |
| Gateway / outbound | 客户端命令、持久投递、独立客户端 cursor |
| Consumer / Intake | 队列接纳、持久 buffer、固定输入批次 |
| Manager / Worker | lease、调度与有界 Worker 池 |
| Brain | context、固定模型请求与后处理 |
| Tool system | Invocation identity、审批、deadline 与终态 |
| Storage | SQLite 事务、执行状态与 Journal |
| Queue | RabbitMQ 投递、confirm 与 Outbox relay |
| Supervisor | 待办检查与 `system.invoke` |
| Biz | Trace、CLI 与应用事件 HTTP 接口 |

这些模块通过明确契约协作。应用能力放在 Tool、CLI 与 Skill 扩展中，Core 不依赖具体产品。

## 开发一个接入

| 目标 | 下一步 |
| --- | --- |
| 本机运行 Oath | [安装与运行](./getting-started) |
| 连接自己的客户端 | [WebSocket 与 HTTP](./protocol) |
| 添加 Tool、CLI 或 Skill | [扩展能力](./extensions) |
| 配置模型、Prompt 与鉴权 | [运行时配置](./configuration) |
| 委派有界子任务 | [子 Agent 与应用事件](./delegation) |

一个常见接入顺序是：

```sh
oath start \
  --system-prompt ./prompts/assistant.md \
  --skill ./skills \
  --tool ./tools \
  --cli ./cli
```

客户端通过 Gateway 发送 `user.message` 并接收事件，通过 Biz 查询 Trace 或调用应用命令。把业务校验、用户授权和持久业务状态留在应用层，再通过小型 Tool / CLI adapter 暴露给 Agent。

## 当前边界

默认部署是单机 Docker Compose：一个 SQLite owner、一个 RabbitMQ 节点和一个 Vault 节点。服务边界支持继续演进，但当前不包含数据库自动故障转移或 broker 集群。

默认受信访问与 allow-all 工具策略适合本地和受控环境。开放给不受信调用方前，需要配置鉴权与执行隔离。

完整执行契约见 [持续运行的 Personal Agent 设计](https://github.com/HymioSpace/Oath/blob/main/spec/feature-distributed-personal-agent.md)。
