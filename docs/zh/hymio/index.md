# Hymio

Hymio 是围绕一段持续对话构建的个人 Agent 应用。任务可在服务端继续，个人记忆可以回到真实来源，
选定的设备可以执行工具操作，但它们都不会另建一段对话。

Hymio 拥有产品边界：账号、授权、连接器、附件、设备许可、产品 API 与界面。
[Oath](../oath/) 拥有持久任务与 Agent 执行；[Nostalgia](../nostalgia/) 拥有个人 Context 的
记录、发布与检索。

<DocGallery :images='[{"src": "/screenshots/hymio-material-home.png", "label": "iOS · 此刻", "caption": "紧凑的 Material 外壳只保留一个当前重点，没有内容的模块直接收起。"}, {"src": "/screenshots/hymio-material-my.png", "label": "iOS · 我的", "caption": "任务、记忆、连接与设置以列表分组，不再堆叠大卡片。"}]' />

## 从真实使用开始

| 你想做什么 | 阅读 |
| --- | --- |
| 安装 Hymio 并收到第一条回复 | [安装与启动](./getting-started) |
| 在 iPhone、Web 与 Desktop 继续同一段对话 | [对话与客户端](./conversation) |
| 查看持久任务、Agent Team 或 Workflow | [任务、Agent 与日历](./tasks) |
| 添加文件、选择模型或查看生成图片 | [模型与附件](./media) |
| 查看足迹与已发布理解 | [Nostalgia 概览](../nostalgia/) |
| 导入邮件、待办、日历或健康摘要 | [连接与设备](./devices) |
| 连接个人 Mac 或 Android 设备 | [连接与设备](./devices) |
| 管理账号、Provider、Trace 与 Context | [管理平台](./admin) |
| 开发 Hymio 集成 | [架构](./architecture)、[HTTP API](./api)、[UI/UX](./ui) |

<ProjectOverviewMap kind="hymio" />

## 产品外壳

主界面有意保持精简：

- **iOS** 使用此刻、对话、我的。任务、记忆、连接服务、模型偏好、通知、设备和诊断都从“我的”进入。
- **Web / Desktop** 使用带文字标签的侧栏和更宽的内容工作区。任务使用列表加详情 inspector，
  不再与对话争夺页面。
- **HymioDevice** 是个人 Mac 或 Android 手机上的出站代理，是执行目标，不是另一套对话客户端。

iOS 一级导航不再单独放“记忆”。账号没有内容时，不能用虚构的记忆卡片、来源筛选或插画填充区域。

## 对话行为

一个用户只有一段持续对话，不是每个客户端各建一套 session。发送消息时：

1. 本地先显示 pending 消息；
2. 用稳定 command identity 提交到 Backend / Oath；
3. ACK 只表示持久接纳，不表示任务完成；
4. 键盘收起后跟随真实可见的最后内容；
5. 展开执行过程时，内容锚定在所属行并向下增长。

最新消息上方不能出现大片空白。完成态布局变化、键盘收起与探索详情展开不能依赖彼此竞争的滚动
计时器。历史内容保持稳定，只有新流式文本的边缘继续变化。

## Task 不是 cron

任务页是持久工作清单。以下概念相互独立：

| 概念 | 含义 |
| --- | --- |
| 时间范围 | 一次性临时工作，或持续追踪 / 周期任务 |
| 执行方式 | 确定程序、并行 Subagent、Agent Team 或 Dynamic Workflow |
| Task | 持久目标与要求 |
| Run | 一次执行尝试，带检查点与结果 |
| TaskAgent | 绑定到某个 Agent Run 的执行 Agent |

日程和提醒只是可选触发手段，不定义任务系统，也不是每个任务都必须有日程。已取消任务会离开当前
列表，不会计入成功。

## 记忆是服务边界

Nostalgia 已实现，并从用户注册 / 登录 Hymio 的同一条链路自动开通私有服务绑定。用户不需要创建
第二套记忆账号。Hymio 的记忆界面展示：

- **足迹**：原始记录与真实来源；
- **记住的事**：带依据的已发布卡片；
- Gmail、滴答清单等 Provider 只有在对应记录真实存在后才出现；
- 加载中、暂时不可用、确认空账号三种状态。

Gmail、滴答清单等 Provider 名称不是内置记忆分类。只有用户已连接且记录到达后才出现。读取失败
不能变成虚构的空账号。

## 当前边界

| 范畴 | 当前状态 |
| --- | --- |
| Web、Desktop、iOS | 可用 |
| 个人 Mac 与 Android 执行 | 可通过 HymioDevice 使用，受系统权限控制 |
| 托管云电脑 | 管理员授权 Provider 后可用 |
| Gmail、滴答清单、日历、健康连接 | 只读基础已实现；仍需私有配置与部署验证 |
| Chrome 扩展 | 责任目录脚手架 |
| Apple Watch、面向用户的 Android App | 尚未交付 |
| 云手机与人工接管 | 尚未交付 |
| Kit 与生成式应用运行时 | 已退役 |

跨项目权威状态见[进度页](../status)。
