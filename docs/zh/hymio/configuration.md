# 配置与部署

新安装优先使用统一的本机流程。修改操作者输入文件，启动时会重新生成各服务配置。

## 真实案例：让手机和电脑访问同一套服务

本轮原生 iOS 应用连接到运行中的开发后端，Web 也使用该后端。用同一演示账号登录后，手机保存的 `MiniMax-M3` 偏好在 Web 读到，手机发起的旅行清单也被 Web 接回。

这提供了一个配置验收标准：除了能分别打开两端，还要核对**同一账号、同一后端、相同模型偏好和相同对话内容**。配置地址或账号不一致时，不应该通过复制本机缓存来“修复同步”。实际截图见[模型与附件](./media)。

## 本机配置

`hymio init` 创建具有私有权限的 `~/.hymio/config.toml`。以下是可选云电脑配置片段，应加入 init 生成的文件，不要覆盖所有已有字段：

```toml
computer_provider = "daytona"
daytona_api_key = "" # 也可在启动时提供 DAYTONA_API_KEY
admin_user_ids = [] # 产品用户 ID，不是名字
lan_host = "off"   # 局域网开发改为 "auto"
```

| 配置 | 用途 |
| --- | --- |
| `minimax_api_key`、`minimax_api_base` | 模型账户与兼容 Endpoint |
| `models`、`vision_model` | 对话白名单与媒体模型 |
| `daytona_api_key`、`daytona_api_url`、`daytona_snapshot` | 托管电脑连接 |
| `admin_user_ids` | 管理平台权限 |
| `device_api_targets` | 分配给用户的 HTTPS 设备主机 |
| `casdoor_port` | 身份服务端口，默认 8000 |
| `invitation_codes` | 本机注册邀请码列表 |
| `lan_host` | `off`、`auto` 或指定局域网地址 |

完整默认值见[输入模板](https://github.com/HymioSpace/Hymio/blob/main/deploy/config.example.toml)。凭据也可由 `MINIMAX_API_KEY`、`DAYTONA_API_KEY`、`E2B_API_KEY` 提供，避免把明文密钥写进命令和源码。

## 启动、查看与重启

```sh
hymio start --client web --timeout 900
hymio status
hymio logs -f
hymio restart
hymio doctor
```

用 `hymio doctor` 查看当前配置模式。统一模式的产物位于 `~/.hymio/local-<id>/`，不要手改其中生成的 Backend 或 Oath 文件。

## 换一台电脑

新机器安装依赖后，可复制私有输入文件并设置 `600` 权限，建立独立的新安装。账号、历史、任务和设备绑定属于数据库状态，不在配置中；迁移这些数据需要一致的备份与恢复。

## 局域网与 iOS

统一输入设置 `lan_host = "auto"` 后重启。客户端使用生成的 Backend 公共入口，无需分别手改 Oath、登录和媒体地址。功能使用与双端案例见[多端互通](./ios)。

## 公网云部署

公网部署组合 HTTPS 路由、Web、Backend、身份与 Oath。产品配置、独立 Oath 配置和部署路由职责不同：

```text
/opt/hymio/config/hymio.toml    产品 / 服务配置
/opt/hymio/config/oath.toml     独立运行时配置
/opt/hymio/config/cloud.toml    部署 / 域名
/opt/hymio/config/private/      私有凭据
```

HTTPS/WSS、允许的 Origin 与 OIDC callback 需要匹配公共入口。备份应覆盖数据库、Vault 恢复材料和身份数据。


云部署目录为 `deploy/cloud`：先准备域名及 HTTPS，安装 Docker、Compose、Python 3.11+ 和 Oath，把 Backend、Oath、身份服务与私有凭据配置在服务器上。当前方案面向单台服务器和一个 Backend 实例。

确认 Oath 已启动且网络名称与 `cloud.toml` 一致后，在 Hymio 仓库运行：

```sh
python3 deploy/cloud/manage.py prepare --config /opt/hymio/config/cloud.toml
python3 deploy/cloud/manage.py start --config /opt/hymio/config/cloud.toml
```

启动容器后仍需配置身份服务中的组织、登录应用和回调地址。容器健康并不代表模型能回复：完成账号登录后，发送一条短消息，再验证任务和设备授权链路。

## 故障排查

先运行 `hymio status`、`hymio doctor` 和 `hymio logs -f`，按失败位置定位：

| 现象 | 先检查 |
| --- | --- |
| 页面能开、登录失败 | 身份服务配置、回调地址、Backend 可达性。 |
| 已连接、Agent 不回复 | Oath Worker 日志，Skill 文件权限，以及模型调用错误。 |
| 模型报鉴权或额度错误 | 模型白名单、供应商凭据和余额，不要循环重试被拒绝的付费请求。 |
| 工具挂起 | Oath Tools、Backend 设备命令记录、超时与设备锁。 |
| 设备一直 preparing | 已有分配操作与恢复记录；超时不代表未创建，先查询再决定。 |

容器中的应用 UID 为 `10001`。目录必须可遍历、Skill 文件必须可读；私有配置保持最小权限并由对应运行身份读取，不要递归放宽整个目录。分享排障信息时只保留错误类别和必要记录，移除凭据。
