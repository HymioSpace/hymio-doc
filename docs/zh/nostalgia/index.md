# Nostalgia

Nostalgia 是 Hymio 的个人 Context 服务。它接收来源资料，保留可追溯身份，让定时 dreaming
提出持久理解，再由服务自身校验并原子发布为一个版本。Agent 可以读取有界概述、检索卡片，并沿
依据回到原始记录。

服务已经实现；运营者为用户配置 Nostalgia 连接后，Hymio 会接入它。基础对话不依赖 Nostalgia，
但个人记忆和 Context 发现的任务机会需要它。

<ProjectOverviewMap kind="nostalgia" />

## 用户得到什么

产品界面把这项能力称为**记忆**，它分为两层：

| 层级 | 内容 | 用户应该怎样理解 |
| --- | --- | --- |
| 足迹 | 对话原话、手记、连接器记录和其他原始资料 | 来源已经被接收，但不自动等于整理完成的个人事实 |
| 记住的事 | 已发布卡片、显式关系与 `_core` 整体理解 | Hymio 已依据原文整理这一版本；新证据到来时会更新 |

读取、搜索、补充纠正与连接状态不依赖某次 dreaming 是否完成。新接收的来源可以立即读取；对应
的整理结果会在之后成功发布时出现。

## 完整闭环

1. Hymio 验证用户、检查来源授权、解析内容，并以幂等请求把记录写入 Nostalgia。
2. Nostalgia 保存原始记录与来源身份。同一外部对象的新版本会成为另一条可追责记录。
3. Nostalgia 创建有界 dreaming 草稿，把固定输入窗口交给 Hymio 的私有 proposal adapter。
4. 提案返回理解、记录处理结论、关系和可选任务机会。Nostalgia 用自己的状态机完整校验，模型
   不能直接写存储。
5. 成功提交会原子发布卡片、`_index`、记录状态、关系和处理游标；提案失败则放弃草稿。
6. Oath 向 Hymio 请求应用 Context，并可通过 `recall` 从有界摘要进入精确卡片、相关节点和原文。
7. Hymio 持续消费 Context 事件。有依据的机会可以成为任务，但机会本身不授予执行权限。

## 核心术语

| 术语 | 含义 |
| --- | --- |
| Record | 不可修改的 context 或 command；多次来源版本共享 `root_id` |
| Source | 来源种类、namespace、external ID、版本与可选 parser 等身份信息 |
| Dream | 针对固定记录窗口的一次 draft / commit / abort 生命周期 |
| Artifact | 已发布理解卡片；`_core` 是稳定概述，`_index` 是导航索引 |
| Relation | 任意两个 record / artifact 之间有类型、有方向的断言 |
| Event | `record.appended`、`context.published`、`opportunity.proposed` 等持久通知 |
| Assembly | 提供给 Hymio 的稳定 `_core` 与动态摘要 / 注入数据 |
| 足迹 | 产品界面展示原始 record 时使用的名称 |

`kit` 仍是兼容旧记录或业务投影的合法来源种类，但不代表已退役的 Kit Host 或生成式应用运行时
重新启用。

## 职责边界

| 职责 | 所有者 |
| --- | --- |
| 账号、授权、连接器、解析器、媒体文件和产品界面 | Hymio |
| 个人 Context 记录、卡片、关系、版本、事件和检索 | Nostalgia |
| Dreaming 调度、草稿校验、原子发布与回滚 | Nostalgia |
| Proposal 模型调用与产品层任务去重 / 比较 | Hymio Backend |
| Agent 执行、任务状态和工具生命周期 | Oath |

## 重要边界

- 当前检索是精确过滤加上对权威快照做不区分大小写的子串扫描。它不是 embedding / 向量检索，
  也不承诺相关性排序。
- 图检索限定在当前用户快照和最多两跳邻域。实现从版本 details 构建视图，不是专用图数据库。
- 当前存储适配器是 SQLite，面向单写实例，不承诺数据库横向扩容或自动故障切换。
- 原始记录默认保留；最近若干已发布快照可供回滚，旧草稿 / 详情可能被清理，但不会删除来源日志。
- 断开连接器会停止后续采集，不会自动删除既有来源和派生理解。

## 来源标签来自真实证据

Gmail 与滴答清单不是 Nostalgia 预置的记忆分类。只有登录用户已经连接该 Provider，且确实存在
来源记录时，界面才出现 `gmail` 或 `dida` 标签。Apple 日历和 Apple 健康同理。空账号或连接失败
不能伪造来源分组。

继续阅读[架构与发布](./architecture)、[HTTP 契约](./contracts)或[部署与运维](./operations)。
