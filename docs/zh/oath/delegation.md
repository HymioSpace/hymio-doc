# 多 Agent 任务与协作

Oath 现在把持续工作组织成任务系统，而不是一段带了若干临时子 Agent 的无界对话。核心规则只有一句：

> 每个 Agent 执行模式的 TaskRun 只有一个 TaskAgent；所有参与协作的 Subagent 都必须绑定到该
> TaskRun。确定性的 `program` Run 不创建 TaskAgent。

第二条规则是 **明确所有权**。一个 Task 只负责一个连贯结果。每个 Subagent 或 Workflow 节点都要收到
一个具体交付物、输入来源、负责范围、排除项/非目标、可观察验收标准，以及上下文不足或冲突时的
停止条件。最终决策、跨部分整合和完成权仍属于 TaskAgent。

这条规则让多 Agent 工作可观察、可恢复，也让它能被安全地暂停和取消。用户可以只取消某一项任务，
不需要删除整段对话；可以看清哪个 Agent 在做什么；也可以区分“仍在执行”和“只是安排在未来”。

## 结论先行

当前模型由五个决定构成：

1. **Task 记录意图，Run 记录一次执行。** “追踪半年减重”是 Task；“周二生成一份报告”是其中一个 Run。
2. **每个 Agent Run 由一个 TaskAgent 负责。** 交互 Agent 创建任务后回到对话，TaskAgent 在独立
   context 中执行；Program Run 只执行确定动作，不启动 Agent。
3. **所有 Subagent 强制绑定。** 不存在脱离 Task 的后台孩子。临时并行工作也先建立一次性 Task。
4. **执行方式与时间维度正交。** 一次性调研和长期追踪都可以选择并行 Subagent、Agent Team 或 Dynamic Workflow。
5. **一级界面展示协作，深层界面展示证据。** 用户先看到状态、结果、Leader 和成员；context、通信、
   执行记录和工具调用进入更深一层。

## 两个独立维度

多 Agent 产品最容易混淆的是“什么时候执行”和“如何执行”。Hymio 把它们拆成两个独立维度。

| 维度 | 取值 | 回答的问题 |
| --- | --- | --- |
| 时间 | temporary、ongoing | 这是一次性有界任务，还是周期性/持续追踪任务？ |
| 执行 | program、parallel Subagents、Agent Team、Dynamic Workflow | 这一次工作如何完成？ |

所有组合都成立：

| 例子 | 时间 | 执行 |
| --- | --- | --- |
| 每晚 20:00 发固定提醒 | 一次性或长期 | program |
| 一次性调研三家供应商 | 临时 | parallel Subagents |
| 每周生成竞品简报 | 长期 | Agent Team |
| 按依赖关系形成多阶段报告 | 临时 | Dynamic Workflow |

## 四种执行方式

### 1. Program 执行

`program` 用于确定性的固定动作：固定提醒、通知，或参数稳定的应用操作。Oath 不启动 TaskAgent，
也不创建 Subagent。消息是否送达与被通知的任务结果分开记录。

### 2. 并行 Subagent

`parallel_subagents` 适合 Leader 能够拆分独立工作、并行执行、最后整合的任务。每个孩子有独立 context、
Journal、步骤预算、deadline 和终态，只能把结果交回 TaskAgent，不能再次委派。

孩子之间的职责不能重叠。“帮我研究这个话题”这类模糊任务不合格，因为没有稳定边界可以判断进展、
验收或取消范围。

适合：

- 比较相互独立的来源；
- 并行收集几组有界资料；
- 分别检查后由 Leader 合并。

### 3. Agent Team

`agent_team` 适合成员在工作过程中需要互相沟通的任务。TaskAgent 是 Leader，Teammate 可以在同一个 Run
内发送持久消息、回复 Leader，并读取自己作为发送者或接收者的消息。

每个 Teammate 都有独立职责边界。通信可以改变协作方式，但不能把最终责任从 TaskAgent 转移出去。

Team 消息不是一条临时的 WebSocket 通知。每条消息持久保存：

- Task 与 Run；
- 发送者与接收者 Agent ID；
- 内容和时间；
- 可幂等的稳定 message ID。

检查 API 在展示前把 Agent ID 关联到当前名称。

任务一级界面必须直接写成 **发送者 → 接收者**。进入成员页后，再展示完整消息和该成员相关通信。

<DocFigure
  variant="phone"
  src="/screenshots/hymio-material-agent-communication.png"
  caption="Agent 详情把通信方向写清楚：发送者名称 → 接收者名称，再显示持久消息内容。"
/>

### 4. Dynamic Workflow

`dynamic_workflow` 适合 TaskAgent 必须先决定各步骤依赖关系的任务。`workflow_define` 会持久化一张 DAG，
每个节点对应一个绑定 Subagent。调度器会：

1. 启动所有根节点；
2. 只在一个节点的全部依赖成功后才让它开始；
3. 将失败传播给依赖节点；
4. 遵守全局活跃 Agent 上限；
5. 在最终 join 后唤醒 TaskAgent。

Leader 被唤醒时收到节点结果。只要还有工作流节点没有完成，它就不能宣称 Task 已经完成。

每个节点必须可以独立验证，并明确输入、范围、排除项和有界输出。依赖必须代表真实的数据或决策交接。
C 端以 DAG 展示节点与有向边；这里不展示 Agent 间通信，因为通信属于 Agent Team。

节点进入 ready 状态时，调度器必须把全部依赖节点的有界输出注入它的 assignment。节点不能再去设备、
对话历史或文件系统里重新寻找这些输入。TaskAgent 每完成一批有意义的工具工作，或每经过 8 个 active
step，就要发送一次简短进度 checkpoint，避免后台 token 消耗变成用户不可见的循环。

交互 Agent 可以提出初始 Task plan，但不能调用 `workflow_define`；运行中的 DAG 属于绑定该 Run
的 TaskAgent。节点保存在 `task_workflow_nodes` 表中，按 Run 隔离，每行记录依赖列表和绑定
Subagent，不存在外部 DAG 文件。

## Task、Run 与 Agent 的层级

| 层级 | 归属 | 职责 |
| --- | --- | --- |
| Task | Oath 任务数据库 | 持久目标、验收、计划、trigger、策略、预算和长期记忆 |
| TaskRun | Oath 任务数据库 | 一次执行尝试、状态、检查点、结果、用量和控制 epoch |
| TaskAgent | Agent Run 的专用委派 Agent | 执行 Run，负责整合和验证 |
| Team 成员 | 绑定同一 Run 的 Subagent | 完成明确职责，并在 Run 内沟通 |
| Workflow 节点 | 持久图节点 + 绑定 Subagent | 等待依赖、执行并返回一个有界结果 |
| 交互 Agent | 主对话 | 创建和控制 Task，同时保持对话响应 |

交互 Agent 不能创建未绑定的 Subagent。临时并行工作和长期工作都必须先成为 Task。

## 执行链路

1. 交互 Agent 接纳用户目标。
2. 创建包含 trigger、executor、验收、context、plan 和 budget 的 Task。
3. 任务调度器创建 queued TaskRun。
4. Program Run 执行确定动作；Agent Run 创建并绑定 TaskAgent。
5. 对 Agent Run，TaskAgent 可以：
   - 独立执行；
   - 创建并行 Subagent；
   - 创建 Teammate 并交换持久消息；
   - 定义 Dynamic Workflow DAG；
   - 报告明确的等待条件或 blocker。
6. 孩子结果通过持久队列返回。
7. TaskAgent 整合结果并报告完成。
8. Hymio 展示任务状态和结果；通知投递属于另一条独立链路。

Supervisor 可以从持久状态唤醒或对账这两类 Run。它不是第二个推理模型，也不判断一份研究结果
是否满足用户的语义目标。

## 状态机

### Task

| 状态 | 含义 |
| --- | --- |
| `active` | 已接纳，可以产生未来 Run |
| `paused` | 不应再启动新的执行 |
| `closed` | 终态；`close_reason` 为 `achieved`、`cancelled` 或 `expired` |

### Run

| 状态 | 含义 |
| --- | --- |
| `queued` | 可以获取执行权 |
| `running` | Program 动作或 TaskAgent 正在执行 |
| `waiting` | 等待明确条件，例如孩子、时间、事件、用户或工具 |
| `paused` | 已停止，但保留可恢复检查点或等待用户处理 |
| `succeeded` | 当前 Run 产生了被接受的结果 |
| `failed` | 当前 Run 未成功结束 |
| `cancelled` | Run 及其所属执行已被停止 |

### Workflow 节点

正常路径是 `pending → running → succeeded`。`pending` 只表示尚未满足启动条件；上游依赖已经成功时，
调度器必须继续释放节点，不能让它继续显示为“等待依赖”。

已经开始执行的节点因所属 Run 暂停时进入 `paused`。`paused` 不是 `pending`，也不是失败：界面应明确
显示“执行已暂停”，恢复时继续同一个节点和绑定 Subagent，不得重建 Run 或重置进度。失败终态包括
`failed`、`blocked` 和 `cancelled`；Task 取消时，所有未成功节点都必须进入 `cancelled`，包括当时已经
暂停的节点。上游依赖没有成功时，下游节点进入 `blocked`。

### Subagent

成员状态包括 `waiting`、`running`、`succeeded`、`failed`、`cancelled`，也可能暂时 `paused`。
所属 Run 暂停后，TaskAgent 和正在执行的 child 不能继续对外显示为 `running`；Program Run
没有成员记录。

## 取消和暂停都不是完成

取消是用户的终态操作，必须：

- 将 Task 关闭为 `cancelled`；
- 将打开的 Run 标为 `cancelled`；
- 停止未来 trigger；
- 停止或取消绑定成员；
- 阻止过期消息把工作重新唤醒；
- 从当前任务列表移除该任务。

已取消任务**不属于已完成**。“完成”表示成功结果，不表示“这一行终于不动了”。如果需要历史归档，
取消记录应进入独立的历史入口，而不是成功分组。

暂停不是取消。暂停必须保留真实检查点和恢复能力。预算耗尽和停滞检测通常会让任务进入需要关注的暂停态，
不能伪装成成功。

## 失败与恢复

| 失败 | 必须的行为 |
| --- | --- |
| 预算耗尽 | 保存已有检查点，暂停 owner，停止或暂停 child，并要求用户关注；用户授权后，Agent 可以提高当前 Run 预算并继续同一个 Run |
| 长时间无进展 | 只有没有任何外部工具仍在运行时才暂停 |
| Child 失败 | Parent 可以查看失败；Dynamic Workflow 阻断依赖节点 |
| Agent 未报告就结束 | 以 `REPORT_REQUIRED` 暂停，不能把进程结束推断为完成 |
| 过期 Run 返回 | Lease/control fencing 阻止它覆盖更新状态 |
| 用户取消 | 新事件和旧 timer 都不能复活该 Run |
| 服务重启 | Supervisor 对持久 Run、队列和 Agent 终态进行对账 |

恢复必须基于持久事实。进程重启不能证明外部副作用是否发生；不确定副作用仍需幂等或对账。

预算继续不是取消后重建。`task_adjust_budget` 只接受 `BUDGET_EXHAUSTED` 的暂停 Run，新上限必须
高于当前用量；它保留同一个 Task、Run、检查点和结果历史，再把该 Run 放回队列。该工具由主交互
Agent 使用，任务 UI 只提示用户在对话中继续。

## 通信与 context

### 共享内容

- Task 目标、验收标准和策略；
- 交互 Agent 明确提供的 context 引用；
- 持久 Team 消息；
- Child 的发现与最终结果；
- Workflow 节点结果；
- Run 之间继承的 Task memory。

### 隔离内容

- 每个 Agent 自己的 Journal 和模型 context；
- 每个 Agent 的工具审批与终态；
- 每个 TaskRun 的要求快照和检查点；
- 每个 Agent 的预算和 deadline。

系统不能把整段主对话复制给所有成员。过宽的 context 既增加成本，也可能泄露无关个人信息。
TaskAgent 必须为每次委派提供足够的任务专属资料。

事件发生时间在持久层保持 UTC，用于稳定排序。注入模型上下文时，`<time>` 会按客户端最近上报的
`time_zone` 转成本地时间，并附带 timezone 元数据；这是展示口径，不会另存一套时钟。

## 用户可见层级

### 任务一级

保持简洁：

- 标题和当前状态；
- 一个时间维度标签；
- 一个执行方式标签；
- 用户当前能看到的阶段结果或 blocker；
- Leader 与绑定成员；
- 简洁计划，或带方向依赖边的 Workflow DAG。

### Agent 二级

展示：

- Agent 职责与验收；
- 发送者 → 接收者的通信记录；
- 中间结果和最终结果；
- 按时间排序的执行记录；
- 有语义描述的工具调用。

### 技术三级

原始工具 JSON、trace ID、Journal 和事件 payload 属于开发者/运维界面，不进入默认的 C 端任务页。

## 工具边界

| 工具族 | 可用角色 |
| --- | --- |
| `task_create/list/get/update/message/pause/resume/cancel/retry/adjust_budget` | 交互 Agent |
| `task_report` | TaskAgent |
| `subagent_spawn/list/get/cancel/continue` | 仅 TaskAgent |
| `subagent_notify` | 绑定成员 |
| `team_send/inbox/members` | `agent_team` 中的 TaskAgent 或 Teammate |
| `workflow_define/status` | `dynamic_workflow` 中的 TaskAgent |

工具注册、模型可见定义、准入检查与 Storage 执行必须使用同一套边界。只在 prompt 中隐藏工具，
不构成授权。

## API 投影

开启 execution 的 `task_get` 返回：

- executor kind 与 execution mode；
- TaskAgent；
- 绑定 Subagent 和委派角色；
- 带工具名和语义描述的近期 activity；
- Team 消息；
- Workflow 节点与边；
- plan、usage、checkpoint、wait 和近期事件。

C 端任务页不应原样呈现技术字段，而要转换成稳定层级，并把工具细节放到下一层。

## 限制与安全

- Subagent 受步骤、时间和终态约束。
- 每个用户的活跃委派 Agent 数量有上限。
- Workflow 节点数量和结构有上限，并必须通过无环校验。
- Team 消息按 Run 隔离，并校验接收者是否属于同一团队。
- 工具审批按 Agent 生效，child 不会自动继承无限授权。
- 取消不能撤销已经发生的外部操作，只能阻止后续工作并记录剩余不确定性。

## 下一阶段的观察能力

当前实现已经具备绑定成员、持久通信、DAG 调度和每 Agent activity。后续工作是加深这些层次，
而不是把现有模式继续写成“未来”。

### 第一阶段：显式团队名册

执行前定义 Leader、Teammate、职责、工具和通信 allowlist，并在任务一级显示团队名册。

### 第二阶段：共享团队产物

增加明确共享的 finding 和 artifact，不要广播所有内部消息。Agent 私有 Journal 保持隔离，
只有被选择的证据可以进入团队共享区。

### 第三阶段：团队通信图

展示谁可以向谁发送消息，以及哪条消息改变了计划。检测死锁、重复交接，以及成员在等待从未发出的信息。

### 第四阶段：动态领导和冲突解决

允许团队提出新计划或重新分配工作。除非 Task policy 明确允许，TaskAgent 仍承担最终责任。
冲突必须通过证据和明确职责解决，而不是谁说得更多。

### 第五阶段：更深的团队可观察性

提供三层视图：一级协作图、二级 Agent transcript、三级工具与 trace。三层必须共享 Agent identity 和时序，
让用户从“谁在和谁协作”进入“具体发生了什么”，而不会丢失上下文。

## C 端设计规则

- 异常展示在对应任务内部，不在页面顶部重复一张独立告警。
- 取消属于历史，不属于成功。
- 已完成与已取消任务进入独立归档；移除是软隐藏，并按所有者隔离。
- 执行方式只显示一个短标签，解释放在旁边的小问号里。
- Agent 通信直接写 `A → B`，只有“来自/发给”而没有名字不够清楚。
- Dynamic Workflow 使用 DAG，不展示不适用的 Agent 通信。
- 一级任务列表隐藏原始预算数字，详情里的 Run 区再展示。
- 主任务页保持简洁，诊断信息下沉一层。

## 相关文档

- [Hymio 任务体验](../hymio/tasks)
- [Oath 架构](./architecture)
- [Tool、Skill 与 CLI 边界](./extensions)
- [Oath 任务系统规范](https://github.com/HymioSpace/Oath/blob/main/spec/feature-task-system.md)
