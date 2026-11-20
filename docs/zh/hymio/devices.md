# 连接与设备

Hymio 把经常出现在同一设置页、但信任和执行语义完全不同的对象分开：

| 对象 | 用途 |
| --- | --- |
| 对话客户端 | Web、Desktop 或 iPhone，用于阅读对话与接收事件 |
| 连接 | Gmail、滴答清单、日历或健康来源的只读 Context 授权 |
| 个人执行设备 | 运行 HymioDevice 的 Mac 或 Android |
| 云电脑 | 按运营策略分配的 Provider 托管桌面 |

iPhone 是已认证的对话客户端，不需要在“设备”里重复添加。iOS 设备页只列 Mac、Android 和云执行
目标。

## 连接服务

打开 **我的 → 连接服务**。页面按组展示：

- **云端服务**包含 Gmail、滴答清单等；
- **这台 iPhone**包含 Apple 日历与 Apple 健康；
- 每个 Provider 使用统一的一行入口和详情页，不制作大小悬殊的品牌 Hero；
- 状态、覆盖范围、最近成功、待写入数量和操作都在详情中。

Provider 注册取决于部署。未配置的服务明确显示“待部署者配置”，不能展示坏掉的“连接”按钮或
虚构账号。

### 每个来源做什么

| 来源 | 初始采集 | 权限边界 |
| --- | --- | --- |
| Gmail | 有限近期收件箱与后续 history 页 | 只读；不发送、修改或删除 |
| 滴答清单 | 有限项目 / 任务页与最近完成任务 | 只读；不完成或修改 |
| Apple 日历 | 过去 7 天到未来 30 天中选定的日历 | Hymio 只读；Apple 要求完整日历权限 |
| Apple 健康 | 最多 7 天的每日步数与活动能量摘要 | 不读取临床记录，不写入健康数据 |

云端 token 使用 Backend 数据库旁的密钥加密。断开连接会停止新采集并移除本地 Provider 凭据；
已经写入的 Context 会保留，除非独立的数据策略删除。

原生上传需要用户明确同意把选定摘要送到 Hymio 和配置的 AI 模型；系统权限本身不等于这项同意。
即使权限存在，HealthKit 也可能没有可读样本；“无数据”不等于活动量为零，也不等于用户拒绝。

## 个人 Mac 与 Android

### 配对

1. 打开 **我的 → 我的设备 → 连接 Mac 或 Android**；
2. 生成五分钟有效、只能使用一次的配对码；
3. 在 HymioDevice 输入 Hymio 服务地址与配对码；
4. 只为实际使用的能力授予系统权限。

设备通过出站 WSS 连接 Backend，不需要家庭网络开放入站端口。每个账号可绑定一台 Mac 和一台
Android 执行设备。设备凭据保存在 Keychain / Keystore，Backend 只保存摘要。

### 能力

| 设备 | 能力 | 重要边界 |
| --- | --- | --- |
| 个人 Mac | 本机显式开启后的 Bash、浏览器与桌面控制 | Screen Recording / Accessibility 权限留在本机；Shell 默认关闭 |
| 个人 Android | 截图、点击、滑动、文字输入、back/home/recents | 不暴露 Bash；需要解锁与屏幕共享同意 |

Pause / revoke 会阻止后续命令，不能撤销已经发生的点击、Shell 或外部副作用。断线或超时后的
不确定命令不会自动重放。

## 云电脑

云 Provider 与个人设备分离。新账号没有云资源，必须由管理员授权。API 返回 `preparing` 后，
Backend 可以继续后台准备。

| Provider | 分配模型 |
| --- | --- |
| Daytona | 托管 sandbox API |
| 兼容 E2B | 既有 Provider 兼容路径 |
| 运维托管 Linux | 主机侧 HTTPS device API |

Hymio 配置上限不等于 Provider 价格或账号额度。Paused / outcome unknown 的环境仍可能占用容量。
释放托管 sandbox 可能删除数据；解除自管 VM 绑定不会关闭那台 VM。

## 管理员授权案例

<DocFigure src="/screenshots/hymio-admin-grant.png" caption="授权已经落库，但云电脑数量仍为零：权限与分配是两件事。" />

截图使用隔离数据库与合成用户。管理员只开通 Daytona 权限，Hymio 没有创建付费桌面。

## 当前边界

- 云手机执行与人工接管尚未交付。
- Chrome 扩展采集仍是脚手架。
- 只读连接基础不包含写入外部邮件的动作。
- Gmail restricted-scope 审核与 Apple 真机权限必须做真实部署验收。

账号授权、监控与设备生命周期见[管理平台](./admin)。
