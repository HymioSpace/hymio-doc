# 当前进度

本页记录 **2026-11-20** 核对的实现基线。“已实现”表示仓库中存在可调用路径并有测试覆盖；
“依赖部署”表示代码已经存在，但仍需要私有凭据、Provider 审核、真机权限或管理员配置。这不表示
所有部署都已启用该能力。

## 产品总览

| 项目 | 当前状态 | 重要边界 |
| --- | --- | --- |
| Hymio | Web、Desktop 与原生 iOS；持续对话、任务投影、记忆界面、连接器、媒体、个人设备与云执行、管理台 | Chrome 扩展与 Apple Watch 尚未交付；Kit 应用生成能力已退役 |
| Oath | 持久 Task/Run、TaskAgent 执行、Supervisor 恢复、并行 Subagent、Agent Team 与 Dynamic Workflow | Supervisor 检查持久状态，不替代 Agent 做语义判断 |
| Nostalgia | 认证 HTTP 服务、SQLite、版本化卡片发布、回滚、事件、有界图检索、定时 dreaming 与证据约束的任务机会 | 文本检索仍是权威字面子串扫描；未实现语义 / 向量检索和大规模图索引 |

## Hymio

### 当前可用

- Web、Desktop 与原生 iOS 共用一段持续对话；每个安装维护自己的事件游标，客户端断开后服务端
  已接纳的工作继续执行。
- iOS 使用 **此刻 / 对话 / 我的** 三个一级入口。任务、记忆、连接服务、模型与通知设置、设备和
  诊断都从“我的”进入。
- Web 使用带标签侧栏组织此刻、对话、记忆和任务，并在宽屏提供任务详情检查器。
- 任务默认先展示列表。iOS 可在任务列表与月、周、日日历之间切换；时间范围、当前状态和执行
  方式相互独立。
- 绑定到 TaskRun 且具有明确交付物和排除项的 Subagent、带发送者 → 接收者的持久 Agent Team
  消息，以及真正的 Dynamic Workflow DAG。
- 已完成和已取消任务从当前列表进入归档；归档移除是按所有者隔离的软操作，取消不会计为完成。
- 预算及其他异常只在受影响任务内部显示。用户授权后，主 Agent 可以扩大当前 Run 预算并从检查点
  继续，不会取消后重建。
- 对话以真实可见内容为锚点；发送后收起键盘，展开执行过程时向下增长，不再产生页面级空白。
- 工具过程优先展示模型提供的 `description`；命令语法和通用传输名称只作为兜底或深入诊断。
- Trace 以首个输入正文作为可读标题，显示本地墙钟时间、相对耗时以及有界的 LLM 请求 / 响应；
  原始 Trace ID 折叠到详情，不再占据主视觉。
- Trace 请求正文按消息结构化展示；超长原始 JSON 有独立折叠和高宽边界，Agent 的二次转义换行、
  Markdown 与工具记录会正常渲染并保持左对齐。
- 任务执行记录带本地时间。个人 Mac 支持最多 4 条 Shell 并行，浏览器 / 桌面动作保持独占。
- 记忆界面区分原始足迹与已发布理解，Provider 标签来自真实记录，并支持依据阅读、用户纠正以及
  分别呈现加载、读取失败与真正空态。
- Gmail、滴答清单、Apple 日历与 Apple 健康具备只读连接基础：凭据加密、有限同步，并以幂等
  操作写入 Nostalgia。
- 个人 Mac 与 Android 通过 HymioDevice 的出站 Link 协议执行，另有托管云电脑。对话客户端与
  执行目标不是同一概念。
- iOS 与 Web 的收敛层已经采用 Material Design 3 色彩角色、色调表面、形状层级、导航几何和
  交互状态。

### 依赖部署

- Gmail 与滴答清单需要私有 OAuth 应用。广泛分发 Gmail 读取能力前，仍可能需要完成 Google
  restricted-scope 审核。
- Apple 日历与 Apple 健康需要签名 iOS 构建、真机权限、HealthKit capability，以及用户明确
  同意上传选定摘要。
- APNs、实时活动、云 Provider、Nostalgia 用户绑定和管理员用户 ID 都需要私有部署配置。
- Provider 实际配额、云手机可用性和 App Store 隐私要求取决于运营者与上游账号。

### 尚未交付

- 可构建、可打包的 Chrome 采集扩展。
- Apple Watch 客户端或面向用户的 Hymio Android 应用；HymioDevice 仓库提供 Android 执行端。
- 云手机执行与人工接管。
- 连接器写操作。当前 Gmail、滴答清单、日历和健康都按只读接入设计。
- 旧 Kit Host、生成式应用运行时和 `kit_*` Agent 工具，已从当前产品链路退役。

## Oath

### 当前可用

- 持久 Task / Run 生命周期，包含检查点、等待、重试、暂停、恢复、取消与 Supervisor 恢复。
- 每个 Agent 执行模式的 Run 绑定一个 TaskAgent；交互 Agent 不能创建脱离任务的 Subagent。
- 四种执行方式：`program`、`parallel_subagents`、`agent_team` 与 `dynamic_workflow`。
- 持久 Team 消息、有界且无环的 Workflow DAG、依赖失败传播和 Leader join。
- 按所有者隔离的委派执行活动、语义化工具描述、工具审批、Trace 与独立 Agent 上下文。
- 外部应用 Context Provider、模型与窗口选择、媒体工具和私有鉴权接入。

### 重要边界

定时只是 Task 开始或继续的手段之一。Task 可以是一次性、事件驱动、手动推进或长期运行，不需要
变成 cron。`program` 执行确定动作；Agent 执行使用绑定到 Run 的 TaskAgent。Supervisor 只观察
持久状态并请求唤醒，不是第二个负责理解目标的模型。

## Nostalgia

### 当前可用

- 按用户隔离的 context / command 原始记录、不可变来源历史，以及 `kit`、`conversation`、
  `connector`、`user`、`legacy` 来源种类。
- 草稿 → 校验 → 原子提交生命周期，配合 ETag 冲突、幂等回执、最近版本回滚和有界历史保留。
- 带原始记录依据的已发布理解卡片、显式关系、`_core` 稳定上下文与 `_index` 导航摘要。
- Nostalgia 自己调度 dreaming，固定有界输入窗口并调用无状态 proposal provider；提案失败会
  放弃本次草稿。
- 每轮最多三个、必须引用固定窗口内真实记录的任务机会；机会作为持久事件发布，Hymio 消费它
  但不会因此获得执行权限。
- 权威 ID / 来源 / 过滤索引与不区分大小写的子串搜索；精确读取、快照分页和来源版本冲突处理。
- record / artifact 有界图查询与检索，支持一跳或两跳扩展、显式截断和快照冲突。
- Hymio Backend 维护每用户私有连接；Nostalgia token 不进入客户端、Oath 或模型。

### 不作承诺

- Embedding、向量召回、重排或语义搜索质量保证。
- 专用图数据库或无规模上限的全局图视图。
- 多区域存储、数据库自动故障切换或多写部署；当前适配器是单个 SQLite 服务。
- 自动采集全部对话。历史对话导入需要显式操作；Agent 使用 `remember` 与 `recall` 保存和读取
  跨轮事实。

## 如何阅读

- [Hymio](hymio/) 说明产品行为与部署。
- [Oath](oath/) 说明执行、任务语义与多 Agent 协作。
- [Nostalgia](nostalgia/) 说明个人 Context 的架构、接口与运维。
- 排查任务或协作问题时，先阅读[多 Agent 任务指南](oath/delegation)；它是当前任务系统最完整的
  机制说明。
